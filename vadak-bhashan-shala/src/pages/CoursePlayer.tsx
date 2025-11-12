// src/pages/CoursePlayer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Loader2,
  ArrowLeft,
  AlertTriangle,
  PlayCircle,
  Clock,
  BookOpen,
  CheckCircle2,
  List,
  CheckCircle,
} from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || '';

// ----------------- Types -----------------
interface Lesson {
  _id: string;
  title: string;
  videoUrl: string;
  video_cloudinary_id?: string;

  // optional audio-cache fields
  audioUrl_hi?: string;
  audioUrl_mr?: string;
  audioUrl_en?: string;

  // optional transcript (if saved)
  transcript?: string;

  // optional dubbed video fields (if used elsewhere)
  videoUrl_hi?: string;
  videoUrl_mr?: string;
  videoUrl_en?: string;
  duration?: number;
  order?: number;
  thumbnailUrl?: string;
}

interface CourseDetails {
  _id: string;
  title: string;
  description?: string;
  instructor: string;
  slug: string;
  lessons: Lesson[];
  thumbnailUrl?: string;
}

// ----------------- API -----------------
const fetchCourseForPlayer = async (slug: string, token: string | null): Promise<CourseDetails> => {
  if (!slug) throw new Error('Missing course slug.');
  const url = `${API_URL}/api/courses/player/${encodeURIComponent(slug)}`;
  const config = {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  };
  const resp = await axios.get(url, config);
  if (resp.status !== 200 || !resp.data) throw new Error(resp.data?.message || 'Failed to fetch course.');
  return { ...resp.data, lessons: Array.isArray(resp.data.lessons) ? resp.data.lessons : [] } as CourseDetails;
};

const fetchProgressForCourse = async (courseId: string, token: string | null) => {
  const url = `${API_URL}/api/users/course-progress/${encodeURIComponent(courseId)}`;
  const config = { headers: { Authorization: token ? `Bearer ${token}` : undefined } };
  const resp = await axios.get(url, config);
  return resp.data;
};

// call backend to get or generate audio URL for a lesson + language
async function fetchAudioUrlBackend(courseId: string, lessonId: string, lang: 'hi' | 'mr' | 'en' | 'original', sourceLang?: string) {
  const base = API_URL.replace(/\/$/, '');
  const params: any = { courseId, lessonId, lang };
  if (sourceLang) params.sourceLang = sourceLang;
  const resp = await axios.get(`${base}/api/dubbing/audio`, {
    params,
    timeout: 120000,
  });
  console.debug('[PLAYER] fetchAudioUrlBackend response:', resp.data);
  return resp.data;
}


// ----------------- Helpers for video/embed detection -----------------
const isDirectVideo = (url?: string | null) => {
  if (!url) return false;
  const u = url.split('?')[0].split('#')[0].toLowerCase();
  return (
    u.endsWith('.mp4') ||
    u.endsWith('.webm') ||
    u.endsWith('.ogg') ||
    u.endsWith('.m3u8') ||
    u.startsWith('blob:')
  );
};

const isYouTube = (url?: string | null) => {
  if (!url) return false;
  return /(?:youtube\.com|youtu\.be)/i.test(url);
};

