import { v4 as uuidv4 } from 'uuid';

export type MemberStatus = 'Activo' | 'Suspendido' | 'Pendiente';

export interface FamilyMember {
  rut: string;
  name: string;
  relationship: string;
}

export interface Member {
  id: string;
  rut: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  region?: string;
  commune?: string;
  familySize: number;
  familyMembers?: FamilyMember[];
  status: MemberStatus;
  createdAt: string;
}

export type TransactionType = 'ingreso' | 'egreso';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  category: string;
  memberId?: string;
  memberName?: string;
  memberRut?: string;
}

export type DocumentType = 'Oficio' | 'Carta' | 'Acta';
export type DocumentStatus = 'Borrador' | 'Firmado';

export interface Document {
  id: string;
  type: DocumentType;
  folio: string;
  title: string;
  content: string;
  status: DocumentStatus;
  createdAt: string;
}

export type AssemblyType = 'Ordinaria' | 'Extraordinaria' | 'Informativa';

export interface Assembly {
  id: string;
  date: string;
  type: AssemblyType;
  location?: string;
  attendance: number;
  attendanceRuts?: string[];
  agreements: string;
  status: 'Programada' | 'Realizada' | 'Anulada';
}

export interface DirectiveMember {
  id: string;
  role: string;
  name: string;
  rut: string;
  substituteName: string;
  substituteRut: string;
  termStart: string;
  termEnd: string;
}

export type UserRole = 'Admin' | 'Presidente' | 'Secretario' | 'Tesorero' | 'Socio';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: 'Activo' | 'Inactivo';
  createdAt: string;
}

export interface CommitteeConfig {
  name: string;
  rut: string;
  address: string;
  email: string;
  phone: string;
  president: string;
  logo?: string;
}

// In-memory database
class Database {
  config: CommitteeConfig = {
    name: 'Comité de Vivienda Tierra Esperanza',
    rut: '65.123.456-7',
    address: 'Av. Principal 123, Comuna',
    email: 'contacto@tierraesperanza.cl',
    phone: '+56912345678',
    president: 'Ana Silva',
    logo: '',
  };

  users: User[] = [
    { id: uuidv4(), name: 'Soporte Técnico', email: 'soporte@tierraesperanza.cl', role: 'Admin', status: 'Activo', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Ana Silva', email: 'ana.silva@tierraesperanza.cl', role: 'Presidente', status: 'Activo', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Luis Martínez', email: 'luis.martinez@tierraesperanza.cl', role: 'Tesorero', status: 'Activo', createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Carmen Rojas', email: 'carmen.rojas@tierraesperanza.cl', role: 'Secretario', status: 'Activo', createdAt: new Date().toISOString() },
  ];

  members: Member[] = [
    { id: uuidv4(), rut: '12.345.678-9', name: 'Juan Pérez', email: 'juan@example.com', phone: '+56912345678', address: 'Pasaje Los Pinos 123', familySize: 4, status: 'Activo', createdAt: new Date().toISOString() },
    { id: uuidv4(), rut: '9.876.543-2', name: 'María González', email: 'maria@example.com', phone: '+56987654321', address: 'Av. Principal 456', familySize: 2, status: 'Activo', createdAt: new Date().toISOString() },
    { id: uuidv4(), rut: '15.678.901-K', name: 'Carlos Soto', email: 'carlos@example.com', phone: '+56911223344', address: 'Calle Las Rosas 789', familySize: 3, status: 'Pendiente', createdAt: new Date().toISOString() },
  ];

  transactions: Transaction[] = [
    { id: uuidv4(), type: 'ingreso', amount: 50000, description: 'Cuota Social Enero', date: '2026-01-15T10:00:00Z', category: 'Cuotas' },
    { id: uuidv4(), type: 'ingreso', amount: 50000, description: 'Cuota Social Febrero', date: '2026-02-15T10:00:00Z', category: 'Cuotas' },
    { id: uuidv4(), type: 'egreso', amount: 15000, description: 'Artículos de Oficina', date: '2026-02-20T10:00:00Z', category: 'Operativos' },
    { id: uuidv4(), type: 'ingreso', amount: 100000, description: 'Aporte Municipal', date: '2026-03-01T10:00:00Z', category: 'Aportes' },
  ];

  documents: Document[] = [
    { id: uuidv4(), type: 'Oficio', folio: 'OF-2026-001', title: 'Solicitud de Subsidio', content: 'Mediante el presente oficio, solicitamos...', status: 'Firmado', createdAt: '2026-01-10T10:00:00Z' },
    { id: uuidv4(), type: 'Acta', folio: 'AC-2026-001', title: 'Acta Asamblea Ordinaria Enero', content: 'En la ciudad de...', status: 'Firmado', createdAt: '2026-01-20T10:00:00Z' },
  ];

  assemblies: Assembly[] = [
    { id: uuidv4(), date: '2026-01-20T19:00:00Z', type: 'Ordinaria', attendance: 45, attendanceRuts: ['12.345.678-9', '9.876.543-2'], agreements: 'Se aprobó la cuota social de $50.000.', status: 'Realizada' },
    { id: uuidv4(), date: '2026-03-15T19:00:00Z', type: 'Extraordinaria', attendance: 0, attendanceRuts: [], agreements: '', status: 'Programada' },
  ];

  directive: DirectiveMember[] = [
    { id: uuidv4(), role: 'Presidente', name: 'Ana Silva', rut: '12.345.678-9', substituteName: 'Roberto Díaz', substituteRut: '10.222.333-4', termStart: '2025-01-01', termEnd: '2027-01-01' },
    { id: uuidv4(), role: 'Tesorero', name: 'Luis Martínez', rut: '9.876.543-2', substituteName: 'Elena Martínez', substituteRut: '11.444.555-6', termStart: '2025-01-01', termEnd: '2027-01-01' },
    { id: uuidv4(), role: 'Secretario', name: 'Carmen Rojas', rut: '15.678.901-K', substituteName: 'Miguel Torres', substituteRut: '13.666.777-8', termStart: '2025-01-01', termEnd: '2027-01-01' },
  ];
}

// Global instance to persist across API route reloads in dev
const globalForDb = global as unknown as { db: Database };
export const db = globalForDb.db || new Database();
if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
