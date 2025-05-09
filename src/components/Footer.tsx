import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <footer className="bg-[#1B2559] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and Description */}
          <div>
            <Link to="/" className="block mb-6">
              <img 
                src={logo} 
                alt="NutriDecode" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-300 text-base leading-relaxed mb-6">
              AI-powered food analysis for informed decisions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/features" className="text-gray-300 hover:text-white transition-colors text-base">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-white transition-colors text-base">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-6">Connect</h3>
            <div className="flex space-x-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-6">Newsletter</h3>
            <form onSubmit={handleSubmit} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 px-5 py-3 bg-[#2A3463] text-white text-base placeholder-gray-400 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#00A651]"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#00A651] text-white rounded-r-lg hover:bg-[#008C44] transition-colors"
                aria-label="Subscribe to newsletter"
              >
                <ArrowRight className="h-6 w-6" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-700">
          <p className="text-center text-gray-300 text-base">
            © {new Date().getFullYear()} NutriDecode. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;