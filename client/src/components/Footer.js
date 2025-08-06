import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GX</span>
              </div>
              <div>
                <h3 className="text-lg font-bold gradient-text">GitXTribe</h3>
                <p className="text-sm text-gray-500">Technical Club</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              A professional Capture The Flag platform for technical enthusiasts. 
              Join our community and test your cybersecurity skills in a competitive environment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/challenges" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Challenges
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/admin/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Admin Panel
                </Link>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Help Center
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 mb-4 md:mb-0">
              © 2024 GitXTribe Technical Club. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <button className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Privacy Policy
              </button>
              <button className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 