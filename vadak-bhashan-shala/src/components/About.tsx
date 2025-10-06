import React, { useEffect, useState } from "react";
import { Target, Lightbulb, TrendingUp } from "lucide-react";

const STRAPI_API_URL = import.meta.env.VITE_STRAPI_API_URL;

interface AboutContent {
  title: string;
  subtitle: string;
  mainImageUrl: string;
  mission_title: string;
  mission_description: string;
}

const About: React.FC = () => {
  const [content, setContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    const fetchAbout = async () => {
      if (!STRAPI_API_URL) {
        console.error("❌ VITE_STRAPI_API_URL is missing. Check your .env file.");
        return;
      }

      try {
        // ✅ Try single type first
        let res = await fetch(`${STRAPI_API_URL}/api/about?populate=main_image`);

        // If single type not found (404), try collection
        if (res.status === 404) {
          console.warn("⚠️ /api/about not found — trying /api/abouts instead...");
          res = await fetch(`${STRAPI_API_URL}/api/abouts?populate=main_image`);
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch about content: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log("✅ About API data:", data);

        // ✅ Handle both single and collection responses
        const entry = Array.isArray(data.data)
          ? data.data[0]
          : data.data;

        if (!entry) {
          console.warn("⚠️ No about data found in response.");
          return;
        }

        // ✅ Handle Strapi v4 (attributes) or v5 (flattened)
        const attributes = entry.attributes || entry;

        // ✅ Handle main_image as array or object
        let imageUrl = "";
        const mainImage = attributes.main_image;

        if (Array.isArray(mainImage) && mainImage.length > 0) {
          imageUrl = `${STRAPI_API_URL}${mainImage[0].url}`;
        } else if (mainImage?.data?.attributes?.url) {
          imageUrl = `${STRAPI_API_URL}${mainImage.data.attributes.url}`;
        } else if (mainImage?.url) {
          imageUrl = `${STRAPI_API_URL}${mainImage.url}`;
        }

        setContent({
          title: attributes.title || "About Us",
          subtitle: attributes.subtitle || "",
          mainImageUrl: imageUrl,
          mission_title: attributes.mission_title || "Our Mission & Vision",
          mission_description:
            attributes.mission_description ||
            "Empowering learners worldwide through knowledge and innovation.",
        });
      } catch (err) {
        console.error("❌ Error fetching about content:", err);
      }
    };

    fetchAbout();
  }, []);

  if (!content)
    return (
      <div className="py-20 bg-gray-50">
        <p className="text-center text-gray-700">Loading About section...</p>
      </div>
    );

  return (
    <section id="about" className="py-20 md:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            {content.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {content.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Image */}
          <div className="order-2 lg:order-1">
            {content.mainImageUrl ? (
              <img
                src={content.mainImageUrl}
                alt={content.title}
                className="w-full h-auto object-cover rounded-2xl shadow-2xl transform hover:scale-[1.01] transition duration-500"
              />
            ) : (
              <div className="w-full h-80 bg-gray-300 rounded-2xl flex items-center justify-center text-gray-500">
                Image Placeholder
              </div>
            )}
          </div>

          {/* Right Content */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-blue-100">
              <div className="flex items-center text-blue-600 mb-4">
                <Target className="w-8 h-8 mr-3" />
                <h3 className="text-3xl font-bold">{content.mission_title}</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mt-4">
                {content.mission_description}
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start">
                  <Lightbulb className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <p className="ml-3 text-gray-700 font-medium">
                    Innovative Solutions
                  </p>
                </div>
                <div className="flex items-start">
                  <TrendingUp className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <p className="ml-3 text-gray-700 font-medium">
                    Sustainable Growth Strategies
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
