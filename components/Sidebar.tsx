'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  FileText, 
  Building2, 
  Settings,
  Menu,
  X,
  ShieldAlert,
  UserCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/components/AuthProvider';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Socios', href: '/socios', icon: Users },
  { name: 'Tesorería', href: '/tesoreria', icon: Wallet },
  { name: 'Secretaría', href: '/secretaria', icon: FileText },
  { name: 'Directiva', href: '/directiva', icon: Building2 },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
  { name: 'Soporte', href: '/soporte', icon: ShieldAlert },
];

export function Sidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const { user, logout, canAccess } = useAuth();

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error('Error fetching config in sidebar:', err));
  }, []);

  const filteredNavigation = navigation.filter(item => canAccess(item.href));

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 z-50 p-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-md shadow-md text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={twMerge(
          clsx(
            'fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )
        )}
      >
        <div className="flex items-center gap-3 px-4 h-20 border-b border-slate-800 shrink-0 overflow-hidden">
          {config?.logo ? (
            <Image src={config.logo} alt="Logo" width={40} height={40} className="h-10 w-10 object-contain shrink-0" referrerPolicy="no-referrer" />
          ) : (
            <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-emerald-400" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-white truncate">
              {config?.name || 'Tierra Esperanza'}
            </h1>
            <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider">Comité de Vivienda</p>
          </div>
        </div>
        <nav className="mt-6 px-4 space-y-2 flex-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={twMerge(
                  clsx(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors',
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )
                )}
              >
                <item.icon className={twMerge(clsx('mr-3 h-5 w-5', isActive ? 'text-emerald-400' : 'text-slate-400'))} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 overflow-hidden">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="h-6 w-6 text-emerald-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Usuario'}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold truncate">{user?.role || 'Socio'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all border border-slate-700 hover:border-red-500/20"
          >
            <ShieldAlert className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
