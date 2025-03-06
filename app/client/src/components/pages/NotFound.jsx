import React from 'react';

const NotFound = () => {
  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-4xl w-full">
        <div className="text-white space-y-6">
          {/* Error code */}
          <p className="text-lg font-medium text-gray-300">404</p>
          
          {/* Main heading */}
          <h1 className="text-5xl font-bold tracking-tight">Page not found</h1>
          
          {/* Error message */}
          <p className="text-xl text-gray-300">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          {/* Optional: Back to home button */}
          <div className="pt-6">
            <a 
              href="/" 
              className="inline-flex items-center px-5 py-2.5 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;