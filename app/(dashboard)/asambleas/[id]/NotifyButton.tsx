'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface NotifyButtonProps {
  assemblyId: number;
  isPast: boolean;
}

export default function NotifyButton({ assemblyId, isPast }: NotifyButtonProps) {
  const [notifying, setNotifying] = useState(false);
  const [notifyStatus, setNotifyStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({ type: 'idle', message: '' });

  const handleNotify = async () => {
    setNotifying(true);
    setNotifyStatus({ type: 'idle', message: '' });

    try {
      const res = await fetch(`/api/asambleas/${assemblyId}/notificar`, {
        method: 'POST',
      });

      if (res.ok) {
        setNotifyStatus({ type: 'success', message: 'Notificaciones enviadas correctamente' });
      } else {
        const data = await res.json();
        setNotifyStatus({ type: 'error', message: data.error || 'Error al enviar notificaciones' });
      }
    } catch (error) {
      setNotifyStatus({ type: 'error', message: 'Error de conexión' });
    } finally {
      setNotifying(false);
      setTimeout(() => setNotifyStatus({ type: 'idle', message: '' }), 5000);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button 
        onClick={handleNotify}
        disabled={notifying || isPast}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm"
      >
        {notifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Notificar Socios
      </button>
      
      {notifyStatus.type !== 'idle' && (
        <div className={`fixed bottom-8 right-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-2xl z-50 ${
          notifyStatus.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {notifyStatus.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="font-bold text-sm">{notifyStatus.message}</p>
        </div>
      )}
    </div>
  );
}
