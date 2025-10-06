import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const STRAPI_API_URL = import.meta.env.VITE_STRAPI_API_URL;

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactContent {
  title: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
}

const Contact: React.FC = () => {
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
        // ✅ Correct endpoint for a collection type
        const res = await fetch(`${STRAPI_API_URL}/api/contacts`);

        if (!res.ok) {
          throw new Error(
            `Failed to fetch contact content: ${res.status} ${res.statusText}`
          );
        }

        const data = await res.json();
        console.log("✅ Contact API data:", data);

        // ✅ Handle both Strapi v4 (attributes) and v5 (flattened)
        if (data.data && data.data.length > 0) {
          const item = data.data[0];
          const attributes = item.attributes || item;

          setContent({
            title: attributes.title || "Contact Us",
            subtitle:
              attributes.subtitle || "We’d love to hear from you!",
            address: attributes.address || "",
            phone: attributes.phone || "",
            email: attributes.email || "",
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
    console.log("📤 Form submitted:", formData);

    // Simulated form submission
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  if (!content)
    return (
      <div className="py-20 bg-gray-50">
        <p className="text-center text-gray-700">Loading contact info...</p>
      </div>
    );

  const contactInfo = [
    {
      icon: MapPin,
      value: content.address,
      link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        content.address
      )}`,
    },
    { icon: Phone, value: content.phone, link: `tel:${content.phone}` },
    { icon: Mail, value: content.email, link: `mailto:${content.email}` },
  ];

  return (
    <section id="contact" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            {content.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info Panel */}
          <div className="lg:col-span-1 p-8 bg-white rounded-xl shadow-2xl h-full flex flex-col justify-center border border-gray-100">
            <h3 className="text-2xl font-bold text-blue-600 mb-6">Reach Out</h3>
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
              Send us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <input
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <input
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <textarea
                name="message"
                placeholder="Your Message"
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
                  ? "Sending..."
                  : status === "success"
                  ? "Sent! Thank You."
                  : "Send Message"}
              </button>

              {status === "error" && (
                <p className="text-red-500 text-center">
                  Failed to send message. Please try again.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
