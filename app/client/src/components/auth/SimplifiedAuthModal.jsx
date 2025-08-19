import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useFirebaseAuth } from './FirebaseAuthContext';
import Button from '../ui/Button';

const SimplifiedAuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { 
    signUpWithEmail, 
    signInWithEmail, 
    signInWithGoogle, 
    signInWithGitHub,
    resendEmailVerification,
    error,
    setError
  } = useFirebaseAuth();
  
  const [authMode, setAuthMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  const validateForm = () => {
    setError(null);
    
    if (authMode === 'signup') {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('All fields are required');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    } else {
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      if (authMode === 'signup') {
        const result = await signUpWithEmail(formData.email, formData.password);
        
        if (result.success) {
          setSuccessMessage(result.message);
          setShowEmailVerification(true);
        } else {
          setError(result.message);
        }
      } else {
        const result = await signInWithEmail(formData.email, formData.password);
        
        if (result.success) {
          setSuccessMessage(result.message);
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          if (result.requiresVerification) {
            setShowEmailVerification(true);
          }
          setError(result.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    const result = await signInWithGoogle();
    
    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError(null);
    
    const result = await signInWithGitHub();
    
    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleResendVerification = async () => {
    setLoading(true);
    const result = await resendEmailVerification();
    
    if (result.success) {
      setSuccessMessage(result.message);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleBack = () => {
    if (showEmailVerification) {
      setShowEmailVerification(false);
    } else {
      onClose();
    }
    setError(null);
    setSuccessMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/90 p-8 rounded-2xl border border-white/10 w-full max-w-md relative">
        {/* Back button */}
        <button 
          onClick={handleBack}
          className="absolute top-4 left-4 text-gray-400 hover:text-white cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {showEmailVerification ? 'Verify Email' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
            {successMessage}
          </div>
        )}

        {showEmailVerification ? (
          <div className="space-y-4">
            <p className="text-gray-400 text-center">
              Please check your email and click the verification link. Once verified, you can sign in.
            </p>
            <Button 
              onClick={handleResendVerification}
              variant="secondary" 
              fullWidth
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            <Button 
              onClick={() => setAuthMode('login')}
              variant="ghost" 
              fullWidth
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="Enter password"
                  />
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-gray-400 mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      placeholder="Confirm password"
                    />
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                variant="primary" 
                fullWidth
                disabled={loading}
              >
                {loading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
              </Button>
            </form>

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="text-gray-400">or</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleGoogleSignIn}
                variant="secondary"
                fullWidth
                icon={<span className="w-5 h-5 flex items-center justify-center">G</span>}
                disabled={loading}
              >
                Continue with Google
              </Button>
              <Button
                onClick={handleGitHubSignIn}
                variant="secondary"
                fullWidth
                icon={<span className="w-5 h-5 flex items-center justify-center">GH</span>}
                disabled={loading}
              >
                Continue with GitHub
              </Button>
            </div>

            <p className="text-center text-gray-400 mt-4">
              {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setError(null);
                  setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                  });
                }}
                className="ml-2 text-violet-500 hover:text-violet-400 cursor-pointer"
              >
                {authMode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default SimplifiedAuthModal;