import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Phone, CheckCircle, Users, Award, PlayCircle, X } from "lucide-react";

const STRAPI_API_URL = import.meta.env.VITE_STRAPI_API_URL;
const BACKEND_API_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

interface HeroContent {
  title_en: string;
  title_mr: string;
  subtitle_en: string;
  subtitle_mr: string;
}

interface ActiveBanner {
  _id: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
}

// Counter animation hook
const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  return count;
};

const Hero = () => {
  const [content, setContent] = useState<HeroContent | null>(null);
  const [banner, setBanner] = useState<ActiveBanner | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const { language } = useLanguage();
  const navigate = useNavigate();

  const studentsCount = useCountUp(50000);
  const coursesCount = useCountUp(500);
  const successRate = useCountUp(98);

  // ✅ Skip banner for 6 hours max
  const SKIP_DURATION_MS = 6 * 60 * 60 * 1000;

  const handleSkipBanner = () => {
    const expiry = Date.now() + SKIP_DURATION_MS;
    localStorage.setItem("skipBannerUntil", expiry.toString());
    setShowBanner(false);
  };

  // ✅ Fetch Hero Content (from Strapi CMS)
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch(`${STRAPI_API_URL}/api/heroes`);
        if (!res.ok) throw new Error(`Hero fetch failed: ${res.status}`);
        const data = await res.json();

        if (data.data?.length > 0) {
          const hero = data.data[0];
          setContent({
            title_en: hero.title_en,
            title_mr: hero.title_mr,
            subtitle_en: hero.subtitle_en,
            subtitle_mr: hero.subtitle_mr,
          });
        }
      } catch (err) {
        console.error("❌ Error fetching hero:", err);
      }
    };

    fetchHero();
  }, []);

  // ✅ Fetch Active Banner (from Node backend)
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const skipUntil = localStorage.getItem("skipBannerUntil");
        if (skipUntil && Date.now() < Number(skipUntil)) return; // still skipped

        const res = await fetch(`${BACKEND_API_URL}/api/banners/active`);
        if (!res.ok) return;

        const data = await res.json();
        if (data && data.isActive) {
          setBanner(data);
          setShowBanner(true);
        }
      } catch (err) {
        console.warn("⚠️ No active banner or fetch error:", err);
      }
    };

    fetchBanner();
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
      {/* 🔹 Banner Overlay */}
      {showBanner && banner && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-6 transition-all">
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-3xl w-full">
            <button
              onClick={handleSkipBanner}
              className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-2 hover:bg-black/70 transition"
              title="Skip Banner"
            >
              <X className="w-5 h-5" />
            </button>
            <a
              href={banner.link || "/"}
              target={banner.link.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
            >
              <img
                src={banner.imageUrl}
                alt="Active Banner"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </a>
          </div>
        </div>
      )}

      {/* 🔹 Main Hero Section */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center min-h-screen px-6 sm:px-8 lg:px-12 py-20 transition-all ${
          showBanner ? "blur-sm" : ""
        }`}
      >
        <div className="w-full max-w-6xl">
          <div className="text-center space-y-12">
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900">
                {language === "mr" ? content.title_mr : content.title_en}
              </h1>
              <div className="flex items-center justify-center">
                <div className="h-1 w-24 bg-blue-600 rounded-full"></div>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl text-slate-700 max-w-4xl mx-auto">
                {language === "mr" ? content.subtitle_mr : content.subtitle_en}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/courses")}
                className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-xl shadow-xl hover:bg-blue-700 hover:scale-105 transition"
              >
                Get Started <ArrowRight className="inline w-6 h-6 ml-2" />
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 text-xl font-bold rounded-xl shadow-xl hover:bg-blue-50 hover:scale-105 transition"
              >
                <Phone className="inline w-6 h-6 mr-2" />
                Call Us
              </button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8">
              {[
                { icon: Users, value: studentsCount, suffix: "+", label: "Happy Students" },
                { icon: Award, value: coursesCount, suffix: "+", label: "Expert Teachers" },
                { icon: CheckCircle, value: successRate, suffix: "%", label: "Success Rate" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-lg hover:scale-105 transition"
                >
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-slate-900">
                      {stat.value.toLocaleString()}
                      {stat.suffix}
                    </div>
                    <div className="text-lg text-slate-600">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
