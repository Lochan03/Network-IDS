
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { Menu, X, Shield, Wifi, WifiOff } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'About', path: '/about' },
    { name: 'Feedback', path: '/feedback' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cyberpulse-darker/80 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Logo />
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`font-medium transition-colors ${
                location.pathname === item.path
                  ? 'text-cyberpulse-purple'
                  : 'text-gray-300 hover:text-cyberpulse-purple'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cyberpulse-darker border-t border-white/10">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-cyberpulse-purple'
                    : 'text-gray-300 hover:text-cyberpulse-purple'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

