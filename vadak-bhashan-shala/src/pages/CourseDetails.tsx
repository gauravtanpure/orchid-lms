import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  duration: number;
  price: number;
  videoUrl: string;
  thumbnailUrl: string;
  completionRate?: number;
}

const CourseDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/courses/slug/${slug}`);
        if (!data) throw new Error('Course not found');
        setCourse(data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Course not found');
        // Redirect to /courses after 2 seconds
        setTimeout(() => navigate('/courses'), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex justify-center items-center flex-grow">
          <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
          <p className="ml-2 text-gray-600">Loading course...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <Header />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Oops! {error}</h2>
        <p className="text-gray-500">Redirecting to courses...</p>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/my-courses')} className="mb-6 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Courses
        </Button>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="rounded-xl shadow-lg w-full object-cover"
          />

          <div>
            <h1 className="text-4xl font-bold text-indigo-700 mb-4">{course.title}</h1>
            <p className="text-gray-700 mb-4">{course.description}</p>

            <div className="space-y-2 mb-6">
              <p><strong>Instructor:</strong> {course.instructor}</p>
              <p><strong>Category:</strong> {course.category}</p>
              <p><strong>Duration:</strong> {course.duration} hours</p>
              <p><strong>Price:</strong> ₹{course.price}</p>
            </div>

            {course.videoUrl && (
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border">
                <iframe
                  src={course.videoUrl}
                  title={course.title}
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetails;
