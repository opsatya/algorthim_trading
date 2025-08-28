import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import Button from '../ui/Button';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { 
    loginWithGoogle, 
    loginWithGithub, 
    loginWithEmail, 
    signUpWithEmail,
    loading, 
    error, 
    clearError 
  } = useAuth();
  
  const [authMode, setAuthMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    setLocalError('');
    clearError();
    
    if (authMode === 'signup') {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setLocalError('All fields are required');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setLocalError('Passwords do not match');
        return false;
      }
      
      if (formData.password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return false;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setLocalError('Please enter a valid email address');
        return false;
      }
    } else {
      if (!formData.email || !formData.password) {
        setLocalError('Email and password are required');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLocalError('');
    setSuccessMessage('');
    
    try {
      if (authMode === 'signup') {
        await signUpWithEmail(formData.email, formData.password);
        setSuccessMessage('Account created successfully!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        await loginWithEmail(formData.email, formData.password);
        setSuccessMessage('Signed in successfully!');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      // Error is already handled in AuthContext
      console.error('Auth error:', err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLocalError('');
      clearError();
      await loginWithGoogle();
      setSuccessMessage('Signed in with Google successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Google login error:', err);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setLocalError('');
      clearError();
      await loginWithGithub();
      setSuccessMessage('Signed in with GitHub successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('GitHub login error:', err);
    }
  };

  const handleBack = () => {
    onClose();
    setLocalError('');
    setSuccessMessage('');
    clearError();
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  const switchMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
    setLocalError('');
    setSuccessMessage('');
    clearError();
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  if (!isOpen) return null;

  const displayError = localError || error;

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
          {authMode === 'login' ? 'Sign In' : 'Sign Up'}
        </h2>
        
        {displayError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            {displayError}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
            {successMessage}
          </div>
        )}

        {/* Social Login Buttons - Moved to top */}
        <div className="space-y-3 mb-6">
          <Button
            variant="secondary"
            fullWidth
            icon={<span className="w-5 h-5 flex items-center justify-center text-red-500 font-bold">G</span>}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            icon={<span className="w-5 h-5 flex items-center justify-center">⚡</span>}
            onClick={handleGithubLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Continue with GitHub'}
          </Button>
        </div>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 border-t border-white/10"></div>
          <span className="text-gray-400">or</span>
          <div className="flex-1 border-t border-white/10"></div>
        </div>

        {/* Email/Password Form */}
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
                disabled={loading}
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
                placeholder="Enter your password"
                disabled={loading}
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
                  placeholder="Confirm your password"
                  disabled={loading}
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
            {loading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
          </Button>

          <p className="text-center text-gray-400 mt-4">
            {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={switchMode}
              className="ml-2 text-violet-500 hover:text-violet-400 cursor-pointer"
              disabled={loading}
            >
              {authMode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
