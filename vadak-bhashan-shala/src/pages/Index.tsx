import React from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import CourseGrid from '@/components/CourseGrid';
import Blogs from '@/components/Blogs'; 
import Footer from '@/components/Footer';
// 1. IMPORT THE NEW COMPONENT
import Contact from '@/components/Contact'; 

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <About />
          <CourseGrid />
          <Blogs />
          {/* 2. RENDER THE NEW COMPONENT */}
          <Contact /> 
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;