import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white py-8">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between mb-12">
          {/* Left Section */}
          <div className="mb-8 md:mb-0">
            <h2 className="text-4xl font-light mb-6">
              Get started <br /> with Cancerian Capitals.
            </h2>
            <button className="flex items-center bg-black text-white border border-white rounded-full px-6 py-3 hover:bg-gray-900 transition cursor-pointer">
              <span className="mr-2">→</span>
              Try Now
            </button>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Product Column */}
            <div>
              <h3 className="text-gray-300 font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-gray-300">Platform</a></li>
                <li><a href="#" className="hover:text-gray-300">Safety & security</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-gray-300 font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-gray-300">About</a></li>
                <li><a href="#" className="hover:text-gray-300">Careers</a></li>
                <li><a href="#" className="hover:text-gray-300">Contact</a></li>
              </ul>
            </div>

            {/* Social Column */}
            <div>
              <h3 className="text-gray-300 font-medium mb-4">Social</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center hover:text-gray-300">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center hover:text-gray-300">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    X
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Logo Section */}
        <div className="flex justify-center mb-12">
          <div className="text-white text-8xl font-bold">
            <span className="relative">
              <span className="absolute -top-4 -left-2 w-8 h-8 bg-black border-t-2 border-l-2 border-white rounded-tl-lg"></span>
              Cancerian's
            </span>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-800 text-gray-400 text-sm">
          <div>&#xA9; Copyrights By Cancerian Capitals 2024</div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-300">Privacy policy</a>
            <a href="#" className="hover:text-gray-300">Terms of use</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;