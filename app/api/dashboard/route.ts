import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const income = db.transactions.filter(t => t.type === 'ingreso').reduce((acc, t) => acc + t.amount, 0);
  const expenses = db.transactions.filter(t => t.type === 'egreso').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expenses;
  const activeMembers = db.members.filter(m => m.status === 'Activo').length;
  const totalMembers = db.members.length;
  
  const hogarSocialSegments = {
    cumple: db.members.filter(m => (m.registroHogarSocial || 0) <= 40).length,
    observado: db.members.filter(m => (m.registroHogarSocial || 0) > 40 && (m.registroHogarSocial || 0) <= 90).length,
    noCumple: db.members.filter(m => (m.registroHogarSocial || 0) > 90).length,
  };
  
  const now = new Date();
  const upcomingAssemblies = db.assemblies
    .filter(a => new Date(a.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Monthly stats for the last 6 months
  const monthlyStats = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleString('es-CL', { month: 'short' });
    const month = d.getMonth();
    const year = d.getFullYear();

    const monthIncome = db.transactions
      .filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === month && td.getFullYear() === year && t.type === 'ingreso';
      })
      .reduce((acc, t) => acc + t.amount, 0);

    const monthExpenses = db.transactions
      .filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === month && td.getFullYear() === year && t.type === 'egreso';
      })
      .reduce((acc, t) => acc + t.amount, 0);

    monthlyStats.push({
      name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      ingresos: monthIncome,
      egresos: monthExpenses,
    });
  }

  // Recent activity (last 10 events)
  const recentTransactions = db.transactions
    .slice(-5)
    .map(t => ({
      id: `t-${t.id}`,
      type: 'transaccion',
      title: t.description,
      subtitle: `${t.type === 'ingreso' ? '+' : '-'}$${t.amount.toLocaleString('es-CL')}`,
      date: t.date,
      icon: t.type === 'ingreso' ? 'TrendingUp' : 'TrendingDown'
    }));

  const recentMembers = db.members
    .slice(-5)
    .map(m => ({
      id: `m-${m.id}`,
      type: 'socio',
      title: `Nuevo socio: ${m.name}`,
      subtitle: `RUT: ${m.rut}`,
      date: m.createdAt,
      icon: 'UserPlus'
    }));

  const recentActivity = [...recentTransactions, ...recentMembers]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  // Member status distribution
  const memberStatusStats = [
    { name: 'Activos', value: db.members.filter(m => m.status === 'Activo').length, color: '#10b981' },
    { name: 'Suspendidos', value: db.members.filter(m => m.status === 'Suspendido').length, color: '#ef4444' },
    { name: 'Pendientes', value: db.members.filter(m => m.status === 'Pendiente').length, color: '#f59e0b' },
  ];

  return NextResponse.json({
    balance,
    income,
    expenses,
    activeMembers,
    totalMembers,
    hogarSocialSegments,
    upcomingAssemblies,
    monthlyStats,
    recentActivity,
    memberStatusStats
  });
}
