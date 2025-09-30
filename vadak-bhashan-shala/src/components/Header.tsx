import React, { useState } from 'react';
import { Search, ShoppingCart, Menu, X, Globe, User, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { getTotalItems } = useCart();
  const { isLoggedIn, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'mr' : 'en');
  };

  const navItems = [
    { key: 'home', href: '/' },
    { key: 'courses', href: '#courses' },
    { key: 'about', href: '#about' },
    { key: 'testimonials', href: '#testimonials' },
    { key: 'contact', href: '#contact' },
  ];

  const loggedInNavItems = [
    ...navItems,
    { key: 'myCourses', href: '/my-courses' },
  ];

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-heading font-bold text-primary">
              Orchid
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {(isLoggedIn ? loggedInNavItems : navItems).map((item) => (
              <a // Changed Link to a for hash links
                key={item.key}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {t(item.key)}
              </a>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex items-center space-x-1"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">
                {language === 'en' ? 'मराठी' : 'English'}
              </span>
            </Button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-foreground hover:text-primary transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center space-x-2">
              {isLoggedIn ? (
                <Button variant="outline" size="sm" onClick={logout}>
                  {t('logout')}
                </Button>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      {t('login')}
                    </Button>
                  </Link>
                  <Button size="sm" className="btn-primary">
                    {t('signup')}
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden py-3 border-t border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder={t('search')}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="px-4 py-4 space-y-4">
            <nav className="space-y-3">
              {(isLoggedIn ? loggedInNavItems : navItems).map((item) => (
                <a // Changed Link to a for hash links
                  key={item.key}
                  href={item.href}
                  className="block text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(item.key)}
                </a>
              ))}
            </nav>
            
            <div className="border-t border-border pt-4 space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="w-full justify-center"
              >
                <Globe className="h-4 w-4 mr-2" />
                {language === 'en' ? 'मराठी' : 'English'}
              </Button>
              
              <div className="space-y-2">
                {isLoggedIn ? (
                  <Button variant="outline" size="sm" className="w-full" onClick={logout}>
                    {t('logout')}
                  </Button>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="outline" size="sm" className="w-full">
                        {t('login')}
                      </Button>
                    </Link>
                    <Button size="sm" className="w-full btn-primary">
                      {t('signup')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;