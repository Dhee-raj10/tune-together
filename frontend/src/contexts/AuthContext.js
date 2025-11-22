import api from '../services/api';
import { MusicianRoleSelector } from "../components/MusicianRoleSelector";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({ user: null, session: null });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setSession({ user: parsedUser, token });
        api.defaults.headers.common['x-auth-token'] = token;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set API default header
      api.defaults.headers.common['x-auth-token'] = token;
      
      // Update state
      setUser(userData);
      setSession({ user: userData, token });
      
      console.log('✅ Login successful, token stored');
      
      return { user: userData, error: null };
    } catch (error) {
      console.error("Login failed:", error.response?.data?.msg || error.message);
      return { user: null, error: error.response?.data?.msg || 'Invalid Credentials' };
    }
  };

  // Signup function
  const signup = async (username, email, password) => {
    try {
      const res = await api.post('/auth/signup', { username, email, password });
      const { token, user: userData } = res.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set API default header
      api.defaults.headers.common['x-auth-token'] = token;
      
      // Update state
      setUser(userData);
      setSession({ user: userData, token });
      
      // Show role selector for new signups
      setShowRoleSelector(true);
      
      console.log('✅ Signup successful, token stored');
      
      return { user: userData, error: null };
    } catch (error) {
      console.error("Signup failed:", error.response?.data?.msg || error.message);
      return { user: null, error: error.response?.data?.msg || 'Signup failed' };
    }
  };

  // Update user roles function
  const updateUserRoles = async (userId, roles) => {
    try {
      const res = await api.put(`/profiles/${userId}/roles`, { roles });
      const updatedUser = res.data;
      
      const updatedUserId = updatedUser._id || updatedUser.id;
      const currentUserId = user._id || user.id;
      
      if (user && currentUserId === updatedUserId) {
        const normalizedUser = {
          ...updatedUser,
          id: updatedUserId,
        };
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        
        setUser(normalizedUser);
        setSession(prev => ({ ...prev, user: normalizedUser }));
        setShowRoleSelector(false);
      }
      
      return updatedUser;
    } catch (error) {
      console.error("Error updating roles:", error);
      throw new Error(error.response?.data?.msg || 'Failed to update roles');
    }
  };

  // Logout function
  const logout = async () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear API header
    delete api.defaults.headers.common['x-auth-token'];
    
    // Clear state
    setUser(null);
    setSession(null);
    setShowRoleSelector(false);
    
    console.log('✅ Logged out successfully');
  };

  const value = {
    user,
    session,
    login,
    signup,
    logout,
    updateUserRoles,
    isLoading
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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