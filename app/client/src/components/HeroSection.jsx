import React, { useState, useEffect } from 'react';

const HeroSection = () => {
  const [text, setText] = useState('');
  const fullText = "Revolutionary algorithmic trading platform powered by Cancerian Capitals";
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (isTyping) {
      if (text.length < fullText.length) {  
        const timeout = setTimeout(() => {  
          setText(fullText.slice(0, text.length + 1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (text.length === 0) {
        const timeout = setTimeout(() => {  
          setIsTyping(true);
        }, 500);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setText(text.slice(0, -1));
        }, 30);
        return () => clearTimeout(timeout);
      }
    }
  }, [text, isTyping]);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center px-4">
      {/* Text Content */}
      <div className="relative z-10 text-center flex flex-col justify-center items-center" style={{ perspective: '1000px' }}>
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] xl:text-[10rem] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 glow-text transition-all duration-300 leading-tight">
          <span className="block">Cancerian Capital</span>
        </h1>
        <div className="mt-4 sm:mt-6 text-lg sm:text-2xl md:text-3xl lg:text-3xl text-gray-300 max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto min-h-[60px] flex flex-col justify-center items-center leading-tight px-4">
          <p className="text-center">{text}</p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;