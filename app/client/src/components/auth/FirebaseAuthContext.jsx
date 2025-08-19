import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../../config/firebase';

const FirebaseAuthContext = createContext();

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

export const FirebaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email/Password Sign Up
  const signUpWithEmail = async (email, password) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      await sendEmailVerification(result.user);
      
      return {
        success: true,
        message: 'Account created successfully! Please check your email for verification.',
        user: result.user
      };
    } catch (error) {
      setError(error.message);
      return {
        success: false,
        message: error.message
      };
    }
  };

  // Email/Password Sign In
  const signInWithEmail = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      if (!result.user.emailVerified) {
        return {
          success: false,
          message: 'Please verify your email before signing in.',
          requiresVerification: true
        };
      }
      
      return {
        success: true,
        message: 'Signed in successfully!',
        user: result.user
      };
    } catch (error) {
      setError(error.message);
      return {
        success: false,
        message: error.message
      };
    }
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      return {
        success: true,
        message: 'Signed in with Google successfully!',
        user: result.user
      };
    } catch (error) {
      setError(error.message);
      return {
        success: false,
        message: error.message
      };
    }
  };

  // GitHub Sign In
  const signInWithGitHub = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, githubProvider);
      return {
        success: true,
        message: 'Signed in with GitHub successfully!',
        user: result.user
      };
    } catch (error) {
      setError(error.message);
      return {
        success: false,
        message: error.message
      };
    }
  };

  // Sign Out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      return {
        success: true,
        message: 'Signed out successfully!'
      };
    } catch (error) {
      setError(error.message);
      return {
        success: false,
        message: error.message
      };
    }
  };

  // Resend Email Verification
  const resendEmailVerification = async () => {
    try {
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        return {
          success: true,
          message: 'Verification email sent!'
        };
      }
      return {
        success: false,
        message: 'No user found or email already verified'
      };
    } catch (error) {
      setError(error.message);
      return {
        success: false,
        message: error.message
      };
    }
  };

  const value = {
    user,
    loading,
    error,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithGitHub,
    logout,
    resendEmailVerification,
    setError
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {!loading && children}
    </FirebaseAuthContext.Provider>
  );
};