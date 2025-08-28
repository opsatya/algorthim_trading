import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Navbar from "./components/Navbar";
import ChatPage from "./components/pages/ChatPage";
import Footer from "./components/pages/Footer";
import NotFound from "./components/pages/NotFound";
import Blog from "./components/pages/Blog";
import Resources from "./components/pages/Resources";
import Contact from "./components/pages/Contact";
import AboutUs from "./components/pages/AboutUs";
import VisionSection from "./components/pages/VisionSection";
import HomePage from "./components/pages/HomePage";

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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

// Main App Component
function App() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("Missing Publishable Key");
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <AppLayout>
                  <HomePage />
                  <AboutUs />
                  <VisionSection />
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
              path="/chat"
              element={
                <ProtectedRoute>
                  <AppLayout showFooter={false}>
                    <ChatPage />
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
                        Trading Dashboard
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
        </div>
      </Router>
    </ClerkProvider>
  );
}

export default App;
