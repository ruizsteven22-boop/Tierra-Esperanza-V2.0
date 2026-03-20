'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  UserPlus, 
  ShieldCheck, 
  Calendar, 
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const POSITIONS = [
  'Presidente/a',
  'Secretario/a',
  'Tesorero/a',
  'Primer Director/a',
  'Segundo Director/a',
  'Tercer Director/a',
  'Comisión Revisora de Cuentas',
  'Comité de Ética'
];

export default function NewDirectiveMemberPage() {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [formData, setFormData] = useState({
    position: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  
  const router = useRouter();

  // Fetch members for selection
  useEffect(() => {
    if (search.length > 2) {
      const timer = setTimeout(async () => {
        const res = await fetch(`/api/members?q=${search}`);
        const data = await res.json();
        setMembers(data.members || []);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setMembers([]);
    }
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !formData.position) return;

    setLoading(true);
    try {
      const res = await fetch('/api/directiva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMember.id,
          ...formData
        }),
      });

      if (res.ok) {
        router.push('/directiva');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al asignar cargo');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/directiva" 
          className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Asignar Cargo</h1>
          <p className="text-slate-500 font-medium">Registrar nuevo integrante en la directiva</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Member Selection */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Search className="h-5 w-5 text-emerald-600" />
                Seleccionar Socio
              </h2>
            </div>
            <div className="p-8 space-y-6">
              {!selectedMember ? (
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-all" />
                    </div>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar por nombre o RUT..."
                      className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl text-slate-900 font-medium transition-all outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMember(m)}
                        className="w-full p-4 flex items-center justify-between bg-white hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-2xl transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all font-bold">
                            {m.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-slate-900">{m.name}</p>
                            <p className="text-xs text-slate-400">{m.rut}</p>
                          </div>
                        </div>
                        <UserPlus className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-all" />
                      </button>
                    ))}
                    {search.length > 2 && members.length === 0 && (
                      <div className="p-8 text-center text-slate-400 text-sm italic">
                        No se encontraron socios con ese criterio
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-2xl flex items-center justify-between animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 text-xl font-bold">
                      {selectedMember.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-emerald-900 font-bold text-lg">{selectedMember.name}</p>
                      <p className="text-emerald-600 font-medium text-sm">{selectedMember.rut}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 underline"
                  >
                    Cambiar Socio
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Detalles del Cargo
              </h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Cargo / Posición</label>
                <select
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="block w-full px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl text-slate-900 font-medium transition-all outline-none"
                >
                  <option value="">Seleccione un cargo...</option>
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Fecha Inicio</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl text-slate-900 font-medium transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Fecha Término (Opcional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl text-slate-900 font-medium transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Submit */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-8 shadow-xl">
            <h3 className="text-xl font-bold opacity-90">Resumen de Asignación</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cargo</p>
                  <p className="font-bold">{formData.position || 'No seleccionado'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periodo</p>
                  <p className="font-bold">Desde {new Date(formData.startDate).toLocaleDateString('es-CL')}</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedMember || !formData.position}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-900 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Confirmar Asignación
                </>
              )}
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              Al asignar un cargo, el socio tendrá visibilidad en el módulo de directiva y podrá participar en la toma de decisiones oficiales del comité.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
