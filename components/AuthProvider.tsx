'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Role = 'Administrador' | 'Tesorero' | 'Secretario' | 'Visualizador' | 'Admin' | 'Presidente' | 'Socio';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  role: string;
  login: (user: User) => void;
  logout: () => void;
  canAccess: (path: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [{ user, mounted, loading }, setAuthState] = useState({
    user: null as User | null,
    mounted: false,
    loading: true
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    
    setTimeout(() => {
      setAuthState({
        user,
        mounted: true,
        loading: false
      });
    }, 0);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/');
      }
    }
  }, [user, pathname, mounted, loading, router]);

  const login = (userData: User) => {
    setAuthState(prev => ({ ...prev, user: userData }));
    localStorage.setItem('user', JSON.stringify(userData));
    router.push('/');
  };

  const logout = () => {
    setAuthState(prev => ({ ...prev, user: null }));
    localStorage.removeItem('user');
    router.push('/login');
  };

  const canAccess = (path: string) => {
    if (!user) return false;
    const role = user.role;
    
    if (role === 'Admin' || role === 'Administrador' || role === 'Presidente') return true;
    
    // Base paths everyone can access
    if (path === '/' || path === '/socios' || path === '/directiva') return true;

    if (role === 'Tesorero') {
      return path === '/tesoreria';
    }

    if (role === 'Secretario') {
      return path === '/secretaria';
    }

    return false;
  };

  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      role: user?.role || '', 
      login, 
      logout, 
      canAccess,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
