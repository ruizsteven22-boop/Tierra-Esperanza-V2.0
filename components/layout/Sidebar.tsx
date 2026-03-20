'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Wallet, 
  Gavel, 
  Users2, 
  Settings, 
  LifeBuoy,
  LogOut
} from 'lucide-react';
import { canAccess, PERMISSIONS } from '@/lib/permissions';

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const role = user.role.name;

  const menuItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      show: canAccess(role, PERMISSIONS.DASHBOARD)
    },
    { 
      name: 'Socios', 
      href: '/socios', 
      icon: Users,
      show: canAccess(role, PERMISSIONS.MEMBERS.READ)
    },
    { 
      name: 'Secretaría', 
      href: '/secretaria', 
      icon: FileText,
      show: canAccess(role, PERMISSIONS.SECRETARY.READ)
    },
    { 
      name: 'Tesorería', 
      href: '/tesoreria', 
      icon: Wallet,
      show: canAccess(role, PERMISSIONS.TREASURY.READ)
    },
    { 
      name: 'Asambleas', 
      href: '/asambleas', 
      icon: Gavel,
      show: canAccess(role, PERMISSIONS.ASSEMBLIES.READ)
    },
    { 
      name: 'Directiva', 
      href: '/directiva', 
      icon: Users2,
      show: canAccess(role, PERMISSIONS.DIRECTIVE.READ)
    },
    { 
      name: 'Configuración', 
      href: '/configuracion', 
      icon: Settings,
      show: canAccess(role, PERMISSIONS.CONFIG.READ)
    },
    { 
      name: 'Soporte', 
      href: '/soporte', 
      icon: LifeBuoy,
      show: canAccess(role, PERMISSIONS.USERS.READ)
    },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full hidden md:flex">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-2xl font-bold text-emerald-600 tracking-tight">SIGEVIVI</h2>
        <p className="text-xs text-slate-400 font-medium uppercase mt-1">Gestión de Vivienda</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.filter(item => item.show).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group"
        >
          <LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-500" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
