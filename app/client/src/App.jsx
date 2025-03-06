import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthContext";
import { useAuth } from "./components/hooks/useAuth";
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
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// App Layout Component
const AppLayout = ({ children, showNavbar = true, showFooter = true }) => {
  return (
    <>
      {showNavbar && <Navbar />}
      {children}
      {showFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthModal />
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
            path="/chat"
            element={
              <AppLayout showFooter={false}>
                <ChatPage />
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
          
          {/* Catch-all Route */}
          <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;