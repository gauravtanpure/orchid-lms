import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

interface CourseDetails {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  instructor: string;
  slug: string;
  lessons: { title: string; duration: number }[];
}

/**
 * ✅ FIXED: Include token in the Authorization header.
 */
const fetchCourseBySlug = async (courseSlug: string, token: string | null): Promise<CourseDetails> => {
  if (!courseSlug || courseSlug === 'undefined') {
    throw new Error('Course slug is invalid or missing.');
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  console.log(`Fetching course from: ${API_URL}/api/courses/${courseSlug}`, 'with token:', !!token);

  const { data } = await axios.get(`${API_URL}/api/courses/${courseSlug}`, config);
  return data;
};

const CoursePlayer: React.FC = () => {
  const { courseId: courseSlug } = useParams<{ courseId: string }>();
  const { isLoggedIn, isEnrolled, token } = useAuth();

  if (!courseSlug) {
    return <Navigate to="/404" replace />;
  }

  const isUserEnrolled = isEnrolled(courseSlug);

  const {
    data: course,
    isLoading,
    isError,
  } = useQuery<CourseDetails>({
    queryKey: ['course', courseSlug],
    queryFn: () => fetchCourseBySlug(courseSlug!, token),
    enabled: !!courseSlug && !!token && isLoggedIn,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-8 bg-red-50">
        <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
        <h1 className="text-2xl font-bold text-red-800">Course Not Found</h1>
        <p className="text-gray-600 mt-2">
          The course you are looking for may not exist or the link is invalid.
        </p>
        <Link to="/my-courses">
          <Button className="mt-4" variant="outline">
            Go Back to My Courses
          </Button>
        </Link>
      </div>
    );
  }

  if (!isUserEnrolled) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-8 bg-yellow-50">
        <AlertTriangle className="w-12 h-12 text-yellow-600 mb-4" />
        <h1 className="text-2xl font-bold text-yellow-800">Access Denied</h1>
        <p className="text-gray-600 mt-2">You must be enrolled in this course to view its content.</p>
        <Link to="/courses">
          <Button className="mt-4">View Course Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-4">
      <main className="lg:col-span-3 bg-black flex flex-col">
        <Header />
        <div className="w-full aspect-video bg-black">
          <video key={course.videoUrl} className="w-full h-full" controls autoPlay>
            <source src={course.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="p-6 text-white">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-lg text-muted-foreground mt-1">by {course.instructor}</p>
          <div className="mt-4 text-gray-400">
            <p>{course.description}</p>
          </div>
        </div>
      </main>
      <aside className="lg:col-span-1 bg-card border-l p-6 flex flex-col">
        <Link
          to="/my-courses"
          className="flex items-center text-sm font-medium text-primary mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Courses
        </Link>
        <h2 className="text-xl font-semibold mb-4">Course Content</h2>
        <div className="flex-grow overflow-y-auto space-y-2">
          {course.lessons?.map((lesson, index) => (
            <div
              key={index}
              className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
            >
              <p className="font-semibold text-sm">
                Module {index + 1}: {lesson.title}
              </p>
              <p className="text-xs text-muted-foreground">{lesson.duration} mins</p>
            </div>
          ))}
          {!course.lessons || course.lessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No lessons found for this course.</p>
          ) : null}
        </div>
      </aside>
    </div>
  );
};

export default CoursePlayer;
