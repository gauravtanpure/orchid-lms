// @/contexts/LanguageContext.tsx

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
  blogs: { en: 'Blogs', mr: 'ब्लॉग्ज' },
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
  
  // Category Section
  browse_by_category: { en: 'Browse by Category', mr: 'श्रेणीनुसार अभ्यासक्रम पहा' },
  political: { en: 'Political', mr: 'राजकीय' },
  public_speaking: { en: 'Public Speaking', mr: 'सार्वजनिक भाषण' },
  course_grid_subtitle: {
    en: 'Choose from our comprehensive selection of courses in communication and political skills.',
    mr: 'संवाद आणि राजकीय कौशल्यांमधील आमच्या सर्वसमावेशक अभ्यासक्रमांमधून निवडा.'
  },
  
  // Course Categories 
  marathiCourses: { en: 'Marathi Speaking', mr: 'मराठी भाषण' },
  englishCourses: { en: 'English Speaking', mr: 'इंग्रजी भाषण' },
  presentationSkills: { en: 'Presentation Skills', mr: 'सादरीकरण कौशल्ये' },
  
  // Course Actions
  addToCart: { en: 'Add to Cart', mr: 'कार्टमध्ये जोडा' },
  buyNow: { en: 'Buy Now', mr: 'आता खरेदी करा' },
  viewDetails: { en: 'View Details', mr: 'तपशील पहा' },
  goToCourse: { en: 'Go to Course', mr: 'अभ्यासक्रमावर जा' },
  
  // Course Details
  by: { en: 'by', mr: 'द्वारे' },
  reviews: { en: 'reviews', mr: 'पुनरावलोकने' },
  
  // Levels
  level_beginner: { en: 'Beginner', mr: 'प्राथमिक' },
  level_intermediate: { en: 'Intermediate', mr: 'मध्यम' },
  level_advanced: { en: 'Advanced', mr: 'प्रगत' },
  
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
  loginRequired: { en: 'Login Required', mr: 'लॉगिन आवश्यक' },
  loginRequiredDescription: { en: 'Please login to add courses to your cart.', mr: 'कृपया अभ्यासक्रम कार्टमध्ये जोडण्यासाठी लॉगिन करा.' },

  // Back Button
  backToHome: { en: 'Back to Home', mr: 'मुख्यपृष्ठावर परत जा' },

  // Registration Keys
  signupSubtitle: { en: 'Start your communication journey today', mr: 'आजच तुमचा संवाद प्रवास सुरू करा' },
  signupDescription: { en: 'Create an account to get access to all courses', mr: 'सर्व अभ्यासक्रमांमध्ये प्रवेश मिळवण्यासाठी खाते तयार करा' },
  registrationSuccessful: { en: 'Registration Successful', mr: 'नोंदणी यशस्वी' },
  registrationFailed: { en: 'Registration Failed', mr: 'नोंदणी अयशस्वी' },
  registrationRedirect: { en: 'Your account has been created. Please log in.', mr: 'तुमचे खाते तयार झाले आहे. कृपया लॉगिन करा.' },
  haveAccount: { en: 'Already have an account?', mr: 'तुमचे आधीच खाते आहे?' },
  registering: { en: 'Registering...', mr: 'नोंदणी करत आहे...' },
  anUnexpectedErrorOccurred: { en: 'An unexpected error occurred.', mr: 'एक अनपेक्षित त्रुटी आली.' },
  
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
  
  // My Courses Page
  noCoursesEnrolled: { en: "You haven't enrolled in any courses yet.", mr: 'तुम्ही अद्याप कोणत्याही अभ्यासक्रमात नोंदणी केलेली नाही.' },
  startLearningJourney: { en: 'Start your learning journey by exploring our catalog.', mr: 'आमचा कॅटलॉग एक्सप्लोर करून तुमचा शिकण्याचा प्रवास सुरू करा.' },
  progress: { en: 'Progress', mr: 'प्रगती' },
  continueLearning: { en: 'Continue Learning', mr: 'शिकणे सुरू ठेवा' },
  viewCertificate: { en: 'View Certificate', mr: 'प्रमाणपत्र पहा' },
  
  // Contact Section
  contact_title: { en: 'Get In Touch', mr: 'संपर्क साधा' },
  contact_subtitle: { 
    en: 'We would love to hear from you. Send us a message and we will respond as soon as possible.', 
    mr: 'आम्हाला तुमच्याकडून ऐकायला आवडेल. आम्हाला एक संदेश पाठवा आणि आम्ही लवकरच प्रतिसाद देऊ.' 
  },
  form_name: { en: 'Your Name', mr: 'तुमचे नाव' },
  form_email: { en: 'Your Email', mr: 'तुमचा ईमेल' },
  form_subject: { en: 'Subject', mr: 'विषय' },
  form_message: { en: 'Your Message', mr: 'तुमचा संदेश' },
  form_send_message: { en: 'Send Message', mr: 'संदेश पाठवा' },
  contact_info_title: { en: 'Contact Information', mr: 'संपर्क माहिती' },
  contact_address: { en: 'Our Location', mr: 'आमचे ठिकाण' },
  contact_address_text: { 
    en: '123 Public Speaking St, Pune, Maharashtra, 411001', 
    mr: '१२३ सार्वजनिक भाषण मार्ग, पुणे, महाराष्ट्र, ४११००१' 
  },
  contact_phone: { en: 'Call Us', mr: 'आम्हाला कॉल करा' },
  contact_email: { en: 'Email Us', mr: 'आम्हाला ईमेल करा' },
  form_placeholder_name: { en: 'Enter your name', mr: 'तुमचे नाव प्रविष्ट करा' },
  form_placeholder_email: { en: 'Enter your email', mr: 'तुमचा ईमेल प्रविष्ट करा' },
  form_placeholder_subject: { en: 'Regarding course inquiry...', mr: 'अभ्यासक्रमाच्या चौकशीबद्दल...' },
  form_placeholder_message: { en: 'Type your message here...', mr: 'येथे तुमचा संदेश टाइप करा...' },
  form_success: { en: 'Message sent successfully!', mr: 'संदेश यशस्वीरित्या पाठवला गेला!' },
  form_error: { en: 'Failed to send message. Please try again.', mr: 'संदेश पाठवण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा!' },
  
  // Blog Section
  latest_blogs: { en: 'Our Latest Insights', mr: 'आमचे नवीनतम लेख' },
  blog_subtitle: { en: 'Knowledge and Communication Strategy from Our Experts', mr: 'आमच्या तज्ञांकडून संवाद आणि धोरणावरील ज्ञान' },
  read_more: { en: 'Read Article', mr: 'लेख वाचा' },
  view_all_blogs: { en: 'View All Blogs', mr: 'सर्व ब्लॉग पहा' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('mr'); // Default to Marathi
  
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