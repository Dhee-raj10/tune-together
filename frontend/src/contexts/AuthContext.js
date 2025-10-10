import api from '../services/api';
import { MusicianRoleSelector } from "../components/MusicianRoleSelector";
import { createContext, useContext, useState } from "react";

const AuthContext = createContext({ user: null, session: null });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  // Login function - FIXED: Don't show role selector on login
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      
      api.defaults.headers.common['x-auth-token'] = token;
      setUser(user);
      setSession({ user, token });
      
      // Don't show role selector on login, only for new signups
      setShowRoleSelector(false);
      
      return { user, error: null };
    } catch (error) {
      console.error("Login failed:", error.response?.data?.msg || error.message);
      return { user: null, error: error.response?.data?.msg || 'Invalid Credentials' };
    }
  };

  // Signup function - FIXED: Always show role selector after signup
  const signup = async (username, email, password) => {
    try {
      const res = await api.post('/auth/signup', { username, email, password });
      const { token, user } = res.data;
      
      api.defaults.headers.common['x-auth-token'] = token;
      setUser(user);
      setSession({ user, token });
      
      // CRITICAL FIX: Always show role selector after a new signup
      setShowRoleSelector(true);
      
      return { user, error: null };
    } catch (error) {
      console.error("Signup failed:", error.response?.data?.msg || error.message);
      return { user: null, error: error.response?.data?.msg || 'Signup failed' };
    }
  };

  // Update user roles function - FIXED: Proper ID handling
  const updateUserRoles = async (userId, roles) => {
    try {
      // Calls the PUT /api/profiles/:id/roles route
      const res = await api.put(`/profiles/${userId}/roles`, { roles });
      const updatedUser = res.data;
      
      // FIXED: Handle both _id (from MongoDB) and id fields
      const updatedUserId = updatedUser._id || updatedUser.id;
      const currentUserId = user._id || user.id;
      
      if (user && currentUserId === updatedUserId) {
        // Update user state with proper ID mapping
        const normalizedUser = {
          ...updatedUser,
          id: updatedUserId, // Ensure id field exists for frontend consistency
        };
        
        setUser(normalizedUser);
        setSession(prev => ({ ...prev, user: normalizedUser }));
        
        // Hide the selector after successful update
        setShowRoleSelector(false);
      }
      
      return updatedUser;
    } catch (error) {
      console.error("Error updating roles:", error);
      // Re-throw error so component can handle it
      throw new Error(error.response?.data?.msg || 'Failed to update roles');
    }
  };

  // Logout function
  const logout = async () => {
    setUser(null);
    setSession(null);
    api.defaults.headers.common['x-auth-token'] = null;
    setShowRoleSelector(false);
  };

  const value = {
    user,
    session,
    login,
    signup,
    logout,
    updateUserRoles
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {user && showRoleSelector && (
        <MusicianRoleSelector
          isOpen={showRoleSelector}
          onClose={() => setShowRoleSelector(false)}
          userId={user._id || user.id}
        />
      )}
    </AuthContext.Provider>
  );
}

export default AuthContext;