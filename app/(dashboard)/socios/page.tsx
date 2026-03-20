import prisma from '@/lib/prisma';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  Download,
  Printer
} from 'lucide-react';
import Link from 'next/link';

export default async function MembersPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const query = searchParams.q || '';
  const status = searchParams.status || 'Todos';

  const members = await prisma.member.findMany({
    where: {
      AND: [
        query ? {
          OR: [
            { name: { contains: query } },
            { rut: { contains: query } },
            { email: { contains: query } },
          ]
        } : {},
        status !== 'Todos' ? { status } : {}
      ]
    },
    include: {
      _count: {
        select: { familyMembers: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Socios</h1>
          <p className="text-slate-500 font-medium">Administra el censo del comité SIGEVIVI</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm">
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
          <Link 
            href="/socios/nuevo" 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
          >
            <UserPlus className="h-4 w-4" />
            Nuevo Socio
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <form action="/socios" method="GET">
            <input 
              name="q"
              defaultValue={query}
              type="text" 
              placeholder="Buscar por nombre, RUT o correo..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </form>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-wider px-2">
            <Filter className="h-4 w-4" />
            Filtrar:
          </div>
          <select 
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            defaultValue={status}
            onChange={(e) => window.location.href = `/socios?status=${e.target.value}${query ? `&q=${query}` : ''}`}
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Suspendido">Suspendido</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Socio</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">RUT</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Grupo Familiar</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {members.length > 0 ? (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shadow-inner">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-all">{member.name}</p>
                          <p className="text-xs text-slate-400">{member.email || 'Sin correo'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-600">{member.rut}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        member.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' :
                        member.status === 'Suspendido' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-600">{member._count.familyMembers} integrantes</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/socios/${member.id}`}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Ver Detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link 
                          href={`/socios/${member.id}/editar`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button 
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Users className="h-12 w-12 opacity-20" />
                      <p className="font-medium">No se encontraron socios</p>
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
