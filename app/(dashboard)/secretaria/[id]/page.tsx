import prisma from '@/lib/prisma';
import { 
  FileText, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Calendar,
  Tag,
  MessageSquare,
  Paperclip,
  History,
  Save,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RequestStatusForm from './RequestStatusForm';

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await prisma.secretaryRequest.findUnique({
    where: { id: parseInt(id) },
    include: {
      member: true,
      documents: true,
      records: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/secretaria" 
            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{request.title}</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                request.status === 'Completada' ? 'bg-emerald-100 text-emerald-700' :
                request.status === 'Pendiente' ? 'bg-amber-100 text-amber-700' :
                request.status === 'En Proceso' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {request.status}
              </span>
            </div>
            <p className="text-slate-500 font-medium">Solicitud #{request.id.toString().padStart(6, '0')} · {request.type}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Records */}
        <div className="lg:col-span-2 space-y-8">
          {/* Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Detalles de la Solicitud
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Socio Solicitante</p>
                  <Link href={`/socios/${request.memberId}`} className="text-emerald-600 font-bold hover:underline">
                    {request.member.name}
                  </Link>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">RUT Socio</p>
                  <p className="text-slate-900 font-medium">{request.member.rut}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prioridad</p>
                  <span className={`text-sm font-bold ${
                    request.priority === 'Urgente' ? 'text-red-600' :
                    request.priority === 'Alta' ? 'text-amber-600' :
                    'text-slate-600'
                  }`}>
                    {request.priority}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha Creación</p>
                  <p className="text-slate-900 font-medium">{new Date(request.createdAt).toLocaleString('es-CL')}</p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción / Motivo</p>
                <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed">
                  {request.description}
                </div>
              </div>
            </div>
          </div>

          {/* Records / History */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-600" />
                Historial de Gestiones
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {request.records.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {request.records.map((record) => (
                    <div key={record.id} className="relative pl-10">
                      <div className="absolute left-2.5 top-1.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-emerald-500 z-10" />
                      <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{new Date(record.createdAt).toLocaleString('es-CL')}</p>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Registro</span>
                        </div>
                        <p className="text-sm text-slate-700 font-medium">{record.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p className="font-medium italic">No hay registros de gestiones aún</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Status Management & Documents */}
        <div className="space-y-8">
          {/* Status Update Card */}
          <RequestStatusForm request={request} />

          {/* Documents Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-emerald-600" />
                Documentos Adjuntos
              </h3>
              <button className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:underline">
                Subir
              </button>
            </div>
            <div className="p-4 space-y-3">
              {request.documents.length > 0 ? (
                request.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group hover:bg-emerald-50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <FileText className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-all" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{doc.title}</p>
                        <p className="text-[10px] text-slate-400">PDF · 1.2 MB</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-300 hover:text-emerald-600 transition-all">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  No hay documentos adjuntos
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