// ----------------- Component -----------------
const CoursePlayer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, token, isLoading: isAuthLoading, user } = useAuth();

  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());
  const [completionRate, setCompletionRate] = useState<number | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);

  // language selector: original / hindi / marathi / english (frontend values)
  const [selectedLanguage, setSelectedLanguage] = useState<'original' | 'hindi' | 'marathi' | 'english'>('original');

  // dynamic audio state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [currentAudioLang, setCurrentAudioLang] = useState<'original' | 'hi' | 'mr' | 'en'>('original');

  // react-query for course data
  const {
    data: course,
    isLoading: isCourseLoading,
    isError,
    error,
    refetch,
  } = useQuery<CourseDetails, Error>({
    queryKey: ['coursePlayer', slug, token],
    queryFn: () => fetchCourseForPlayer(slug!, token),
    enabled: !isAuthLoading && !!slug,
    retry: 1,
    staleTime: 0,
  });

  useEffect(() => {
    if (course && Array.isArray(course.lessons) && course.lessons.length > 0 && !currentLessonId) {
      const sorted = [...course.lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setCurrentLessonId(sorted[0]._id);
    }
  }, [course, currentLessonId]);

  useEffect(() => {
    let mounted = true;
    const loadProgress = async () => {
      if (!course || !token) return;
      try {
        setProgressLoading(true);
        const resp = await fetchProgressForCourse(course._id, token);
        if (!mounted) return;
        const ids = Array.isArray(resp.completedLessons) ? resp.completedLessons : [];
        setCompletedSet(new Set(ids));
        if (typeof resp.completionRate === 'number') setCompletionRate(resp.completionRate);
      } catch (err) {
        console.warn('Failed to load progress:', err);
      } finally {
        if (mounted) setProgressLoading(false);
      }
    };
    loadProgress();
    return () => { mounted = false; };
  }, [course, token]);

  const sortedLessons = course?.lessons ? [...course.lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];
  const currentIndex = sortedLessons.findIndex(l => l._id === currentLessonId);
  const currentLesson = course?.lessons?.find(l => l._id === currentLessonId) ?? null;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytPollRef = useRef<number | null>(null);

  const watchedSecondsRef = useRef<number>(0);
  const sessionMarkedRef = useRef<Set<string>>(new Set());

  // mark completion APIs (same optimistic behavior as earlier)
  const markLessonCompleteAPI = async (courseId: string, lessonId: string, token: string | null) => {
    const url = `${API_URL}/api/users/course-progress/complete`;
    const config = { headers: { Authorization: token ? `Bearer ${token}` : undefined } };
    const resp = await axios.post(url, { courseId, lessonId }, config);
    return resp.data;
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!course || !token) return;
    if (completedSet.has(lessonId)) return;
    const prev = new Set(completedSet);
    const optimistic = new Set(completedSet);
    optimistic.add(lessonId);
    setCompletedSet(optimistic);
    setCompletionRate(Math.round((optimistic.size / (sortedLessons.length || 1)) * 100));

    try {
      const resp = await markLessonCompleteAPI(course._id, lessonId, token);
      const ids = Array.isArray(resp.completedLessons) ? resp.completedLessons : Array.from(optimistic);
      setCompletedSet(new Set(ids));
      if (typeof resp.completionRate === 'number') setCompletionRate(resp.completionRate);
      window.dispatchEvent(new Event('courses-updated'));
    } catch (err) {
      console.error('Failed to mark complete:', err);
      setCompletedSet(prev);
      setCompletionRate(Math.round((prev.size / (sortedLessons.length || 1)) * 100));
    }
  };

  const tryAutoMark = (lessonId: string | null, durationSec?: number) => {
    if (!lessonId || !course || !token) return;
    const watched = watchedSecondsRef.current || 0;
    const percent = durationSec && durationSec > 0 ? (watched / durationSec) * 100 : 0;
    if ((percent >= 90 || (durationSec && watched >= Math.max(5, Math.floor(durationSec)))) && !completedSet.has(lessonId) && !sessionMarkedRef.current.has(lessonId)) {
      sessionMarkedRef.current.add(lessonId);
      markLessonComplete(lessonId);
    }
  };

  // ------------------ Dynamic audio logic ------------------

  // Utility: convert UI selectedLanguage -> lang code used by backend
  const selectedLanguageToCode = (sel: 'original' | 'hindi' | 'marathi' | 'english') => {
    if (sel === 'original') return 'original';
    if (sel === 'hindi') return 'hi';
    if (sel === 'marathi') return 'mr';
    return 'en';
  };

  // When selectedLanguage or currentLesson changes, load appropriate audio (unless user picks original)
