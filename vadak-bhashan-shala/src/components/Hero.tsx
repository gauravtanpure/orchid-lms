import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, ArrowRight, CheckCircle, Zap, Star } from "lucide-react";

const STRAPI_API_URL = import.meta.env.VITE_STRAPI_API_URL;

interface HeroContent {
  title_en: string;
  title_mr: string;
  subtitle_en: string;
  subtitle_mr: string;
}

const Hero = () => {
  const [content, setContent] = useState<HeroContent | null>(null);
  const { language } = useLanguage();

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="relative mb-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-300 border-t-transparent rounded-full animate-spin-slow"></div>
        </div>
        <p className="text-slate-600 font-medium animate-pulse">Loading amazing content...</p>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float-slow"></div>
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] animate-slide-pattern" 
           style={{
             backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59 130 246) 1px, transparent 0)`,
             backgroundSize: '50px 50px'
           }}>
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Badge/Label at top */}
        <div className="mb-8 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-sm font-semibold text-blue-700">Welcome to the Future</span>
          </div>
        </div>

        {/* Main content card */}
        <div className="w-full max-w-5xl animate-scale-in">
          <div className="relative bg-white/90 backdrop-blur-xl border-2 border-slate-200/50 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Decorative top border animation */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-x"></div>
            
            {/* Inner content */}
            <div className="relative p-8 sm:p-12 lg:p-16">
              
              {/* Title section */}
              <div className="text-center mb-8">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-tight mb-6 animate-fade-in-down">
                  <span className="inline-block hover:scale-105 transition-transform duration-300">
                    {language === 'mr' ? content.title_mr : content.title_en}
                  </span>
                </h1>
                
                <div className="flex items-center justify-center gap-2 mb-8">
                  <div className="h-1 w-12 bg-gradient-to-r from-transparent to-blue-600 rounded-full"></div>
                  <Star className="w-5 h-5 text-blue-600 fill-blue-600 animate-spin-slow" />
                  <div className="h-1 w-12 bg-gradient-to-l from-transparent to-blue-600 rounded-full"></div>
                </div>
                
                <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto animate-fade-in-up">
                  {language === 'mr' ? content.subtitle_mr : content.subtitle_en}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-bounce-in">
                <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </button>
                
                <button className="group px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 text-lg font-bold rounded-xl shadow-md transition-all duration-300 hover:bg-slate-50 hover:shadow-lg hover:border-slate-400 hover:scale-105">
                  <span className="flex items-center gap-2">
                    Learn More
                    <Zap className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                  </span>
                </button>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in-up-delay">
                {[
                  { icon: CheckCircle, text: "Fast & Reliable" },
                  { icon: Zap, text: "Easy to Use" },
                  { icon: Star, text: "Best Quality" }
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className="group flex items-center justify-center gap-3 p-4 bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <feature.icon className="w-5 h-5 text-blue-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                    <span className="text-sm font-semibold text-slate-700">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative corner elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full blur-2xl opacity-20 animate-pulse-slow"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-2xl opacity-20 animate-pulse-slow animation-delay-1000"></div>
          </div>
        </div>

        {/* Bottom decorative elements */}
        <div className="mt-12 flex items-center gap-8 animate-fade-in-up-late">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white shadow-md animate-bounce-subtle"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
          <p className="text-sm text-slate-600 font-medium">
            Join <span className="font-bold text-blue-600">10,000+</span> happy users
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, -20px) scale(1.05); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 20px) scale(1.05); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translate(-10px, -10px) scale(1); }
          50% { transform: translate(10px, 10px) scale(1.08); }
        }
        
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.8); }
          50% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes slide-pattern {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-float { animation: float 20s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 25s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 30s ease-in-out infinite; }
        .animate-fade-in-down { animation: fade-in-down 0.8s ease-out; }
        .animate-scale-in { animation: scale-in 0.6s ease-out 0.2s both; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out 0.4s both; }
        .animate-bounce-in { animation: bounce-in 0.8s ease-out 0.6s both; }
        .animate-fade-in-up-delay { animation: fade-in-up 0.8s ease-out 0.8s both; }
        .animate-fade-in-up-late { animation: fade-in-up 0.8s ease-out 1s both; }
        .animate-gradient-x { 
          background-size: 200% 100%;
          animation: gradient-x 3s ease infinite; 
        }
        .animate-slide-pattern { animation: slide-pattern 60s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        .animation-delay-1000 { animation-delay: 1s; }
      `}</style>
    </section>
  );
};

export default Hero;