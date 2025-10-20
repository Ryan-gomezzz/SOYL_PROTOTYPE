import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Studio', href: '/studio' },
    { name: 'About', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Pricing', href: '/pricing' },
  ];

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-soyl-black/90 backdrop-blur-md border-b border-soyl-silver/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-soyl-gold to-soyl-bronze rounded-full flex items-center justify-center">
              <span className="text-soyl-black font-bold text-sm">S</span>
            </div>
            <span className="font-serif text-xl font-semibold text-soyl-white">SOYL</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'text-soyl-gold'
                    : 'text-soyl-silver hover:text-soyl-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/dashboard" className="text-soyl-silver hover:text-soyl-white text-sm">
              Dashboard
            </Link>
            <Link to="/studio" className="btn-primary">
              Create Your Story
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-soyl-white" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-soyl-white" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden py-4 border-t border-soyl-silver/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'text-soyl-gold'
                      : 'text-soyl-silver hover:text-soyl-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-soyl-silver/20">
                <Link 
                  to="/dashboard" 
                  className="block text-soyl-silver hover:text-soyl-white text-sm mb-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/studio" 
                  className="btn-primary inline-block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Your Story
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
