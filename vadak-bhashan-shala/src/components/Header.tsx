import React, { useState } from 'react';
import { Search, ShoppingCart, Menu, X, Globe, User, BookOpen, LogOut, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { getTotalItems } = useCart();
  const { isLoggedIn, user, logout } = useAuth(); // Destructure user
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // New state for profile dropdown

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'mr' : 'en');
  };
  
  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const navItems = [
    { key: 'home', href: '/' },
    { key: 'courses', href: '#courses' },
    { key: 'about', href: '#about' },
    { key: 'blogs', href: '#blogs' },
    { key: 'contact', href: '#contact' },
  ];

  // Updated loggedInNavItems to use Link when applicable (for /my-courses)
  const desktopNavLinks = (isLoggedIn ? [
    ...navItems.filter(item => item.key !== 'myCourses'), // Filter out to insert the Link version
    { key: 'myCourses', href: '/my-courses', isLink: true }, // New Link item
  ] : navItems).map((item) => (
    item.isLink ? (
        <Link // Use Link for /my-courses
            key={item.key}
            to={item.href}
            className="text-foreground hover:text-primary transition-colors duration-200 font-medium flex items-center"
        >
            {t(item.key)}
        </Link>
    ) : (
        <a // Use 'a' for hash links
            key={item.key}
            href={item.href}
            className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
        >
            {t(item.key)}
        </a>
    )
  ));
  
  const ProfileDropdown = () => (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsProfileOpen(!isProfileOpen)}
        className="rounded-full overflow-hidden w-9 h-9 border border-input p-0"
      >
        {/* Profile Image/Icon */}
        {user?.profileImage ? (
          <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <User className="h-5 w-5" />
        )}
      </Button>

      {isProfileOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-md shadow-2xl bg-card ring-1 ring-black ring-opacity-5 z-50 transform translate-y-1">
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <img 
                src={user?.profileImage || 'https://i.pravatar.cc/150?img=default'} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border border-input"
              />
              <div>
                <p className="text-sm font-semibold text-card-foreground line-clamp-1">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{user?.email}</p>
              </div>
            </div>
          </div>
          <div className="py-1">
            <Link 
              to="/my-courses" 
              className="flex items-center px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors"
              onClick={() => setIsProfileOpen(false)}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {t('myCourses')}
            </Link>
            <button 
              onClick={handleLogout} 
              className="flex items-center w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );

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
            {desktopNavLinks}
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

            {/* Auth Buttons / Profile Dropdown */}
            <div className="hidden sm:flex items-center space-x-2">
              {isLoggedIn ? (
                <ProfileDropdown />
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link to="/signup"> {/* Assuming a SignUp route/page will be created */}
                    <Button size="sm" className="btn-primary">
                      {t('signup')}
                    </Button>
                  </Link>
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

        {/* Mobile Search - kept for continuity */}
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
              {(isLoggedIn ? [{ key: 'myCourses', href: '/my-courses' }, ...navItems] : navItems).map((item) => (
                <Link // Using Link for both hash and non-hash links in mobile menu for consistency
                  key={item.key}
                  to={item.href}
                  className="block text-foreground hover:text-primary transition-colors font-medium py-2 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                    {item.key === 'myCourses' && <BookOpen className="h-4 w-4 mr-2" />}
                    {t(item.key)}
                </Link>
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
                  <Button size="sm" className="w-full btn-primary" onClick={handleLogout}>
                    {t('logout')}
                  </Button>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="outline" size="sm" className="w-full">
                        {t('login')}
                      </Button>
                    </Link>
                    <Link to="/signup">
                        <Button size="sm" className="w-full btn-primary">
                          {t('signup')}
                        </Button>
                    </Link>
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