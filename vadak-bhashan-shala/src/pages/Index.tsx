import React from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import CourseGrid from '@/components/CourseGrid';
import Blogs from '@/components/Blogs'; // Changed import from Testimonials to Blogs
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <About />
          <CourseGrid />
          <Blogs /> {/* Changed component from Testimonials to Blogs */}
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;