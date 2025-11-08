import React, { useEffect, useState, useRef } from 'react';
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

const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

// ----------------- Types -----------------
interface Lesson {
  _id: string;
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
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

// ----------------- API helpers (change URLs if backend differs) -----------------
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

// fetch completed lessons for this course for current user
const fetchProgressForCourse = async (courseId: string, token: string | null) => {
  const url = `${API_URL}/api/users/course-progress/${encodeURIComponent(courseId)}`;
  const config = { headers: { Authorization: token ? `Bearer ${token}` : undefined } };
  const resp = await axios.get(url, config);
  return resp.data; // expected { completedLessons: string[], completionRate?: number }
};

// mark a lesson complete
const markLessonCompleteAPI = async (courseId: string, lessonId: string, token: string | null) => {
  const url = `${API_URL}/api/users/course-progress/complete`;
  const config = { headers: { Authorization: token ? `Bearer ${token}` : undefined } };
  const resp = await axios.post(url, { courseId, lessonId }, config);
  return resp.data;
};

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
  const { isAuthenticated, token, isLoading: isAuthLoading } = useAuth();

  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());
  const [completionRate, setCompletionRate] = useState<number | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);

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
    enabled: !isAuthLoading && !!token && !!slug,
    retry: 1,
    staleTime: 0,
  });

  // set default lesson when course loads
  useEffect(() => {
    if (course && Array.isArray(course.lessons) && course.lessons.length > 0 && !currentLessonId) {
      const sorted = [...course.lessons].sort((a, b) => a.order - b.order);
      setCurrentLessonId(sorted[0]._id);
    }
  }, [course, currentLessonId]);

  // load user's progress for the course
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

  const sortedLessons = course?.lessons ? [...course.lessons].sort((a, b) => a.order - b.order) : [];
  const currentIndex = sortedLessons.findIndex(l => l._id === currentLessonId);
  const currentLesson = course?.lessons?.find(l => l._id === currentLessonId) ?? null;

  // refs for <video> and YT player
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytPollRef = useRef<number | null>(null);

  // track watched time per session to avoid small seeks counting
  const watchedSecondsRef = useRef<number>(0);
  const sessionMarkedRef = useRef<Set<string>>(new Set());

  // helper to call mark API (optimistic UI)
  const markLessonComplete = async (lessonId: string) => {
    if (!course || !token) return;
    if (completedSet.has(lessonId)) return; // already completed

    // optimistic UI update
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
      // notify other pages to refresh (MyCourses)
      window.dispatchEvent(new Event('courses-updated'));
    } catch (err) {
      console.error('Failed to mark complete:', err);
      // rollback
      setCompletedSet(prev);
      setCompletionRate(Math.round((prev.size / (sortedLessons.length || 1)) * 100));
    }
  };

  // attempt auto-mark: requires watchedSeconds and duration
  const tryAutoMark = (lessonId: string | null, durationSec?: number) => {
    if (!lessonId || !course || !token) return;
    const watched = watchedSecondsRef.current || 0;
    const percent = durationSec && durationSec > 0 ? (watched / durationSec) * 100 : 0;
    // thresholds: >=90% OR ended - we'll also call this on ended
    if ((percent >= 90 || (durationSec && watched >= Math.max(5, Math.floor(durationSec)))) && !completedSet.has(lessonId) && !sessionMarkedRef.current.has(lessonId)) {
      sessionMarkedRef.current.add(lessonId);
      markLessonComplete(lessonId);
    }
  };

  // .................. direct video handlers .........................
  useEffect(() => {
    // Clean previous ref values each lesson change
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
      // set watched to duration to ensure percent 100
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

  // .................. YouTube support .........................
  // We load the YouTube IFrame API when a YouTube lesson is active and listen for ENDED state
  useEffect(() => {
    // cleanup any existing poll / player
    if (ytPollRef.current) {
      window.clearInterval(ytPollRef.current);
      ytPollRef.current = null;
    }

    let mounted = true;
    const setupYouTube = async () => {
      if (!currentLesson || !isYouTube(currentLesson.videoUrl)) return;

      // load YT API if not present
      if (!(window as any).YT) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(script);
        // wait until API ready
        await new Promise<void>((resolve) => {
          (window as any).onYouTubeIframeAPIReady = () => resolve();
        });
      }

      if (!mounted) return;

      // parse video id (basic)
      const match = currentLesson.videoUrl.match(/(?:v=|\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
      const videoId = match ? match[1] : null;
      if (!videoId) return;

      // create or replace player in container `yt-player-${lessonId}`
      const containerId = `yt-player-${currentLesson._id}`;
      // If a previous player exists, destroy it
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        try { ytPlayerRef.current.destroy(); } catch (e) { /* ignore */ }
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
              // start polling currentTime to track watched seconds (approx)
              if (ytPollRef.current) window.clearInterval(ytPollRef.current);
              ytPollRef.current = window.setInterval(() => {
                try {
                  const t = Math.floor(ytPlayerRef.current.getCurrentTime() || 0);
                  if (t > watchedSecondsRef.current) watchedSecondsRef.current = t;
                  const dur = Math.floor(ytPlayerRef.current.getDuration() || 0);
                  tryAutoMark(currentLessonId, dur);
                } catch (e) {
                  // ignore cross-origin or API temporary errors
                }
              }, 1000);
            } else {
              // stop polling when paused/stopped
              if (ytPollRef.current) {
                window.clearInterval(ytPollRef.current);
                ytPollRef.current = null;
              }
            }

            // ended
            if (e.data === (window as any).YT.PlayerState.ENDED) {
              try {
                const dur = Math.floor(ytPlayerRef.current.getDuration() || 0);
                watchedSecondsRef.current = Math.max(watchedSecondsRef.current, dur);
                tryAutoMark(currentLessonId, dur);
              } catch (err) { /* ignore */ }
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
      // note: we don't forcibly destroy player here to avoid flicker if user jumps back
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            
            {/* Video Container: direct video uses <video>, YouTube injected, else iframe */}
            <div className="bg-black p-6 rounded-lg">
              <div className="overflow-hidden aspect-video rounded">
                {currentLesson ? (
                  isDirectVideo(currentLesson.videoUrl) ? (
                    <video
                      ref={videoRef}
                      key={currentLesson._id}
                      src={currentLesson.videoUrl}
                      controls
                      className="w-full h-full"
                      style={{ border: 'none', outline: 'none', display: 'block' }}
                    />
                  ) : isYouTube(currentLesson.videoUrl) ? (
                    <div id={`yt-player-${currentLesson._id}`} className="w-full h-full" />
                  ) : (
                    <iframe
                      key={currentLesson._id}
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
                  <div className="flex-shrink-0">
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
                        onClick={() => setCurrentLessonId(lesson._id)}
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
                      {sortedLessons.reduce((acc, l) => acc + l.duration, 0)}m
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
