import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, ArrowLeft, AlertTriangle, PlayCircle, Clock, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

// --- Interfaces (Lesson, CourseDetails) ---
interface Lesson {
  _id: string;
  title: string;
  videoUrl: string;
  duration: number; // in minutes
  order: number;
}

interface CourseDetails {
  _id: string;
  title: string;
  description?: string;
  instructor: string;
  slug: string;
  lessons: Lesson[];
}

// --- ⬇️ UPGRADED API FETCH FUNCTION (WITH DEBUGGING) ⬇️ ---
const fetchCourseBySlug = async (courseSlug: string, token: string | null): Promise<CourseDetails> => {
  if (!courseSlug || courseSlug === 'undefined') {
    throw new Error('Course slug is invalid or missing.');
  }
  if (!token) {
    throw new Error('Authentication token is missing. Cannot fetch course content.');
  }

  const url = `${API_URL}/api/courses/${courseSlug}`;
  console.log(`%c[DEBUG] Fetching course...%c\nURL: ${url}\nToken Present: ${!!token}`, 'color: blue; font-weight: bold;', 'color: black;');

  try {
    const response = await axios.get(url); // Interceptor adds token
    
    // --- DEBUGGING LOG 1 ---
    console.log('%c[DEBUG] Server Response (Success):', 'color: green; font-weight: bold;', response);

    // Check if data is null/undefined even on 200 OK
    if (response.status === 200 && !response.data) {
       console.error('❌ [DEBUG] Server returned 200 OK but response.data is empty! This is the bug.');
       throw new Error('Server returned empty course data.');
    }

    return response.data;

  } catch (error: any) {
    // --- DEBUGGING LOG 2 ---
    // This will log if the server sent a 4xx or 5xx error
    console.error('%c[DEBUG] Axios request failed:', 'color: red; font-weight: bold;', error.response || error.message);
    
    // Re-throw the error for react-query
    throw new Error(error.response?.data?.message || error.message || 'Unknown server error');
  }
};
// --- ⬆️ END OF UPGRADED FUNCTION ⬆️ ---


// --- Main Component (No changes from last time) ---
const CoursePlayer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { isAuthenticated, token, isLoading: isAuthLoading } = useAuth(); 
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  const { 
    data: course, 
    isLoading: isCourseLoading, 
    isError, 
    error 
  } = useQuery<CourseDetails, Error>({
    queryKey: ['coursePlayer', slug, token],
    queryFn: () => fetchCourseBySlug(slug!, token),
    enabled: !isAuthLoading && !!token && !!slug, 
    retry: 1,
    // Add an error log specifically for react-query
    onError: (err) => console.error('%c[DEBUG] React Query Error:', 'color: orange; font-weight: bold;', err),
  });


  // Set the first lesson as the default when the course loads
  useEffect(() => {
    if (course && course.lessons.length > 0 && !currentLesson) {
        const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);
        setCurrentLesson(sortedLessons[0]);
    }
  }, [course, currentLesson]);

  // 1. Show loading spinner
  if (isAuthLoading || isCourseLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // 2. Handle Not Authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; 
  }

  // 3. Handle Query Error or Empty Data
  if (isError || !course) {
    // This is the message you are seeing
    const errorMessage = (error as Error)?.message || 'Course content not available.';
    
    // --- DEBUGGING LOG 3 ---
    console.log(`%c[DEBUG] Rendering Error UI%c\nisError: ${isError}\n!course: ${!course}\nMessage: ${errorMessage}`, 'color: red; font-weight: bold;', 'color: black;');

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-16 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied or Course Not Found</h1>
            <p className="text-gray-600">{errorMessage}</p>
            <Link to="/courses">
                <Button className="mt-4">Browse Courses</Button>
            </Link>
        </main>
      </div>
    );
  }

  // 4. Handle Course with No Lessons
  if (course.lessons.length === 0) {
    return (
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-16 text-center">
              <BookOpen className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">{course.title} is Empty</h1>
              <p className="text-gray-600">This course has been created but no lessons have been added yet.</p>
              <Link to="/my-courses">
                  <Button className="mt-4" variant="outline">Back to My Courses</Button>
              </Link>
          </main>
        </div>
    );
  }

  // 5. RENDER THE PLAYER
  const activeLesson = currentLesson || [...course.lessons].sort((a, b) => a.order - b.order)[0];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-grow w-full max-w-7xl mx-auto">
        
        {/* Main Content: Video Player and Lesson Info */}
        <main className="flex-grow lg:w-3/4 p-6 overflow-y-auto">
          <div className="aspect-w-16 aspect-h-9 bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
            {activeLesson && (
                <iframe
                    key={activeLesson._id} // Key ensures iframe re-renders when lesson changes
                    src={activeLesson.videoUrl}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                ></iframe>
            )}
            {!activeLesson && (
                <div className="flex items-center justify-center h-full text-white/50">Select a lesson to begin.</div>
            )}
          </div>

          <div className="mt-6 p-4 border-b">
            <h1 className="text-3xl font-bold text-gray-800">{activeLesson.title}</h1>
            <p className="text-lg text-muted-foreground mt-1">From course: {course.title}</p>
          </div>

          <Card className="mt-4">
            <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">Course Description</h2>
                <p className="text-gray-700">{course.description || 'No description provided for this course.'}</p>
            </CardContent>
          </Card>
        </main>

        {/* Sidebar: Course Content/Lesson List */}
        <aside className="lg:w-1-4 bg-card border-l p-6 flex flex-col shadow-inner">
          <Link
            to="/my-courses"
            className="flex items-center text-sm font-medium text-indigo-600 mb-6 hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Courses
          </Link>

          <h2 className="text-xl font-semibold mb-4 text-gray-800">Course Content ({course.lessons.length} Lessons)</h2>
          
          <div className="flex-grow overflow-y-auto space-y-1">
            {course.lessons.sort((a, b) => a.order - b.order).map((lesson, index) => (
              <div
                key={lesson._id}
                onClick={() => setCurrentLesson(lesson)}
                className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    activeLesson._id === lesson._id 
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md' 
                    : 'hover:bg-muted bg-white border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                    <p className="font-semibold text-sm flex-grow">
                        <PlayCircle className="w-4 h-4 inline-block mr-2" />
                        {index + 1}. {lesson.title}
                    </p>
                </div>
                <p className={`text-xs mt-1 flex items-center ${activeLesson._id === lesson._id ? 'text-indigo-500' : 'text-muted-foreground'}`}>
                    <Clock className="w-3 h-3 mr-1" /> {lesson.duration} mins
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CoursePlayer;