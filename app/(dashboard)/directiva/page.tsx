import prisma from '@/lib/prisma';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  Award,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

export default async function DirectivePage() {
  const directiveMembers = await prisma.directiveMember.findMany({
    include: {
      member: true,
    },
    orderBy: {
      position: 'asc',
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Directiva</h1>
          <p className="text-slate-500 font-medium">Gestión de la mesa directiva y cargos del comité</p>
        </div>
        <Link 
          href="/directiva/nuevo" 
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-100"
        >
          <UserPlus className="h-5 w-5" />
          Asignar Cargo
        </Link>
      </div>

      {/* Stats / Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargos Activos</p>
            <p className="text-2xl font-bold text-slate-900">{directiveMembers.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Periodo Actual</p>
            <p className="text-2xl font-bold text-slate-900">2024 - 2026</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado Directiva</p>
            <p className="text-2xl font-bold text-slate-900">Vigente</p>
          </div>
        </div>
      </div>

      {/* Directive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {directiveMembers.map((dm) => (
          <div key={dm.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
            <div className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all text-2xl font-bold">
                  {dm.member.name.charAt(0)}
                </div>
                <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">{dm.position}</p>
                <h3 className="text-xl font-bold text-slate-900">{dm.member.name}</h3>
                <p className="text-sm text-slate-400 font-medium">Desde: {new Date(dm.startDate).toLocaleDateString('es-CL')}</p>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3 text-slate-600 group-hover:text-slate-900 transition-all">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium">{dm.member.email || 'Sin correo'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 group-hover:text-slate-900 transition-all">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium">{dm.member.phone || 'Sin teléfono'}</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-8 py-4 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                <CheckCircle2 className="h-3 w-3" />
                Cargo Vigente
              </span>
              <Link 
                href={`/socios/${dm.memberId}`}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-all"
              >
                Ver Perfil
              </Link>
            </div>
          </div>
        ))}

        {directiveMembers.length === 0 && (
          <div className="col-span-full bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center space-y-4">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Users className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">No hay integrantes asignados</h3>
              <p className="text-slate-500">Comienza asignando cargos a los socios del comité</p>
            </div>
            <Link 
              href="/directiva/nuevo" 
              className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline"
            >
              Asignar primer cargo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
