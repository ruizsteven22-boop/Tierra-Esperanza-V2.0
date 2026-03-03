'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Calendar, Users, FileText, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/AuthProvider';

export default function Directiva() {
  const { canAccess } = useAuth();
  const [directive, setDirective] = useState<any[]>([]);
  const [assemblies, setAssemblies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isNewAssemblyModalOpen, setIsNewAssemblyModalOpen] = useState(false);
  const [newAssembly, setNewAssembly] = useState({
    type: 'Ordinaria', date: '', status: 'Programada'
  });

  const fetchData = () => {
    Promise.all([
      fetch('/api/directive').then(res => res.json()),
      fetch('/api/assemblies').then(res => res.json())
    ]).then(([dirData, assemData]) => {
      setDirective(dirData);
      setAssemblies(assemData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!canAccess('/directiva')) {
      setTimeout(() => setLoading(false), 0);
      return;
    }
    fetchData();
  }, [canAccess]);

  const handleCreateAssembly = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/assemblies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssembly),
      });
      if (res.ok) {
        setIsNewAssemblyModalOpen(false);
        setNewAssembly({ type: 'Ordinaria', date: '', status: 'Programada' });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating assembly:', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Cargando...</div>;

  if (!canAccess('/directiva')) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-full">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Acceso Denegado</h2>
        <p className="text-slate-500 text-center max-w-md">
          No tienes los permisos necesarios para acceder a la directiva.
          Contacta al administrador si crees que esto es un error.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Directiva y Asambleas</h1>
          <p className="text-slate-500 mt-2">Control de mandatos y libro de actas digital.</p>
        </div>
        <button 
          onClick={() => setIsNewAssemblyModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Calendar className="h-4 w-4" />
          Programar Asamblea
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {directive.map((member, index) => (
          <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  {member.role}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">
                      Titular • {format(new Date(member.termStart), 'yyyy')} - {format(new Date(member.termEnd), 'yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xs">
                    {member.substituteName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-700">{member.substituteName}</p>
                    <p className="text-xs text-slate-400">Suplente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            Libro de Actas Digital (Asambleas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {assemblies.length === 0 ? (
              <p className="text-sm text-slate-500">No hay asambleas registradas.</p>
            ) : (
              assemblies.map((assembly) => (
                <div key={assembly.id} className="relative pl-8 sm:pl-32 py-6 group">
                  <div className="font-medium text-sm text-slate-500 mb-1 sm:mb-0 sm:absolute sm:left-0 sm:top-6 sm:w-24 sm:text-right">
                    {format(new Date(assembly.date), "d MMM yyyy", { locale: es })}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-2 sm:before:left-[104px] before:h-full before:px-px before:bg-slate-200 sm:before:ml-[6.5px] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-[104px] after:w-2 after:h-2 after:bg-emerald-600 after:border-4 after:box-content after:border-slate-50 after:rounded-full sm:after:ml-[6.5px] after:-translate-x-1/2 after:translate-y-1.5">
                    <div className="text-xl font-bold text-slate-900">{assembly.type}</div>
                    <span className={`sm:ml-3 mt-1 sm:mt-0 px-2 py-1 rounded-full text-xs font-medium ${
                      assembly.status === 'Realizada' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {assembly.status}
                    </span>
                  </div>
                  <div className="text-slate-600 mt-2">
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span>Asistencia: {assembly.attendance > 0 ? `${assembly.attendance} socios` : 'Por definir'}</span>
                      </div>
                    </div>
                    {assembly.agreements && (
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Acuerdos Tomados
                        </h4>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{assembly.agreements}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* New Assembly Modal */}
      <AnimatePresence>
        {isNewAssemblyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Programar Asamblea</h2>
                <button 
                  onClick={() => setIsNewAssemblyModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCreateAssembly} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Asamblea</label>
                  <select
                    value={newAssembly.type}
                    onChange={(e) => setNewAssembly({...newAssembly, type: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Ordinaria">Ordinaria</option>
                    <option value="Extraordinaria">Extraordinaria</option>
                    <option value="Informativa">Informativa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    required
                    value={newAssembly.date}
                    onChange={(e) => setNewAssembly({...newAssembly, date: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewAssemblyModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Programar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
