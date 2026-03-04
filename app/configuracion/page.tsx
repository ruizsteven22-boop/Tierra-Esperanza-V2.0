'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2, Building, Mail, Phone, MapPin, User, ShieldAlert, Upload, Image as ImageIcon, AlertCircle, CheckCircle2, Download, FileUp, RotateCcw, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { validateRut, formatRut } from '@/lib/chile-data';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function Configuracion() {
  const { canAccess } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [rutError, setRutError] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);

  useEffect(() => {
    if (!canAccess('/configuracion')) {
      setTimeout(() => setLoading(false), 0);
      return;
    }
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      });
  }, [canAccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'rut') {
      const formatted = formatRut(e.target.value);
      setConfig({ ...config, rut: formatted });
      setRutError(validateRut(formatted) ? '' : 'RUT inválido');
    } else {
      setConfig({ ...config, [e.target.name]: e.target.value });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validaciones robustas
      if (file.size > 2 * 1024 * 1024) {
        setMessage('Error: El logo no debe superar los 2MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        setMessage('Error: Formato de imagen no permitido (usar JPG, PNG, WEBP o SVG)');
        return;
      }

      const reader = new FileReader();
      reader.onloadstart = () => setLoading(true);
      reader.onloadend = () => {
        setConfig({ ...config, logo: reader.result as string });
        setMessage('Logo cargado. Presione "Guardar Cambios" para confirmar.');
        setLoading(false);
      };
      reader.onerror = () => {
        setMessage('Error al procesar la imagen');
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setConfig({ ...config, logo: '' });
    setMessage('Logo removido. Presione "Guardar Cambios" para confirmar.');
  };

  const handleSave = async () => {
    if (rutError) {
      setMessage('Error: Corrija el RUT antes de guardar');
      return;
    }

    setSaving(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setMessage('✓ Configuración actualizada correctamente');
        setTimeout(() => setMessage(''), 5000);
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.message || 'No se pudo guardar la configuración'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage('Error de conexión al intentar guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/maintenance');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `respaldo_comite_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error al exportar datos');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (confirm('¿Está seguro de importar estos datos? Se sobrescribirán los datos actuales.')) {
          setMaintenanceLoading(true);
          const res = await fetch('/api/maintenance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'import', data }),
          });
          if (res.ok) {
            alert('Datos importados exitosamente. La página se recargará.');
            window.location.reload();
          } else {
            alert('Error al importar datos');
          }
        }
      } catch (error) {
        alert('Archivo inválido');
      } finally {
        setMaintenanceLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    setMaintenanceLoading(true);
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      if (res.ok) {
        alert('Sistema restablecido exitosamente. La página se recargará.');
        window.location.reload();
      } else {
        alert('Error al restablecer el sistema');
      }
    } catch (error) {
      alert('Error de red');
    } finally {
      setMaintenanceLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Cargando...</div>;

  if (!canAccess('/configuracion')) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-full">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Acceso Denegado</h2>
        <p className="text-slate-500 text-center max-w-md">
          No tienes los permisos necesarios para acceder a la configuración del sistema.
          Contacta al administrador si crees que esto es un error.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuración del Comité</h1>
        <p className="text-slate-500 mt-2">Administra los datos generales y de contacto de la organización.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identidad Visual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-32 h-32 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group">
              {config.logo ? (
                <>
                  <Image src={config.logo} alt="Logo" width={128} height={128} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <label className="cursor-pointer p-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors" title="Cambiar Logo">
                      <Upload className="h-5 w-5 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                    <button 
                      onClick={handleRemoveLogo}
                      className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-full transition-colors" 
                      title="Eliminar Logo"
                    >
                      <Trash2 className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </>
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors">
                  <ImageIcon className="h-12 w-12 text-slate-300 mb-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Subir Logo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-bold text-slate-900">Logo del Comité</h3>
              <p className="text-sm text-slate-500">
                Sube el logo oficial de la organización. Este logo aparecerá en todos los documentos, recibos y reportes generados por el sistema.
              </p>
              <p className="text-xs text-slate-400">Formatos recomendados: PNG o JPG. Tamaño máximo: 2MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos Generales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Building className="h-4 w-4 text-slate-400" />
                Nombre del Comité
              </label>
              <input
                type="text"
                name="name"
                value={config.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <FileTextIcon className="h-4 w-4 text-slate-400" />
                RUT
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="rut"
                  value={config.rut}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    rutError ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'
                  }`}
                />
                {config.rut && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {rutError ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                )}
              </div>
              {rutError && <p className="text-[10px] text-red-500 font-bold uppercase">{rutError}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                Dirección Sede
              </label>
              <input
                type="text"
                name="address"
                value={config.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                value={config.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                Teléfono de Contacto
              </label>
              <input
                type="text"
                name="phone"
                value={config.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                Presidente(a) Actual
              </label>
              <input
                type="text"
                name="president"
                value={config.president}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <p className={`text-sm font-medium ${message.includes('Error') ? 'text-red-600' : 'text-emerald-600'}`}>
              {message}
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar Cambios
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Mantenimiento de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleExport}
              className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors group"
            >
              <Download className="h-8 w-8 text-slate-400 group-hover:text-emerald-600 mb-2" />
              <span className="font-bold text-slate-900">Exportar Datos</span>
              <span className="text-xs text-slate-500 text-center mt-1">Descarga un respaldo completo en formato JSON</span>
            </button>

            <label className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors group cursor-pointer">
              <FileUp className="h-8 w-8 text-slate-400 group-hover:text-blue-600 mb-2" />
              <span className="font-bold text-slate-900">Importar Datos</span>
              <span className="text-xs text-slate-500 text-center mt-1">Carga un archivo de respaldo previamente exportado</span>
              <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={maintenanceLoading} />
            </label>

            <button
              onClick={() => setResetModalOpen(true)}
              disabled={maintenanceLoading}
              className="flex flex-col items-center justify-center p-6 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors group"
            >
              <RotateCcw className="h-8 w-8 text-red-300 group-hover:text-red-600 mb-2" />
              <span className="font-bold text-red-900">Restablecer Sistema</span>
              <span className="text-xs text-red-500 text-center mt-1">Elimina toda la información y vuelve al estado inicial</span>
            </button>
          </div>
          
          {maintenanceLoading && (
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando solicitud de mantenimiento...
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={handleReset}
        title="Restablecer Sistema"
        message="¡ADVERTENCIA! Esta acción eliminará todos los socios, transacciones, asambleas y documentos. ¿Está completamente seguro de restablecer a fábrica? Esta acción no se puede deshacer."
        confirmText="Restablecer Todo"
      />
    </div>
  );
}

function FileTextIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  )
}
