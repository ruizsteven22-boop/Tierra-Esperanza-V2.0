'use client';

import { Bell, Search, User as UserIcon } from 'lucide-react';

export default function Navbar({ user }: { user: any }) {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
      <div className="flex items-center gap-4 w-full max-w-md relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar en el sistema..." 
          className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{user.role.name}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-inner">
            <UserIcon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
