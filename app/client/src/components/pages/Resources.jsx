import React from 'react';
import { 
  Newspaper, 
  BarChart2, 
  BookOpen, 
  Video, 
  Clock, 
  TrendingUp,
  Search
} from 'lucide-react';

const Resources = () => {
  // Placeholder for API data - you'll replace these with your API calls
  const newsArticles = [
    {
      title: "Market Trends: Q1 2025 Analysis",
      source: "Trading Insights",
      date: "Feb 25, 2025",
      excerpt: "Key patterns emerging in algorithmic trading markets...",
      link: "#"
    },
    {
      title: "Tech Stocks Surge on AI Developments",
      source: "Financial Times",
      date: "Feb 20, 2025",
      excerpt: "How AI-driven trading is shaping the tech sector...",
      link: "#"
    }
  ];

  const resources = [
    {
      type: "Guide",
      icon: <BookOpen className="w-5 h-5 text-blue-400" />,
      title: "Beginner's Guide to Algo Trading",
      description: "Learn the fundamentals of algorithmic trading",
      link: "#"
    },
    {
      type: "Video",
      icon: <Video className="w-5 h-5 text-purple-400" />,
      title: "Technical Analysis Basics",
      description: "Watch our expert break down key indicators",
      link: "#"
    }
  ];

  return (
    <div className="bg-gradient-to-b from-black to-gray-900 text-white min-h-screen overflow-hidden">
      {/* Header with Glow Effect */}
      <div className="relative">
        <div className="absolute top-24 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute top-16 right-1/4 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
        
        <div className="relative z-10 flex flex-col items-center pt-16 pb-12">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Trading Resources</h1>
          <p className="text-gray-400 max-w-md text-center">Stay informed with the latest market news and educational content</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search news & resources..." 
            className="w-full bg-gray-900/80 border border-gray-800/80 rounded-xl py-3 px-4 pl-12 text-gray-300 focus:outline-none focus:border-blue-500/30 transition-all duration-300"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Latest News Section */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-center mb-8">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500 mr-4"></div>
              <h2 className="text-3xl font-bold">Latest Market News</h2>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-500 ml-4"></div>
            </div>

            <div className="space-y-6">
              {newsArticles.map((article, index) => (
                <div 
                  key={index} 
                  className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/80 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300"
                >
                  <div className="flex items-center mb-3">
                    <Newspaper className="w-5 h-5 text-blue-400 mr-2" />
                    <h3 className="text-lg font-medium">{article.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{article.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">
                      {article.source} • <Clock className="w-3 h-3 inline mr-1" /> {article.date}
                    </span>
                    <a 
                      href={article.link} 
                      className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
                    >
                      Read More
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/20">
              Load More News
            </button>
          </div>

          {/* Educational Resources Section */}
          <div>
            <div className="flex items-center justify-center mb-8">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-purple-500 mr-4"></div>
              <h2 className="text-3xl font-bold">Learn Trading</h2>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-500 ml-4"></div>
            </div>

            <div className="space-y-6">
              {resources.map((resource, index) => (
                <div 
                  key={index}
                  className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/80 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300"
                >
                  <div className="flex items-center mb-3">
                    {resource.icon}
                    <h3 className="text-lg font-medium ml-2">{resource.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{resource.description}</p>
                  <a 
                    href={resource.link}
                    className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
                  >
                    Explore Now
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights Section */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="relative bg-gray-900/60 backdrop-blur-md border border-gray-800/80 rounded-2xl p-8">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-8">
              <TrendingUp className="w-6 h-6 text-green-400 mr-3" />
              <h2 className="text-3xl font-bold">Market Insights</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <BarChart2 className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium mb-2">Daily Market Summary</h3>
                  <p className="text-gray-400 text-sm">Get our latest analysis on market movements and trading opportunities.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium mb-2">Real-Time Updates</h3>
                  <p className="text-gray-400 text-sm">Stay ahead with live market data from trusted sources.</p>
                </div>
              </div>
            </div>

            <button className="mt-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/20">
              Subscribe to Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;