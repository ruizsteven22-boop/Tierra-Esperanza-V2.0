import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Financial Stats
    const transactions = await prisma.treasuryTransaction.findMany({
      where: {
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
        }
      }
    });

    const income = transactions.filter(t => t.type === 'INGRESO').reduce((acc, t) => acc + Number(t.amount), 0);
    const expenses = transactions.filter(t => t.type === 'EGRESO').reduce((acc, t) => acc + Number(t.amount), 0);
    const balance = income - expenses;

    // 2. Member Stats
    const totalMembers = await prisma.member.count();
    const activeMembers = await prisma.member.count({ where: { status: 'Activo' } });
    const suspendedMembers = await prisma.member.count({ where: { status: 'Suspendido' } });
    const inactiveMembers = await prisma.member.count({ where: { status: 'Inactivo' } });

    // 3. Hogar Social Segments (assuming numeric strings or parsing)
    const allMembers = await prisma.member.findMany({
      select: { registroHogarSocial: true }
    });

    const parseRHS = (rhs: string | null) => {
      if (!rhs) return 0;
      const num = parseInt(rhs.replace(/[^0-9]/g, ''));
      return isNaN(num) ? 0 : num;
    };

    const hogarSocialSegments = {
      cumple: allMembers.filter(m => parseRHS(m.registroHogarSocial) <= 40).length,
      observado: allMembers.filter(m => parseRHS(m.registroHogarSocial) > 40 && parseRHS(m.registroHogarSocial) <= 90).length,
      noCumple: allMembers.filter(m => parseRHS(m.registroHogarSocial) > 90).length,
    };

    // 4. Upcoming Assemblies
    const upcomingAssemblies = await prisma.assembly.findMany({
      where: {
        date: { gte: new Date() },
        status: 'Programada'
      },
      orderBy: { date: 'asc' },
      take: 5
    });

    // 5. Monthly Stats (Last 6 months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('es-CL', { month: 'short' });
      const month = d.getMonth();
      const year = d.getFullYear();

      const monthIncome = transactions
        .filter(t => {
          const td = new Date(t.date);
          return td.getMonth() === month && td.getFullYear() === year && t.type === 'INGRESO';
        })
        .reduce((acc, t) => acc + Number(t.amount), 0);

      const monthExpenses = transactions
        .filter(t => {
          const td = new Date(t.date);
          return td.getMonth() === month && td.getFullYear() === year && t.type === 'EGRESO';
        })
        .reduce((acc, t) => acc + Number(t.amount), 0);

      monthlyStats.push({
        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        ingresos: monthIncome,
        egresos: monthExpenses,
      });
    }

    // 6. Recent Activity
    const recentTransactions = await prisma.treasuryTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const recentMembers = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const recentActivity = [
      ...recentTransactions.map(t => ({
        id: `t-${t.id}`,
        type: 'transaccion',
        title: t.description,
        subtitle: `${t.type === 'INGRESO' ? '+' : '-'}$${Number(t.amount).toLocaleString('es-CL')}`,
        date: t.date.toISOString(),
        icon: t.type === 'INGRESO' ? 'TrendingUp' : 'TrendingDown'
      })),
      ...recentMembers.map(m => ({
        id: `m-${m.id}`,
        type: 'socio',
        title: `Nuevo socio: ${m.name}`,
        subtitle: `RUT: ${m.rut}`,
        date: m.createdAt.toISOString(),
        icon: 'UserPlus'
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

    const memberStatusStats = [
      { name: 'Activos', value: activeMembers, color: '#10b981' },
      { name: 'Suspendidos', value: suspendedMembers, color: '#ef4444' },
      { name: 'Inactivos', value: inactiveMembers, color: '#f59e0b' },
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
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Error al cargar dashboard' }, { status: 500 });
  }
}
