import React, { useEffect } from 'react'; // Import useEffect
import { useLocation } from 'react-router-dom'; // Import useLocation
// Removed: import { LanguageProvider } from '@/contexts/LanguageContext'; // Removed redundant import
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import CourseGrid from '@/components/CourseGrid';
import Blogs from '@/components/Blogs'; 
import Footer from '@/components/Footer';
import Contact from '@/components/Contact'; 

const Index = () => {
  const location = useLocation();

  // NEW: Effect to scroll to the correct section based on the route path
  useEffect(() => {
    const path = location.pathname.substring(1); // e.g., 'courses', 'about', 'contact'
    
    // Maps route path to the HTML section ID
    const sectionIdMap: { [key: string]: string } = {
        'courses': 'courses',
        'about': 'about',
        'blogs': 'blogs',
        'contact': 'contact',
        '': 'top', // For the root path /
    };
    
    const idToScrollTo = sectionIdMap[path];

    if (idToScrollTo && idToScrollTo !== 'top') {
        const element = document.getElementById(idToScrollTo);
        if (element) {
            // Use requestAnimationFrame for smooth scroll behavior after render
            requestAnimationFrame(() => {
                element.scrollIntoView({ behavior: 'smooth' });
            });
        }
    } else {
        // Scroll to top for home page
        window.scrollTo(0, 0);
    }
  }, [location.pathname]);


  return (
    // Removed redundant LanguageProvider
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* NEW: Added sections with IDs for scroll targeting */}
        <section id="top"> 
            <Hero />
        </section>
        <section id="about">
            <About />
        </section>
        <section id="courses">
            <CourseGrid />
        </section>
        <section id="blogs">
            <Blogs />
        </section>
        <section id="contact">
            <Contact /> 
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;