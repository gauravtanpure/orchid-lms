import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { BookOpen, Calendar } from 'lucide-react';

// Use a library for rendering markdown, like react-markdown
import ReactMarkdown from 'react-markdown'; 
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown

// 1. Define the Blog Post Interface (should match your model)
interface BlogPost {
  _id: string;
  title: { en: string; mr: string };
  excerpt: { en: string; mr: string };
  content: { en: string; mr: string };
  imageUrl: string;
  category: { en: string; mr: string };
  readTime: { en: string; mr: string };
  createdAt: string;
}

const API_URL =
  import.meta.env.VITE_REACT_APP_BACKEND_URL ||
  import.meta.env.VITE_STRAPI_API_URL ||
  'http://localhost:1337';

const BlogDetails: React.FC = () => {
  const { blogId } = useParams<{ blogId: string }>(); // Get the ID from the URL
  const { language, t } = useLanguage();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!blogId) {
      setError("No blog ID provided.");
      setLoading(false);
      return;
    }

    const fetchBlog = async () => {
      try {
        setLoading(true);
        // This targets your backend API: GET /api/blogs/:id
        const response = await axios.get(`${API_URL}/api/blogs/${blogId}`);
        setBlog(response.data);
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
        setError("Blog post not found or server error.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [blogId]);

  if (loading) {
    return <div className="text-center py-16">Loading article...</div>;
  }

  if (error || !blog) {
    // Navigate to a dedicated Not Found page or show a friendly message
    return <div className="text-center py-16 text-red-500">Error: {error || "Blog post not found."}</div>;
  }

  const currentTitle = blog.title[language as keyof typeof blog.title];
  const currentContent = blog.content[language as keyof typeof blog.content];
  const currentCategory = blog.category[language as keyof typeof blog.category];
  const currentReadTime = blog.readTime[language as keyof typeof blog.readTime];
  
  const formatDate = (dateString: string) => format(new Date(dateString), 'MMMM dd, yyyy');

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header Image */}
        <img 
          src={blog.imageUrl} 
          alt={currentTitle} 
          className="w-full h-80 object-cover"
        />

        <div className="p-6 md:p-10">
          {/* Metadata */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <span className="text-primary font-semibold uppercase">{currentCategory}</span>
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1" />
              <span>{currentReadTime}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatDate(blog.createdAt)}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            {currentTitle}
          </h1>

          {/* Content (Rendered as Markdown) */}
          <div className="prose max-w-none prose-lg prose-indigo">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {currentContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;