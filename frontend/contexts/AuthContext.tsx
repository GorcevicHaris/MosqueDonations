import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@/constants/Api';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'imam' | 'admin';
  mosqueId: string;
  mosqueName: string;
}

interface RegisterData {
  mosqueId?: number; // Make it optional to support both methods
  mosqueName?: string;
  fullName: string;
  email: string;
  password: string;
  role: 'imam' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Postavi axios interceptor za automatsko davanje tokena
axios.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');
        console.log('Loaded user:', userData, 'Loaded token:', token);
        if (userData && token) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });

      console.log('✅ Backend login response:', response.data);

      const userFromApi = response.data.user;
      const token = response.data.token;

      if (!token || !userFromApi) throw new Error('Invalid login response');

      const userData: User = {
        id: userFromApi.id.toString(),
        fullName: userFromApi.full_name,
        email: userFromApi.email,
        role: userFromApi.role,
        mosqueId: userFromApi.mosque_id.toString(),
        mosqueName: userFromApi.mosque_name || '',
      };

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error: any) {
      console.error('❌ Login error:', error?.response?.data || error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    console.log('Register data:', userData);
    setLoading(true);
    try {
      // Support both mosque_id and mosque_name registration
      const requestData: any = {
        full_name: userData.fullName,
        email: userData.email,
        password: userData.password,
        role: userData.role,
      };

      // If mosqueId is provided, use it; otherwise use mosqueName
      if (userData.mosqueId) {
        requestData.mosque_id = userData.mosqueId;
      } else if (userData.mosqueName) {
        requestData.mosque_name = userData.mosqueName;
      }

      const response = await axios.post(`${API_URL}/register`, requestData);
      
      console.log('✅ Registration response:', response.data);
      console.log('Response status:', response.status);

      // Check if backend returns token and user directly
      if (response.data.token && response.data.user) {
        const { token, user: registeredUser } = response.data;
        
        const userData: User = {
          id: registeredUser.id.toString(),
          fullName: registeredUser.full_name,
          email: registeredUser.email,
          role: registeredUser.role,
          mosqueId: registeredUser.mosque_id.toString(),
          mosqueName: registeredUser.mosque_name || '',
        };

        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return true;
      } 
      // If backend only returns success message, login after registration
      else if (response.data.message || response.status === 201 || response.status === 200) {
        console.log('Registration successful, logging in...');
        // Automatically login after registration
        return await login(userData.email, userData.password);
      } else {
        console.error('❌ Unexpected response format');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error?.response?.data || error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};