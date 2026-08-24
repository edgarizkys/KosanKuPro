import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, role: 'LANDLORD' | 'TENANT') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper for cross-platform secure storage (Native SecureStore vs Web localStorage)
const getStoredItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    console.warn(`Error reading ${key}:`, e);
    return null;
  }
};

const setStoredItem = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.warn(`Error writing ${key}:`, e);
  }
};

const deleteStoredItem = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch (e) {
    console.warn(`Error deleting ${key}:`, e);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check saved session on app launch
    const loadSession = async () => {
      try {
        const savedToken = await getStoredItem('user_token');
        const savedUserStr = await getStoredItem('user_data');
        if (savedToken && savedUserStr) {
          setToken(savedToken);
          setUser(JSON.parse(savedUserStr));
        }
      } catch (e) {
        console.error('Failed to load auth session:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email: string, role: 'LANDLORD' | 'TENANT') => {
    setIsLoading(true);
    const mockUser: User = {
      id: 'usr_101',
      name: role === 'LANDLORD' ? 'Bapak Budi (Owner)' : 'Rizky (Penyewa)',
      email,
      role,
      phone: '+6281234567890',
    };
    const mockToken = 'jwt_token_kosankupro_sample_' + Date.now();

    await setStoredItem('user_token', mockToken);
    await setStoredItem('user_data', JSON.stringify(mockUser));

    setToken(mockToken);
    setUser(mockUser);
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await deleteStoredItem('user_token');
    await deleteStoredItem('user_data');
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
