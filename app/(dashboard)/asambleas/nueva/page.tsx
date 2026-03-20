'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  MapPin, 
  Save, 
  X, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tag,
  FileText
} from 'lucide-react';
import Link from 'next/link';

export default function NewAssemblyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    type: 'Ordinaria',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const response = await fetch('/api/asambleas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          date: dateTime.toISOString() 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear la asamblea');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/asambleas');
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner animate-bounce">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">¡Asamblea Programada!</h2>
        <p className="text-slate-500">La asamblea ha sido creada y está lista para recibir asistencia.</p>
        <p className="text-xs text-slate-400">Redirigiendo al listado...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/asambleas" 
            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nueva Asamblea</h1>
            <p className="text-slate-500 font-medium">Programa una nueva reunión general de socios</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {/* Assembly Details */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Detalles de la Asamblea
            </h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Título de la Asamblea</label>
              <input 
                required
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                type="text" 
                placeholder="Ej: Asamblea General Ordinaria - Marzo 2026"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Fecha</label>
              <input 
                required
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                type="date" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Hora</label>
              <input 
                required
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                type="time" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Ubicación</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  required
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  type="text" 
                  placeholder="Ej: Sede Social, Calle Principal #123"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tipo de Asamblea</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
              >
                <option value="Ordinaria">Ordinaria</option>
                <option value="Extraordinaria">Extraordinaria</option>
                <option value="Informativa">Informativa</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Descripción / Tabla de Temas</label>
              <textarea 
                required
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe los temas a tratar en la asamblea..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link 
            href="/asambleas"
            className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
          >
            Cancelar
          </Link>
          <button 
            disabled={loading}
            type="submit"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Programando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Programar Asamblea
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
