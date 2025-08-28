import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Firebase config using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Set additional scopes for more user info
googleProvider.addScope('profile');
googleProvider.addScope('email');
githubProvider.addScope('user:email');

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Clear any previous errors on auth state change
      if (currentUser) {
        setError(null);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Clear error helper function
  const clearError = () => setError(null);

  // Google Sign In
  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Optional: Access additional user info
      console.log('Google login successful:', result.user.displayName);
      return result.user;
      
    } catch (err) {
      console.error('Google login error:', err);
      
      // Handle specific error codes
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login was cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups and try again.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // GitHub Sign In
  const loginWithGithub = async () => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithPopup(auth, githubProvider);
      
      console.log('GitHub login successful:', result.user.displayName);
      return result.user;
      
    } catch (err) {
      console.error('GitHub login error:', err);
      
      // Handle specific error codes
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login was cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups and try again.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email address but different sign-in credentials.');
      } else {
        setError('Failed to sign in with GitHub. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Sign In
  const loginWithEmail = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      console.log('Email login successful:', result.user.email);
      return result.user;
      
    } catch (err) {
      console.error('Email login error:', err);
      
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else {
        setError('Failed to sign in. Please check your credentials.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Sign Up
  const signUpWithEmail = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      console.log('Email signup successful:', result.user.email);
      return result.user;
      
    } catch (err) {
      console.error('Email signup error:', err);
      
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else {
        setError('Failed to create account. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      console.log('Logout successful');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
      throw err;
    }
  };

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.displayName || user.email || 'User';
  };

  // Helper function to get user avatar
  const getUserAvatar = () => {
    if (!user) return '';
    return user.photoURL || '';
  };

  const value = {
    // User state
    user,
    loading,
    error,
    
    // Authentication methods
    loginWithGoogle,
    loginWithGithub,
    loginWithEmail,
    signUpWithEmail,
    logout,
    
    // Helper methods
    clearError,
    getUserDisplayName,
    getUserAvatar,
    
    // User info
    isAuthenticated: !!user,
    userEmail: user?.email || '',
    userId: user?.uid || ''
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context for advanced usage
export { AuthContext };
export default AuthProvider;
