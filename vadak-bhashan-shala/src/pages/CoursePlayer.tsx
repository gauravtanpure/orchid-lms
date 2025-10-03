// /frontend/src/pages/CoursePlayer.tsx
import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Course } from '@/types';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const fetchCourseById = async (courseId: string): Promise<Course> => {
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
  if (!isLoading && course && !isEnrolled(course._id)) {
      return <Navigate to="/my-courses" replace />;
  }

  if (isError || !course) {
    return <div className="flex h-screen items-center justify-center text-red-500"><AlertTriangle className="mr-2"/> Course not found.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow grid lg:grid-cols-4">
        <main className="lg:col-span-3 bg-black flex flex-col">
          <div className="w-full aspect-video bg-black">
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
              <p className="text-sm text-muted-foreground">{course.duration} hours</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CoursePlayer;