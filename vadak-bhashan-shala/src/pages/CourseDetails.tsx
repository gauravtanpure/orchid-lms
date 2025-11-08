import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ArrowLeft, PlayCircle, Clock, Lock, Info, CheckCircle, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

// Interface for a single lesson
interface Lesson {
  _id: string;
  title: string;
  videoUrl: string;
  duration: number; // in minutes
  order: number;
}

// Updated Course interface to include the full lessons array
interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  duration: number; // Total duration in minutes
  price: number;
  thumbnailUrl: string;
  completionRate?: number;
  lessons: Lesson[]; // Now fetches the full lesson list
  slug: string; // Ensure slug is part of the interface
  specialOffer?: {
    isActive: boolean;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    description: string;
  };
}

// Utility to format price in INR
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
};

// --- Main Component ---
const CourseDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  // --- ⬇️ MODIFIED: Get the 'isEnrolled' function ⬇️ ---
  const { token, isEnrolled: isUserEnrolled } = useAuth();
  const { addToCart, items: cartItems } = useCart();
  // --- ⬆️ END OF MODIFICATION ⬆️ ---

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPreview, setCurrentPreview] = useState<Lesson | null>(null);
  const [showPurchasePrompt, setShowPurchasePrompt] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- ⬇️ MODIFIED: Use the function from AuthContext ⬇️ ---
  // Check enrollment status
  const isEnrolled = isUserEnrolled(course?._id || '');
  // --- ⬆️ END OF MODIFICATION ⬆️ ---
  const isInCart = cartItems?.some(item => item._id === course?._id) || false;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        // Fetch public course details (may exclude lessons)
        const endpoint = token ? `${API_URL}/api/courses/player/${slug}` : `${API_URL}/api/courses/slug/${slug}`;
        const { data } = await axios.get(endpoint, config);

        if (!data) throw new Error('Course not found');

        // ---------- SAFETY: ensure lessons is always an array ----------
        const safeData: Course = {
          ...data,
          lessons: Array.isArray(data.lessons) ? data.lessons : [],
        };

        setCourse(safeData);

        // Only set preview if there's at least one lesson
        if (safeData.lessons.length > 0) {
          setCurrentPreview(safeData.lessons[0]);
        } else {
          setCurrentPreview(null);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCourse();
    }
  }, [slug, token]);


  // Handle clicking on a lesson
  const handleLessonClick = (lesson: Lesson) => {
    if (isEnrolled) {
      // If enrolled, go to the full player
      navigate(`/learn/${course?.slug}`);
    } else {
      // If not enrolled, set as preview and hide purchase prompt
      setCurrentPreview(lesson);
      setShowPurchasePrompt(false);
      // Scroll to player
      videoRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // This function runs every time the video's time updates
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.currentTime >= 20 && !isEnrolled) {
      video.pause();
      setShowPurchasePrompt(true);
    }
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (course) {
      addToCart({
        ...course,
        id: course._id, // Fulfill CartItem interface
        image: course.thumbnailUrl, // Fulfill CartItem interface
        language: course.category === 'marathi' ? 'mr' : 'en' // Fulfill CartItem interface
      });
      toast({
        title: 'Success',
        description: `${course.title} added to cart.`,
      });
    }
  };

  // Get final price considering special offers
  const getFinalPrice = (course: Course): number => {
    if (!course.specialOffer?.isActive || course.specialOffer.discountValue <= 0) {
      return course.price;
    }
    const { price, specialOffer } = course;
    const { discountType, discountValue } = specialOffer;
    let finalPrice: number;
    if (discountType === 'percentage') {
      finalPrice = price - (price * discountValue) / 100;
    } else {
      finalPrice = price - discountValue;
    }
    return Math.max(0, finalPrice);
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
            <p className="text-red-600 font-semibold">{error || 'Course not found.'}</p>
            <Button onClick={() => navigate('/courses')} className="mt-4">
                Go Back to Courses
            </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const finalPrice = getFinalPrice(course);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/courses')} className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Courses
        </Button>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-4xl font-extrabold text-gray-900">{course.title}</h1>
            <p className="text-gray-700 text-lg">{course.description}</p>
            
            {/* Video Player */}
            <div ref={videoRef} className="aspect-video w-full bg-black rounded-xl shadow-lg overflow-hidden relative">
              {currentPreview ? (
                <video
                  key={currentPreview._id}
                  className="w-full h-full"
                  controls
                  autoPlay
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setShowPurchasePrompt(false)} // Hide prompt on play
                  src={currentPreview.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
              )}

              {/* Purchase Prompt Overlay */}
              {showPurchasePrompt && !isEnrolled && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-10">
                  <Lock className="w-12 h-12 text-white mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Watch the full course</h3>
                  <p className="text-gray-200 mb-6">Purchase this course to unlock all lessons and content.</p>
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700" onClick={isInCart ? () => navigate('/cart') : handleAddToCart}>
                    {isInCart ? (
                      <><ShoppingCart className="w-5 h-5 mr-2" /> Go to Cart</>
                    ) : (
                      <><ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart</>
                    )}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Course Content Accordion */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold mb-4">Course Content</h2>
              {course.lessons.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {/* We can improve this by grouping lessons into sections if you add sections later */}
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="font-semibold">
                      All Lessons ({course.lessons.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {course.lessons.sort((a,b) => a.order - b.order).map((lesson, index) => (
                          <div
                            key={lesson._id}
                            onClick={() => handleLessonClick(lesson)}
                            className="flex items-center justify-between p-3 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center">
                              {isEnrolled ? (
                                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                              ) : (
                                <PlayCircle className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                              )}
                              <span className="font-medium text-gray-800">{index + 1}. {lesson.title}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              {!isEnrolled && index > 0 && (
                                <Lock className="w-4 h-4 mr-2 text-gray-400" />
                              )}
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

          {/* Right Column (Purchase Card) */}
          <div className="lg:col-span-1 sticky top-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
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

                {isEnrolled ? (
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate(`/learn/${course.slug}`)}>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Go to Course
                  </Button>
                ) : isInCart ? (
                  <Button size="lg" variant="outline" className="w-full" onClick={() => navigate('/cart')}>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Go to Cart
                  </Button>
                ) : (
                  <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleAddToCart}>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
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