export type RoleName = 'superadmin' | 'administrador' | 'secretaria' | 'tesoreria' | 'directiva' | 'consulta';

export const ROLES: Record<RoleName, string> = {
  superadmin: 'Acceso total al sistema',
  administrador: 'Gestión administrativa casi total',
  secretaria: 'Gestión de socios y documentos',
  tesoreria: 'Gestión financiera y recibos',
  directiva: 'Gestión de asambleas y directiva',
  consulta: 'Solo lectura general',
};

export const PERMISSIONS = {
  DASHBOARD: ['superadmin', 'administrador', 'secretaria', 'tesoreria', 'directiva', 'consulta'],
  MEMBERS: {
    READ: ['superadmin', 'administrador', 'secretaria', 'tesoreria', 'directiva', 'consulta'],
    WRITE: ['superadmin', 'administrador', 'secretaria'],
    DELETE: ['superadmin', 'administrador'],
  },
  SECRETARY: {
    READ: ['superadmin', 'administrador', 'secretaria', 'consulta'],
    WRITE: ['superadmin', 'administrador', 'secretaria'],
  },
  TREASURY: {
    READ: ['superadmin', 'administrador', 'tesoreria', 'consulta'],
    WRITE: ['superadmin', 'administrador', 'tesoreria'],
  },
  DIRECTIVE: {
    READ: ['superadmin', 'administrador', 'directiva', 'consulta'],
    WRITE: ['superadmin', 'administrador', 'directiva'],
  },
  ASSEMBLIES: {
    READ: ['superadmin', 'administrador', 'directiva', 'consulta'],
    WRITE: ['superadmin', 'administrador', 'directiva'],
  },
  CONFIG: {
    READ: ['superadmin', 'administrador', 'consulta'],
    WRITE: ['superadmin', 'administrador'],
  },
  USERS: {
    READ: ['superadmin', 'administrador'],
    WRITE: ['superadmin'],
  },
};

export function canAccess(role: string, permission: string[]): boolean {
  return permission.includes(role);
}
