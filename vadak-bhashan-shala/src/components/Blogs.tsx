import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337';

interface BlogPost {
  _id: string;
  title: { en: string; mr: string };
  excerpt: { en: string; mr: string };
  imageUrl: string;
  category: { en: string; mr: string };
  readTime: { en: string; mr: string };
  createdAt: string;
}

const Blogs: React.FC = () => {
  const { t, language } = useLanguage();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/blogs`);
        setBlogPosts(response.data);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
        setError("Could not load blog posts at this time.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <section id="blogs" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Refined Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50"></div>
            <span className="mx-4 text-primary font-semibold text-sm tracking-wider uppercase">
              {t('blog_badge') || 'Insights & Articles'}
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            {t('latest_blogs') || 'Latest Publications'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('blog_subtitle') || 'Expert insights and thought leadership from our team'}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200 animate-pulse">
                <div className="w-full h-64 bg-gray-200" />
                <div className="p-8 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-20 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-200 mb-4">
              <span className="text-red-600 text-2xl font-semibold">!</span>
            </div>
            <p className="text-red-600 text-lg font-medium">{error}</p>
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No articles available at the moment.</p>
          </div>
        ) : (
          <>
            {/* Centered Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
              {currentPosts.map((post) => (
                <article
                  key={post._id}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative overflow-hidden h-64 bg-gray-100">
                    <img
                      src={post.imageUrl}
                      alt={post.title[language as keyof typeof post.title]}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="absolute top-5 left-5 bg-white text-gray-900 text-xs font-semibold px-4 py-2 rounded-md shadow-md">
                      {post.category[language as keyof typeof post.category]}
                    </span>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {post.readTime[language as keyof typeof post.readTime]}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {post.title[language as keyof typeof post.title]}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed flex-grow">
                      {post.excerpt[language as keyof typeof post.excerpt]}
                    </p>
                    
                    <Link 
                      to={`/blog/${post._id}`}
                      className="inline-flex items-center text-primary font-semibold text-sm hover:gap-3 transition-all duration-300 group/link mt-auto"
                    >
                      <span className="relative">
                        {t('read_more') || 'Read Article'}
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 origin-left transition-transform duration-300 group-hover/link:scale-x-100" />
                      </span>
                      <span className="ml-2 transition-transform duration-300 group-hover/link:translate-x-1">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Professional Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-11 h-11 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700 transition-all"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="px-3 text-gray-400 font-medium">...</span>
                      ) : (
                        <button
                          onClick={() => paginate(page as number)}
                          className={`w-11 h-11 rounded-lg font-semibold transition-all ${
                            currentPage === page
                              ? 'bg-primary text-white shadow-md border-2 border-primary'
                              : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-11 h-11 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700 transition-all"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Refined Results Info */}
                <div className="text-sm text-gray-500 font-medium">
                  Displaying {indexOfFirstPost + 1}–{Math.min(indexOfLastPost, blogPosts.length)} of {blogPosts.length} articles
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Blogs;