import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';

interface User {
  userId: string;
  name: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  register: (email: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('senpai_token');
    const userId = localStorage.getItem('senpai_userId');
    const name = localStorage.getItem('senpai_name');
    if (token && userId) {
      setUser({ userId, name: name || 'User', token });
    }
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    const res = await api.login(email);
    localStorage.setItem('senpai_token', res.token);
    localStorage.setItem('senpai_userId', res.userId);
    localStorage.setItem('senpai_name', res.name);
    setUser({ userId: res.userId, name: res.name, token: res.token });
  };

  const register = async (email: string, name?: string) => {
    const res = await api.register(email, name);
    localStorage.setItem('senpai_token', res.token);
    localStorage.setItem('senpai_userId', res.userId);
    localStorage.setItem('senpai_name', res.name);
    setUser({ userId: res.userId, name: res.name, token: res.token });
  };

  const logout = () => {
    localStorage.removeItem('senpai_token');
    localStorage.removeItem('senpai_userId');
    localStorage.removeItem('senpai_name');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}