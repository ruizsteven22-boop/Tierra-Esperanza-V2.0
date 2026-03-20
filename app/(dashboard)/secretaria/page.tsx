import prisma from '@/lib/prisma';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  Eye,
  Edit
} from 'lucide-react';
import Link from 'next/link';

export default async function SecretaryPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const query = searchParams.q || '';
  const status = searchParams.status || 'Todos';

  const requests = await prisma.secretaryRequest.findMany({
    where: {
      AND: [
        query ? {
          OR: [
            { title: { contains: query } },
            { member: { name: { contains: query } } },
            { member: { rut: { contains: query } } },
          ]
        } : {},
        status !== 'Todos' ? { status } : {}
      ]
    },
    include: {
      member: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Secretaría</h1>
          <p className="text-slate-500 font-medium">Gestión de solicitudes, trámites y documentos oficiales</p>
        </div>
        <Link 
          href="/secretaria/nueva-solicitud" 
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
        >
          <Plus className="h-4 w-4" />
          Nueva Solicitud
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Pendientes', count: requests.filter(r => r.status === 'Pendiente').length, color: 'bg-amber-100 text-amber-700', icon: Clock },
          { label: 'En Proceso', count: requests.filter(r => r.status === 'En Proceso').length, color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
          { label: 'Completadas', count: requests.filter(r => r.status === 'Completada').length, color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
          { label: 'Rechazadas', count: requests.filter(r => r.status === 'Rechazada').length, color: 'bg-red-100 text-red-700', icon: XCircle },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.count}</p>
            </div>
            <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <form action="/secretaria" method="GET">
            <input 
              name="q"
              defaultValue={query}
              type="text" 
              placeholder="Buscar por título, socio o RUT..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </form>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            defaultValue={status}
            onChange={(e) => window.location.href = `/secretaria?status=${e.target.value}${query ? `&q=${query}` : ''}`}
          >
            <option value="Todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Completada">Completada</option>
            <option value="Rechazada">Rechazada</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Solicitud</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Socio</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Tipo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.length > 0 ? (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-all">{request.title}</p>
                        <p className="text-xs text-slate-400 truncate max-w-xs">{request.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-600">{request.member.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                        {request.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        request.status === 'Completada' ? 'bg-emerald-100 text-emerald-700' :
                        request.status === 'Pendiente' ? 'bg-amber-100 text-amber-700' :
                        request.status === 'En Proceso' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-500 font-medium">{new Date(request.createdAt).toLocaleDateString('es-CL')}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/secretaria/${request.id}`}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FileText className="h-12 w-12 opacity-20" />
                      <p className="font-medium">No hay solicitudes registradas</p>
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
