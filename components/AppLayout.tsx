'use client';

import { useAuth } from '@/components/AuthProvider';
import { Sidebar } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { usePathname } from 'next/navigation';
import React from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!user) {
    return null; // AuthProvider will redirect
  }

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto pt-16 p-4 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
