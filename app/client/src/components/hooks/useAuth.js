import { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';

/**
 * Custom hook to access authentication context
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth hook must be used within an AuthProvider component. ' +
      'Wrap your component tree with <AuthProvider>'
    );
  }

  return context;
};
