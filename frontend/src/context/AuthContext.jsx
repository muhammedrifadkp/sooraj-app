import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI, attendanceAPI } from '../services/api';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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

  // ...rest of the logic from AuthContext.tsx, converted to JS (omitted for brevity)

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
