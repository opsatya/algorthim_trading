import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Headphones, 
  MapPin, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  CreditCard, 
  Mail, 
  File, 
  Clock
} from 'lucide-react';

const Contact = () => {
  const [activeQuestion, setActiveQuestion] = useState(0);
  const faqRefs = useRef([]);

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  // Smooth scroll to active FAQ
  useEffect(() => {
    if (activeQuestion !== null && faqRefs.current[activeQuestion]) {
      faqRefs.current[activeQuestion].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeQuestion]);

  const faqs = [
    {
      question: "Is there a free trial available?",
      answer: "Yes, you can try Cancerian Capital for free for 14 days. If you want, we'll provide you with a free 30-minute onboarding call to get you set up and running. Book a call here."
    },
    {
      question: "Can I change my subscription plan later?",
      answer: "Absolutely! You can upgrade, downgrade, or modify your subscription at any time. Changes will be effective from the next billing cycle."
    },
    {
      question: "What is your cancellation policy?",
      answer: "You can cancel your subscription at any time with no penalties. You'll retain access to all features until the end of your current billing period."
    },
    {
      question: "How do your algorithms work?",
      answer: "Our proprietary algorithms analyze historical data, market trends, and various indicators to identify profitable trading opportunities across multiple markets. We use a combination of machine learning, statistical analysis, and technical indicators to make data-driven trading decisions."
    },
    {
      question: "What markets do you support?",
      answer: "Cancerian Capital currently supports trading in equities, forex, commodities, and cryptocurrencies across major global exchanges."
    },
    {
      question: "How secure is my data?",
      answer: "We employ bank-level encryption and security protocols to protect your personal and financial information. We never share your data with third parties without your explicit consent."
    },
  ];

  return (
    <div className="bg-gradient-to-b from-black to-gray-900 text-white min-h-screen overflow-hidden">
      {/* Header with Glow Effect */}
      <div className="relative">
        <div className="absolute top-24 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute top-16 right-1/4 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
        
        <div className="relative z-10 flex flex-col items-center pt-16 pb-12">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Contact us</h1>
          <p className="text-gray-400 max-w-md text-center">Let us know how we can help with your algorithmic trading needs.</p>
        </div>
      </div>

      {/* Contact Cards - Horizontal Layout */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/80 rounded-xl p-5 hover:border-blue-500/30 transition-all duration-300 group">
            <div className="mb-4 p-2 bg-blue-500/10 rounded-lg w-fit group-hover:bg-blue-500/20 transition-colors">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">Chat to sales</h3>
            <p className="text-gray-400 text-sm mb-3">Speak to our friendly team.</p>
            <a href="mailto:sales@canceriancapital.com" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">sales@canceriancapital.com</a>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/80 rounded-xl p-5 hover:border-purple-500/30 transition-all duration-300 group">
            <div className="mb-4 p-2 bg-purple-500/10 rounded-lg w-fit group-hover:bg-purple-500/20 transition-colors">
              <Headphones className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">Chat to support</h3>
            <p className="text-gray-400 text-sm mb-3">We're here to help.</p>
            <a href="mailto:support@canceriancapital.com" className="text-purple-400 text-sm hover:text-purple-300 transition-colors">support@canceriancapital.com</a>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/80 rounded-xl p-5 hover:border-green-500/30 transition-all duration-300 group">
            <div className="mb-4 p-2 bg-green-500/10 rounded-lg w-fit group-hover:bg-green-500/20 transition-colors">
              <MapPin className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">Visit us</h3>
            <p className="text-gray-400 text-sm mb-3">Visit our office HQ.</p>
            <a href="https://maps.google.com" className="text-green-400 text-sm hover:text-green-300 transition-colors">View on Google Maps</a>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/80 rounded-xl p-5 hover:border-yellow-500/30 transition-all duration-300 group">
            <div className="mb-4 p-2 bg-yellow-500/10 rounded-lg w-fit group-hover:bg-yellow-500/20 transition-colors">
              <Phone className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">Call us</h3>
            <p className="text-gray-400 text-sm mb-3">Mon-Fri from 9am to 5pm.</p>
            <a href="tel:+1-555-000-0000" className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors">+1 (555) 000-0000</a>
          </div>
        </div>
      </div>

      {/* Legal Section - Horizontal Cards */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="flex items-center justify-center mb-8">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-green-500 mr-4"></div>
          <h2 className="text-3xl font-bold text-center">Legal Information</h2>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-green-500 ml-4"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl p-5 hover:border-blue-500/20 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-base font-medium">Terms of Service</h3>
            </div>
            <p className="text-gray-400 text-xs mb-4 flex-grow">
              Review our detailed terms of service agreement that governs the use of Cancerian Capital's algorithmic trading platform.
            </p>
            <a href="#" className="text-blue-400 text-xs flex items-center hover:text-blue-300 transition-colors">
              Read our terms
              <ChevronDown className="w-3 h-3 ml-1 transform rotate-270" />
            </a>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl p-5 hover:border-purple-500/20 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg mr-3">
                <Shield className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-base font-medium">Privacy Policy</h3>
            </div>
            <p className="text-gray-400 text-xs mb-4 flex-grow">
              Learn about how we collect, use, and protect your personal information and trading data when using our services.
            </p>
            <a href="#" className="text-purple-400 text-xs flex items-center hover:text-purple-300 transition-colors">
              Read our policy
              <ChevronDown className="w-3 h-3 ml-1 transform rotate-270" />
            </a>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl p-5 hover:border-green-500/20 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg mr-3">
                <Shield className="w-4 h-4 text-green-400" />
              </div>
              <h3 className="text-base font-medium">Risk Disclosure</h3>
            </div>
            <p className="text-gray-400 text-xs mb-4 flex-grow">
              Important information about the inherent risks associated with algorithmic trading and financial markets.
            </p>
            <a href="#" className="text-green-400 text-xs flex items-center hover:text-green-300 transition-colors">
              Read our disclosure
              <ChevronDown className="w-3 h-3 ml-1 transform rotate-270" />
            </a>
          </div>
        </div>
      </div>

      {/* Pricing and FAQ Grid Layout */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pricing Section */}
          <div>
            <div className="flex items-center justify-center mb-8">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500 mr-4"></div>
              <h2 className="text-3xl font-bold text-center">Pricing</h2>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-500 ml-4"></div>
            </div>
            
            <div className="relative bg-gray-900/60 backdrop-blur-md border border-gray-800/80 rounded-2xl p-6 overflow-hidden h-full">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
              
              <div className="flex flex-col items-start justify-between gap-8 relative z-10 h-full">
                <div className="flex-1 w-full">
                  <div className="bg-blue-900/30 text-blue-400 text-xs py-1 px-3 rounded-full inline-block mb-4 font-medium">EARLY ACCESS</div>
                  <h3 className="text-2xl font-bold mb-3">Free Trial Available</h3>
                  <p className="text-gray-400 mb-6 text-sm">Experience the power of algorithmic trading with no commitment.</p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <div className="text-green-500 p-1 bg-green-500/10 rounded-full mr-3">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-gray-300 text-sm">Full access to trading algorithms</span>
                    </li>
                    <li className="flex items-center">
                      <div className="text-green-500 p-1 bg-green-500/10 rounded-full mr-3">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-gray-300 text-sm">Real-time market analysis</span>
                    </li>
                    <li className="flex items-center">
                      <div className="text-green-500 p-1 bg-green-500/10 rounded-full mr-3">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-gray-300 text-sm">Custom strategy building</span>
                    </li>
                    <li className="flex items-center">
                      <div className="text-green-500 p-1 bg-green-500/10 rounded-full mr-3">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-gray-300 text-sm">Paper trading capabilities</span>
                    </li>
                    <li className="flex items-center">
                      <div className="text-green-500 p-1 bg-green-500/10 rounded-full mr-3">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-gray-300 text-sm">Paper trading capabilities</span>
                    </li>
                  </ul>
                  
                  <button className="group bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/20 cursor-pointer">
                    <span className="bg-gradient-to-r from-white to-gray-100 bg-clip-text group-hover:opacity-90 transition-opacity">
                      Start your free trial
                    </span>
                  </button> 
                </div>
                
                <div className="border-t border-gray-700/50 pt-6 w-full">
                  <div className="text-xl font-semibold mb-1">After Trial</div>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">$99</span>
                    <span className="text-gray-400 ml-2">/month</span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-3">Cancel anytime. No contracts.</p>
                  <a href="#" className="inline-flex items-center text-blue-400 text-sm hover:text-blue-300 transition-colors">
                    <span>Contact our team</span>
                    <ChevronDown className="w-4 h-4 ml-1 transform -rotate-90" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div>
            <div className="flex items-center justify-center mb-8">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-purple-500 mr-4"></div>
              <h2 className="text-3xl font-bold text-center">FAQs</h2>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-500 ml-4"></div>
            </div>
            
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  ref={el => faqRefs.current[index] = el}
                  className="border border-gray-800/50 bg-gray-900/60 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-700"
                >
                  <button 
                    className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-800/20 transition-colors cursor-pointer"
                    onClick={() => toggleQuestion(index)}
                  >
                    <div className="flex items-center">
                      <span className="mr-3 text-gray-400 bg-gray-800 p-2 rounded-lg">
                        {index === 0 && <Clock className="w-4 h-4" />}
                        {index === 1 && <CreditCard className="w-4 h-4" />}
                        {index === 2 && <File className="w-4 h-4" />}
                        {index === 3 && <MessageSquare className="w-4 h-4" />}
                        {index === 4 && <MapPin className="w-4 h-4" />}
                        {index === 5 && <Shield className="w-4 h-4" />}
                      </span>
                      <span className="font-medium text-sm">{faq.question}</span>
                    </div>
                    <div className={`p-1 rounded-full transition-colors duration-200 ${activeQuestion === index ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'}`}>
                      {activeQuestion === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      activeQuestion === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="p-4 bg-gray-800/30 border-t border-gray-800/50">
                      <p className="text-gray-400 text-sm">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;