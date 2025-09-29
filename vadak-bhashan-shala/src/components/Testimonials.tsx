import React from 'react';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
  course: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'रमेश पाटील',
    role: 'शिक्षक, पुणे',
    content: 'या कोर्समुळे माझे आत्मविश्वास वाढले आहे. आता मी कोणत्याही सभेत बिनधास्तपणे बोलू शकतो.',
    rating: 5,
    avatar: '/api/placeholder/80/80',
    course: 'मराठी भाषण कौशल्य',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    role: 'Marketing Manager, Mumbai',
    content: 'The English public speaking course transformed my career. I can now present confidently to international clients.',
    rating: 5,
    avatar: '/api/placeholder/80/80',
    course: 'English Public Speaking',
  },
  {
    id: '3',
    name: 'अनिल जोशी',
    role: 'व्यापारी, नागपूर',
    content: 'माझ्या व्यवसायामध्ये ग्राहकांशी संवाद साधण्यात खूप फायदा झाला आहे. धन्यवाद!',
    rating: 5,
    avatar: '/api/placeholder/80/80',
    course: 'व्यक्तिमत्व विकास',
  },
  {
    id: '4',
    name: 'Dr. Sarah Mendes',
    role: 'Medical Professional, Goa',
    content: 'Excellent course structure and practical exercises. The instructors are very supportive and knowledgeable.',
    rating: 5,
    avatar: '/api/placeholder/80/80',
    course: 'Advanced Business Presentation',
  },
  {
    id: '5',
    name: 'सुनीता कुलकर्णी',
    role: 'गृहिणी, कोल्हापूर',
    content: 'वयाच्या ५० नंतर शिकण्याची संधी मिळाली. शिक्षक खूप धैर्याने शिकवतात.',
    rating: 5,
    avatar: '/api/placeholder/80/80',
    course: 'मराठी सादरीकरण',
  },
  {
    id: '6',
    name: 'Rajesh Kumar',
    role: 'IT Professional, Bangalore',
    content: 'Being from Maharashtra but working in Bangalore, this helped me maintain my Marathi speaking skills while improving English.',
    rating: 5,
    avatar: '/api/placeholder/80/80',
    course: 'Bilingual Communication',
  },
];

const Testimonials: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="testimonials" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-heading mb-4">
            {t('testimonials')}
          </h2>
          <p className="text-subheading max-w-2xl mx-auto">
            Success Stories from Our Students
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className="card-hover p-6 animate-fade-in-up relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-primary/20">
                <Quote className="h-8 w-8" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-card-foreground mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>

              {/* Author Info */}
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-card-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-primary font-medium mt-1">
                    {testimonial.course}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">
              Join Thousands of Successful Students
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start your journey to confident public speaking today. Choose from our expert-led courses in Marathi and English.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-hero">
                View All Courses
              </button>
              <button className="btn-outline">
                Book Free Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;