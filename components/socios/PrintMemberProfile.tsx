'use client';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Printer } from 'lucide-react';

export default function PrintMemberProfile({ member }: { member: any }) {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Emerald-600
    doc.text('SIGEVIVI - Sistema de Gestión de Vivienda', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('FICHA OFICIAL DE SOCIO', 105, 30, { align: 'center' });

    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.line(20, 35, 190, 35);

    // Personal Info
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN PERSONAL', 20, 45);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre: ${member.name}`, 20, 55);
    doc.text(`RUT: ${member.rut}`, 20, 62);
    doc.text(`Correo: ${member.email || 'No registrado'}`, 20, 69);
    doc.text(`Teléfono: ${member.phone || 'No registrado'}`, 20, 76);
    doc.text(`Dirección: ${member.address || 'No registrada'}`, 20, 83);
    doc.text(`Fecha Nacimiento: ${member.birthDate ? new Date(member.birthDate).toLocaleDateString('es-CL') : 'No registrada'}`, 20, 90);
    doc.text(`Estado: ${member.status}`, 20, 97);
    doc.text(`Fecha Incorporación: ${new Date(member.createdAt).toLocaleDateString('es-CL')}`, 20, 104);

    // Family Group
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('GRUPO FAMILIAR', 20, 115);

    if (member.familyMembers && member.familyMembers.length > 0) {
      (doc as any).autoTable({
        startY: 120,
        head: [['Nombre', 'Parentesco', 'RUT']],
        body: member.familyMembers.map((fm: any) => [fm.name, fm.relationship, fm.rut]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        margin: { left: 20, right: 20 }
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text('No hay integrantes registrados en el grupo familiar.', 20, 125);
    }

    // Footer
    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : 135;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(`Documento generado el ${new Date().toLocaleString('es-CL')}`, 105, 280, { align: 'center' });
    doc.text('SIGEVIVI - Sistema de Gestión Interna', 105, 285, { align: 'center' });

    // Save PDF
    doc.save(`Ficha_Socio_${member.rut.replace(/\./g, '').replace(/-/g, '')}.pdf`);
  };

  return (
    <button 
      onClick={generatePDF}
      className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm"
    >
      <Printer className="h-4 w-4" />
      Imprimir Ficha
    </button>
  );
}
