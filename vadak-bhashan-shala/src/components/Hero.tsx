import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Phone, CheckCircle, Users, Award, PlayCircle } from "lucide-react";

const STRAPI_API_URL = import.meta.env.VITE_STRAPI_API_URL;

interface HeroContent {
  title_en: string;
  title_mr: string;
  subtitle_en: string;
  subtitle_mr: string;
}

// Counter animation hook
const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    
    setHasAnimated(true);
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, hasAnimated]);

  return count;
};

const Hero = () => {
  const [content, setContent] = useState<HeroContent | null>(null);
  const { language } = useLanguage();
  const navigate = useNavigate(); // Initialize useNavigate hook

  const studentsCount = useCountUp(50000);
  const coursesCount = useCountUp(500);
  const successRate = useCountUp(98);

  // Handlers for CTA buttons
  const handleGetStarted = () => {
    navigate('/courses'); // Navigate to the courses page
  };

  const handleCallUs = () => {
    navigate('/contact'); // Navigate to the contact page
  };


  useEffect(() => {
    const fetchHero = async () => {
      if (!STRAPI_API_URL) {
        console.error(
          "VITE_STRAPI_API_URL is not defined. Please check your .env file."
        );
        return;
      }

      try {
        const res = await fetch(`${STRAPI_API_URL}/api/heroes`);

        if (!res.ok) {
          throw new Error(
            `Failed to fetch hero content: ${res.status} ${res.statusText}`
          );
        }

        const data = await res.json();
        
        if (data.data && data.data.length > 0) {
          const heroData = data.data[0];
          
          setContent({
            title_en: heroData.title_en,
            title_mr: heroData.title_mr,
            subtitle_en: heroData.subtitle_en,
            subtitle_mr: heroData.subtitle_mr,
          });
        } else {
          console.warn("No hero data found in API response.");
        }
      } catch (err) {
        console.error("Error fetching hero content:", err);
      }
    };

    fetchHero();
  }, []);

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="relative mb-6">
          <div className="w-24 h-24 border-6 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-700 text-2xl font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 via-white to-slate-50">
      {/* Simple, calm background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-40"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 sm:px-8 lg:px-12 py-20">
        


        {/* Main content card - larger spacing */}
        <div className="w-full max-w-6xl">
          <div className="text-center space-y-12">
            
            {/* Title - Clear and readable */}
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
                {language === 'mr' ? content.title_mr : content.title_en}
              </h1>
              
              {/* Simple divider */}
              <div className="flex items-center justify-center">
                <div className="h-1 w-24 bg-blue-600 rounded-full"></div>
              </div>
              
              {/* Subtitle - Readable */}
              <p className="text-xl sm:text-2xl lg:text-3xl text-slate-700 leading-relaxed max-w-4xl mx-auto font-normal">
                {language === 'mr' ? content.subtitle_mr : content.subtitle_en}
              </p>
            </div>

            {/* Reduced size CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Reduced padding (py-7 -> py-4, px-12 -> px-8) and font size (text-2xl -> text-xl) */}
              <button 
                onClick={handleGetStarted} // Added click handler
                className="group px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-xl shadow-xl transition-all duration-300 hover:bg-blue-700 hover:shadow-2xl hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-6 h-6" /> {/* Reduced icon size */}
                </span>
              </button>
              
              {/* Reduced padding (py-7 -> py-4, px-12 -> px-8) and font size (text-2xl -> text-xl) */}
              <button 
                onClick={handleCallUs} // Added click handler
                className="group px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 text-xl font-bold rounded-xl shadow-xl transition-all duration-300 hover:bg-blue-50 hover:shadow-2xl hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <Phone className="w-6 h-6" /> {/* Reduced icon size */}
                  Call Us
                </span>
              </button>
            </div>

            {/* Simple, clear stats with counter animation - Reduced size */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8"> {/* Reduced gap and pt */}
              {[
                { icon: Users, value: studentsCount, suffix: "+", label: "Happy Students", color: "bg-blue-600" },
                { icon: Award, value: coursesCount, suffix: "+", label: "Expert Teachers", color: "bg-green-600" },
                { icon: CheckCircle, value: successRate, suffix: "%", label: "Success Rate", color: "bg-purple-600" }
              ].map((stat, index) => (
                <div 
                  key={index}
                  // Reduced padding (p-10 -> p-6) and increased border-radius (rounded-3xl -> rounded-2xl)
                  className="p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
                >
                  <div className="space-y-3"> {/* Reduced vertical space */}
                    {/* Reduced icon padding (p-5 -> p-4) and icon size (w-10 h-10 -> w-8 h-8) */}
                    <div className={`inline-flex p-4 ${stat.color} rounded-xl`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    {/* Reduced font size (text-5xl -> text-3xl) */}
                    <div className="text-3xl font-bold text-slate-900">
                      {stat.value.toLocaleString()}{stat.suffix}
                    </div>
                    {/* Reduced font size (text-xl -> text-lg) */}
                    <div className="text-lg font-semibold text-slate-600">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear feature highlights with icons - minor reduction for consistency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-6">
              {[
                { icon: CheckCircle, text: "Easy to Learn", color: "text-green-600" },
                { icon: PlayCircle, text: "Video Lessons", color: "text-blue-600" },
                { icon: Phone, text: "24/7 Support", color: "text-purple-600" }
              ].map((feature, index) => (
                <div 
                  key={index}
                  // Reduced padding (p-8 -> p-6)
                  className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-slate-200 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  <feature.icon className={`w-10 h-10 ${feature.color}`} /> {/* Slightly reduced icon size */}
                  <span className="text-lg font-bold text-slate-700">{feature.text}</span> {/* Slightly reduced font size */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;