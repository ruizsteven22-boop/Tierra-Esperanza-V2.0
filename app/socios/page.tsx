'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, UserPlus, Filter, FileText, Printer, Download, MessageCircle, Mail, X, Trash2, Users as UsersIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { shareWhatsApp, shareEmail } from '@/lib/share';
import { useAuth } from '@/components/AuthProvider';
import { REGIONS_CHILE, validateRut, formatRut } from '@/lib/chile-data';
import { AlertCircle, CheckCircle2, Edit2, Save } from 'lucide-react';

export default function Socios() {
  const { role } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [memberTransactions, setMemberTransactions] = useState<any[]>([]);
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '', rut: '', email: '', phone: '', address: '', region: '', commune: '', familyMembers: [] as any[], status: 'Activo'
  });
  const [rutError, setRutError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editMember, setEditMember] = useState<any>(null);

  const relationshipOptions = ['Cónyuge', 'Hijo/a', 'Padre/Madre', 'Hermano/a', 'Otro'];

  const addFamilyMember = () => {
    setNewMember({
      ...newMember,
      familyMembers: [...newMember.familyMembers, { rut: '', name: '', relationship: 'Hijo/a' }]
    });
  };

  const removeFamilyMember = (index: number) => {
    const updated = [...newMember.familyMembers];
    updated.splice(index, 1);
    setNewMember({ ...newMember, familyMembers: updated });
  };

  const updateFamilyMember = (index: number, field: string, value: string) => {
    const updated = [...newMember.familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setNewMember({ ...newMember, familyMembers: updated });
  };
  const itemsPerPage = 10;

  const fetchData = () => {
    Promise.all([
      fetch('/api/members').then(res => res.json()),
      fetch('/api/config').then(res => res.json())
    ]).then(([membersData, configData]) => {
      setMembers(membersData);
      setConfig(configData);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedMember) {
      fetch('/api/transactions')
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter((t: any) => t.memberRut === selectedMember.rut || t.memberId === selectedMember.id);
          setMemberTransactions(filtered.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        });
    }
  }, [selectedMember]);

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>, isFamily = false, index = -1) => {
    const formatted = formatRut(e.target.value);
    
    if (isFamily && index !== -1) {
      const updated = [...newMember.familyMembers];
      updated[index] = { ...updated[index], rut: formatted };
      setNewMember({ ...newMember, familyMembers: updated });
    } else {
      setNewMember({ ...newMember, rut: formatted });
      setRutError(validateRut(formatted) ? '' : 'RUT inválido');
    }
  };

  const handleEditRutChange = (e: React.ChangeEvent<HTMLInputElement>, isFamily = false, index = -1) => {
    const formatted = formatRut(e.target.value);
    if (isFamily && index !== -1) {
      const updated = [...editMember.familyMembers];
      updated[index] = { ...updated[index], rut: formatted };
      setEditMember({ ...editMember, familyMembers: updated });
    } else {
      setEditMember({ ...editMember, rut: formatted });
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRut(newMember.rut)) {
      setRutError('Debe ingresar un RUT válido antes de guardar');
      return;
    }

    // Validate family members RUTs
    for (const fm of newMember.familyMembers) {
      if (fm.rut && !validateRut(fm.rut)) {
        alert(`El RUT del integrante ${fm.name || ''} es inválido`);
        return;
      }
    }

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMember,
          familySize: newMember.familyMembers.length + 1
        }),
      });
      if (res.ok) {
        setIsNewMemberModalOpen(false);
        setNewMember({ name: '', rut: '', email: '', phone: '', address: '', region: '', commune: '', familyMembers: [], status: 'Activo' });
        setRutError('');
        fetchData();
      }
    } catch (error) {
      console.error('Error creating member:', error);
    }
  };

  const handleUpdateMember = async () => {
    if (!validateRut(editMember.rut)) {
      alert('RUT del socio es inválido');
      return;
    }

    // Validate family members RUTs
    if (editMember.familyMembers) {
      for (const fm of editMember.familyMembers) {
        if (fm.rut && !validateRut(fm.rut)) {
          alert(`El RUT del integrante ${fm.name || ''} es inválido`);
          return;
        }
      }
    }

    try {
      const res = await fetch(`/api/members/${editMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editMember),
      });
      if (res.ok) {
        setIsEditing(false);
        setSelectedMember(editMember);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating member:', error);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.rut.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const currentMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('print-area');
    if (!element) return;
    
    // Temporarily remove print styles to render correctly in canvas
    element.classList.remove('hidden');
    
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Ficha_Socio_${selectedMember.rut}.pdf`);
  };

  const handleShareWA = () => {
    const text = `Hola ${selectedMember.name}, te enviamos el resumen de tu ficha de socio en ${config?.name}.\nRUT: ${selectedMember.rut}\nEstado: ${selectedMember.status}\nPor favor, contáctanos si necesitas actualizar algún dato.`;
    shareWhatsApp(text);
  };

  const handleShareEmail = () => {
    const subject = `Ficha de Socio - ${selectedMember.name}`;
    const body = `Hola ${selectedMember.name}, te enviamos el resumen de tu ficha de socio en ${config?.name}.\n\nRUT: ${selectedMember.rut}\nEstado: ${selectedMember.status}\n\nPor favor, contáctanos si necesitas actualizar algún dato.`;
    shareEmail(subject, body);
  };

  const handleDownloadStatementPDF = async () => {
    const element = document.getElementById('statement-print-area');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Estado_Cuenta_${selectedMember.rut}.pdf`);
  };

  const handleExportCSV = () => {
    const headers = ['Nombre', 'RUT', 'Email', 'Teléfono', 'Dirección', 'Comuna', 'Región', 'Integrantes Familia', 'Estado'];
    const csvRows = [
      headers.join(','),
      ...filteredMembers.map(member => [
        `"${member.name}"`,
        `"${member.rut}"`,
        `"${member.email}"`,
        `"${member.phone}"`,
        `"${member.address}"`,
        `"${member.commune}"`,
        `"${member.region}"`,
        member.familySize,
        `"${member.status}"`
      ].join(','))
    ];
    
    const csvContent = "\uFEFF" + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `socios_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const memberBalance = memberTransactions.reduce((acc, t) => acc + (t.type === 'ingreso' ? t.amount : -t.amount), 0);

  if (loading) return <div className="flex items-center justify-center h-full">Cargando...</div>;

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestión de Socios</h1>
          <p className="text-slate-500 mt-2">Administra el censo del comité Tierra Esperanza.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors no-print"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
          {role !== 'Visualizador' && (
            <button 
              onClick={() => setIsNewMemberModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors no-print"
            >
              <UserPlus className="h-4 w-4" />
              Nuevo Socio
            </button>
          )}
        </div>
      </div>

      <Card className="no-print">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o RUT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Suspendido">Suspendido</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">RUT</th>
                  <th className="px-6 py-3">Contacto</th>
                  <th className="px-6 py-3">Dirección</th>
                  <th className="px-6 py-3">Grupo Fam.</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No se encontraron socios que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  currentMembers.map((member) => (
                    <motion.tr 
                      key={member.id} 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                        {member.name}
                      </td>
                      <td className="px-6 py-4">{member.rut}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span>{member.email}</span>
                          <span className="text-xs text-slate-400">{member.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{member.address}</td>
                      <td className="px-6 py-4 text-center">{member.familySize}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' :
                          member.status === 'Suspendido' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedMember(member)}
                          className="text-slate-500 hover:text-emerald-600 font-medium text-sm flex items-center gap-1 ml-auto"
                        >
                          <FileText className="h-4 w-4" />
                          Ficha
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-slate-500">
                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredMembers.length)}</span> de <span className="font-medium">{filteredMembers.length}</span> resultados
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Member Modal */}
      <AnimatePresence>
        {isNewMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Nuevo Socio</h2>
                <button 
                  onClick={() => setIsNewMemberModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCreateMember} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1">RUT</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={newMember.rut}
                      onChange={handleRutChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        rutError ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'
                      }`}
                      placeholder="12.345.678-9"
                    />
                    {newMember.rut && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {rutError ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {rutError && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase">{rutError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    required
                    value={newMember.phone}
                    onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Región</label>
                    <select
                      required
                      value={newMember.region}
                      onChange={(e) => setNewMember({...newMember, region: e.target.value, commune: ''})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="">Seleccione Región</option>
                      {REGIONS_CHILE.map(r => (
                        <option key={r.name} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Comuna</label>
                    <select
                      required
                      disabled={!newMember.region}
                      value={newMember.commune}
                      onChange={(e) => setNewMember({...newMember, commune: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">Seleccione Comuna</option>
                      {REGIONS_CHILE.find(r => r.name === newMember.region)?.communes.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    required
                    value={newMember.address}
                    onChange={(e) => setNewMember({...newMember, address: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Calle, número, depto/casa"
                  />
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-emerald-600" />
                      Grupo Familiar
                    </h3>
                    <button
                      type="button"
                      onClick={addFamilyMember}
                      className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Añadir Integrante
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {newMember.familyMembers.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-2 italic">No hay integrantes registrados.</p>
                    ) : (
                      newMember.familyMembers.map((member, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => removeFamilyMember(index)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">RUT</label>
                              <input
                                type="text"
                                required
                                value={member.rut}
                                onChange={(e) => handleRutChange(e, true, index)}
                                className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                                  member.rut && !validateRut(member.rut) ? 'border-red-300 bg-red-50' : 'border-slate-200'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Parentesco</label>
                              <select
                                value={member.relationship}
                                onChange={(e) => updateFamilyMember(index, 'relationship', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                              >
                                {relationshipOptions.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nombres y Apellidos</label>
                            <input
                              type="text"
                              required
                              value={member.name}
                              onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewMemberModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Guardar Socio
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Member Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 no-print">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Ficha de Socio
                </h2>
                <div className="h-4 w-px bg-slate-300"></div>
                <button 
                  onClick={() => {
                    const el = document.getElementById('statement-view');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
                >
                  Ver Estado de Cuenta
                </button>
              </div>
              <div className="flex items-center gap-2">
                {role !== 'Visualizador' && (
                  <button 
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setEditMember(selectedMember);
                    }} 
                    className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}`}
                    title={isEditing ? "Cancelar Edición" : "Editar Socio"}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
                {isEditing && (
                  <button 
                    onClick={handleUpdateMember}
                    className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                    title="Guardar Cambios"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                )}
                <button onClick={handlePrint} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors" title="Imprimir">
                  <Printer className="h-4 w-4" />
                </button>
                <button onClick={handleDownloadPDF} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors" title="Descargar PDF">
                  <Download className="h-4 w-4" />
                </button>
                <button onClick={handleShareWA} className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors" title="Enviar por WhatsApp">
                  <MessageCircle className="h-4 w-4" />
                </button>
                <button onClick={handleShareEmail} className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors" title="Enviar por Correo">
                  <Mail className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <button onClick={() => {
                  setSelectedMember(null);
                  setMemberTransactions([]);
                  setIsEditing(false);
                }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Preview Area (also used for PDF generation) */}
            <div className="p-8 overflow-y-auto bg-white" id="print-area">
              <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
                {config?.logo && (
                  <Image src={config.logo} alt="Logo" width={64} height={64} className="h-16 mx-auto mb-4 object-contain" referrerPolicy="no-referrer" />
                )}
                <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">{config?.name}</h1>
                <p className="text-sm text-slate-600 mt-1">RUT: {config?.rut} | {config?.address}</p>
                <p className="text-sm text-slate-600">{config?.email} | {config?.phone}</p>
              </div>
              
              <h2 className="text-xl font-bold text-center mb-6 uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-2 inline-block mx-auto">
                Ficha de Registro de Socio
              </h2>

              <div className="space-y-6 text-slate-800">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editMember.name} 
                        onChange={(e) => setEditMember({...editMember, name: e.target.value})}
                        className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500"
                      />
                    ) : (
                      <p className="font-medium">{selectedMember.name}</p>
                    )}
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">RUT</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editMember.rut} 
                        onChange={handleEditRutChange}
                        className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500"
                      />
                    ) : (
                      <p className="font-medium">{selectedMember.rut}</p>
                    )}
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editMember.phone} 
                        onChange={(e) => setEditMember({...editMember, phone: e.target.value})}
                        className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500"
                      />
                    ) : (
                      <p className="font-medium">{selectedMember.phone}</p>
                    )}
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</p>
                    {isEditing ? (
                      <input 
                        type="email" 
                        value={editMember.email} 
                        onChange={(e) => setEditMember({...editMember, email: e.target.value})}
                        className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500"
                      />
                    ) : (
                      <p className="font-medium">{selectedMember.email}</p>
                    )}
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-100 col-span-2">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Dirección</p>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={editMember.region}
                            onChange={(e) => setEditMember({...editMember, region: e.target.value, commune: ''})}
                            className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
                          >
                            <option value="">Región</option>
                            {REGIONS_CHILE.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                          </select>
                          <select
                            value={editMember.commune}
                            onChange={(e) => setEditMember({...editMember, commune: e.target.value})}
                            className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
                          >
                            <option value="">Comuna</option>
                            {REGIONS_CHILE.find(r => r.name === editMember.region)?.communes.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <input 
                          type="text" 
                          value={editMember.address} 
                          onChange={(e) => setEditMember({...editMember, address: e.target.value})}
                          className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    ) : (
                      <p className="font-medium">{selectedMember.address}, {selectedMember.commune}, {selectedMember.region}</p>
                    )}
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Grupo Familiar</p>
                    <p className="font-medium">{selectedMember.familySize} personas</p>
                  </div>
                  
                  {selectedMember.familyMembers && selectedMember.familyMembers.length > 0 && (
                    <div className="col-span-2 mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold text-slate-500 uppercase">Detalle Grupo Familiar</p>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...(editMember.familyMembers || [])];
                              updated.push({ rut: '', name: '', relationship: 'Hijo/a' });
                              setEditMember({ ...editMember, familyMembers: updated });
                            }}
                            className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded hover:bg-emerald-100 transition-colors flex items-center gap-1 font-bold uppercase"
                          >
                            <Plus className="h-3 w-3" />
                            Añadir Integrante
                          </button>
                        )}
                      </div>
                      <div className="overflow-hidden border border-slate-200 rounded-lg">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-700 uppercase font-bold">
                            <tr>
                              <th className="px-4 py-2">Nombre</th>
                              <th className="px-4 py-2">RUT</th>
                              <th className="px-4 py-2">Parentesco</th>
                              {isEditing && <th className="px-4 py-2 w-10"></th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(isEditing ? editMember.familyMembers : selectedMember.familyMembers).map((fm: any, idx: number) => (
                              <tr key={idx} className="bg-white">
                                <td className="px-4 py-2">
                                  {isEditing ? (
                                    <input 
                                      type="text" 
                                      value={fm.name} 
                                      onChange={(e) => {
                                        const updated = [...editMember.familyMembers];
                                        updated[idx] = { ...updated[idx], name: e.target.value };
                                        setEditMember({ ...editMember, familyMembers: updated });
                                      }}
                                      className="w-full px-2 py-1 border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500"
                                    />
                                  ) : (
                                    <span className="font-medium">{fm.name}</span>
                                  )}
                                </td>
                                <td className="px-4 py-2">
                                  {isEditing ? (
                                    <input 
                                      type="text" 
                                      value={fm.rut} 
                                      onChange={(e) => handleEditRutChange(e, true, idx)}
                                      className={`w-full px-2 py-1 border rounded focus:ring-1 focus:ring-emerald-500 ${
                                        fm.rut && !validateRut(fm.rut) ? 'border-red-300 bg-red-50' : 'border-slate-200'
                                      }`}
                                    />
                                  ) : (
                                    <span>{fm.rut}</span>
                                  )}
                                </td>
                                <td className="px-4 py-2">
                                  {isEditing ? (
                                    <select
                                      value={fm.relationship}
                                      onChange={(e) => {
                                        const updated = [...editMember.familyMembers];
                                        updated[idx] = { ...updated[idx], relationship: e.target.value };
                                        setEditMember({ ...editMember, familyMembers: updated });
                                      }}
                                      className="w-full px-2 py-1 border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
                                    >
                                      {relationshipOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                  ) : (
                                    <span>{fm.relationship}</span>
                                  )}
                                </td>
                                {isEditing && (
                                  <td className="px-4 py-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...editMember.familyMembers];
                                        updated.splice(idx, 1);
                                        setEditMember({ ...editMember, familyMembers: updated });
                                      }}
                                      className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  <div className="bg-slate-50 p-3 rounded border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Fecha de Ingreso</p>
                    <p className="font-medium">{format(new Date(selectedMember.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200">
                  <p className="text-sm text-justify text-slate-600 mb-16">
                    Por la presente, declaro que los datos entregados son fidedignos y me comprometo a respetar los estatutos y reglamentos del {config?.name}, así como a mantener al día mis cuotas sociales y participar activamente en las asambleas convocadas.
                  </p>
                  
                  <div className="flex justify-around mt-8">
                    <div className="text-center border-t border-slate-800 w-48 pt-2">
                      <p className="font-bold text-sm">Firma del Socio</p>
                      <p className="text-xs text-slate-500">{selectedMember.rut}</p>
                    </div>
                    <div className="text-center border-t border-slate-800 w-48 pt-2">
                      <p className="font-bold text-sm">Presidente(a)</p>
                      <p className="text-xs text-slate-500">{config?.name}</p>
                    </div>
                  </div>
                </div>

                {/* Account Statement Section */}
                <div className="mt-16 pt-16 border-t-4 border-double border-slate-200" id="statement-view">
                  <div id="statement-print-area" className="bg-white p-4">
                    {config?.logo && (
                      <div className="text-center mb-6">
                        <Image src={config.logo} alt="Logo" width={64} height={64} className="h-16 mx-auto object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 uppercase">Estado de Cuenta Individual</h3>
                        <p className="text-sm text-slate-500">Socio: {selectedMember.name}</p>
                        <p className="text-sm text-slate-500">RUT: {selectedMember.rut}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase">Saldo Actual</p>
                        <p className={`text-2xl font-black ${memberBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          ${memberBalance.toLocaleString('es-CL')}
                        </p>
                      </div>
                    </div>

                    <div className="overflow-hidden border border-slate-200 rounded-xl">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-xs">
                          <tr>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Descripción</th>
                            <th className="px-4 py-3">Categoría</th>
                            <th className="px-4 py-3 text-right">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {memberTransactions.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No se registran movimientos para este socio.</td>
                            </tr>
                          ) : (
                            memberTransactions.map((t, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap">{format(new Date(t.date), "dd/MM/yyyy")}</td>
                                <td className="px-4 py-3">{t.description}</td>
                                <td className="px-4 py-3">
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                                    {t.category}
                                  </span>
                                </td>
                                <td className={`px-4 py-3 text-right font-bold ${t.type === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {t.type === 'ingreso' ? '+' : '-'}${t.amount.toLocaleString('es-CL')}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white font-bold">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-right uppercase tracking-wider">Saldo Final Acumulado</td>
                            <td className="px-4 py-3 text-right text-lg">${memberBalance.toLocaleString('es-CL')}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    
                    <div className="mt-8 flex justify-between items-center no-print">
                      <p className="text-xs text-slate-400 italic">Este documento es un extracto de cuenta para fines informativos.</p>
                      <button 
                        onClick={handleDownloadStatementPDF}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Descargar Estado de Cuenta
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
