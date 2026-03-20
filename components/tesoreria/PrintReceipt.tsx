'use client';

import { Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PrintReceiptProps {
  transaction: any;
}

export default function PrintReceipt({ transaction }: PrintReceiptProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    const receipt = transaction.receipt;
    
    if (!receipt) return;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('SIGEVIVI', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('Comité de Vivienda - Gestión Interna', 105, 26, { align: 'center' });

    // Receipt Info Box
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(140, 35, 60, 30, 3, 3, 'FD');
    
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('COMPROBANTE', 170, 45, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(`N° ${receipt.number.toString().padStart(6, '0')}`, 170, 55, { align: 'center' });

    // Main Content
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Fecha de Emisión:', 20, 45);
    doc.setTextColor(15, 23, 42);
    doc.text(new Date(transaction.date).toLocaleDateString('es-CL'), 60, 45);

    doc.setTextColor(100, 116, 139);
    doc.text('Tipo de Operación:', 20, 52);
    doc.setTextColor(15, 23, 42);
    doc.text(transaction.type === 'INGRESO' ? 'INGRESO DE DINERO' : 'EGRESO DE DINERO', 60, 52);

    doc.setTextColor(100, 116, 139);
    doc.text('Categoría:', 20, 59);
    doc.setTextColor(15, 23, 42);
    doc.text(transaction.category.name, 60, 59);

    // Member Info (if exists)
    if (transaction.member) {
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 70, 190, 70);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Información del Socio', 20, 80);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Nombre:', 20, 88);
      doc.setTextColor(15, 23, 42);
      doc.text(transaction.member.name, 50, 88);

      doc.setTextColor(100, 116, 139);
      doc.text('RUT:', 20, 95);
      doc.setTextColor(15, 23, 42);
      doc.text(transaction.member.rut, 50, 95);
    }

    // Transaction Details Table
    autoTable(doc, {
      startY: transaction.member ? 105 : 75,
      head: [['Descripción', 'Método de Pago', 'Monto']],
      body: [[
        transaction.description || 'Sin descripción',
        transaction.paymentMethod,
        new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(transaction.amount)
      ]],
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], fontSize: 10, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      }
    });

    // Footer / Signatures
    const finalY = (doc as any).lastAutoTable.finalY + 40;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(40, finalY, 90, finalY);
    doc.line(120, finalY, 170, finalY);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Firma Tesorería', 65, finalY + 5, { align: 'center' });
    doc.text('Firma Recibí Conforme', 145, finalY + 5, { align: 'center' });

    doc.setFontSize(8);
    doc.text('Este documento es un comprobante interno de SIGEVIVI.', 105, 285, { align: 'center' });

    doc.save(`Recibo_${receipt.number}_${transaction.member?.name || 'Transaccion'}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-xs transition-all"
    >
      <Printer className="h-4 w-4" />
      Imprimir Recibo
    </button>
  );
}
