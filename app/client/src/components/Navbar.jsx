import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const scrollToSection = (sectionId) => {
    // Remove the # if it's included
    const id = sectionId.startsWith('#') ? sectionId.substring(1) : sectionId;
    const element = document.getElementById(id);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false); // Close mobile menu after clicking
    }
  };
  
  return (
    <nav className="fixed w-full bg-black/10 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center cursor-pointer">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <span className="ml-2 text-xl font-semibold text-white">Cancerian Capital</span>
            </a>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('#about')}
                className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('vision')}
                className="text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Vision
              </button>
              {[
                { name: "Blog", path: "/blog" },
                { name: "Resources", path: "/resources" },
                { name: "Contact", path: "/contact" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative w-6 h-6">
                <span
                  className={`absolute w-6 h-0.5 bg-current transform transition duration-300 ease-in-out ${
                    isOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
                  }`}
                ></span>
                <span
                  className={`absolute w-6 h-0.5 bg-current transform transition duration-300 ease-in-out ${
                    isOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                ></span>
                <span
                  className={`absolute w-6 h-0.5 bg-current transform transition duration-300 ease-in-out ${
                    isOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
        >
          <div className="px-0 pt-2 pb-3 space-y-1 sm:px-0 bg-black/20 rounded-lg mt-2">
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-black/20 transition-colors duration-200"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('vision')}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-black/20 transition-colors duration-200"
            >
              Vision
            </button>
            {[
              { name: "Blog", path: "/blog" },
              { name: "Resources", path: "/resources" },
              { name: "Contact", path: "/contact" },
            ].map((item) => (
              <a
                key={item.name}
                href={item.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-black/20 transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;