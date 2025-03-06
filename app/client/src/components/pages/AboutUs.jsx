import React from 'react';
import { motion } from "framer-motion";
import { CheckCircle, TrendingUp, Bot, ChartBar, Clock, Shield } from "lucide-react";

const AboutUs = () => {
  return (
    <section className="bg-black py-16 px-6" id='about'>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-sm font-medium text-blue-500 mb-2">About Us</div>
          <h2 className="text-4xl font-bold text-white mb-3">
            Algorithmic Trading Made Intelligent, Fast, and Secure.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Empowering investors to maximize returns with our advanced AI trading solutions, 
            market analysis, and personalized strategies.
          </p>
        </div>
        
        {/* Top Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* AI-Powered Trading */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-blue-900 p-4 rounded-full">
                <Bot className="text-blue-400 w-10 h-10" />
              </div>
            </div>
            <div className="text-center mb-3">
              <div className="bg-green-900 text-green-400 text-sm py-1 px-3 rounded-full inline-flex items-center mb-2">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Trade executed!</span>
              </div>
              <h3 className="text-2xl font-bold text-green-400">+15.7%</h3>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Trading</h3>
            <p className="text-gray-400">
              Our advanced algorithms analyze market patterns to execute optimal trades with precision timing.
            </p>
          </motion.div>
          
          {/* Market Analysis */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800"
          >
            <div className="flex justify-center mb-6">
              <div className="w-full max-w-xs">
                <div className="text-xl font-bold text-white mb-1">Market Trends</div>
                <div className="h-2 bg-gray-800 rounded-full mb-4">
                  <div className="h-2 bg-blue-500 rounded-full w-3/4"></div>
                </div>
                <div className="flex justify-center">
                  <div className="bg-blue-900 text-blue-400 text-xs py-1 px-2 rounded-full inline-flex items-center">
                    <span>Bullish Indicators</span>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Real-time Market Analysis</h3>
            <p className="text-gray-400">
              Deep insights into market trends with predictive analytics for informed decision-making.
            </p>
          </motion.div>
          
          {/* Risk Management */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="bg-gray-800 w-24 h-36 rounded-xl flex flex-col items-center justify-center">
                  <div className="w-16 h-1 bg-gray-700 mb-1"></div>
                  <div className="w-16 h-1 bg-gray-700 mb-1"></div>
                  <div className="w-16 h-1 bg-gray-700"></div>
                </div>
                <div className="absolute -right-2 top-1/3 transform translate-x-1/2">
                  <div className="bg-blue-600 p-3 rounded-full">
                    <Shield className="text-white w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Risk Management</h3>
            <p className="text-gray-400">
              Advanced safeguards and stop-loss mechanisms to protect your investment portfolio.
            </p>
          </motion.div>
        </div>
        
        {/* Bottom Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Trading Strategies */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="bg-yellow-900 text-yellow-400 text-sm py-1 px-3 rounded-full inline-flex items-center mb-4">
                  <span>Trading Strategies</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="h-10 w-px bg-blue-800 mx-1"></div>
                    <div className="bg-blue-900 text-blue-400 text-sm py-1 px-3 rounded-full inline-flex items-center">
                      <span>Momentum Trading</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="h-10 w-px bg-blue-800 mx-1"></div>
                    <div className="bg-blue-900 text-blue-400 text-sm py-1 px-3 rounded-full inline-flex items-center">
                      <span>Swing Trading</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="h-10 w-px bg-blue-800 mx-1"></div>
                    <div className="bg-blue-900 text-blue-400 text-sm py-1 px-3 rounded-full inline-flex items-center">
                      <span>Arbitrage</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Customizable Strategies</h3>
            <p className="text-gray-400">
              Multiple trading approaches tailored to your risk tolerance, time horizon, and financial goals.
            </p>
          </motion.div>
          
          {/* 24/7 Trading */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800"
          >
            <div className="flex justify-center mb-6 space-x-4">
              <div className="p-3 bg-purple-900 rounded-lg">
                <TrendingUp className="text-purple-400 w-6 h-6" />
              </div>
              <div className="p-3 bg-blue-900 rounded-lg">
                <Clock className="text-blue-400 w-6 h-6" />
              </div>
              <div className="p-3 bg-green-900 rounded-lg">
                <ChartBar className="text-green-400 w-6 h-6" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">24/7 Automated Trading</h3>
            <p className="text-gray-400">
              Our bots never sleep, ensuring you never miss profitable trading opportunities across global markets.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;