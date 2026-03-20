'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  XCircle,
  UserPlus,
  Fingerprint
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AttendanceSystemProps {
  assemblyId: number;
}

export default function AttendanceSystem({ assemblyId }: AttendanceSystemProps) {
  const [rut, setRut] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'idle';
    message: string;
    member?: any;
  }>({ type: 'idle', message: '' });
  
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!rut || rut.length < 7) return;

    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const res = await fetch(`/api/asambleas/${assemblyId}/asistencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ 
          type: 'error', 
          message: data.error || 'Error al registrar asistencia' 
        });
      } else {
        setStatus({ 
          type: 'success', 
          message: `Asistencia registrada: ${data.member.name}`,
          member: data.member
        });
        setRut('');
        router.refresh();
        
        // Reset status after 5 seconds
        setTimeout(() => {
          setStatus({ type: 'idle', message: '' });
        }, 5000);
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error de conexión' });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-emerald-50/50 px-8 py-4 border-b border-emerald-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
          <Fingerprint className="h-5 w-5 text-emerald-600" />
          Control de Asistencia (RUT)
        </h2>
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-emerald-100">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Sistema Activo
        </div>
      </div>
      
      <div className="p-8 space-y-8">
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-emerald-500 transition-all" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder="Ingrese RUT del socio (ej: 12.345.678-9)"
              className="block w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl text-2xl font-bold text-slate-900 placeholder:text-slate-300 transition-all outline-none shadow-inner"
              disabled={loading}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !rut}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white py-6 rounded-2xl font-bold text-xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <UserCheck className="h-6 w-6" />
                Registrar Asistencia
              </>
            )}
          </button>
        </form>

        {/* Status Messages */}
        <div className="min-h-[100px] flex items-center justify-center">
          {status.type === 'success' && (
            <div className="w-full bg-emerald-50 border-2 border-emerald-100 p-6 rounded-2xl flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <p className="text-emerald-900 font-bold text-xl">{status.message}</p>
                <p className="text-emerald-600 font-medium">Socio validado correctamente</p>
              </div>
            </div>
          )}

          {status.type === 'error' && (
            <div className="w-full bg-rose-50 border-2 border-rose-100 p-6 rounded-2xl flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="h-16 w-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
                <XCircle className="h-10 w-10" />
              </div>
              <div>
                <p className="text-rose-900 font-bold text-xl">{status.message}</p>
                <p className="text-rose-600 font-medium">Verifique el RUT e intente nuevamente</p>
              </div>
            </div>
          )}

          {status.type === 'idle' && !loading && (
            <div className="text-center space-y-2 opacity-40">
              <AlertCircle className="h-10 w-10 mx-auto text-slate-400" />
              <p className="text-slate-500 font-medium">Esperando ingreso de RUT</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
