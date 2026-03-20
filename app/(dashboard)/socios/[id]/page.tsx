import prisma from '@/lib/prisma';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  Printer, 
  Download, 
  Edit,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PrintMemberProfile from '@/components/socios/PrintMemberProfile';

export default async function MemberDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const member = await prisma.member.findUnique({
    where: { id: params.id },
    include: {
      familyMembers: true,
      receipts: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      attendance: {
        include: { assembly: true },
        orderBy: { assembly: { date: 'desc' } },
        take: 5
      }
    }
  });

  if (!member) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/socios" 
            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{member.name}</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                member.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' :
                member.status === 'Suspendido' ? 'bg-red-100 text-red-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {member.status}
              </span>
            </div>
            <p className="text-slate-500 font-medium">Ficha de Socio · {member.rut}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PrintMemberProfile member={member} />
          <Link 
            href={`/socios/${member.id}/editar`}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
          >
            <Edit className="h-4 w-4" />
            Editar Socio
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                Información Personal
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">RUT</p>
                <p className="text-slate-900 font-medium">{member.rut}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</p>
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {member.email || 'No registrado'}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teléfono</p>
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {member.phone || 'No registrado'}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dirección</p>
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {member.address || 'No registrada'}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha de Nacimiento</p>
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {member.birthDate ? new Date(member.birthDate).toLocaleDateString('es-CL') : 'No registrada'}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha de Incorporación</p>
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {new Date(member.createdAt).toLocaleDateString('es-CL')}
                </div>
              </div>
            </div>
          </div>

          {/* Family Group Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                Grupo Familiar
              </h2>
              <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-all uppercase tracking-wider">
                Gestionar Integrantes
              </button>
            </div>
            <div className="p-0">
              {member.familyMembers.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/30 border-b border-slate-100">
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parentesco</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">RUT</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {member.familyMembers.map((fm) => (
                      <tr key={fm.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">{fm.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{fm.relationship}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">{fm.rut}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-red-600 transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <p className="font-medium">No hay integrantes registrados en el grupo familiar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Recent Activity */}
        <div className="space-y-8">
          {/* Quick Stats Card */}
          <div className="bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-100 p-6 text-white space-y-6">
            <h3 className="font-bold text-lg opacity-90">Resumen de Cuenta</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4">
                <span className="text-sm opacity-80">Cuotas Pagadas</span>
                <span className="text-xl font-bold">{member.receipts.length}</span>
              </div>
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4">
                <span className="text-sm opacity-80">Asistencia Asambleas</span>
                <span className="text-xl font-bold">{member.attendance.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-80">Estado de Pagos</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Al Día</span>
              </div>
            </div>
          </div>

          {/* Recent Receipts */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Últimos Pagos</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {member.receipts.length > 0 ? (
                member.receipts.map((receipt) => (
                  <div key={receipt.id} className="p-4 hover:bg-slate-50 transition-all flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-bold text-slate-700">#{receipt.number}</p>
                      <p className="text-xs text-slate-400">{new Date(receipt.createdAt).toLocaleDateString('es-CL')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-emerald-600">${receipt.amount.toLocaleString('es-CL')}</span>
                      <button className="p-2 text-slate-300 group-hover:text-emerald-600 transition-all">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Sin pagos registrados
                </div>
              )}
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Asistencia Asambleas</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {member.attendance.length > 0 ? (
                member.attendance.map((att) => (
                  <div key={att.id} className="p-4 hover:bg-slate-50 transition-all flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{att.assembly.title}</p>
                      <p className="text-xs text-slate-400">{new Date(att.assembly.date).toLocaleDateString('es-CL')}</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Sin asistencias registradas
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
