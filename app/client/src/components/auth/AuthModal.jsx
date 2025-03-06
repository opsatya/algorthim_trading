import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../ui/Button';

const AuthModal = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authMode, 
    setAuthMode, 
    login, 
    signup, 
    verifyOTP 
  } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOTP] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingLoginAfterOTP, setPendingLoginAfterOTP] = useState(false);

  const validateForm = () => {
    setError('');
    
    if (authMode === 'signup') {
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
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
    setError('');
    
    try {
      if (authMode === 'signup') {
        const response = await signup({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        
        if (response.success) {
          setSuccessMessage('OTP sent to your email');
          setShowOTPInput(true);
          setPendingLoginAfterOTP(true);
        } else {
          setError(response.message);
        }
      } else {
        const response = await login({
          email: formData.email,
          password: formData.password
        });
        
        if (response.success) {
          setIsAuthModalOpen(false);
        } else {
          if (response.message === 'Email not verified' && response.requireVerification) {
            setSuccessMessage('Please verify your email first');
            setShowOTPInput(true);
          } else {
            setError(response.message);
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await verifyOTP(formData.email, otp);
      
      if (response.success) {
        setSuccessMessage('Account verified successfully');
        
        // If we need to login after verification
        if (pendingLoginAfterOTP) {
          const loginResponse = await login({
            email: formData.email,
            password: formData.password
          });
          
          if (loginResponse.success) {
            setTimeout(() => {
              setIsAuthModalOpen(false);
            }, 1500);
          } else {
            setError(loginResponse.message);
          }
        } else {
          setTimeout(() => {
            setIsAuthModalOpen(false);
          }, 1500);
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('OTP verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (showOTPInput) {
      setShowOTPInput(false);
      setOTP('');
      setPendingLoginAfterOTP(false);
    } else {
      setIsAuthModalOpen(false);
    }
    setError('');
    setSuccessMessage('');
  };

  if (!isAuthModalOpen) return null;

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
          {showOTPInput ? 'Enter OTP' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
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

        {showOTPInput ? (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Enter the 6-digit OTP sent to your email</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  
                  const value = e.target.value.replace(/[^0-9]/g, '');  
                  if (value.length <= 6) setOTP(value);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                placeholder="Enter OTP"
                maxLength={6}
              />
            </div>
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-gray-400 mb-2">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="Enter username"
                  />
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-400 mb-2">{authMode === 'login' ? 'Username or Email' : 'Email'}</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder={authMode === 'login' ? "Enter username or email" : "Enter email"}
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

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="text-gray-400">or</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            <div className="space-y-3">
              <Button
                variant="secondary"
                fullWidth
                icon={<span className="w-5 h-5 flex items-center justify-center">G</span>}
                disabled
              >
                Continue with Google
              </Button>
              <Button
                variant="secondary"
                fullWidth
                icon={<span className="w-5 h-5 flex items-center justify-center">GH</span>}
                disabled
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
                  setError('');
                  setFormData({
                    username: '',
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
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;