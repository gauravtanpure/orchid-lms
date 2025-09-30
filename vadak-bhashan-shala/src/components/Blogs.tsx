import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogPost {
  id: number;
  title: {
    en: string;
    mr: string;
  };
  excerpt: {
    en: string;
    mr: string;
  };
  imageUrl: string;
  category: {
    en: string;
    mr: string;
  };
  readTime: {
    en: string;
    mr: string;
  };
  date: {
    en: string;
    mr: string;
  }
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: {
      en: 'The Power of Bilingual Public Speaking',
      mr: 'द्विभाषिक सार्वजनिक भाषणाची शक्ती',
    },
    excerpt: {
      en: 'Learn how mastering both Marathi and English can give you a professional edge in today\'s global market.',
      mr: 'आजच्या जागतिक बाजारपेठेत मराठी आणि इंग्रजी दोन्ही भाषांवर प्रभुत्व कसे मिळवावे हे शिका.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400',
    category: { en: 'Communication', mr: 'संवाद' },
    readTime: { en: '5 min read', mr: '५ मि. वाचन' },
    date: { en: 'Oct 15, 2024', mr: 'ऑक्टो १५, २०२४' },
  },
  {
    id: 2,
    title: {
      en: '5 Tips for Confident Marathi Presentation',
      mr: 'आत्मविश्वासाने मराठी सादरीकरण करण्याचे ५ सोपे मार्ग',
    },
    excerpt: {
      en: 'Practical steps to overcome stage fear and deliver a compelling presentation in Marathi.',
      mr: 'रंगमंचाची भीती कशी दूर करावी आणि मराठीत प्रभावी सादरीकरण कसे करावे यासाठी व्यावहारिक पाऊले.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400',
    category: { en: 'Presentation Skills', mr: 'सादरीकरण कौशल्ये' },
    readTime: { en: '7 min read', mr: '७ मि. वाचन' },
    date: { en: 'Oct 10, 2024', mr: 'ऑक्टो १०, २०२४' },
  },
  {
    id: 3,
    title: {
      en: 'Why Soft Skills are Crucial for Career Growth',
      mr: 'करिअरच्या वाढीसाठी सॉफ्ट स्किल्स का महत्त्वाचे आहेत?',
    },
    excerpt: {
      en: 'Discover the importance of interpersonal and communication skills in advancing your professional life.',
      mr: 'तुमच्या व्यावसायिक जीवनात प्रगती करण्यासाठी आंतरवैयक्तिक आणि संवाद कौशल्यांचे महत्त्व शोधा.',
    },
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400',
    category: { en: 'Self-Development', mr: 'व्यक्तिमत्व विकास' },
    readTime: { en: '4 min read', mr: '४ मि. वाचन' },
    date: { en: 'Oct 5, 2024', mr: 'ऑक्टो ५, २०२४' },
  },
];

const Blogs: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <section id="blogs" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-heading mb-4">
            {t('latest_blogs')}
          </h2>
          <p className="text-subheading max-w-2xl mx-auto">
            {t('blog_subtitle')}
          </p>
        </div>

        {/* Blog Posts Grid - New Card Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="group bg-card rounded-xl shadow-lg border border-border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/50"
            >
              <div className="relative overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title[language as keyof typeof post.title]}
                  className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  {post.category[language as keyof typeof post.category]}
                </span>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1 text-primary" />
                        {post.readTime[language as keyof typeof post.readTime]}
                    </span>
                    <span>
                        {post.date[language as keyof typeof post.date]}
                    </span>
                </div>
                
                <h3 className="text-xl font-bold mt-2 mb-3 text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title[language as keyof typeof post.title]}
                </h3>
                
                <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                  {post.excerpt[language as keyof typeof post.excerpt]}
                </p>
                
                <Link 
                    to={`/blog/${post.id}`} 
                    className="inline-flex items-center text-primary font-semibold transition-transform duration-300 group-hover:translate-x-1"
                >
                    {t('read_more')} &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* CTA to Blog Page */}
        <div className="text-center mt-16">
          <Link to="/blog">
            <button className="btn-primary shadow-lg hover:shadow-xl transition-shadow">
              {t('view_all_blogs')}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Blogs;