import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('ctf_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          console.log('AuthContext - Loaded user data:', userData);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('ctf_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Team login
  const login = async (teamName, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        teamName,
        password
      });

      const userData = {
        ...response.data.team,
        teamName: response.data.team.name, // Map name to teamName for consistency
        password, // Store password for auth headers
        isAdmin: false,
        type: 'team'
      };

      console.log('AuthContext - Login response:', response.data);
      console.log('AuthContext - Created user data:', userData);
      setUser(userData);
      localStorage.setItem('ctf_user', JSON.stringify(userData));
      toast.success('Login successful!');
      return userData;
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  // Admin login
  const adminLogin = async (username, password) => {
    try {
      const response = await axios.post('/api/admin/login', {
        username,
        password
      });

      const userData = {
        username,
        password, // Store password for auth headers
        isAdmin: true,
        type: 'admin'
      };

      setUser(userData);
      localStorage.setItem('ctf_user', JSON.stringify(userData));
      toast.success('Admin login successful!');
      return userData;
    } catch (error) {
      const message = error.response?.data?.error || 'Admin login failed';
      toast.error(message);
      throw error;
    }
  };

  // Team registration
  const register = async (teamName, password, members) => {
    try {
      const response = await axios.post('/api/auth/register', {
        teamName,
        password,
        members
      });

      const userData = {
        ...response.data.team,
        teamName: response.data.team.name, // Map name to teamName for consistency
        password, // Store password for auth headers
        isAdmin: false,
        type: 'team'
      };

      setUser(userData);
      localStorage.setItem('ctf_user', JSON.stringify(userData));
      toast.success('Registration successful!');
      return userData;
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('ctf_user');
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      const response = await axios.put('/api/auth/profile', {
        teamName: user.name,
        ...updates
      });

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('ctf_user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed';
      toast.error(message);
      throw error;
    }
  };

  // Get user profile
  const getProfile = async () => {
    try {
      const response = await axios.get('/api/auth/profile', {
        params: { teamName: user.name }
      });

      const updatedUser = { ...user, ...response.data.team };
      setUser(updatedUser);
      localStorage.setItem('ctf_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    adminLogin,
    register,
    logout,
    updateProfile,
    getProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 