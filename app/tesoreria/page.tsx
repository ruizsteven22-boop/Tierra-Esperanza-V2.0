'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowUpRight, ArrowDownRight, DollarSign, FileText, Printer, Download, MessageCircle, Mail, X, ShieldAlert, BarChart3, PieChart as PieChartIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { shareWhatsApp, shareEmail } from '@/lib/share';
import { useAuth } from '@/components/AuthProvider';
import { validateRut, formatRut } from '@/lib/chile-data';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function Tesoreria() {
  const { canAccess } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [newTx, setNewTx] = useState({
    type: 'ingreso', amount: 0, description: '', category: 'Cuotas',
    memberId: '', memberName: '', memberRut: ''
  });

  const fetchData = () => {
    Promise.all([
      fetch('/api/transactions').then(res => res.json()),
      fetch('/api/config').then(res => res.json()),
      fetch('/api/members').then(res => res.json())
    ]).then(([txData, configData, membersData]) => {
      setTransactions(txData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setConfig(configData);
      setMembers(membersData);
      setLoading(false);
    });
  };

  const handleRutLookup = (rutInput: string) => {
    const formatted = formatRut(rutInput);
    const cleanInput = formatted.toLowerCase().replace(/\./g, '').replace(/-/g, '');
    
    const found = members.find(m => m.rut.toLowerCase().replace(/\./g, '').replace(/-/g, '') === cleanInput);
    
    if (found) {
      setNewTx(prev => ({
        ...prev,
        memberRut: formatted,
        memberId: found.id,
        memberName: found.name,
        description: prev.description || `Pago cuota social - ${found.name}`
      }));
    } else {
      setNewTx(prev => ({
        ...prev,
        memberRut: formatted,
        memberId: '',
        memberName: ''
      }));
    }
  };

  useEffect(() => {
    if (!canAccess('/tesoreria')) {
      setTimeout(() => setLoading(false), 0);
      return;
    }
    fetchData();
  }, [canAccess]);

  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx),
      });
      if (res.ok) {
        const createdTx = await res.json();
        setIsNewTxModalOpen(false);
        setNewTx({ 
          type: 'ingreso', amount: 0, description: '', category: 'Cuotas',
          memberId: '', memberName: '', memberRut: ''
        });
        fetchData();
        setSelectedTx(createdTx);
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const income = transactions.filter(t => t.type === 'ingreso').reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'egreso').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expenses;

  // Prepare data for chart
  const chartData = transactions.reduce((acc: any[], t) => {
    const month = format(new Date(t.date), 'MMM yyyy', { locale: es });
    const existing = acc.find(d => d.name === month);
    if (existing) {
      if (t.type === 'ingreso') existing.ingresos += t.amount;
      else existing.egresos += t.amount;
    } else {
      acc.push({
        name: month,
        ingresos: t.type === 'ingreso' ? t.amount : 0,
        egresos: t.type === 'egreso' ? t.amount : 0,
      });
    }
    return acc;
  }, []).reverse();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('print-area');
    if (!element) return;
    
    element.classList.remove('hidden');
    
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a5'); // A5 size for receipts
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Recibo_${selectedTx.id.substring(0, 8)}.pdf`);
  };

  const handleShareWA = () => {
    const socioInfo = selectedTx.memberName ? ` del socio ${selectedTx.memberName}` : '';
    const text = `Hola, te enviamos el comprobante de ${selectedTx.type}${socioInfo} por $${selectedTx.amount.toLocaleString('es-CL')} correspondiente a "${selectedTx.description}" en ${config?.name}. Fecha: ${format(new Date(selectedTx.date), "d MMM yyyy", { locale: es })}`;
    shareWhatsApp(text);
  };

  const handleShareEmail = () => {
    const socioInfo = selectedTx.memberName ? `Socio: ${selectedTx.memberName}\nRUT: ${selectedTx.memberRut}\n` : '';
    const subject = `Comprobante de ${selectedTx.type} - ${config?.name}`;
    const body = `Estimado(a),\n\nAdjunto enviamos el detalle de su transacción.\n\nTipo: ${selectedTx.type}\nMonto: $${selectedTx.amount.toLocaleString('es-CL')}\n${socioInfo}Descripción: ${selectedTx.description}\nFecha: ${format(new Date(selectedTx.date), "d MMM yyyy", { locale: es })}\n\nSaludos cordiales,\nLa Directiva`;
    shareEmail(subject, body);
  };

  const handleDownloadReportPDF = async () => {
    const element = document.getElementById('report-print-area');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Reporte_Mensual_${format(new Date(), 'yyyy-MM')}.pdf`);
  };

  if (loading) return <div className="flex items-center justify-center h-full">Cargando...</div>;

  if (!canAccess('/tesoreria')) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-full">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Acceso Denegado</h2>
        <p className="text-slate-500 text-center max-w-md">
          No tienes los permisos necesarios para acceder a la tesorería.
          Contacta al administrador si crees que esto es un error.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tesorería y Finanzas</h1>
          <p className="text-slate-500 mt-2">Control de flujo de caja y reportes financieros.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Generar Reporte
          </button>
          <button 
            onClick={() => setIsNewTxModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo Movimiento
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 no-print">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Saldo Actual</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">${balance.toLocaleString('es-CL')}</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Ingresos</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">${income.toLocaleString('es-CL')}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Egresos</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${expenses.toLocaleString('es-CL')}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 no-print">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Flujo de Caja Mensual</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number | undefined) => [`$${(value || 0).toLocaleString('es-CL')}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="egresos" name="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Historial de Movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {transactions.length === 0 ? (
                <p className="text-sm text-slate-500">No hay movimientos registrados.</p>
              ) : (
                transactions.map((t) => (
                  <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0 gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${t.type === 'ingreso' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {t.type === 'ingreso' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900">{t.description}</p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(t.date), "d MMM yyyy", { locale: es })} • {t.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:self-center self-end">
                      <div className={`font-semibold text-sm ${t.type === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'ingreso' ? '+' : '-'}${t.amount.toLocaleString('es-CL')}
                      </div>
                      <button 
                        onClick={() => setSelectedTx(t)}
                        className="text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Ver Recibo"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Transaction Modal */}
      <AnimatePresence>
        {isNewTxModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Nuevo Movimiento</h2>
                <button 
                  onClick={() => setIsNewTxModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCreateTx} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Movimiento</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewTx({...newTx, type: 'ingreso'})}
                      className={`py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                        newTx.type === 'ingreso' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 border' : 'bg-slate-50 text-slate-600 border-slate-100 border'
                      }`}
                    >
                      Ingreso
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTx({...newTx, type: 'egreso', memberId: '', memberName: '', memberRut: ''})}
                      className={`py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                        newTx.type === 'egreso' ? 'bg-red-100 text-red-700 border-red-200 border' : 'bg-slate-50 text-slate-600 border-slate-100 border'
                      }`}
                    >
                      Egreso
                    </button>
                  </div>
                </div>

                {newTx.type === 'ingreso' && (
                  <div className="space-y-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div>
                      <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">RUT del Socio</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Ej: 12.345.678-9"
                          value={newTx.memberRut}
                          onChange={(e) => handleRutLookup(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            newTx.memberRut && !validateRut(newTx.memberRut) ? 'border-red-300 focus:ring-red-500' : 'border-emerald-200 focus:ring-emerald-500'
                          } bg-white`}
                        />
                        {newTx.memberRut && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {validateRut(newTx.memberRut) ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {newTx.memberRut && !validateRut(newTx.memberRut) && (
                        <p className="text-[10px] text-red-500 font-bold uppercase mt-1">RUT Inválido</p>
                      )}
                    </div>
                    {newTx.memberName && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">Nombre del Socio</label>
                        <p className="text-sm font-bold text-slate-900">{newTx.memberName}</p>
                      </motion.div>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Monto ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({...newTx, amount: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select
                    value={newTx.category}
                    onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Cuotas">Cuotas</option>
                    <option value="Donación">Donación</option>
                    <option value="Gastos Operativos">Gastos Operativos</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                  <textarea
                    required
                    value={newTx.description}
                    onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px] resize-none"
                    placeholder="Ej: Pago cuota social mes de marzo..."
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewTxModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Registrar Movimiento
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Monthly Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-xl font-bold text-slate-900">Reporte Financiero Mensual</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleDownloadReportPDF}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Exportar PDF
                  </button>
                  <button 
                    onClick={() => setShowReportModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 bg-white" id="report-print-area">
                <div className="text-center mb-8 border-b-2 border-slate-800 pb-6">
                  {config?.logo && (
                    <img src={config.logo} alt="Logo" className="h-16 mx-auto mb-4 object-contain" />
                  )}
                  <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">{config?.name}</h1>
                  <p className="text-sm text-slate-600 mt-1">Reporte Consolidado de Ingresos y Egresos</p>
                  <p className="text-xs text-slate-500 mt-1">Generado el {format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}</p>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Total Ingresos</p>
                    <p className="text-2xl font-bold text-emerald-600">${income.toLocaleString('es-CL')}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <p className="text-xs font-bold text-red-700 uppercase mb-1">Total Egresos</p>
                    <p className="text-2xl font-bold text-red-600">${expenses.toLocaleString('es-CL')}</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-xl text-white">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Saldo Neto</p>
                    <p className="text-2xl font-bold text-white">${balance.toLocaleString('es-CL')}</p>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-4 border-emerald-500 pl-3">Tendencia de Flujo de Caja</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                        <Tooltip formatter={(value: any) => `$${Number(value || 0).toLocaleString('es-CL')}`} />
                        <Legend />
                        <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="egresos" name="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-4 border-blue-500 pl-3">Desglose por Categoría</h3>
                    <div className="space-y-2">
                      {Object.entries(
                        transactions.reduce((acc: any, t) => {
                          acc[t.category] = (acc[t.category] || 0) + (t.type === 'ingreso' ? t.amount : -t.amount);
                          return acc;
                        }, {})
                      ).map(([cat, amt]: [string, any]) => (
                        <div key={cat} className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-sm text-slate-600">{cat}</span>
                          <span className={`text-sm font-bold ${amt >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {amt >= 0 ? '+' : ''}${amt.toLocaleString('es-CL')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                      <p className="text-xs text-slate-500 italic text-center">
                        &quot;Este reporte es un documento informativo generado automáticamente por el sistema de gestión Tierra Esperanza. Para auditorías oficiales, favor contrastar con cartola bancaria.&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 no-print">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Comprobante
              </h2>
              <div className="flex items-center gap-2">
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
                <button onClick={() => setSelectedTx(null)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Preview Area (also used for PDF generation) */}
            <div className="p-8 overflow-y-auto bg-white" id="print-area">
              <div className="text-center mb-6 border-b-2 border-slate-800 pb-4">
                <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">{config?.name}</h1>
                <p className="text-xs text-slate-600 mt-1">RUT: {config?.rut} | {config?.address}</p>
              </div>
              
              <h2 className="text-lg font-bold text-center mb-6 uppercase tracking-widest text-slate-800">
                Recibo de {selectedTx.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
              </h2>

              <div className="space-y-4 text-slate-800 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-500">N° Comprobante:</span>
                  <span className="font-mono">{selectedTx.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-500">Fecha:</span>
                  <span>{format(new Date(selectedTx.date), "d 'de' MMMM 'de' yyyy", { locale: es })}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-500">Categoría:</span>
                  <span>{selectedTx.category}</span>
                </div>
                
                {selectedTx.memberName && (
                  <div className="flex flex-col border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-500">Socio:</span>
                    <span className="font-bold">{selectedTx.memberName}</span>
                    <span className="text-xs text-slate-400">RUT: {selectedTx.memberRut}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-500">Descripción:</span>
                  <span className="text-right max-w-[200px]">{selectedTx.description}</span>
                </div>
                
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-base uppercase">Total:</span>
                  <span className="text-xl font-bold text-slate-900">${selectedTx.amount.toLocaleString('es-CL')}</span>
                </div>

                <div className="mt-12 pt-8">
                  <div className="flex justify-around">
                    <div className="text-center border-t border-slate-800 w-32 pt-2">
                      <p className="font-bold text-xs">Tesorero(a)</p>
                      <p className="text-[10px] text-slate-500">{config?.name}</p>
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
