import React from 'react';
import { Users, Award, BookOpen, Target, Heart, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const About: React.FC = () => {
  const { t, language } = useLanguage();

  const features = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'Empowering Marathi speakers to master public speaking skills and boost their confidence',
      titleMr: 'आमचे ध्येय',
      descriptionMr: 'मराठी भाषिकांना सार्वजनिक भाषण कौशल्यात प्रभुत्व मिळवून त्यांचा आत्मविश्वास वाढवणे'
    },
    {
      icon: Users,
      title: 'Expert Instructors',
      description: 'Learn from certified public speaking coaches with years of experience',
      titleMr: 'तज्ञ शिक्षक',
      descriptionMr: 'अनेक वर्षांच्या अनुभवासह प्रमाणित सार्वजनिक भाषण प्रशिक्षकांकडून शिका'
    },
    {
      icon: BookOpen,
      title: 'Comprehensive Courses',
      description: 'Structured courses designed specifically for ages 30-70 with practical approach',
      titleMr: 'सर्वसमावेशक अभ्यासक्रम',
      descriptionMr: '३०-७० वयोगटासाठी विशेषतः डिझाइन केलेले प्रात्यक्षिक पध्दतीचे संरचित अभ्यासक्रम'
    },
    {
      icon: Heart,
      title: 'Cultural Sensitivity',
      description: 'Courses that respect Marathi culture while building modern communication skills',
      titleMr: 'सांस्कृतिक संवेदनशीलता',
      descriptionMr: 'आधुनिक संवाद कौशल्ये निर्माण करताना मराठी संस्कृतीचा आदर करणारे अभ्यासक्रम'
    },
    {
      icon: Lightbulb,
      title: 'Practical Learning',
      description: 'Hands-on practice sessions with real-world speaking scenarios and feedback',
      titleMr: 'प्रात्यक्षिक शिक्षण',
      descriptionMr: 'वास्तविक जगातील भाषण परिस्थितींसह प्रात्यक्षिक सराव सत्रे आणि अभिप्राय'
    },
    {
      icon: Award,
      title: 'Certified Learning',
      description: 'Get recognized certificates upon successful completion of courses',
      titleMr: 'प्रमाणित शिक्षण',
      descriptionMr: 'अभ्यासक्रम यशस्वीरीत्या पूर्ण केल्यावर मान्यताप्राप्त प्रमाणपत्रे मिळवा'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Students', labelMr: 'समाधानी विद्यार्थी' },
    { number: '50+', label: 'Expert Courses', labelMr: 'तज्ञ अभ्यासक्रम' },
    { number: '15+', label: 'Years Experience', labelMr: 'वर्षांचा अनुभव' },
    { number: '98%', label: 'Success Rate', labelMr: 'यश दर' }
  ];

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-heading mb-4">
            {t('about')}
          </h2>
          <p className="text-subheading max-w-3xl mx-auto">
            SpeakMaster is Maharashtra's premier online platform for public speaking education, designed specifically for Marathi speakers who want to enhance their communication skills in both Marathi and English.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
              <div className="text-muted-foreground">
                {language === 'mr' ? stat.labelMr : stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="card-hover p-8 text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 rounded-full p-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-4 text-card-foreground">
                {language === 'mr' ? feature.titleMr : feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {language === 'mr' ? feature.descriptionMr : feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-6 text-primary">
              Why Choose SpeakMaster?
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              We understand the unique challenges faced by Marathi speakers in developing public speaking skills. Our courses are culturally sensitive, age-appropriate, and designed with the specific needs of the 30-70 age group in mind. Whether you want to improve your Marathi oratory skills or master English presentations, we provide the perfect learning environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-hero">
                Start Your Journey
              </button>
              <button className="btn-outline">
                Book Free Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;