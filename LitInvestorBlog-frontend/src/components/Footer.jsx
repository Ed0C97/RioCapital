// LitInvestorBlog-frontend/src/components/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Mail } from 'lucide-react';

import RioCapitalLogo from '../assets/litinvestor_logo.webp';

const Footer = () => {
  const [email, setEmail] = React.useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert('Newsletter subscription successful!');
        setEmail('');
      } else {
        const data = await response.json();
        alert(data.error || 'Error during subscription');
      }
    } catch {
      alert('Connection error');
    }
  };

  return (
    <footer className="bg-white">
      {}
      <div className="max-w-[1012px] mx-auto px-[16px] sm:px-[16px] lg:px-[16px] py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <Link to="/">
              <img
                src={RioCapitalLogo}
                alt="Lit Investor Logo"
                className="h-7 w-auto"
              />
            </Link>
            {}
            <p className="font-semibold text-gray-800 pt-4">Lit Investor</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Navigation</h3>
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="text-sm text-gray-500 hover:text-blue-600"
              >
                Home
              </Link>
              <Link
                to="/about-us"
                className="text-sm text-gray-500 hover:text-blue-600"
              >
                About Us
              </Link>
              <Link
                to="/archive"
                className="text-sm text-gray-500 hover:text-blue-600"
              >
                Archive
              </Link>
              <Link
                to="/contact"
                className="text-sm text-gray-500 hover:text-blue-600"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Resources</h3>
            <div className="flex flex-col space-y-2">
              <Link
                to="/termini-e-condizioni"
                className="text-sm text-gray-500 hover:text-blue-600"
              >
                Terms & Conditions
              </Link>
              <Link
                to="/privacy-policy"
                className="text-sm text-gray-500 hover:text-blue-600"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Newsletter</h3>
            <p className="text-sm text-gray-500">
              Stay updated with our weekly analyses.
            </p>
            {}
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative border-b border-gray-300">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent border-none pl-6 pr-2 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-0"
                />
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNewsletterSubmit(e);
                }}
                className="text-gray-500 hover:text-blue-600 uppercase text-xs font-semibold tracking-wider transition-colors"
              >
                Subscribe
              </a>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 text-center md:text-left">
            © {new Date().getFullYear()} Lit Investor. All rights reserved.
          </p>

          {}
          {}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
