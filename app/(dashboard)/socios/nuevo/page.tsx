'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  Save, 
  X, 
  Plus, 
  Trash2,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface FamilyMemberInput {
  name: string;
  relationship: string;
  rut: string;
}

export default function NewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    status: 'Activo',
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMemberInput[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { name: '', relationship: '', rut: '' }]);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const handleFamilyMemberChange = (index: number, field: keyof FamilyMemberInput, value: string) => {
    const updated = [...familyMembers];
    updated[index][field] = value;
    setFamilyMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/socios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, familyMembers }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear el socio');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/socios');
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner animate-bounce">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">¡Socio Registrado!</h2>
        <p className="text-slate-500">El socio ha sido creado exitosamente en el sistema.</p>
        <p className="text-xs text-slate-400">Redirigiendo al listado...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/socios" 
            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nuevo Socio</h1>
            <p className="text-slate-500 font-medium">Completa la información para registrar un nuevo integrante</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Información Personal
            </h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Nombre Completo</label>
              <input 
                required
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                type="text" 
                placeholder="Ej: Juan Pérez Soto"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">RUT</label>
              <input 
                required
                name="rut"
                value={formData.rut}
                onChange={handleInputChange}
                type="text" 
                placeholder="12.345.678-9"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Correo Electrónico</label>
              <input 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                type="email" 
                placeholder="juan@ejemplo.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Teléfono</label>
              <input 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                type="tel" 
                placeholder="+56 9 1234 5678"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Dirección</label>
              <input 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                type="text" 
                placeholder="Calle, Número, Villa/Población"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Fecha de Nacimiento</label>
              <input 
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                type="date" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Estado Inicial</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </div>
          </div>
        </div>

        {/* Family Group */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Grupo Familiar
            </h2>
            <button 
              type="button"
              onClick={addFamilyMember}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm uppercase tracking-wider transition-all"
            >
              <Plus className="h-4 w-4" />
              Agregar Integrante
            </button>
          </div>
          <div className="p-8 space-y-6">
            {familyMembers.length > 0 ? (
              <div className="space-y-4">
                {familyMembers.map((member, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre</label>
                      <input 
                        required
                        value={member.name}
                        onChange={(e) => handleFamilyMemberChange(index, 'name', e.target.value)}
                        type="text" 
                        placeholder="Nombre completo"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parentesco</label>
                      <input 
                        required
                        value={member.relationship}
                        onChange={(e) => handleFamilyMemberChange(index, 'relationship', e.target.value)}
                        type="text" 
                        placeholder="Ej: Cónyuge, Hijo/a"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1 flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RUT</label>
                        <input 
                          required
                          value={member.rut}
                          onChange={(e) => handleFamilyMemberChange(index, 'rut', e.target.value)}
                          type="text" 
                          placeholder="RUT"
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeFamilyMember(index)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="font-medium italic">No se han agregado integrantes al grupo familiar</p>
                <p className="text-xs mt-1">Haz clic en &quot;Agregar Integrante&quot; para comenzar</p>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3">
            <Trash2 className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link 
            href="/socios"
            className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
          >
            Cancelar
          </Link>
          <button 
            disabled={loading}
            type="submit"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Guardar Socio
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
