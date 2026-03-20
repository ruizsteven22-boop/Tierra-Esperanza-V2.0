'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  User, 
  Search, 
  Save, 
  X, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Tag,
  FileText
} from 'lucide-react';
import Link from 'next/link';

export default function NewTransactionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const [formData, setFormData] = useState({
    type: 'Ingreso',
    categoryId: '',
    amount: '',
    description: '',
    paymentMethod: 'Efectivo',
    generateReceipt: true,
  });

  // Fetch categories based on type
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await fetch(`/api/tesoreria/categorias?type=${formData.type}`);
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [formData.type]);

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
    const { name, value, type, checked } = e.target as any;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tesoreria/transacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          amount: parseFloat(formData.amount),
          memberId: selectedMember?.id || null 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear la transacción');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/tesoreria');
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
        <h2 className="text-2xl font-bold text-slate-900">¡Transacción Registrada!</h2>
        <p className="text-slate-500">La transacción ha sido procesada y el recibo generado.</p>
        <p className="text-xs text-slate-400">Redirigiendo a tesorería...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/tesoreria" 
            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nueva Transacción</h1>
            <p className="text-slate-500 font-medium">Registra un nuevo ingreso o egreso de fondos</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {/* Transaction Type Selector */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, type: 'Ingreso' }))}
            className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
              formData.type === 'Ingreso' 
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-100' 
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
            }`}
          >
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
              formData.type === 'Ingreso' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="font-bold uppercase tracking-widest text-sm">Ingreso</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, type: 'Egreso' }))}
            className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
              formData.type === 'Egreso' 
                ? 'bg-red-50 border-red-500 text-red-700 shadow-lg shadow-red-100' 
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
            }`}
          >
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
              formData.type === 'Egreso' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              <TrendingDown className="h-6 w-6" />
            </div>
            <span className="font-bold uppercase tracking-widest text-sm">Egreso</span>
          </button>
        </div>

        {/* Member Selection (Optional for expenses, recommended for income) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Socio Relacionado <span className="text-xs font-normal text-slate-400 italic">(Opcional)</span>
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
                    placeholder="Escribe el nombre o RUT del socio..." 
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

        {/* Transaction Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Detalles del Movimiento
            </h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Monto ($)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                <input 
                  required
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-bold text-slate-700"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Categoría</label>
              <select 
                required
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
              >
                {isLoadingCategories ? (
                  <option>Cargando categorías...</option>
                ) : (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                )}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Método de Pago</label>
              <select 
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Depósito">Depósito</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Descripción / Glosa</label>
              <input 
                required
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                type="text" 
                placeholder="Ej: Pago de cuota ordinaria mes de Marzo"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
            <div className="md:col-span-2 pt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    name="generateReceipt"
                    checked={formData.generateReceipt}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6 shadow-inner" />
                </div>
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-all">Generar comprobante de pago automáticamente</span>
              </label>
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
            href="/tesoreria"
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
                Procesando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Registrar Transacción
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
