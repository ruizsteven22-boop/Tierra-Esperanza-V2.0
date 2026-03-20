'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  UserPlus, 
  Shield, 
  Mail, 
  Lock, 
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewUserPage() {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({ type: 'idle', message: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleId: '',
  });
  
  const router = useRouter();

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      const res = await fetch('/api/roles');
      const data = await res.json();
      setRoles(data || []);
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus({ type: 'success', message: 'Usuario creado correctamente' });
        setTimeout(() => {
          router.push('/usuarios');
          router.refresh();
        }, 1500);
      } else {
        const data = await res.json();
        setStatus({ type: 'error', message: data.error || 'Error al crear usuario' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/usuarios" 
          className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nuevo Usuario</h1>
          <p className="text-slate-500 font-medium">Crear acceso administrativo al sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Datos del Usuario
            </h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl text-slate-900 font-medium transition-all outline-none"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl text-slate-900 font-medium transition-all outline-none"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Rol / Permisos</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    required
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl text-slate-900 font-medium transition-all outline-none"
                  >
                    <option value="">Seleccione un rol...</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl text-slate-900 font-medium transition-all outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {status.type !== 'idle' && (
          <div className={`p-6 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in-95 duration-300 ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
            <p className="font-bold">{status.message}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link 
            href="/usuarios"
            className="px-10 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white transition-all"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5" />
                Crear Usuario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
