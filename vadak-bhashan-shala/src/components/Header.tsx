import React, { useState } from 'react';
import { Search, ShoppingCart, Menu, X, Globe, User, BookOpen, LogOut } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { getTotalItems } = useCart();
  const { isLoggedIn, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
    { key: 'courses', href: '/courses' },
    { key: 'about', href: '/about' },
    { key: 'blogs', href: '/blogs' },
    { key: 'contact', href: '/contact' },
  ];

  const desktopNavLinks = (isLoggedIn ? [
    ...navItems,
    { key: 'myCourses', href: '/my-courses' },
  ] : navItems).map((item) => (
    <Link
      key={item.key}
      to={item.href}
      className="text-foreground hover:text-primary transition-colors duration-200 font-medium flex items-center"
    >
      {t(item.key)}
    </Link>
  ));

  const ProfileDropdown = () => (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsProfileOpen(!isProfileOpen)}
        className="rounded-full overflow-hidden w-9 h-9 border border-input p-0"
      >
        {user?.profileImage ? (
          <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <User className="h-5 w-5" />
        )}
      </Button>

      {isProfileOpen && (
        <div className="absolute right-0 mt-1 w-64 rounded-md shadow-2xl bg-card ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <img
                src={user?.profileImage || 'https://i.pravatar.cc/150?img=default'}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-input"
              />
              <div>
                <p className="text-sm font-semibold text-card-foreground line-clamp-1">
                  {user?.name || 'User'}
                </p>
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
        {/* ↓ Reduced vertical height from h-16 → h-14 */}
        <div className="flex items-center justify-between h-14">
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
          <div className="flex items-center space-x-3">
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

            {/* Auth/Profile */}
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
                  <Link to="/signup">
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
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          {/* ↓ Reduced padding from py-4 → py-2 */}
          <div className="px-4 py-2 space-y-2">
            <nav className="space-y-2">
              {(isLoggedIn ? [{ key: 'myCourses', href: '/my-courses' }, ...navItems] : navItems).map((item) => (
                <Link
                  key={item.key}
                  to={item.href}
                  className="block text-foreground hover:text-primary transition-colors font-medium py-1 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.key === 'myCourses' && <BookOpen className="h-4 w-4 mr-2" />}
                  {t(item.key)}
                </Link>
              ))}
            </nav>

            <div className="border-t border-border pt-3 space-y-2">
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