// When selectedLanguage or currentLesson changes, load appropriate audio (unless user picks original)
useEffect(() => {
  const requestedLang = selectedLanguageToCode(selectedLanguage) as ('original'|'hi'|'mr'|'en');

  // clear previous audio when lesson changes
  const loadForLesson = async () => {
    // If no lesson or API URL missing, fallback to original
    if (!currentLesson || !course) {
      // ensure audio removed
      if (audioRef.current) {
        try { audioRef.current.pause(); audioRef.current.src = ''; } catch (e) {}
      }
      setCurrentAudioLang('original');
      setAudioLoading(false);
      return;
    }

    const v = videoRef.current;

    // If original requested, remove the custom audio (video's own audio used)
    if (requestedLang === 'original') {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
        if (v) v.muted = false; // restore original audio
      } catch (e) {}
      setCurrentAudioLang('original');
      setAudioLoading(false);
      return;
    }

    // else requestedLang is hi/mr/en -> ask backend for audio URL (cached or generated)
    setAudioLoading(true);
    try {
      const data = await fetchAudioUrlBackend(course._id, currentLesson._id, requestedLang);
      const url = data?.url;
      if (!url) throw new Error('No audio url returned from server');

      // ensure audio element exists
      if (!audioRef.current) {
        const a = document.createElement('audio');
        a.crossOrigin = 'anonymous';
        a.preload = 'auto';
        a.style.display = 'none';
        document.body.appendChild(a);
        audioRef.current = a;
      }
      const a = audioRef.current;

      // set src and wait for canplay
      a.src = url;
      await new Promise<void>((resolve, reject) => {
        const onCan = () => { cleanup(); resolve(); };
        const onErr = (e: any) => { cleanup(); reject(e); };
        const cleanup = () => {
          a.removeEventListener('canplay', onCan);
          a.removeEventListener('error', onErr);
        };
        a.addEventListener('canplay', onCan);
        a.addEventListener('error', onErr);
        try { a.load(); } catch (e) {}
      });

      // Mute original video to avoid overlapping audio and sync time
      if (v) {
        try { v.muted = true; a.currentTime = v.currentTime; } catch (e) {}
        // if video is playing, start audio as well
        if (!v.paused && !v.ended) {
          try { await a.play(); } catch (e) { /* autoplay policies */ }
        } else {
          // ensure audio paused
          try { a.pause(); } catch (e) {}
        }
      }

      setCurrentAudioLang(requestedLang);
    } catch (err) {
      console.error('Failed to load dubbed audio:', err);
      // fallback: clear audio and use original
      try {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
        if (videoRef.current) videoRef.current.muted = false;
      } catch (e) {}
      setCurrentAudioLang('original');
    } finally {
      setAudioLoading(false);
    }
  };

  loadForLesson();

  // cleanup on unmount or lesson change
  return () => {
    // do not remove audio element here (we reuse it), but stop playback for safety
    try { if (audioRef.current) audioRef.current.pause(); } catch (e) {}
  };
// NOTE: fixed bug - remove the accidental space in course?._id
}, [selectedLanguage, currentLessonId, course?._id]);


  // Keep video & audio in sync: play/pause/seek/rate/ended
  useEffect(() => {
    const v = videoRef.current;
    const getA = () => audioRef.current;
    if (!v) return;
    try { v.muted = (currentAudioLang !== 'original'); } catch (e) {}

    const onVideoPlay = async () => {
      const a = getA();
      if (a && currentAudioLang !== 'original') {
        try { a.currentTime = v.currentTime; await a.play(); } catch (e) {}
      }
    };
    const onVideoPause = () => {
      const a = getA();
      if (a && currentAudioLang !== 'original') {
        try { a.pause(); } catch (e) {}
      }
    };
    const onVideoSeek = () => {
      const a = getA();
      if (a && currentAudioLang !== 'original') {
        try { a.currentTime = v.currentTime; } catch (e) {}
      }
    };
    const onVideoRateChange = () => {
      const a = getA();
      if (a && currentAudioLang !== 'original') {
        try { a.playbackRate = v.playbackRate; } catch (e) {}
      }
    };
    const onVideoEnded = () => {
      const a = getA();
      if (a && currentAudioLang !== 'original') {
        try { a.pause(); a.currentTime = 0; } catch (e) {}
      }
    };

    v.addEventListener('play', onVideoPlay);
    v.addEventListener('pause', onVideoPause);
    v.addEventListener('seeking', onVideoSeek);
    v.addEventListener('seeked', onVideoSeek);
    v.addEventListener('ratechange', onVideoRateChange);
    v.addEventListener('ended', onVideoEnded);

    return () => {
      v.removeEventListener('play', onVideoPlay);
      v.removeEventListener('pause', onVideoPause);
      v.removeEventListener('seeking', onVideoSeek);
      v.removeEventListener('seeked', onVideoSeek);
      v.removeEventListener('ratechange', onVideoRateChange);
      v.removeEventListener('ended', onVideoEnded);
    };
  }, [currentAudioLang]);

  // ........................... existing video watched tracking ...........................
  useEffect(() => {
    watchedSecondsRef.current = 0;
    sessionMarkedRef.current = new Set();

    const v = videoRef.current;
    if (!v || !currentLesson || !isDirectVideo(currentLesson.videoUrl)) return;

    const onTime = () => {
      const secs = Math.floor(v.currentTime);
      if (secs > watchedSecondsRef.current) watchedSecondsRef.current = secs;
      const dur = Math.floor(v.duration || 0);
      tryAutoMark(currentLessonId, dur);
    };
    const onEnded = () => {
      const dur = Math.floor(v.duration || 0);
      watchedSecondsRef.current = Math.max(watchedSecondsRef.current, dur);
      tryAutoMark(currentLessonId, dur);
    };

    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', onEnded);

    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('ended', onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLessonId, currentLesson?.videoUrl]);

  // .................. YouTube support (unchanged) .........................
  useEffect(() => {
    if (ytPollRef.current) {
      window.clearInterval(ytPollRef.current);
      ytPollRef.current = null;
    }

    let mounted = true;
    const setupYouTube = async () => {
      if (!currentLesson || !isYouTube(currentLesson.videoUrl)) return;

      if (!(window as any).YT) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(script);
        await new Promise<void>((resolve) => {
          (window as any).onYouTubeIframeAPIReady = () => resolve();
        });
      }

      if (!mounted) return;

      const match = currentLesson.videoUrl.match(/(?:v=|\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
      const videoId = match ? match[1] : null;
      if (!videoId) return;

      const containerId = `yt-player-${currentLesson._id}`;
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        try { ytPlayerRef.current.destroy(); } catch (e) {}
        ytPlayerRef.current = null;
      }

      ytPlayerRef.current = new (window as any).YT.Player(containerId, {
        height: '100%',
        width: '100%',
        videoId,
        playerVars: { rel: 0, modestbranding: 1, enablejsapi: 1 },
        events: {
          onStateChange: (e: any) => {
            const YT = (window as any).YT;
            if (e.data === YT.PlayerState.PLAYING) {
              if (ytPollRef.current) window.clearInterval(ytPollRef.current);
              ytPollRef.current = window.setInterval(() => {
                try {
                  const t = Math.floor(ytPlayerRef.current.getCurrentTime() || 0);
                  if (t > watchedSecondsRef.current) watchedSecondsRef.current = t;
                  const dur = Math.floor(ytPlayerRef.current.getDuration() || 0);
                  tryAutoMark(currentLessonId, dur);
                } catch (e) {}
              }, 1000);
            } else {
              if (ytPollRef.current) {
                window.clearInterval(ytPollRef.current);
                ytPollRef.current = null;
              }
            }

            if (e.data === (window as any).YT.PlayerState.ENDED) {
              try {
                const dur = Math.floor(ytPlayerRef.current.getDuration() || 0);
                watchedSecondsRef.current = Math.max(watchedSecondsRef.current, dur);
                tryAutoMark(currentLessonId, dur);
              } catch (err) {}
            }
          },
        },
      });
    };

    setupYouTube();

    return () => {
      mounted = false;
      if (ytPollRef.current) {
        window.clearInterval(ytPollRef.current);
        ytPollRef.current = null;
      }
    };
  }, [currentLessonId, currentLesson?.videoUrl]);

  // ----------------- Loading / Auth / Error UI -----------------
  if (isAuthLoading || isCourseLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isError || !course) {
    const msg = (error as Error)?.message || 'Course content not available.';
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-6 py-20 text-center">
          <div className="max-w-md mx-auto">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-3 text-gray-900">Access Denied</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{msg}</p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => refetch()} size="lg">Retry</Button>
              <Link to="/courses">
                <Button variant="outline" size="lg">Browse Courses</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!Array.isArray(course.lessons) || course.lessons.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-6 py-20 text-center">
          <div className="max-w-md mx-auto">
            <BookOpen className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-3 text-gray-900">No Lessons Available</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              This course has been created but no lessons have been added yet. Please check back later.
            </p>
            <Link to="/my-courses">
              <Button size="lg">Back to My Courses</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ----------------- Main Render -----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      {/* Top Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/my-courses" 
                className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-2 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>My Courses</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4" />
                <span>{Math.max(0, currentIndex) + 1} of {sortedLessons.length} lessons</span>
              </div>
              <div className="hidden md:block">
                <span className="font-medium">Instructor:</span> {course.instructor}
              </div>
              <div className="ml-4 text-sm">
                <span className="font-medium">Progress: </span>
                <span className="text-indigo-600 font-semibold">{completionRate ?? 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Player + Details) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Video Container: language selector + player */}
            <div className="bg-black p-6 rounded-lg">
              {/* Language selector (top-right) + loader */}
              <div className="flex items-center justify-end gap-2 mb-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm font-medium text-gray-700 bg-white"
                >
                  <option value="original">Original</option>
                  <option value="hindi">Hindi</option>
                  <option value="marathi">Marathi</option>
                  <option value="english">English</option>
                </select>

                {audioLoading && (
                  <div className="text-sm text-white px-3 py-1 bg-yellow-500 rounded">Preparing audio…</div>
                )}
              </div>

              <div className="overflow-hidden aspect-video rounded">
                {currentLesson ? (
                  isDirectVideo(currentLesson.videoUrl) ? (
                    <video
                      ref={videoRef}
                      key={`${currentLesson._id}-${selectedLanguage}`} // re-render when language/lesson changes
                      src={currentLesson.videoUrl} // always load the full video; audio is swapped with the audio element
                      controls
                      className="w-full h-full"
                      style={{ border: 'none', outline: 'none', display: 'block' }}
                    />
                  ) : isYouTube(currentLesson.videoUrl) ? (
                    <div id={`yt-player-${currentLesson._id}`} className="w-full h-full" />
                  ) : (
                    <iframe
                      key={`${currentLesson._id}-iframe-${selectedLanguage}`}
                      src={currentLesson.videoUrl}
                      title={currentLesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      style={{ border: 'none', outline: 'none', display: 'block' }}
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white/70">
                    <div className="text-center">
                      <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Select a lesson to begin</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Details */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentLesson?.title || 'Select a lesson'}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{currentLesson?.duration} minutes</span>
                      </div>
                      <div className="h-4 w-px bg-gray-300"></div>
                      <span>Lesson {currentIndex + 1} of {sortedLessons.length}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                    About This Course
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {course.description || 'No description available for this course.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Course Content */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Course Content</h3>
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {sortedLessons.length} lessons
                  </span>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {sortedLessons.map((lesson, idx) => {
                    const isActive = lesson._id === currentLessonId;
                    const completed = completedSet.has(lesson._id);
                    return (
                      <button
                        key={lesson._id}
                        onClick={() => {
                          setCurrentLessonId(lesson._id);
                          // reset audio selection for new lesson: user preference remains but reload will occur
                          // if selectedLanguage !== 'original', effect will fetch audio for new lesson
                        }}
                        className={`w-full text-left p-4 rounded-lg transition-all duration-200 border-2 ${
                          isActive 
                            ? 'bg-indigo-50 border-indigo-500 shadow-md' 
                            : 'bg-white border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                            isActive ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {idx + 1}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                              {lesson.title}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{lesson.duration}m</span>
                              </div>
                              {isActive && (
                                <span className="text-indigo-600 font-semibold flex items-center gap-1">
                                  <PlayCircle className="w-3 h-3" />
                                  Playing
                                </span>
                              )}
                              {completed && (
                                <span className="ml-2 inline-flex items-center text-green-600 text-xs font-medium">
                                  <CheckCircle className="w-4 h-4 mr-1" /> Completed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Course Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600 font-medium">Instructor</span>
                    <span className="text-gray-900 font-semibold">{course.instructor}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600 font-medium">Total Lessons</span>
                    <span className="text-gray-900 font-semibold">{sortedLessons.length}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 font-medium">Total Duration</span>
                    <span className="text-gray-900 font-semibold">
                      {sortedLessons.reduce((acc, l) => acc + (l.duration || 0), 0)}m
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <Link to={`/course/${course.slug}`}>
                    <Button variant="outline" className="w-full font-semibold">
                      View Course Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
