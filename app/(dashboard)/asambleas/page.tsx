import prisma from '@/lib/prisma';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Eye,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

export default async function AssembliesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q, type: typeParam } = await searchParams;
  const query = q || '';
  const type = typeParam || 'Todos';

  const assemblies = await prisma.assembly.findMany({
    where: {
      AND: [
        query ? {
          OR: [
            { title: { contains: query } },
            { location: { contains: query } },
          ]
        } : {},
        type !== 'Todos' ? { type } : {}
      ]
    },
    include: {
      _count: {
        select: { attendances: true }
      }
    },
    orderBy: { date: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Asambleas</h1>
          <p className="text-slate-500 font-medium">Planificación, asistencia y actas de reuniones generales</p>
        </div>
        <Link 
          href="/asambleas/nueva" 
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
        >
          <Plus className="h-4 w-4" />
          Nueva Asamblea
        </Link>
      </div>

      {/* Assemblies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assemblies.length > 0 ? (
          assemblies.map((assembly) => {
            const isPast = new Date(assembly.date) < new Date();
            return (
              <div key={assembly.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden group hover:border-emerald-200 transition-all">
                <div className={`h-2 ${isPast ? 'bg-slate-200' : 'bg-emerald-500'}`} />
                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {assembly.type}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-all">{assembly.title}</h3>
                    </div>
                    <button className="p-2 text-slate-300 hover:text-slate-600 transition-all">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Calendar className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">
                        {new Date(assembly.date).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">
                        {new Date(assembly.date).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} hrs
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium truncate">{assembly.location}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{assembly._count.attendances}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Asistentes</p>
                      </div>
                    </div>
                    <Link 
                      href={`/asambleas/${assembly.id}`}
                      className="px-4 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl text-xs font-bold transition-all"
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No hay asambleas programadas</p>
          </div>
        )}
      </div>
    </div>
  );
}
