// src/pages/CourseDetails.tsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ArrowLeft, PlayCircle, Clock, Lock, Info, CheckCircle, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || '';

/* ---------- Types ---------- */
interface Lesson { _id: string; title: string; videoUrl?: string | null; duration: number; order: number; }
interface Course {
  _id: string; title: string; description: string; instructor: string; category: string;
  duration: number; price: number; thumbnailUrl: string; lessons: Lesson[]; slug: string;
  specialOffer?: { isActive: boolean; discountType: 'percentage'|'fixed'; discountValue: number; description: string };
}

/* ---------- Helpers ---------- */
const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

/* ---------- Component ---------- */
const CourseDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, isEnrolled: isUserEnrolled } = useAuth();
  const { addToCart, items: cartItems } = useCart();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPreview, setCurrentPreview] = useState<Lesson | null>(null);
  const [showPurchasePrompt, setShowPurchasePrompt] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [checkingUrl, setCheckingUrl] = useState(false);

  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());

  const videoRef = useRef<HTMLVideoElement>(null);

  // -------------- Fetch the authenticated user's enrolled course ids --------------
  // This runs when token becomes available.
  useEffect(() => {
    const fetchUserEnrollments = async () => {
      if (!token) {
        setEnrolledCourseIds(new Set());
        return;
      }

      try {
        // Common endpoint: /api/users/me (adjust if your backend uses another)
        const cfg = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${API_URL}/api/users/me`, cfg);

        // Defensive: backend can return user object in different shapes (res.data or res.data.data)
        const payload = res?.data?.data ?? res?.data ?? null;
        if (!payload) {
          console.warn('User endpoint returned unexpected shape', res);
          setEnrolledCourseIds(new Set());
          return;
        }

        // Try common fields for enrolled courses
        // - payload.enrolledCourses = [{ _id,... }, 'id', ...]
        // - payload.courses
        // - payload.enrollments = [{ course: { _id } }, ...]
        const ids = new Set<string>();

        const pushId = (v: any) => {
          if (!v) return;
          if (typeof v === 'string') ids.add(v);
          else if (typeof v === 'object') {
            if (v._id) ids.add(String(v._id));
            else if (v.id) ids.add(String(v.id));
          }
        };

        if (Array.isArray(payload.enrolledCourses)) {
          payload.enrolledCourses.forEach(pushId);
        }
        if (Array.isArray(payload.courses)) {
          payload.courses.forEach(pushId);
        }
        if (Array.isArray(payload.enrollments)) {
          // enrollments could be [{ course: { _id } }, { course: 'id' }]
          payload.enrollments.forEach((en: any) => {
            if (en?.course) pushId(en.course);
            else pushId(en);
          });
        }

        // Some backends return a flattened list directly at payload.enrolledCourseIds
        if (Array.isArray(payload.enrolledCourseIds)) {
          payload.enrolledCourseIds.forEach((id: any) => ids.add(String(id)));
        }

        // If still empty, check for a top-level courses array (sometimes nested in data)
        if (ids.size === 0) {
          // Try to locate arrays anywhere sensible
          if (Array.isArray(payload.data?.courses)) payload.data.courses.forEach(pushId);
        }

        setEnrolledCourseIds(ids);
      } catch (err) {
        console.warn('Could not fetch user enrollments; backend may not support /api/users/me. Error:', err);
        setEnrolledCourseIds(new Set());
      }
    };

    fetchUserEnrollments();
  }, [token]);

  // -------------- Compute isEnrolled from canonical set --------------
  const isEnrolled = useMemo(() => {
    if (!course) return false;
    // First prefer the canonical enrolledCourseIds (fetched above)
    if (enrolledCourseIds && enrolledCourseIds.size > 0) {
      return enrolledCourseIds.has(course._id);
    }
    // Fallback: if AuthContext exposes an isEnrolled function, call it
    try {
      return isUserEnrolled ? isUserEnrolled(course._id) : false;
    } catch {
      return false;
    }
  }, [course, enrolledCourseIds, isUserEnrolled]);

  // ensure enrolled users never see cart UI
  const isInCart = useMemo(() => {
    if (!course) return false;
    if (isEnrolled) return false;
    return cartItems?.some((it: any) => it._id === course._id || it.id === course._id) || false;
  }, [cartItems, course, isEnrolled]);

  // ---------- Video URL quick-check helper (optional, kept from earlier) ----------
  const checkVideoUrl = async (url: string) => {
    setVideoError(null);
    setCheckingUrl(true);
    if (!url) { setCheckingUrl(false); return false; }
    try {
      const head = await axios.head(url, { timeout: 5000 });
      setCheckingUrl(false);
      return true;
    } catch (headErr) {
      try {
        const get = await axios.get(url, { headers: { Range: 'bytes=0-1023' }, timeout: 7000 });
        setCheckingUrl(false);
        return true;
      } catch (getErr) {
        setCheckingUrl(false);
        return false;
      }
    }
  };

  // ---------- Fetch course data ---------- (public slug first; then /player if token)
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const publicRes = await axios.get(`${API_URL}/api/courses/slug/${slug}`);
        if (!publicRes?.data) throw new Error('Course not found');

        const safePublic: Course = { ...publicRes.data, lessons: Array.isArray(publicRes.data.lessons) ? publicRes.data.lessons : [] };
        setCourse(safePublic);
        setCurrentPreview(safePublic.lessons.length > 0 ? safePublic.lessons[0] : null);

        if (token) {
          try {
            const cfg = { headers: { Authorization: `Bearer ${token}` } };
            const playerRes = await axios.get(`${API_URL}/api/courses/player/${slug}`, cfg);
            if (playerRes?.data) {
              const merged: Course = {
                ...safePublic,
                ...playerRes.data,
                lessons: Array.isArray(playerRes.data.lessons) ? playerRes.data.lessons : safePublic.lessons,
              };
              setCourse(merged);
              if (merged.lessons.length > 0) setCurrentPreview(merged.lessons[0]);
            }
          } catch (playerErr) {
            // Not enrolled or access denied -> public data remains
            console.warn('Player endpoint not available or access denied — using public course data.', playerErr);
          }
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchCourse();
  }, [slug, token]);

  // ---------- Lesson click ----------
  const handleLessonClick = async (lesson: Lesson) => {
    setVideoError(null);
    if (isEnrolled) { navigate(`/learn/${course?.slug}`); return; }
    if (!lesson.videoUrl) { setVideoError('Video not available for this lesson yet.'); setCurrentPreview(null); return; }
    const ok = await checkVideoUrl(lesson.videoUrl);
    if (!ok) { setVideoError('Unable to load video preview. The file may be missing or restricted.'); setCurrentPreview(null); return; }
    setCurrentPreview(lesson); setShowPurchasePrompt(false); videoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (v.currentTime >= 20 && !isEnrolled) { v.pause(); setShowPurchasePrompt(true); }
  };

  const handleAddToCart = () => {
    if (!course) return;
    if (isEnrolled) { toast({ title: 'Already enrolled', description: 'You already have access to this course.' }); return; }
    addToCart({ ...course, id: course._id, image: course.thumbnailUrl, language: course.category === 'marathi' ? 'mr' : 'en' });
    toast({ title: 'Success', description: `${course.title} added to cart.` });
  };

  const getFinalPrice = (c: Course) => {
    if (!c.specialOffer?.isActive || c.specialOffer.discountValue <= 0) return c.price;
    const { price, specialOffer } = c;
    const { discountType, discountValue } = specialOffer;
    let finalPrice = price;
    if (discountType === 'percentage') finalPrice = price - (price * discountValue) / 100;
    else finalPrice = price - discountValue;
    return Math.max(0, finalPrice);
  };

  /* ---------- UI ---------- */
  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  if (error || !course) return (
    <div className="min-h-screen flex flex-col"><Header /><main className="container mx-auto px-4 py-8 text-center"><p className="text-red-600 font-semibold">{error || 'Course not found.'}</p><Button onClick={() => navigate('/courses')} className="mt-4">Go Back to Courses</Button></main><Footer /></div>
  );

  const finalPrice = getFinalPrice(course);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/courses')} className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800"><ArrowLeft className="w-4 h-4 mr-2" /> Back to All Courses</Button>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-4xl font-extrabold text-gray-900">{course.title}</h1>
            <p className="text-gray-700 text-lg">{course.description}</p>

            <div ref={videoRef} className="relative aspect-video w-full bg-black rounded-xl shadow-lg overflow-hidden">
              {currentPreview ? (
                <>
                  <video key={currentPreview._id} className="w-full h-full" controls autoPlay muted playsInline poster={course.thumbnailUrl} onTimeUpdate={handleTimeUpdate} onPlay={() => setShowPurchasePrompt(false)} onError={(e) => { console.error('Video element error', e); setVideoError('Failed to play this video. It might be blocked or missing.'); }} src={currentPreview.videoUrl || ''}>Your browser does not support the video tag.</video>

                  {checkingUrl && (<div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded">Checking preview...</div>)}
                  {videoError && (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <div className="bg-white/95 text-gray-800 p-4 rounded shadow text-center max-w-sm">
                        <p className="font-semibold mb-2">Video not available</p>
                        <p className="text-sm mb-3">{videoError}</p>
                        <div className="flex justify-center gap-2">
                          <Button size="sm" onClick={() => { setVideoError(null); if (currentPreview) handleLessonClick(currentPreview); }}>Retry</Button>
                          <Button size="sm" variant="outline" onClick={() => setCurrentPreview(null)}>Back to poster</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
              )}

              {showPurchasePrompt && !isEnrolled && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-10">
                  <Lock className="w-12 h-12 text-white mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Watch the full course</h3>
                  <p className="text-gray-200 mb-6">Purchase this course to unlock all lessons and content.</p>
                  {isInCart ? (
                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('/cart')}><ShoppingCart className="w-5 h-5 mr-2" /> Go to Cart</Button>
                  ) : (
                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700" onClick={handleAddToCart}><ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart</Button>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold mb-4">Course Content</h2>
              {course.lessons.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="font-semibold">All Lessons ({course.lessons.length})</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {course.lessons.sort((a,b) => a.order - b.order).map((lesson, idx) => (
                          <div key={lesson._id} onClick={() => handleLessonClick(lesson)} className="flex items-center justify-between p-3 rounded-md hover:bg-gray-100 cursor-pointer transition-colors">
                            <div className="flex items-center">
                              {isEnrolled ? <CheckCircle className="w-5 h-5 text-green-500 mr-3" /> : <PlayCircle className="w-5 h-5 text-indigo-500 mr-3" />}
                              <span className="font-medium text-gray-800">{idx+1}. {lesson.title}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              {token && !isEnrolled && idx > 0 && <Lock className="w-4 h-4 mr-2 text-gray-400" />}
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{lesson.duration} min</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-md">
                  <Info className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Lessons are being prepared and will be added soon!</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 sticky top-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <img src={course.thumbnailUrl} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <div className="mb-4">
                  {course.specialOffer?.isActive ? (
                    <div>
                      <span className="text-3xl font-bold text-gray-900">{formatPrice(finalPrice)}</span>
                      <span className="text-xl text-gray-500 line-through ml-2">{formatPrice(course.price)}</span>
                      <p className="text-green-600 font-semibold mt-1">{course.specialOffer.description}</p>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">{formatPrice(course.price)}</span>
                  )}
                </div>

                {/* Enrolled users only see the Course button; never Add/GoTo Cart */}
                {isEnrolled ? (
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate(`/learn/${course.slug}`)}>Course</Button>
                ) : isInCart ? (
                  <Button size="lg" variant="outline" className="w-full" onClick={() => navigate('/cart')}><ShoppingCart className="w-5 h-5 mr-2" /> Go to Cart</Button>
                ) : (
                  <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleAddToCart}><ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart</Button>
                )}

                <div className="space-y-3 mt-6 text-sm text-gray-600">
                  <p><strong>Instructor:</strong> {course.instructor}</p>
                  <p><strong>Category:</strong> {course.category}</p>
                  <p><strong>Total Duration:</strong> {course.duration} minutes</p>
                  <p><strong>Lessons:</strong> {course.lessons.length}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetails;
