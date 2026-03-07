'use client';
import { Search, Bell, User } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 fixed top-0 left-64 right-0 z-10 no-print">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar socios, movimientos..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-600">
          <Bell className="h-5 w-5" />
        </button>
        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
          <User className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
}
