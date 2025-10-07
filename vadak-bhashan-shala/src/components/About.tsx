import React, { useEffect, useState } from "react";
import { Target, Users, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const STRAPI_API_URL = import.meta.env.VITE_STRAPI_API_URL;

// ✅ 1. Added subtitle fields to the interface
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
        
        // ✅ 2. Fetched and set the new subtitle fields
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
      <div className="py-28 bg-slate-50">
        <p className="text-center text-slate-600 animate-pulse">Loading content...</p>
      </div>
    );
  }

  return (
    <section id="about" className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
            {language === 'mr' ? content.title_mr : content.title_en}
          </h2>
          {/* ✅ 3. Replaced static text with dynamic, multilingual subtitle */}
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            {language === 'mr' ? content.subtitle_mr : content.subtitle_en}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center text-indigo-600">
              <Target className="w-8 h-8 mr-4 flex-shrink-0" />
              <h3 className="text-3xl font-bold text-slate-800">
                {language === 'mr' ? "आमचे ध्येय" : "Our Mission"}
              </h3>
            </div>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed whitespace-pre-line">
              {language === 'mr' ? content.Mission_mr : content.Mission_en}
            </p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center text-indigo-600">
              <Users className="w-8 h-8 mr-4 flex-shrink-0" />
              <h3 className="text-3xl font-bold text-slate-800">
                {language === 'mr' ? "आमचा संघ" : "Our Team"}
              </h3>
            </div>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed whitespace-pre-line">
              {language === 'mr' ? content.our_team_mr : content.our_team_en}
            </p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center text-indigo-600">
              <ShieldCheck className="w-8 h-8 mr-4 flex-shrink-0" />
              <h3 className="text-3xl font-bold text-slate-800">
                {language === 'mr' ? "आम्हाला का निवडा?" : "Why Choose Us?"}
              </h3>
            </div>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed whitespace-pre-line">
              {language === 'mr' ? content.Why_ChooseUs_mr : content.Why_ChooseUs_en}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;