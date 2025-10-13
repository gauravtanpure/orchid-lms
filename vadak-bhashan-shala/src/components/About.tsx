import React, { useEffect, useState } from "react";
import { Target, Users, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const STRAPI_API_URL = import.meta.env.VITE_STRAPI_API_URL;

interface AboutContent {
  title_en: string;
  title_mr: string;
  subtitle_en: string; 
  subtitle_mr: string;
  Mission_en: string; 
  Mission_mr: string;
  our_team_en: string;
  our_team_mr: string;
  Why_ChooseUs_en: string;
  Why_ChooseUs_mr: string;
}

const About: React.FC = () => {
  const [content, setContent] = useState<AboutContent | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchAbout = async () => {
      if (!STRAPI_API_URL) {
        console.error("❌ VITE_STRAPI_API_URL is missing.");
        return;
      }

      try {
        const res = await fetch(`${STRAPI_API_URL}/api/abouts?_sort=id:ASC`);

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const data = await res.json();
        const entry = data.data?.[0];

        if (!entry) {
          console.warn("⚠️ No about data found in response.");
          return;
        }
        
        setContent({
          title_en: entry.title_en || "",
          title_mr: entry.title_mr || "",
          subtitle_en: entry.subtitle_en || "",
          subtitle_mr: entry.subtitle_mr || "",
          Mission_en: entry.Mission_en || "",
          Mission_mr: entry.Mission_mr || "",
          our_team_en: entry.our_team_en || "",
          our_team_mr: entry.our_team_mr || "",
          Why_ChooseUs_en: entry.Why_ChooseUs_en || "",
          Why_ChooseUs_mr: entry.Why_ChooseUs_mr || "",
        });

      } catch (err) {
        console.error("❌ Error fetching about content:", err);
      }
    };

    fetchAbout();
  }, []);

  if (!content) {
    return (
      <div className="py-28 bg-gradient-to-br from-slate-50 to-slate-100">
        <p className="text-center text-slate-600 animate-pulse text-lg">Loading content...</p>
      </div>
    );
  }

  return (
    <section id="about" className="py-24 md:py-32 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="text-sm font-semibold tracking-widest text-indigo-600 uppercase">
              {language === 'mr' ? "आमच्याबद्दल" : "About Us"}
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
            {language === 'mr' ? content.title_mr : content.title_en}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto mb-6 rounded-full"></div>
          <p className="mt-6 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
            {language === 'mr' ? content.subtitle_mr : content.subtitle_en}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          
          {/* Mission - Full Width */}
          <div className="lg:col-span-2 bg-white p-10 md:p-12 rounded-3xl shadow-sm border border-slate-200 hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 group">
            <div className="flex items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mr-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  {language === 'mr' ? "आमचे ध्येय" : "Our Mission"}
                </h3>
                <div className="w-16 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
              </div>
            </div>
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed whitespace-pre-line font-light">
              {language === 'mr' ? content.Mission_mr : content.Mission_en}
            </p>
          </div>

          {/* Our Team */}
          <div className="bg-white p-10 md:p-12 rounded-3xl shadow-sm border border-slate-200 hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 group">
            <div className="flex items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mr-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  {language === 'mr' ? "आमचा संघ" : "Our Team"}
                </h3>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
              </div>
            </div>
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed whitespace-pre-line font-light">
              {language === 'mr' ? content.our_team_mr : content.our_team_en}
            </p>
          </div>

          {/* Why Choose Us */}
          <div className="bg-white p-10 md:p-12 rounded-3xl shadow-sm border border-slate-200 hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 group">
            <div className="flex items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mr-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  {language === 'mr' ? "आम्हाला का निवडा?" : "Why Choose Us?"}
                </h3>
                <div className="w-16 h-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full"></div>
              </div>
            </div>
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed whitespace-pre-line font-light">
              {language === 'mr' ? content.Why_ChooseUs_mr : content.Why_ChooseUs_en}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;