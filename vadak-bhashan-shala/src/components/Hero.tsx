import { useEffect, useState } from "react";

// ✅ Uses environment variable for Strapi API base URL
const STRAPI_API_URL = import.meta.env.VITE_STRAPI_API_URL;

interface HeroContent {
  title: string;
  subtitle: string;
  backgroundImageUrl: string;
}

const Hero = () => {
  const [content, setContent] = useState<HeroContent | null>(null);

  useEffect(() => {
    const fetchHero = async () => {
      if (!STRAPI_API_URL) {
        console.error(
          "VITE_STRAPI_API_URL is not defined. Check your .env file and restart the dev server."
        );
        return;
      }

      try {
        const res = await fetch(
          `${STRAPI_API_URL}/api/heroes?populate=background_image`
        );

        if (!res.ok) {
          throw new Error(
            `Failed to fetch hero content: ${res.status} ${res.statusText}`
          );
        }

        const data = await res.json();
        console.log("✅ Hero API data:", data);

        if (data.data && data.data.length > 0) {
          const heroData = data.data[0]; // Strapi returns an array for collection types
          const attributes = heroData; // your response shows fields directly, not under "attributes"

          // ✅ Handle background_image as an array
          let imageUrl = "";
          const bgImage = attributes.background_image;

          if (Array.isArray(bgImage) && bgImage.length > 0) {
            imageUrl = `${STRAPI_API_URL}${bgImage[0].url}`;
          } else if (bgImage?.data?.attributes?.url) {
            imageUrl = `${STRAPI_API_URL}${bgImage.data.attributes.url}`;
          }

          setContent({
            title: attributes.title,
            subtitle: attributes.subtitle,
            backgroundImageUrl: imageUrl,
          });
        } else {
          console.warn("⚠️ No hero data found in API response.");
        }
      } catch (err) {
        console.error("❌ Error fetching hero content:", err);
      }
    };

    fetchHero();
  }, []);

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-xl text-white">Loading...</p>
      </div>
    );
  }

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-screen text-white text-center px-6 md:px-12 bg-cover bg-center"
      style={{ backgroundImage: `url(${content.backgroundImageUrl})` }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      <div className="relative z-10 max-w-4xl p-6 bg-black/30 rounded-xl backdrop-blur-sm">
        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight animate-fade-in-down">
          {content.title}
        </h1>
        <p className="text-xl md:text-2xl font-light leading-relaxed animate-fade-in-up">
          {content.subtitle}
        </p>
        <button className="mt-8 px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-full shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105">
          Get Started
        </button>
      </div>
    </section>
  );
};

export default Hero;
