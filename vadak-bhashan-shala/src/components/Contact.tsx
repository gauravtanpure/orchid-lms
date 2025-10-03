import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

// Define the shape of your form data
interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// --- Helper Components (Moved Outside) ---

// Define props for the InputField component
interface InputFieldProps {
  name: keyof FormData;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t: (key: string) => string;
}

const InputField: React.FC<InputFieldProps> = ({ name, type = "text", value, onChange, t }) => (
  <div className="mb-5">
    <label htmlFor={name} className="block text-sm font-medium text-card-foreground mb-1">
      {t(`form_${name}`)}<span className="text-red-500">*</span>
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required
      placeholder={t(`form_placeholder_${name}`)}
      className="w-full px-4 py-2 border border-border rounded-lg bg-input text-card-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
    />
  </div>
);

// Define props for the TextAreaField component
interface TextAreaFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  t: (key: string) => string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ value, onChange, t }) => (
  <div className="mb-5">
    <label htmlFor="message" className="block text-sm font-medium text-card-foreground mb-1">
      {t('form_message')}<span className="text-red-500">*</span>
    </label>
    <textarea
      id="message"
      name="message"
      rows={4}
      value={value}
      onChange={onChange}
      required
      placeholder={t('form_placeholder_message')}
      className="w-full px-4 py-2 border border-border rounded-lg bg-input text-card-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
    />
  </div>
);


// --- Main Contact Component ---

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    // **Create the payload for the API call**
    const payload = {
      access_key: "bc325bda-2fe5-463d-bcea-dcaf0be7bb79", // Your Web3Forms access key
      
      // **This sets the subject line of the email you receive**
      subject: `New Contact Form Submission: ${formData.subject}`,
      
      // **The rest of the form data for the email body**
      ...formData,
    };

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      
      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  const contactInfo = [
    { 
      icon: MapPin, 
      key: 'contact_address', 
      value: t('contact_address_text'),
      link: 'https://maps.google.com/?q=YourAddress' // Use a real address link
    },
    { 
      icon: Phone, 
      key: 'contact_phone', 
      value: '+917972945474', 
      link: 'tel:+917972945474' 
    },
    { 
      icon: Mail, 
      key: 'contact_email', 
      value: 'hello@orchid-academy.com', 
      link: 'mailto:hello@orchid-academy.com' 
    },
  ];

  return (
    <section id="contact" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-foreground mb-4">
            {t('contact_title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('contact_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 p-8 bg-card rounded-xl shadow-lg h-full flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-primary mb-6">
              {t('contact_info_title')}
            </h3>
            <p className="text-muted-foreground mb-8">
              {t('heroSubtitle')}
            </p>
            <div className="space-y-6">
              {contactInfo.map((item) => (
                <a 
                  key={item.key} 
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start group hover:bg-muted/50 p-3 -m-3 rounded-lg transition-colors duration-200"
                >
                  <item.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1 mr-4" />
                  <div>
                    <h4 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                      {t(item.key)}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {item.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 p-8 bg-card rounded-xl shadow-lg border border-border">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField name="name" type="text" value={formData.name} onChange={handleChange} t={t} />
                <InputField name="email" type="email" value={formData.email} onChange={handleChange} t={t} />
              </div>
              <InputField name="subject" type="text" value={formData.subject} onChange={handleChange} t={t} />
              <TextAreaField value={formData.message} onChange={handleChange} t={t} />
              
              <div className="pt-4">
                <button
                  type="submit"
                  className={`w-full btn-primary flex items-center justify-center transition-opacity ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      <Send className="h-5 w-5 mr-2 animate-spin" />
                      {t('form_sending')}...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      {t('form_send_message')}
                    </>
                  )}
                </button>
              </div>

              {status === 'success' && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded-lg">
                  {t('form_success')}
                </div>
              )}
              {status === 'error' && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg">
                  {t('form_error')}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;