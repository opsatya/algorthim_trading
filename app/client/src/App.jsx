import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/auth/AuthContext";
import Navbar from "./components/Navbar";
import ChatPage from "./components/pages/ChatPage";
import { WelcomeMessage } from "./components/chat/WelcomeMessage";
import AuthModal from "./components/auth/AuthModal";
import Footer from "./components/pages/Footer";
import NotFound from "./components/pages/NotFound";
import Blog from "./components/pages/Blog";
import Resources from "./components/pages/Resources";
import Contact from "./components/pages/Contact";
import AboutUs from "./components/pages/AboutUs";
import VisionSection from "./components/pages/VisionSection";
import HomePage from "./components/pages/HomePage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Public Route Component (redirects authenticated users from auth-only pages)
const PublicRoute = ({ children, redirectTo = "/welcome" }) => {
  const { user, loading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-500"></div>
      </div>
    );
  }
  
  // If user is authenticated and trying to access public-only routes, redirect
  if (user && redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return children;
};

// App Layout Component
const AppLayout = ({ children, showNavbar = true, showFooter = true }) => {
  return (
    <>
      {showNavbar && <Navbar />}
      <main className="min-h-screen">
        {children}
      </main>
      {showFooter && <Footer />}
    </>
  );
};

// Main App Content Component (needs to be inside AuthProvider to use auth)
const AppContent = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { user } = useAuth();

  // Function to open auth modal
  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute redirectTo={null}>
              <AppLayout>
                <HomePage openAuthModal={openAuthModal} />
                <AboutUs />
                <VisionSection />
              </AppLayout>
            </PublicRoute>
          }
        />
        
        {/* Chat Route - Available to both authenticated and non-authenticated users */}
        <Route
          path="/chat"
          element={
            <AppLayout showFooter={false}>
              <ChatPage openAuthModal={openAuthModal} />
            </AppLayout>
          }
        />
        
        <Route
          path="/blog"
          element={
            <AppLayout>
              <Blog />
            </AppLayout>
          }
        />
        
        <Route
          path="/resources"
          element={
            <AppLayout>
              <Resources />
            </AppLayout>
          }
        />
        
        <Route
          path="/contact"
          element={
            <AppLayout>
              <Contact />
            </AppLayout>
          }
        />
        
        {/* Protected Routes */}
        <Route
          path="/welcome"
          element={
            <ProtectedRoute>
              <AppLayout>
                <WelcomeMessage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold text-white mb-6">
                    Welcome back, {user?.displayName || user?.email}!
                  </h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                      <h3 className="text-xl font-semibold text-white mb-2">Portfolio</h3>
                      <p className="text-gray-400">View your trading portfolio</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                      <h3 className="text-xl font-semibold text-white mb-2">Analytics</h3>
                      <p className="text-gray-400">Trading performance analytics</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                      <h3 className="text-xl font-semibold text-white mb-2">AI Chat</h3>
                      <p className="text-gray-400">Get AI-powered trading insights</p>
                    </div>
                  </div>
                </div>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold text-white mb-6">Profile</h1>
                  <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-4 mb-6">
                      {user?.photoURL && (
                        <img 
                          src={user.photoURL} 
                          alt="Profile" 
                          className="w-16 h-16 rounded-full"
                        />
                      )}
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          {user?.displayName || 'Anonymous User'}
                        </h2>
                        <p className="text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 mb-2">Email</label>
                        <div className="bg-white/5 p-3 rounded border border-white/10 text-white">
                          {user?.email}
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-2">Account Type</label>
                        <div className="bg-white/5 p-3 rounded border border-white/10 text-white">
                          {user?.providerData?.[0]?.providerId === 'google.com' ? 'Google Account' : 
                           user?.providerData?.[0]?.providerId === 'github.com' ? 'GitHub Account' : 
                           'Email Account'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Catch-all Route */}
        <Route 
          path="*" 
          element={
            <AppLayout>
              <NotFound />
            </AppLayout>
          } 
        />
      </Routes>
    </>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
