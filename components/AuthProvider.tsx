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
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setTimeout(() => setUser(parsed), 0);
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('user');
      }
    }
    setTimeout(() => setMounted(true), 0);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/');
      }
    }
  }, [user, pathname, mounted, router]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    router.push('/');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
  };

  const canAccess = (path: string) => {
    if (!user) return false;
    const role = user.role;
    
    if (role === 'Admin' || role === 'Administrador' || role === 'Presidente') return true;
    
    // Base paths everyone can access
    if (path === '/' || path === '/socios' || path === '/directiva') return true;

    if (role === 'Socio') {
      return path === '/socios' || path === '/tesoreria' || path === '/directiva';
    }

    if (role === 'Tesorero') {
      return path === '/tesoreria';
    }

    if (role === 'Secretario') {
      return path === '/secretaria';
    }

    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role: user?.role || '', 
      login, 
      logout, 
      canAccess,
      loading: !mounted 
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
