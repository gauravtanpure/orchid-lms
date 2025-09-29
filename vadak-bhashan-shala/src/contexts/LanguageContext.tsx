import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'mr';

interface Translations {
  [key: string]: {
    en: string;
    mr: string;
  };
}

const translations: Translations = {
  // Navigation
  home: { en: 'Home', mr: 'मुख्यपृष्ठ' },
  courses: { en: 'Courses', mr: 'अभ्यासक्रम' },
  about: { en: 'About', mr: 'आमच्याबद्दल' },
  contact: { en: 'Contact', mr: 'संपर्क' },
  testimonials: { en: 'Testimonials', mr: 'प्रशंसापत्रे' },
  login: { en: 'Login', mr: 'लॉगिन' },
  signup: { en: 'Sign Up', mr: 'नोंदणी करा' },
  
  // Hero Section
  heroTitle: { 
    en: 'Master Public Speaking Skills', 
    mr: 'सार्वजनिक भाषण कौशल्यांमध्ये पारंगत व्हा' 
  },
  heroSubtitle: { 
    en: 'Learn from expert instructors and transform your communication abilities with our comprehensive courses', 
    mr: 'तज्ञ शिक्षकांकडून शिका आणि आमच्या सर्वसमावेशक अभ्यासक्रमांसह तुमच्या संवाद क्षमता बदला' 
  },
  exploreMarathi: { en: 'Explore Marathi Courses', mr: 'मराठी अभ्यासक्रम पहा' },
  exploreEnglish: { en: 'Explore English Courses', mr: 'इंग्रजी अभ्यासक्रम पहा' },
  
  // Course Categories
  marathiCourses: { en: 'Marathi Speaking', mr: 'मराठी भाषण' },
  englishCourses: { en: 'English Speaking', mr: 'इंग्रजी भाषण' },
  publicSpeaking: { en: 'Public Speaking', mr: 'सार्वजनिक भाषण' },
  presentationSkills: { en: 'Presentation Skills', mr: 'सादरीकरण कौशल्ये' },
  
  // Course Actions
  addToCart: { en: 'Add to Cart', mr: 'कार्टमध्ये जोडा' },
  buyNow: { en: 'Buy Now', mr: 'आता खरेदी करा' },
  viewDetails: { en: 'View Details', mr: 'तपशील पहा' },
  
  // Features
  expertInstructors: { en: 'Expert Instructors', mr: 'तज्ञ शिक्षक' },
  practicalLearning: { en: 'Practical Learning', mr: 'प्रात्यक्षिक शिक्षण' },
  flexibleSchedule: { en: 'Flexible Schedule', mr: 'लवचिक वेळापत्रक' },
  certifiedCourses: { en: 'Certified Courses', mr: 'प्रमाणित अभ्यासक्रम' },
  
  // Footer
  quickLinks: { en: 'Quick Links', mr: 'द्रुत लिंक्स' },
  categories: { en: 'Categories', mr: 'श्रेणी' },
  support: { en: 'Support', mr: 'सहाय्य' },
  followUs: { en: 'Follow Us', mr: 'आम्हाला फॉलो करा' },
  
  // Common
  search: { en: 'Search courses...', mr: 'अभ्यासक्रम शोधा...' },
  filter: { en: 'Filter', mr: 'फिल्टर' },
  sortBy: { en: 'Sort by', mr: 'यानुसार क्रमवारी लावा' },
  price: { en: 'Price', mr: 'किंमत' },
  rating: { en: 'Rating', mr: 'रेटिंग' },
  duration: { en: 'Duration', mr: 'कालावधी' },
  hours: { en: 'hours', mr: 'तास' },
  students: { en: 'students', mr: 'विद्यार्थी' },
  successRate: { en: 'Success Rate', mr: 'यश दर' },
  myCourses: { en: 'My Courses', mr: 'माझे अभ्यासक्रम' },
  cart: { en: 'Cart', mr: 'कार्ट' },
  
  // Login & Auth
  email: { en: 'Email', mr: 'ईमेल' },
  password: { en: 'Password', mr: 'पासवर्ड' },
  emailPlaceholder: { en: 'Enter your email', mr: 'तुमचा ईमेल टाका' },
  passwordPlaceholder: { en: 'Enter your password', mr: 'तुमचा पासवर्ड टाका' },
  loginSubtitle: { en: 'Welcome back to your learning journey', mr: 'तुमच्या शिक्षण प्रवासात पुन्हा स्वागत' },
  loginDescription: { en: 'Sign in to access your courses and continue learning', mr: 'तुमच्या अभ्यासक्रमांमध्ये प्रवेश करण्यासाठी आणि शिकणे सुरू ठेवण्यासाठी साइन इन करा' },
  logging_in: { en: 'Signing in...', mr: 'साइन इन करत आहे...' },
  noAccount: { en: "Don't have an account?", mr: 'खाते नाही?' },
  logout: { en: 'Logout', mr: 'लॉगआउट' },
  
  // Cart
  emptyCart: { en: 'Your cart is empty', mr: 'तुमची कार्ट रिकामी आहे' },
  emptyCartDescription: { en: 'Add some courses to get started', mr: 'सुरुवात करण्यासाठी काही अभ्यासक्रम जोडा' },
  continueShopping: { en: 'Continue Shopping', mr: 'खरेदी सुरू ठेवा' },
  shoppingCart: { en: 'Shopping Cart', mr: 'खरेदी कार्ट' },
  orderSummary: { en: 'Order Summary', mr: 'ऑर्डर सारांश' },
  totalItems: { en: 'Total Items', mr: 'एकूण वस्तू' },
  total: { en: 'Total', mr: 'एकूण' },
  proceedToCheckout: { en: 'Proceed to Checkout', mr: 'चेकआउटवर जा' },
  courseAdded: { en: 'Course Added!', mr: 'अभ्यासक्रम जोडला!' },
  addedToCart: { en: 'has been added to your cart', mr: 'तुमच्या कार्टमध्ये जोडला गेला आहे' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('mr'); // Default to Marathi for target audience
  
  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.en || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};