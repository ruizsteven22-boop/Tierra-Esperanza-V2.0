import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, MessageCircle, Mail, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DirectiveMember {
  id: string;
  role: string;
  name: string;
  rut: string;
  substituteName: string;
  substituteRut: string;
  termStart: string;
  termEnd: string;
}

interface Props {
  member: DirectiveMember;
  onClose: () => void;
  config: any;
}

export default function DirectiveIdCard({ member, onClose, config }: Props) {
  const profileUrl = `${window.location.origin}/socios?rut=${member.rut}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Carnet Digital</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div id="id-card-print" className="p-6 bg-white">
          <div className="border-4 border-emerald-600 rounded-xl p-4 space-y-4">
            <div className="text-center border-b-2 border-emerald-100 pb-4">
              <h1 className="text-lg font-bold text-slate-900 uppercase">{config?.name}</h1>
              <p className="text-xs text-slate-500 font-bold uppercase">Identificación Directiva</p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-3xl border-4 border-slate-200">
                {member.name.charAt(0)}
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900">{member.name}</h2>
                <p className="text-emerald-700 font-bold uppercase tracking-wider">{member.role}</p>
                <p className="text-sm text-slate-500 font-mono mt-1">{member.rut}</p>
              </div>
            </div>

            <div className="flex justify-center py-4">
              <QRCodeSVG value={profileUrl} size={128} />
            </div>
            
            <div className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
              Vigencia: {format(new Date(member.termStart), 'yyyy')} - {format(new Date(member.termEnd), 'yyyy')}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 flex justify-center gap-2">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors">
            <Printer className="h-4 w-4" /> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
