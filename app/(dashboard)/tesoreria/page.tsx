import prisma from '@/lib/prisma';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  Download,
  FileText,
  MoreVertical,
  Eye,
  Printer,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import Link from 'next/link';
import PrintReceipt from '@/components/tesoreria/PrintReceipt';

export default async function TreasuryPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string };
}) {
  const query = searchParams.q || '';
  const type = searchParams.type || 'Todos';

  const transactions = await prisma.treasuryTransaction.findMany({
    where: {
      AND: [
        query ? {
          OR: [
            { description: { contains: query } },
            { member: { name: { contains: query } } },
          ]
        } : {},
        type !== 'Todos' ? { type } : {}
      ]
    },
    include: {
      member: true,
      category: true,
      receipt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate stats
  const totalIncome = transactions
    .filter(t => t.type === 'Ingreso')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'Egreso')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tesorería</h1>
          <p className="text-slate-500 font-medium">Control financiero, ingresos y egresos del comité</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/tesoreria/nueva-transaccion" 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
          >
            <Plus className="h-4 w-4" />
            Nueva Transacción
          </Link>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Balance Total</p>
              <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold">${balance.toLocaleString('es-CL')}</p>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="text-emerald-400 font-bold">+12%</span> vs mes anterior
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6 group hover:border-emerald-200 transition-all">
          <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <TrendingUp className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Ingresos</p>
            <p className="text-2xl font-bold text-slate-900">${totalIncome.toLocaleString('es-CL')}</p>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6 group hover:border-red-200 transition-all">
          <div className="h-14 w-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
            <TrendingDown className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Egresos</p>
            <p className="text-2xl font-bold text-slate-900">${totalExpense.toLocaleString('es-CL')}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <form action="/tesoreria" method="GET">
            <input 
              name="q"
              defaultValue={query}
              type="text" 
              placeholder="Buscar por descripción o socio..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </form>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            defaultValue={type}
            onChange={(e) => window.location.href = `/tesoreria?type=${e.target.value}${query ? `&q=${query}` : ''}`}
          >
            <option value="Todos">Todos los tipos</option>
            <option value="Ingreso">Solo Ingresos</option>
            <option value="Egreso">Solo Egresos</option>
          </select>
          <button className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Transacción</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Categoría</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Monto</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          t.type === 'Ingreso' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {t.type === 'Ingreso' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-all">{t.description}</p>
                          <p className="text-xs text-slate-400">{t.member?.name || 'Comité SIGEVIVI'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                        {t.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm font-bold ${
                        t.type === 'Ingreso' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {t.type === 'Ingreso' ? '+' : '-'}${t.amount.toLocaleString('es-CL')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-500 font-medium">{new Date(t.createdAt).toLocaleDateString('es-CL')}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {t.receipt && (
                          <PrintReceipt transaction={t} />
                        )}
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <DollarSign className="h-12 w-12 opacity-20" />
                      <p className="font-medium">No hay transacciones registradas</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
