'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Role = 'Administrador' | 'Tesorero' | 'Secretario' | 'Visualizador' | 'Admin' | 'Presidente' | 'Socio';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  photoUrl?: string;
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
    const role = user.role.toLowerCase();
    
    // Superadmin has access to everything
    if (role === 'superadmin') return true;
    
    // Dashboard is accessible to everyone
    if (path === '/') return true;

    // Administrador has access to almost everything except support
    if (role === 'administrador') {
      return path !== '/soporte';
    }

    // Role-specific access
    if (role === 'secretaria') {
      return ['/socios', '/secretaria', '/asambleas'].some(p => path.startsWith(p));
    }

    if (role === 'tesoreria') {
      return ['/tesoreria', '/socios'].some(p => path.startsWith(p));
    }

    if (role === 'directiva') {
      return ['/asambleas', '/directiva', '/socios'].some(p => path.startsWith(p));
    }

    if (role === 'consulta') {
      // Only read access to main modules
      return ['/socios', '/asambleas', '/directiva', '/tesoreria'].some(p => path.startsWith(p));
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
