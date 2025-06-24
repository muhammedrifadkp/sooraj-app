// This file is deprecated and should not be used. Please use AuthContext.jsx instead.

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI, attendanceAPI } from '../services/api';
import axios from 'axios';
import { toast } from 'react-toastify';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: 'CSE' | 'EEE' | 'MECH';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: string, department?: string) => Promise<any>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const hasMarkedAttendanceRef = useRef(false);

  // Helper function to check if attendance was marked today
  const wasAttendanceMarkedToday = () => {
    const lastMarkedDate = localStorage.getItem('lastAttendanceDate');
    const today = new Date().toISOString().split('T')[0];
    return lastMarkedDate === today;
  };

  // Helper function to mark attendance date
  const markAttendanceDate = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('lastAttendanceDate', today);
    hasMarkedAttendanceRef.current = true;
  };

  // Initialize auth state
  useEffect(() => {
    let isInitializing = false;

    const initializeAuth = async () => {
      // Prevent duplicate initialization
      if (isInitializing) return;
      isInitializing = true;

      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        // Parse stored user first
        const parsedUser = JSON.parse(storedUser);

        // Verify token and get fresh user data
        const verifiedUser = await authAPI.verifyToken();
        if (verifiedUser) {
          // Merge stored user data with verified data
          const user = {
            ...parsedUser,
            ...verifiedUser.user,
            role: (verifiedUser.user.role || 'student').toLowerCase()
          };

          // Store updated user data
          localStorage.setItem('user', JSON.stringify(user));

          setUser(user);
          setIsAuthenticated(true);
          setIsAdmin(user.role.toLowerCase() === 'admin');

          console.log('Auth initialized - user role:', user.role);

          // Only attempt to mark attendance for students once per day
          if (user.role === 'student' && !wasAttendanceMarkedToday()) {
            try {
              const response = await attendanceAPI.markLoginAttendance();
              if (response && (response.attendance || response.duplicate)) {
                markAttendanceDate();
              }
            } catch (error) {
              console.error('Failed to mark attendance during initialization:', error);
            }
          }
        } else {
          // Clear auth data if token verification fails
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
        isInitializing = false;
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      isInitializing = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const user = response.user;
      user.role = (user.role || 'student').toLowerCase();

      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);
      setIsAdmin(user.role.toLowerCase() === 'admin');

      // Only attempt to mark attendance for students once per day
      if (user.role === 'student' && !wasAttendanceMarkedToday()) {
        try {
          const attendanceResponse = await attendanceAPI.markLoginAttendance();
          if (attendanceResponse && (attendanceResponse.attendance || attendanceResponse.duplicate)) {
            markAttendanceDate();
          }
        } catch (error) {
          console.error('Failed to mark attendance during login:', error);
        }
      }

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginHistory');
    localStorage.removeItem('lastAttendanceDate'); // Clear attendance date on logout

    // Reset auth state
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    hasMarkedAttendanceRef.current = false;
  };

  const register = async (name: string, email: string, password: string, role: string, department?: string) => {
    try {
      const response = await authAPI.register(name, email, password, role, department);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      // Ensure role is always a string and properly cased
      updatedUser.role = (updatedUser.role || 'student').toLowerCase();

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setUser(updatedUser);
      setIsAdmin(updatedUser.role.toLowerCase() === 'admin');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};