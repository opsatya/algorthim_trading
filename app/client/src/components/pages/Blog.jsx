import React from 'react';
import { 
  BarChart2, 
  PieChart, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock,
  Shield
} from 'lucide-react';

const Blog = () => {
  return (
    <div className="bg-gradient-to-b from-black to-gray-900 text-white min-h-screen overflow-hidden">
      {/* Header with Glow Effect */}
      <div className="relative">
        <div className="absolute top-24 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute top-16 right-1/4 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
        
        <div className="relative z-10 flex flex-col items-center pt-16 pb-12">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Our Trading Journey</h1>
          <p className="text-gray-400 max-w-md text-center">Discover how we deliver profitable algorithmic trading solutions with proven results</p>
        </div>
      </div>

      {/* How We Work Section */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="flex items-center justify-center mb-8">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500 mr-4"></div>
          <h2 className="text-3xl font-bold">How We Work</h2>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-500 ml-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/80 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300">
            <div className="mb-4 p-2 bg-blue-500/10 rounded-lg w-fit">
              <BarChart2 className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">Technical Analysis</h3>
            <p className="text-gray-400 text-sm">We analyze market trends using advanced technical indicators and our proprietary algorithms, processing data from trusted sources.</p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/80 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300">
            <div className="mb-4 p-2 bg-purple-500/10 rounded-lg w-fit">
              <PieChart className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">Data Visualization</h3>
            <p className="text-gray-400 text-sm">Our team creates intuitive visualizations to identify patterns and optimize trading strategies effectively.</p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/80 rounded-xl p-6 hover:border-green-500/30 transition-all duration-300">
            <div className="mb-4 p-2 bg-green-500/10 rounded-lg w-fit">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">Execution & Results</h3>
            <p className="text-gray-400 text-sm">We implement strategies with precision, delivering consistent outputs backed by real-time performance tracking.</p>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="flex items-center justify-center mb-8">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-purple-500 mr-4"></div>
          <h2 className="text-3xl font-bold">What We've Achieved</h2>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-500 ml-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
              <h3 className="text-xl font-medium">Proven Track Record</h3>
            </div>
            <p className="text-gray-400 text-sm">Over 85% success rate in our trading strategies across multiple markets since inception.</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-blue-400 mr-3" />
              <h3 className="text-xl font-medium">Growing Community</h3>
            </div>
            <p className="text-gray-400 text-sm">Trusted by 10,000+ active traders and investors worldwide.</p>
          </div>
        </div>
      </div>

      {/* Happy Customers Section */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="flex items-center justify-center mb-8">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-green-500 mr-4"></div>
          <h2 className="text-3xl font-bold">Our Happy Customers</h2>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-green-500 ml-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/80 rounded-xl p-6">
            <p className="text-gray-300 text-sm mb-4 italic">"Their algorithmic approach has transformed my trading results. Consistent profits and amazing support!"</p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium">John D.</p>
                <p className="text-xs text-gray-400">Professional Trader</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/80 rounded-xl p-6">
            <p className="text-gray-300 text-sm mb-4 italic">"The data visualizations made it so easy to understand market movements. Highly recommended!"</p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium">Sarah M.</p>
                <p className="text-xs text-gray-400">Retail Investor</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/80 rounded-xl p-6">
            <p className="text-gray-300 text-sm mb-4 italic">"Finally, a platform I can trust with reliable data and solid execution."</p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500/20 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium">Mike R.</p>
                <p className="text-xs text-gray-400">Hedge Fund Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Trust Us Section */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="relative bg-gray-900/60 backdrop-blur-md border border-gray-800/80 rounded-2xl p-8">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-8">
              <Shield className="w-6 h-6 text-blue-400 mr-3" />
              <h2 className="text-3xl font-bold">Why Trust Us</h2>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-center">
                <Clock className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-gray-300 text-sm">Real-time data from trusted, verified sources</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-gray-300 text-sm">Proven algorithms tested across market conditions</span>
              </li>
              <li className="flex items-center">
                <Shield className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-gray-300 text-sm">Bank-level security for your investments</span>
              </li>
            </ul>

            <button className="mt-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/20">
              Start Trading Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;