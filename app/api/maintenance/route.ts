import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  // Export all data
  const data = {
    members: db.members,
    transactions: db.transactions,
    assemblies: db.assemblies,
    documents: db.documents,
    directive: db.directive,
    config: db.config,
    users: db.users,
  };
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, data } = body;

  if (action === 'import') {
    if (!data) return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    
    // Simple import: overwrite existing data if present in import
    if (data.members) db.members = data.members;
    if (data.transactions) db.transactions = data.transactions;
    if (data.assemblies) db.assemblies = data.assemblies;
    if (data.documents) db.documents = data.documents;
    if (data.directive) db.directive = data.directive;
    if (data.config) db.config = data.config;
    if (data.users) db.users = data.users;

    return NextResponse.json({ message: 'Datos importados exitosamente' });
  }

  if (action === 'reset') {
    // Reset to factory defaults (initial state)
    // We can just re-initialize the arrays with some defaults or empty them
    db.members = [];
    db.transactions = [];
    db.assemblies = [];
    db.documents = [];
    // Keep config and users as they are essential for access, or reset config to default
    db.config = {
      name: 'Comité de Vivienda Tierra Esperanza',
      rut: '65.123.456-7',
      address: 'Av. Principal 123, Comuna',
      email: 'contacto@tierraesperanza.cl',
      phone: '+56912345678',
      president: 'Ana Silva',
    };
    
    return NextResponse.json({ message: 'Sistema restablecido a valores de fábrica' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
