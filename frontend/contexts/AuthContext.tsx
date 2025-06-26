import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@/constants/Api'; // Postavi API_URL u constants

interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'imam' | 'admin';
  mosqueId: string;
  mosqueName: string;
}

interface RegisterData {
  mosqueName: string;
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

// Postavi axios interceptor za automatsko dodavanje tokena
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
        console.log('Loaded user:', userData, 'Loaded token:', token); // Debug
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

      const userFromApi = response.data.user; // Pristup user objektu iz responsa
      const token = response.data.token; // Pristup tokenu iz responsa

      if (!token || !userFromApi) throw new Error('Invalid login response');

      const userData: User = {
        id: userFromApi.id.toString(),
        fullName: userFromApi.full_name,
        email: userFromApi.email,
        role: userFromApi.role,
        mosqueId: userFromApi.mosque_id.toString(),
        mosqueName: userFromApi.mosque_name || '', // Koristi mosque_name iz responsa
      };

      await AsyncStorage.setItem('token', token); // Čuvanje tokena
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
      const response = await axios.post(`${API_URL}/register`, {
        mosque_name: userData.mosqueName,
        full_name: userData.fullName,
        email: userData.email,
        password: userData.password,
        role: userData.role,
      });

      if (response.status === 201 && response.data) {
        const { token, user: registeredUser } = response.data; // Pretpostavljam da API vraća token i user
        if (!token || !registeredUser) throw new Error('Invalid registration response');

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
      } else {
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
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