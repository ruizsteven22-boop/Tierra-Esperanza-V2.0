import prisma from '@/lib/prisma';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Users,
  UserCheck,
  FileText,
  Printer,
  Download,
  Search,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AttendanceSystem from './AttendanceSystem';

export default async function AssemblyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assembly = await prisma.assembly.findUnique({
    where: { id },
    include: {
      attendance: {
        include: { member: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!assembly) {
    notFound();
  }

  const isPast = new Date(assembly.date) < new Date();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/asambleas" 
            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{assembly.title}</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isPast ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {isPast ? 'Finalizada' : 'Programada'}
              </span>
            </div>
            <p className="text-slate-500 font-medium">Asamblea {assembly.type} · {new Date(assembly.date).toLocaleDateString('es-CL')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm">
            <Printer className="h-4 w-4" />
            Imprimir Acta
          </button>
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm">
            <Download className="h-4 w-4" />
            Lista Asistencia
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Attendance System */}
        <div className="lg:col-span-2 space-y-8">
          {/* Details Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Detalles de la Asamblea
              </h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ubicación</p>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    {assembly.location}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha y Hora</p>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    {new Date(assembly.date).toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' })}
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción / Tabla</p>
                <div className="bg-slate-50 p-6 rounded-2xl text-slate-700 text-sm leading-relaxed">
                  {assembly.description}
                </div>
              </div>
            </div>
          </div>

          {/* Attendance System (Only if not past or for recording) */}
          <AttendanceSystem assemblyId={assembly.id} />
        </div>

        {/* Right Column: Attendance List */}
        <div className="space-y-8">
          {/* Attendance Stats */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-6 shadow-xl">
            <h3 className="font-bold text-lg opacity-90">Resumen Asistencia</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Presentes</p>
                <p className="text-2xl font-bold">{assembly.attendance.length}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quórum</p>
                <p className="text-2xl font-bold">45%</p>
              </div>
            </div>
          </div>

          {/* Recent Attendance List */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Asistentes Recientes</h3>
              <UserCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
              {assembly.attendance.length > 0 ? (
                assembly.attendance.map((att) => (
                  <div key={att.id} className="p-4 hover:bg-slate-50 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 text-xs font-bold">
                        {att.member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">{att.member.name}</p>
                        <p className="text-[10px] text-slate-400">{new Date(att.createdAt).toLocaleTimeString('es-CL')}</p>
                      </div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs italic">
                  Aún no hay asistentes registrados
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
