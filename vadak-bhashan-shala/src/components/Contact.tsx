import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext"; // ✅ 1. Import the language context

const STRAPI_API_URL = import.meta.env.VITE_STRAPI_API_URL;

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// ✅ 2. Updated interface with all your new multilingual fields
interface ContactContent {
  title_en: string;
  title_mr: string;
  subtitle_en: string;
  subtitle_mr: string;
  address_en: string;
  address_mr: string;
  phone_en: string;
  phone_mr: string;
  email_en: string;
  email_mr: string;
}

const Contact: React.FC = () => {
  const { language, t } = useLanguage(); // ✅ 3. Get language and translation function
  const [content, setContent] = useState<ContactContent | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  useEffect(() => {
    const fetchContact = async () => {
      if (!STRAPI_API_URL) {
        console.error("❌ VITE_STRAPI_API_URL missing. Check your .env file.");
        return;
      }

      try {
        const res = await fetch(`${STRAPI_API_URL}/api/contacts`);
        if (!res.ok) {
          throw new Error(`Failed to fetch contact content: ${res.status}`);
        }
        const data = await res.json();

        if (data.data && data.data.length > 0) {
          const item = data.data[0];

          // ✅ 4. Set state with all new multilingual fields from the API
          setContent({
            title_en: item.title_en || "",
            title_mr: item.title_mr || "",
            subtitle_en: item.subtitle_en || "",
            subtitle_mr: item.subtitle_mr || "",
            address_en: item.address_en || "",
            address_mr: item.address_mr || "",
            phone_en: item.phone_en || "",
            phone_mr: item.phone_mr || "",
            email_en: item.email_en || "",
            email_mr: item.email_mr || "",
          });
        } else {
          console.warn("⚠️ No contact entries found in API response.");
        }
      } catch (err) {
        console.error("❌ Error fetching contact content:", err);
      }
    };

    fetchContact();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    // This is a simulated submission. You would replace this with a real API call.
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  if (!content) {
    return (
      <div className="py-20 bg-gray-50">
        <p className="text-center text-gray-700">Loading contact info...</p>
      </div>
    );
  }

  // ✅ 5. Dynamically create contact info based on the selected language
  const address = language === 'mr' ? content.address_mr : content.address_en;
  const phone = language === 'mr' ? content.phone_mr : content.phone_en;
  const email = language === 'mr' ? content.email_mr : content.email_en;

  const contactInfo = [
    {
      icon: MapPin,
      value: address,
      link: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
    },
    { icon: Phone, value: phone, link: `tel:${phone}` },
    { icon: Mail, value: email, link: `mailto:${email}` },
  ];

  return (
    <section id="contact" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* ✅ 6. Render all text dynamically based on language */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            {language === 'mr' ? content.title_mr : content.title_en}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === 'mr' ? content.subtitle_mr : content.subtitle_en}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info Panel */}
          <div className="lg:col-span-1 p-8 bg-white rounded-xl shadow-2xl h-full flex flex-col justify-center border border-gray-100">
            <h3 className="text-2xl font-bold text-blue-600 mb-6">{t('reachOut')}</h3>
            <div className="space-y-6">
              {contactInfo.map(
                (item, index) =>
                  item.value && (
                    <a
                      key={index}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start group p-3 -m-3 rounded-lg transition-colors duration-200 hover:bg-blue-50"
                    >
                      <item.icon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1 mr-4" />
                      <p className="text-base font-medium text-gray-800">
                        {item.value}
                      </p>
                    </a>
                  )
              )}
            </div>
          </div>

          {/* Contact Form Panel */}
          <div className="lg:col-span-2 p-10 bg-white rounded-xl shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t('sendMessageTitle')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NOTE: Make sure keys like 'yourName', 'yourEmail', etc., exist in your language files */}
              <input
                name="name"
                placeholder={t('yourName')}
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <input
                name="email"
                placeholder={t('yourEmail')}
                value={formData.email}
                onChange={handleChange}
                type="email"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <input
                name="subject"
                placeholder={t('subject')}
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <textarea
                name="message"
                placeholder={t('yourMessage')}
                value={formData.message}
                onChange={handleChange}
                rows={5}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
                disabled={status === "loading"}
              >
                {status === "loading"
                  ? t('sending')
                  : status === "success"
                  ? t('sentThankYou')
                  : t('sendMessage')}
              </button>
              {status === "error" && (
                <p className="text-red-500 text-center">{t('sendMessageError')}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;