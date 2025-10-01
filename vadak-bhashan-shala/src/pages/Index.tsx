import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import CourseGrid from "@/components/CourseGrid";
import Blogs from "@/components/Blogs";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // remove leading "/"
    const path = location.pathname.substring(1); // e.g., "courses", "about"
    
    const sectionIdMap: { [key: string]: string } = {
      "courses": "courses",
      "about": "about",
      "blogs": "blogs",
      "contact": "contact",
      "": "top", // homepage "/"
    };

    const idToScrollTo = sectionIdMap[path];

    if (idToScrollTo && idToScrollTo !== "top") {
      const element = document.getElementById(idToScrollTo);
      if (element) {
        requestAnimationFrame(() => {
          element.scrollIntoView({ behavior: "smooth" });
        });
      }
    } else {
      // Scroll to top on home
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
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
