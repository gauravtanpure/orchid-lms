// /frontend/src/pages/CoursePlayer.tsx
import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Course } from '@/types';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const fetchCourseById = async (courseId: string): Promise<Course> => {
  // 🟢 CORRECT: This is the request that receives the 404, now fixed in courseRoutes.js
  const { data } = await axios.get(`${API_URL}/api/courses/${courseId}`); 
  return data;
};

const CoursePlayer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, isEnrolled } = useAuth();

  const { data: course, isLoading, isError } = useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourseById(courseId!),
    enabled: !!courseId,
  });

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }

  // Security check: Ensure the user is enrolled in this course
  if (!isEnrolled(courseId!)) {
    // Redirect if not enrolled. The enrollment check relies on AuthContext being up-to-date.
    return <Navigate to="/" replace />;
  }

  if (isError || !course) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-xl font-semibold">Error Loading Course</h1>
        <p className="text-muted-foreground">The course could not be found or loaded.</p>
        <Link to="/my-courses" className="mt-4">
            <Button>Go to My Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-grow grid lg:grid-cols-4">
        <main className="lg:col-span-3 bg-black flex flex-col">
          <div className="w-full aspect-video bg-black">
            {/* 🟢 VIDEO PLAYER: This relies on course.videoUrl being fetched successfully */}
            <video key={course.videoUrl} className="w-full h-full" controls autoPlay>
              <source src={course.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="p-6 text-white">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-lg text-muted-foreground mt-1">by {course.instructor}</p>
          </div>
        </main>
        <aside className="lg:col-span-1 bg-card border-l p-6 flex flex-col">
          <Link to="/my-courses" className="flex items-center text-sm font-medium text-primary mb-6 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Courses
          </Link>
          <h2 className="text-xl font-semibold mb-4">Course Content</h2>
          <div className="flex-grow overflow-y-auto">
            {/* Future: Map over lessons here */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary">
              <p className="font-semibold">{course.title}</p>
              <p className="text-sm text-muted-foreground">Video 1: Introduction</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CoursePlayer;