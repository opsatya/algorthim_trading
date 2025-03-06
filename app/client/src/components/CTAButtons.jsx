import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTAButtons = () => {
  const navigate = useNavigate();
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, show: false, button: null });

  const handleMouseMove = (e, button) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    setCursorPos({ x: e.clientX - left, y: e.clientY - top, show: true, button });
  };

  const handleMouseLeave = () => {
    setCursorPos({ x: 0, y: 0, show: false, button: null });
  };

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
      {/* Learn More Button */}
      <button
        className="group relative px-8 py-3 bg-gray-800 bg-opacity-80 rounded-full overflow-hidden transition-all duration-300 hover:bg-opacity-90 hover:scale-105 transform cursor-pointer"
        onMouseMove={(e) => handleMouseMove(e, 'learn')}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        <span className="relative text-white text-lg">Learn more</span>
        {cursorPos.show && cursorPos.button === 'learn' && (
          <span
            className="absolute w-16 h-16 bg-white opacity-10 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
          ></span>
        )}
      </button>
      
      {/* Try Now Button */}
      <button
        onClick={() => navigate('/chat')}
        className="group relative px-8 py-3 bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500 rounded-full overflow-hidden hover:scale-105 transform transition-transform duration-300 cursor-pointer"
        onMouseMove={(e) => handleMouseMove(e, 'try')}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        <span className="relative text-white text-lg flex items-center">
          Try now
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
        </span>
        {cursorPos.show && cursorPos.button === 'try' && (
          <span
            className="absolute w-16 h-16 bg-white opacity-10 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
          ></span>
        )}
      </button>
    </div>
  );
};

export default CTAButtons;