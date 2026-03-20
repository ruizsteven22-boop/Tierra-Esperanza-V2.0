import prisma from '@/lib/prisma';
import { 
  Users, 
  Users2, 
  UserCheck, 
  Gavel, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Receipt,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  // Fetch metrics in parallel
  const [
    memberCount,
    familyMemberCount,
    userCount,
    assemblyCount,
    meetingCount,
    treasuryStats,
    recentDocs,
    recentReceipts,
    pendingAgreements
  ] = await Promise.all([
    prisma.member.count(),
    prisma.familyMember.count(),
    prisma.user.count(),
    prisma.assembly.count(),
    prisma.meeting.count(),
    prisma.treasuryTransaction.groupBy({
      by: ['type'],
      _sum: { amount: true }
    }),
    prisma.secretaryDocument.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    prisma.treasuryReceipt.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { transaction: true } }),
    prisma.meetingAgreement.findMany({ where: { status: 'pendiente' }, take: 5, orderBy: { createdAt: 'desc' } })
  ]);

  const income = treasuryStats.find(s => s.type === 'INGRESO')?._sum.amount || 0;
  const expense = treasuryStats.find(s => s.type === 'EGRESO')?._sum.amount || 0;

  const stats = [
    { label: 'Total Socios', value: memberCount, icon: Users, color: 'bg-blue-500' },
    { label: 'Grupo Familiar', value: familyMemberCount, icon: Users2, color: 'bg-indigo-500' },
    { label: 'Usuarios', value: userCount, icon: UserCheck, color: 'bg-slate-500' },
    { label: 'Asambleas', value: assemblyCount, icon: Gavel, color: 'bg-emerald-500' },
    { label: 'Reuniones', value: meetingCount, icon: Calendar, color: 'bg-amber-500' },
    { label: 'Ingresos', value: `$${Number(income).toLocaleString()}`, icon: TrendingUp, color: 'bg-emerald-600' },
    { label: 'Egresos', value: `$${Number(expense).toLocaleString()}`, icon: TrendingDown, color: 'bg-red-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bienvenido al Panel</h1>
          <p className="text-slate-500 font-medium">Resumen general de SIGEVIVI</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Hora del sistema: {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className={`p-4 rounded-xl ${stat.color} text-white shadow-inner`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Documents */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Documentos Recientes
            </h3>
            <Link href="/secretaria" className="text-emerald-600 hover:text-emerald-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex-1 p-2">
            {recentDocs.length > 0 ? (
              recentDocs.map(doc => (
                <div key={doc.id} className="p-4 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-3 group">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{doc.title}</p>
                    <p className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-sm text-slate-400 text-center">No hay documentos recientes</p>
            )}
          </div>
        </div>

        {/* Recent Receipts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />
              Recibos Recientes
            </h3>
            <Link href="/tesoreria" className="text-emerald-600 hover:text-emerald-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex-1 p-2">
            {recentReceipts.length > 0 ? (
              recentReceipts.map(receipt => (
                <div key={receipt.id} className="p-4 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-3 group">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Recibo #{receipt.number}</p>
                    <p className="text-xs text-slate-400">${Number(receipt.transaction.amount).toLocaleString()} - {new Date(receipt.issueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-sm text-slate-400 text-center">No hay recibos recientes</p>
            )}
          </div>
        </div>

        {/* Pending Agreements */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Gavel className="h-5 w-5 text-emerald-600" />
              Acuerdos Pendientes
            </h3>
            <Link href="/asambleas" className="text-emerald-600 hover:text-emerald-700 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex-1 p-2">
            {pendingAgreements.length > 0 ? (
              pendingAgreements.map(agreement => (
                <div key={agreement.id} className="p-4 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-3 group">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">
                    <Gavel className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{agreement.title}</p>
                    <p className="text-xs text-slate-400">Resp: {agreement.responsible || 'No asignado'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-sm text-slate-400 text-center">No hay acuerdos pendientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
