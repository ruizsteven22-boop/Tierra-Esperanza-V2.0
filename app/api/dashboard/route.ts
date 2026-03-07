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

  return NextResponse.json({
    balance,
    income,
    expenses,
    activeMembers,
    totalMembers,
    hogarSocialSegments,
    upcomingAssemblies,
  });
}
