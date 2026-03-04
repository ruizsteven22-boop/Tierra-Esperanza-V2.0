'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Calendar, Users, FileText, CheckCircle2, ShieldAlert, X, MapPin, Edit2, Trash2, MessageCircle, Mail, Share2, MoreVertical, Bell, Printer, Download, UserCheck, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/AuthProvider';
import ConfirmationModal from '@/components/ConfirmationModal';
import { validateRut, formatRut } from '@/lib/chile-data';

export default function Directiva() {
  const { canAccess } = useAuth();
  const [directive, setDirective] = useState<any[]>([]);
  const [assemblies, setAssemblies] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isNewAssemblyModalOpen, setIsNewAssemblyModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedAssembly, setSelectedAssembly] = useState<any>(null);
  const [isNominaModalOpen, setIsNominaModalOpen] = useState(false);
  const [selectedMemberForCarnet, setSelectedMemberForCarnet] = useState<any>(null);
  const [isEditDirectiveModalOpen, setIsEditDirectiveModalOpen] = useState(false);
  const [selectedDirectiveMember, setSelectedDirectiveMember] = useState<any>(null);
  const [directiveRutError, setDirectiveRutError] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');

  const [newAssembly, setNewAssembly] = useState({
    type: 'Ordinaria', date: '', status: 'Programada', location: '', agreements: '', attendance: 0
  });

  const fetchData = () => {
    Promise.all([
      fetch('/api/directive').then(res => res.json()),
      fetch('/api/assemblies').then(res => res.json()),
      fetch('/api/config').then(res => res.json()),
      fetch('/api/members').then(res => res.json())
    ]).then(([dirData, assemData, configData, membersData]) => {
      setDirective(dirData);
      setAssemblies(assemData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setConfig(configData);
      setMembers(membersData);
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
        setNewAssembly({ type: 'Ordinaria', date: '', status: 'Programada', location: '', agreements: '', attendance: 0 });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating assembly:', error);
    }
  };

  const handleUpdateAssembly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssembly) return;
    try {
      const res = await fetch(`/api/assemblies/${selectedAssembly.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedAssembly),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setSelectedAssembly(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating assembly:', error);
    }
  };

  const handleCancelAssembly = async () => {
    if (!selectedAssembly) return;
    try {
      const res = await fetch(`/api/assemblies/${selectedAssembly.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Anulada' }),
      });
      if (res.ok) {
        setIsCancelModalOpen(false);
        setSelectedAssembly(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error canceling assembly:', error);
    }
  };

  const handleToggleAttendance = async (rut: string) => {
    if (!selectedAssembly) return;
    
    const currentRuts = selectedAssembly.attendanceRuts || [];
    const newRuts = currentRuts.includes(rut)
      ? currentRuts.filter((r: string) => r !== rut)
      : [...currentRuts, rut];
    
    const updatedAssembly = {
      ...selectedAssembly,
      attendanceRuts: newRuts,
      attendance: newRuts.length
    };

    setSelectedAssembly(updatedAssembly);

    try {
      await fetch(`/api/assemblies/${selectedAssembly.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          attendanceRuts: newRuts,
          attendance: newRuts.length
        }),
      });
      fetchData();
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const handleUpdateDirectiveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDirectiveMember) return;
    
    if (!validateRut(selectedDirectiveMember.rut) || !validateRut(selectedDirectiveMember.substituteRut)) {
      setDirectiveRutError('RUT inválido');
      return;
    }

    try {
      const res = await fetch(`/api/directive/${selectedDirectiveMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedDirectiveMember),
      });
      if (res.ok) {
        setIsEditDirectiveModalOpen(false);
        setSelectedDirectiveMember(null);
        setDirectiveRutError('');
        fetchData();
      }
    } catch (error) {
      console.error('Error updating directive member:', error);
    }
  };

  const notifyWhatsApp = (assembly: any) => {
    const dateStr = format(new Date(assembly.date), "eeee d 'de' MMMM 'a las' HH:mm", { locale: es });
    const text = `📢 *CONVOCATORIA ASAMBLEA*\n\nHola, el *${config?.name || 'Comité'}* te informa que se ha programado una *Asamblea ${assembly.type}*.\n\n📅 *Fecha:* ${dateStr}\n📍 *Lugar:* ${assembly.location || 'Sede Social'}\n\n¡Tu participación es muy importante! Te esperamos.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const notifyEmail = (assembly: any) => {
    const dateStr = format(new Date(assembly.date), "eeee d 'de' MMMM 'a las' HH:mm", { locale: es });
    const subject = `Convocatoria Asamblea ${assembly.type} - ${config?.name || 'Comité'}`;
    const body = `Estimado socio,\n\nLe informamos que se ha programado una Asamblea ${assembly.type} para el día ${dateStr} en ${assembly.location || 'la Sede Social'}.\n\n¡Su participación es fundamental para el desarrollo de nuestra comunidad!\n\nAtentamente,\nDirectiva ${config?.name || 'del Comité'}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handlePrint = () => {
    window.print();
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
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsNominaModalOpen(true)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <FileText className="h-4 w-4" />
            Nómina Directiva
          </button>
          <button 
            onClick={() => setIsNewAssemblyModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Calendar className="h-4 w-4" />
            Programar Asamblea
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {directive.map((member, index) => (
          <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="border-l-4 border-l-emerald-500 group relative">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  {member.role}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      setSelectedDirectiveMember(member);
                      setIsEditDirectiveModalOpen(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    title="Editar Miembro"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setSelectedMemberForCarnet(member)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    title="Ver Carnet"
                  >
                    < Printer className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{member.rut}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
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
                    <p className="text-[10px] text-slate-500 font-mono">{member.substituteRut}</p>
                    <p className="text-[10px] text-slate-400">Suplente</p>
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
                      assembly.status === 'Realizada' ? 'bg-emerald-100 text-emerald-700' : 
                      assembly.status === 'Anulada' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {assembly.status}
                    </span>
                    
                    <div className="sm:ml-auto flex items-center gap-1 mt-2 sm:mt-0">
                      {assembly.status !== 'Anulada' && (
                        <>
                          <button 
                            onClick={() => {
                              setSelectedAssembly(assembly);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedAssembly(assembly);
                              setIsCancelModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Anular"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedAssembly(assembly);
                              setIsAttendanceModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Registrar Asistencia"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                          <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block"></div>
                          <button 
                            onClick={() => notifyWhatsApp(assembly)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Notificar por WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => notifyEmail(assembly)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Notificar por Email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-slate-600 mt-2">
                    <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span>Asistencia: {assembly.attendance > 0 ? `${assembly.attendance} socios` : 'Por definir'}</span>
                      </div>
                      {assembly.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>Lugar: {assembly.location}</span>
                        </div>
                      )}
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dirección / Sede</label>
                  <input
                    type="text"
                    placeholder="Ej: Sede Social, Calle Principal #123"
                    value={newAssembly.location}
                    onChange={(e) => setNewAssembly({...newAssembly, location: e.target.value})}
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

      {/* Edit Assembly Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedAssembly && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Editar Asamblea</h2>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateAssembly} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Asamblea</label>
                  <select
                    value={selectedAssembly.type}
                    onChange={(e) => setSelectedAssembly({...selectedAssembly, type: e.target.value})}
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
                    value={selectedAssembly.date}
                    onChange={(e) => setSelectedAssembly({...selectedAssembly, date: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select
                    value={selectedAssembly.status}
                    onChange={(e) => setSelectedAssembly({...selectedAssembly, status: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Programada">Programada</option>
                    <option value="Realizada">Realizada</option>
                    <option value="Anulada">Anulada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dirección / Sede</label>
                  <input
                    type="text"
                    value={selectedAssembly.location}
                    onChange={(e) => setSelectedAssembly({...selectedAssembly, location: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Asistencia (Socios)</label>
                  <input
                    type="number"
                    value={selectedAssembly.attendance}
                    onChange={(e) => setSelectedAssembly({...selectedAssembly, attendance: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Acuerdos Tomados</label>
                  <textarea
                    value={selectedAssembly.agreements}
                    onChange={(e) => setSelectedAssembly({...selectedAssembly, agreements: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelAssembly}
        title="Anular Asamblea"
        message="¿Estás seguro de que deseas anular esta asamblea? Esta acción marcará la asamblea como anulada y no se podrá revertir fácilmente."
        confirmText="Anular Asamblea"
      />

      {/* Attendance Modal */}
      <AnimatePresence>
        {isAttendanceModalOpen && selectedAssembly && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Registro de Asistencia</h2>
                  <p className="text-sm text-slate-500">Asamblea {selectedAssembly.type} • {format(new Date(selectedAssembly.date), "d 'de' MMMM, yyyy", { locale: es })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir Formato
                  </button>
                  <button 
                    onClick={() => setIsAttendanceModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Member Selection */}
                <div className="flex-1 p-6 border-r border-slate-100 flex flex-col overflow-hidden">
                  <div className="relative mb-4">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar socio por nombre o RUT..."
                      value={attendanceSearch}
                      onChange={(e) => setAttendanceSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {members
                      .filter(m => 
                        m.name.toLowerCase().includes(attendanceSearch.toLowerCase()) || 
                        m.rut.includes(attendanceSearch)
                      )
                      .map((member) => {
                        const isPresent = selectedAssembly.attendanceRuts?.includes(member.rut);
                        return (
                          <div 
                            key={member.id}
                            onClick={() => handleToggleAttendance(member.rut)}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                              isPresent 
                                ? 'bg-emerald-50 border-emerald-200' 
                                : 'bg-white border-slate-100 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                isPresent ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <p className={`text-sm font-bold ${isPresent ? 'text-emerald-900' : 'text-slate-900'}`}>{member.name}</p>
                                <p className="text-xs text-slate-500 font-mono">{member.rut}</p>
                              </div>
                            </div>
                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isPresent ? 'bg-emerald-600 border-emerald-600' : 'border-slate-200'
                            }`}>
                              {isPresent && <UserCheck className="h-3 w-3 text-white" />}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Summary & Printable Preview */}
                <div className="w-full md:w-80 bg-slate-50 p-6 overflow-y-auto">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Resumen
                  </h3>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Presentes</p>
                      <p className="text-3xl font-bold text-slate-900">{selectedAssembly.attendance || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Socios</p>
                      <p className="text-xl font-bold text-slate-700">{members.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Quórum</p>
                      <p className="text-xl font-bold text-emerald-600">
                        {Math.round(((selectedAssembly.attendance || 0) / members.length) * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      <strong>Nota:</strong> Al marcar a un socio, se actualiza automáticamente el acta digital de la asamblea.
                    </p>
                  </div>
                </div>
              </div>

              {/* Printable Attendance List (Hidden in UI) */}
              <div className="hidden print:block p-8 bg-white" id="printable-attendance">
                <div className="text-center mb-8">
                  <h1 className="text-xl font-bold text-slate-900 uppercase">{config?.name}</h1>
                  <p className="text-sm text-slate-500">LISTA DE ASISTENCIA A ASAMBLEA</p>
                  <div className="flex justify-center gap-8 mt-4 text-xs font-bold uppercase text-slate-700">
                    <span>TIPO: {selectedAssembly.type}</span>
                    <span>FECHA: {format(new Date(selectedAssembly.date), "dd/MM/yyyy")}</span>
                    <span>LUGAR: {selectedAssembly.location || 'SEDE SOCIAL'}</span>
                  </div>
                </div>

                <table className="w-full border-collapse border border-slate-300 text-xs">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-300 px-3 py-2 w-10 text-center">N°</th>
                      <th className="border border-slate-300 px-3 py-2 text-left">APELLIDOS Y NOMBRES</th>
                      <th className="border border-slate-300 px-3 py-2 w-32 text-center">RUT</th>
                      <th className="border border-slate-300 px-3 py-2 w-48 text-center">FIRMA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* First show present members */}
                    {members
                      .filter(m => selectedAssembly.attendanceRuts?.includes(m.rut))
                      .map((member, idx) => (
                        <tr key={member.id}>
                          <td className="border border-slate-300 px-3 py-4 text-center">{idx + 1}</td>
                          <td className="border border-slate-300 px-3 py-4 font-bold uppercase">{member.name}</td>
                          <td className="border border-slate-300 px-3 py-4 text-center font-mono">{member.rut}</td>
                          <td className="border border-slate-300 px-3 py-4"></td>
                        </tr>
                      ))}
                    {/* Then show empty rows for manual filling if needed, or just the rest of the members */}
                    {members
                      .filter(m => !selectedAssembly.attendanceRuts?.includes(m.rut))
                      .map((member, idx) => (
                        <tr key={member.id} className="opacity-40">
                          <td className="border border-slate-300 px-3 py-4 text-center">{selectedAssembly.attendance + idx + 1}</td>
                          <td className="border border-slate-300 px-3 py-4 uppercase">{member.name}</td>
                          <td className="border border-slate-300 px-3 py-4 text-center font-mono">{member.rut}</td>
                          <td className="border border-slate-300 px-3 py-4"></td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                <div className="mt-12 flex justify-between px-12 pt-12">
                  <div className="text-center">
                    <div className="w-48 h-px bg-slate-400 mb-2"></div>
                    <p className="text-[10px] font-bold uppercase">Secretario(a)</p>
                  </div>
                  <div className="text-center">
                    <div className="w-48 h-px bg-slate-400 mb-2"></div>
                    <p className="text-[10px] font-bold uppercase">Presidente(a)</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Nomina de Directiva Modal */}
      <AnimatePresence>
        {isNominaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Nómina de Directiva</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePrint}
                    className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Imprimir"
                  >
                    <Printer className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setIsNominaModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-8 overflow-y-auto bg-white" id="printable-nomina">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{config?.name}</h1>
                  <p className="text-sm text-slate-500 mt-1">RUT: {config?.rut} • {config?.address}</p>
                  <div className="h-1 w-24 bg-emerald-600 mx-auto mt-4"></div>
                  <h2 className="text-lg font-bold text-slate-700 mt-6 uppercase">Certificado de Composición de Directiva</h2>
                </div>

                <div className="space-y-6">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Por el presente documento se certifica que la Directiva del <strong>{config?.name}</strong>, para el periodo comprendido entre el <strong>{directive[0] ? format(new Date(directive[0].termStart), "dd 'de' MMMM 'de' yyyy", { locale: es }) : ''}</strong> y el <strong>{directive[0] ? format(new Date(directive[0].termEnd), "dd 'de' MMMM 'de' yyyy", { locale: es }) : ''}</strong>, está compuesta por los siguientes miembros:
                  </p>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Cargo</th>
                          <th className="px-4 py-3">Titular</th>
                          <th className="px-4 py-3">RUT</th>
                          <th className="px-4 py-3">Suplente</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {directive.map((member) => (
                          <tr key={member.id}>
                            <td className="px-4 py-3 font-bold text-slate-900">{member.role}</td>
                            <td className="px-4 py-3 text-slate-700">{member.name}</td>
                            <td className="px-4 py-3 font-mono text-xs">{member.rut}</td>
                            <td className="px-4 py-3 text-slate-500">{member.substituteName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-12 grid grid-cols-2 gap-8 text-center pt-12">
                    <div className="space-y-1">
                      <div className="h-px w-48 bg-slate-300 mx-auto mb-4"></div>
                      <p className="text-xs font-bold text-slate-900 uppercase">{config?.president}</p>
                      <p className="text-[10px] text-slate-500 uppercase">Presidente</p>
                    </div>
                    <div className="space-y-1">
                      <div className="h-px w-48 bg-slate-300 mx-auto mb-4"></div>
                      <p className="text-xs font-bold text-slate-900 uppercase">Secretario(a)</p>
                      <p className="text-[10px] text-slate-500 uppercase">Ministro de Fe</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                    Documento generado el {format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Carnet Modal */}
      <AnimatePresence>
        {selectedMemberForCarnet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Credencial de Directiva</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePrint}
                    className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Imprimir"
                  >
                    <Printer className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setSelectedMemberForCarnet(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-8 flex justify-center bg-slate-50">
                <div className="w-[340px] h-[210px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 relative flex flex-col" id="printable-carnet">
                  {/* Header */}
                  <div className="bg-emerald-600 p-3 flex items-center gap-3">
                    <div className="bg-white p-1 rounded-lg">
                      <Building2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-white uppercase leading-tight">{config?.name}</h3>
                      <p className="text-[8px] text-emerald-100 uppercase tracking-widest">Credencial de Directiva</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 p-4 flex gap-4">
                    <div className="w-24 h-24 bg-slate-100 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-300">
                      <Users className="h-12 w-12" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Nombre Completo</p>
                        <p className="text-xs font-bold text-slate-900 leading-tight">{selectedMemberForCarnet.name}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">RUT</p>
                        <p className="text-xs font-mono text-slate-700">{selectedMemberForCarnet.rut}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Cargo</p>
                        <p className="text-xs font-bold text-emerald-600 uppercase">{selectedMemberForCarnet.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-slate-900 p-2 px-4 flex justify-between items-center">
                    <div className="text-[8px] text-slate-400">
                      Vigencia: {format(new Date(selectedMemberForCarnet.termEnd), 'MM/yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3 text-emerald-500" />
                      <span className="text-[8px] font-bold text-white uppercase">Titular</span>
                    </div>
                  </div>

                  {/* Watermark */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                    <Building2 className="w-48 h-48" />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white border-t border-slate-100">
                <p className="text-xs text-slate-500 text-center italic">
                  Esta credencial acredita la calidad de dirigente del comité ante autoridades y socios.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Directive Member Modal */}
      <AnimatePresence>
        {isEditDirectiveModalOpen && selectedDirectiveMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Editar {selectedDirectiveMember.role}</h2>
                <button 
                  onClick={() => setIsEditDirectiveModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateDirectiveMember} className="p-6 space-y-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Titular</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={selectedDirectiveMember.name}
                      onChange={(e) => setSelectedDirectiveMember({...selectedDirectiveMember, name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">RUT</label>
                    <input
                      type="text"
                      required
                      value={selectedDirectiveMember.rut}
                      onChange={(e) => {
                        const formatted = formatRut(e.target.value);
                        setSelectedDirectiveMember({...selectedDirectiveMember, rut: formatted});
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        selectedDirectiveMember.rut && !validateRut(selectedDirectiveMember.rut) ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Suplente</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={selectedDirectiveMember.substituteName}
                      onChange={(e) => setSelectedDirectiveMember({...selectedDirectiveMember, substituteName: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">RUT</label>
                    <input
                      type="text"
                      required
                      value={selectedDirectiveMember.substituteRut}
                      onChange={(e) => {
                        const formatted = formatRut(e.target.value);
                        setSelectedDirectiveMember({...selectedDirectiveMember, substituteRut: formatted});
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        selectedDirectiveMember.substituteRut && !validateRut(selectedDirectiveMember.substituteRut) ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                {directiveRutError && (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {directiveRutError}
                  </p>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditDirectiveModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Guardar Cambios
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
