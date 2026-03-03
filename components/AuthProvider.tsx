'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'Administrador' | 'Tesorero' | 'Secretario' | 'Visualizador';

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  canAccess: (path: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('Administrador');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as Role;
    if (savedRole) {
      setTimeout(() => setRole(savedRole), 0);
    }
    setTimeout(() => setMounted(true), 0);
  }, []);

  const handleSetRole = (newRole: Role) => {
    setRole(newRole);
    localStorage.setItem('userRole', newRole);
  };

  const canAccess = (path: string) => {
    if (role === 'Administrador') return true;
    
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
    return null; // Prevent hydration mismatch
  }

  return (
    <AuthContext.Provider value={{ role, setRole: handleSetRole, canAccess }}>
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
