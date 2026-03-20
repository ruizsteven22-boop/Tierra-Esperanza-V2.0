'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  XCircle,
  MessageSquare,
  History
} from 'lucide-react';

export default function RequestStatusForm({ request }: { request: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [status, setStatus] = useState(request.status);
  const [recordContent, setRecordContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/secretaria/solicitudes/${request.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          recordContent: recordContent.trim() || null 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar la solicitud');
      }

      setSuccess(true);
      setRecordContent('');
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <History className="h-4 w-4 text-emerald-600" />
          Gestión de Estado
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estado Actual</label>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-bold text-slate-700"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Completada">Completada</option>
            <option value="Rechazada">Rechazada</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Agregar Registro / Nota</span>
            <span className="text-[10px] font-medium text-slate-300 italic">Opcional</span>
          </label>
          <textarea 
            value={recordContent}
            onChange={(e) => setRecordContent(e.target.value)}
            rows={3}
            placeholder="Describe el avance o motivo del cambio de estado..."
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none text-sm"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-2 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle className="h-4 w-4" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-xl flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-4 w-4" />
            <p className="font-medium">¡Actualizado correctamente!</p>
          </div>
        )}

        <button 
          disabled={loading}
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </button>
      </form>
    </div>
  );
}
