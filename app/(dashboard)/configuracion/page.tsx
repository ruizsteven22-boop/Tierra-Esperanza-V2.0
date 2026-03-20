import prisma from '@/lib/prisma';
import { 
  Settings, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Save, 
  Shield, 
  Bell, 
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import ConfigForm from './ConfigForm';

export default async function ConfigPage() {
  const config = await prisma.systemConfig.findFirst();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
          <p className="text-slate-500 font-medium">Ajustes generales del sistema SIGEVIVI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-6 py-4 bg-white text-emerald-600 font-bold rounded-2xl shadow-sm border border-emerald-100 transition-all">
            <Building2 className="h-5 w-5" />
            General
          </button>
          <button className="w-full flex items-center gap-3 px-6 py-4 text-slate-500 hover:bg-white hover:text-slate-900 font-bold rounded-2xl transition-all">
            <Bell className="h-5 w-5" />
            Notificaciones
          </button>
          <button className="w-full flex items-center gap-3 px-6 py-4 text-slate-500 hover:bg-white hover:text-slate-900 font-bold rounded-2xl transition-all">
            <Shield className="h-5 w-5" />
            Seguridad
          </button>
          <button className="w-full flex items-center gap-3 px-6 py-4 text-slate-500 hover:bg-white hover:text-slate-900 font-bold rounded-2xl transition-all">
            <Database className="h-5 w-5" />
            Base de Datos
          </button>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <ConfigForm initialConfig={config} />
        </div>
      </div>
    </div>
  );
}
