'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const userData = await res.json();
        login(userData);
      } else {
        const data = await res.json();
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 mb-4">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Tierra Esperanza</h1>
          <p className="text-slate-500">Sistema de Gestión de Comités</p>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
                  <Mail className="h-3.5 w-3.5 text-emerald-500" />
                  Usuario / Correo
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@tierraesperanza.cl"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
                  <Lock className="h-3.5 w-3.5 text-emerald-500" />
                  Contraseña
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Acceder al Sistema'}
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-slate-100" />
                <p className="text-[10px] text-center text-slate-400 uppercase tracking-[0.2em] font-black">Acceso por Cargo</p>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer group" onClick={() => {setEmail('soporte@tierraesperanza.cl'); setPassword('admin');}}>
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Administrador</p>
                  <p className="text-[10px] text-slate-500 truncate font-medium">soporte@tierraesperanza.cl</p>
                  <p className="text-[10px] text-slate-400 mt-1">Clave: <span className="font-bold text-slate-600">admin</span></p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer group" onClick={() => {setEmail('luis.martinez@tierraesperanza.cl'); setPassword('luis');}}>
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Tesorero</p>
                  <p className="text-[10px] text-slate-500 truncate font-medium">luis.martinez@tierraesperanza.cl</p>
                  <p className="text-[10px] text-slate-400 mt-1">Clave: <span className="font-bold text-slate-600">luis</span></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
