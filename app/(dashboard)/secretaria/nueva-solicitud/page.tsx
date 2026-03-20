'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  User, 
  Search, 
  Save, 
  X, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Certificado de Residencia',
    priority: 'Normal',
  });

  // Search members
  useEffect(() => {
    const searchMembers = async () => {
      if (searchQuery.length < 3) {
        setMembers([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await fetch(`/api/socios?q=${searchQuery}`);
        const data = await response.json();
        setMembers(data);
      } catch (err) {
        console.error('Error searching members:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchMembers, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      setError('Debes seleccionar un socio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/secretaria/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          memberId: selectedMember.id 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear la solicitud');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/secretaria');
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
        <h2 className="text-2xl font-bold text-slate-900">¡Solicitud Registrada!</h2>
        <p className="text-slate-500">La solicitud ha sido creada y asignada al socio.</p>
        <p className="text-xs text-slate-400">Redirigiendo a secretaría...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/secretaria" 
            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nueva Solicitud</h1>
            <p className="text-slate-500 font-medium">Ingresa los detalles del trámite o solicitud</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {/* Member Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Seleccionar Socio
            </h2>
          </div>
          <div className="p-8 space-y-6">
            {!selectedMember ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Escribe el nombre o RUT del socio (mín. 3 caracteres)..." 
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {members.length > 0 && (
                  <div className="bg-white border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50 shadow-lg shadow-slate-200/50">
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMember(m)}
                        className="w-full px-6 py-4 text-left hover:bg-emerald-50 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-emerald-700">{m.name}</p>
                          <p className="text-xs text-slate-400">{m.rut}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-emerald-200 rounded-xl flex items-center justify-center text-emerald-700 font-bold">
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900">{selectedMember.name}</p>
                    <p className="text-xs text-emerald-600 font-medium">{selectedMember.rut}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="p-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Request Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Detalles de la Solicitud
            </h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Título de la Solicitud</label>
              <input 
                required
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                type="text" 
                placeholder="Ej: Solicitud de Certificado de Residencia"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tipo de Trámite</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
              >
                <option value="Certificado de Residencia">Certificado de Residencia</option>
                <option value="Certificado de Socio">Certificado de Socio</option>
                <option value="Carta de Recomendación">Carta de Recomendación</option>
                <option value="Solicitud de Ayuda">Solicitud de Ayuda</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Prioridad</label>
              <select 
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
              >
                <option value="Baja">Baja</option>
                <option value="Normal">Normal</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Descripción / Observaciones</label>
              <textarea 
                required
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe brevemente el motivo de la solicitud..."
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
            href="/secretaria"
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
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Crear Solicitud
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
