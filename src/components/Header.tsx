import { useState, useEffect } from 'react';
import { Menu, X, Settings, History, Home, Scan } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, supabase } from '../services/supabase';

interface HeaderProps {
  onGetStarted?: () => void;
  isLanding?: boolean;
}

const Header = ({ onGetStarted, isLanding = false }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navigationItems = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ];

  const appNavigationItems = [
    { name: 'Overview', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { name: 'Analyze', href: '/scan', icon: <Scan className="w-5 h-5" /> },
    { name: 'History', href: '/history', icon: <History className="w-5 h-5" /> },
    { name: 'Settings', href: '/preferences', icon: <Settings className="w-5 h-5" /> },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        const profile = await getUserProfile(user.id);
        if (profile) {
          setUserProfile(profile);
        } else {
          // If no profile exists, create one with email as full name
          const { data: newProfile } = await supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              full_name: user.email?.split('@')[0] || 'User',
            })
            .select()
            .single();
          
          if (newProfile) {
            setUserProfile(newProfile);
          }
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (!sectionId.startsWith('#')) {
      navigate(sectionId);
      return;
    }
    
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Render authenticated header
  if (user && !isLanding) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <nav className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <img 
                  src="/images/logo.png"
                  alt="NutriDecode - Know your Food. Transform your life." 
                  className="h-10 w-auto hover:opacity-90 transition-opacity"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {appNavigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-5 py-2.5 rounded-lg transition-all text-base ${
                    location.pathname === item.href
                      ? 'bg-primary bg-opacity-10 text-primary-dark font-semibold'
                      : 'text-gray-600 hover:text-primary-dark hover:bg-primary-light hover:bg-opacity-5 font-medium'
                  }`}
                >
                  {item.icon}
                  <span className="text-base">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center">
              <button
                onClick={handleSignOut}
                className="px-6 py-2.5 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-lg text-gray-600 hover:text-primary-dark hover:bg-primary-light hover:bg-opacity-10 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-7 w-7" />
                ) : (
                  <Menu className="h-7 w-7" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-3 space-y-2">
              {appNavigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-5 py-3 rounded-lg transition-all text-base ${
                    location.pathname === item.href
                      ? 'bg-primary bg-opacity-10 text-primary-dark font-semibold'
                      : 'text-gray-600 hover:text-primary-dark hover:bg-primary-light hover:bg-opacity-5 font-medium'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="text-base">{item.name}</span>
                </Link>
              ))}
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-5 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </nav>
      </header>
    );
  }

  // Render landing page header
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg' 
          : 'bg-gradient-to-r from-primary-light to-secondary-light bg-opacity-95'
      }`}
    >
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/images/logo.png"
                alt="NutriDecode - Know your Food. Transform your life." 
                className="h-12 w-auto cursor-pointer hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="text-base font-medium text-gray-700 hover:text-primary-dark transition-colors tracking-wide"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-2.5 rounded-lg text-lg text-primary-dark hover:bg-primary-light hover:bg-opacity-10 transition-colors font-medium"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 hover:translate-y-[-2px]"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-primary-dark hover:bg-primary-light hover:bg-opacity-10 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-2 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  scrollToSection(item.href);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-gray-600 hover:text-primary-dark hover:bg-primary-light hover:bg-opacity-5 rounded-lg transition-colors"
              >
                {item.name}
              </button>
            ))}
            <Link
              to="/auth"
              className="block w-full text-center bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;