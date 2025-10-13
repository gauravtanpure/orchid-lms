import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext'; // Corrected import path
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

// Define the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Fallback for development

// 1. Updated interface to match the backend model
interface BlogPost {
  _id: string; // Changed from id: number to _id: string
  title: {
    en: string;
    mr: string;
  };
  excerpt: {
    en: string;
    mr: string;
  };
  imageUrl: string;
  category: {
    en: string;
    mr: string;
  };
  readTime: {
    en: string;
    mr: string;
  };
  createdAt: string; // Changed from date object to createdAt string
}

const Blogs: React.FC = () => {
  const { t, language } = useLanguage();
  // 2. Add state for blogs, loading, and errors
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Fetch data from the backend when the component mounts
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        // Using the public endpoint to get all blogs
        const response = await axios.get(`${API_URL}/api/blogs`);
        // We only want to show the latest 3 on the homepage
        setBlogPosts(response.data.slice(0, 3)); 
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
        setError("Could not load blog posts at this time.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []); // Empty dependency array ensures this runs only once

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section id="blogs" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-heading mb-4">
            {t('latest_blogs')}
          </h2>
          <p className="text-subheading max-w-2xl mx-auto">
            {t('blog_subtitle')}
          </p>
        </div>

        {/* 4. Conditional Rendering based on loading and error state */}
        {loading ? (
          <div className="text-center text-lg">Loading posts...</div>
        ) : error ? (
          <div className="text-center text-red-500 text-lg">{error}</div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center text-lg text-muted-foreground">No blog posts found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {blogPosts.map((post) => (
              <article
                key={post._id} // Use _id from MongoDB
                className="group bg-card rounded-xl shadow-lg border border-border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/50"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title[language as keyof typeof post.title]}
                    className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    {post.category[language as keyof typeof post.category]}
                  </span>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1 text-primary" />
                          {post.readTime[language as keyof typeof post.readTime]}
                      </span>
                      {/* Display the formatted date from createdAt */}
                      <span>{formatDate(post.createdAt)}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold mt-2 mb-3 text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title[language as keyof typeof post.title]}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                    {post.excerpt[language as keyof typeof post.excerpt]}
                  </p>
                  
                  <Link 
                      to={`/blog/${post._id}`} // Link to the specific blog post
                      className="inline-flex items-center text-primary font-semibold transition-transform duration-300 group-hover:translate-x-1"
                  >
                      {t('read_more')} &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* CTA to Blog Page */}
        <div className="text-center mt-16">
          <Link to="/blogs">
            <button className="btn-primary shadow-lg hover:shadow-xl transition-shadow">
              {t('view_all_blogs')}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Blogs;