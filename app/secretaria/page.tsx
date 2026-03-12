'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Download, Send, PenTool, Loader2, Printer, MessageCircle, Mail, X, ShieldAlert, Upload, Filter, Eye } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { shareWhatsApp, shareEmail } from '@/lib/share';
import { useAuth } from '@/components/AuthProvider';
import { GoogleGenAI } from '@google/genai';

export default function Secretaria() {
  const { canAccess } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [drafting, setDrafting] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [docType, setDocType] = useState('Oficio');
  const [draftContent, setDraftContent] = useState('');
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [filterType, setFilterType] = useState('Todos');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!canAccess('/secretaria')) {
      setTimeout(() => setLoading(false), 0);
      return;
    }
    Promise.all([
      fetch('/api/documents').then(res => res.json()),
      fetch('/api/config').then(res => res.json())
    ]).then(([docsData, configData]) => {
      setDocuments(docsData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setConfig(configData);
      setLoading(false);
    });
  }, [canAccess]);

  const handleDraft = async () => {
    if (!prompt) return;
    setDrafting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      const systemInstruction = `Eres un secretario experto en redacción administrativa para comités de vivienda. 
      Debes redactar un documento de tipo ${docType} basado en las instrucciones del usuario. 
      Usa un lenguaje formal, claro y profesional. 
      Incluye espacios para firmas y datos que falten.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { systemInstruction }
      });

      setDraftContent(response.text || 'No se pudo generar el borrador.');
      setShowDraftModal(true);
    } catch (error) {
      console.error(error);
      setDraftContent('Error al generar el borrador con IA.');
      setShowDraftModal(true);
    } finally {
      setDrafting(false);
    }
  };

  const handleSaveDocument = async () => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: docType,
          title: prompt.substring(0, 50) + '...',
          content: draftContent,
        }),
      });
      const newDoc = await res.json();
      setDocuments([newDoc, ...documents]);
      setShowDraftModal(false);
      setPrompt('');
      setDraftContent('');
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('print-area');
    if (!element) return;
    
    element.classList.remove('hidden');
    
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${selectedDoc.folio}.pdf`);
  };

  const handleShareWA = () => {
    const text = `Hola, te enviamos el documento ${selectedDoc.folio} (${selectedDoc.type}) emitido por ${config?.name}. Fecha: ${format(new Date(selectedDoc.createdAt), "d MMM yyyy", { locale: es })}`;
    shareWhatsApp(text);
  };

  const handleShareEmail = () => {
    const subject = `Documento ${selectedDoc.folio} - ${config?.name}`;
    const body = `Estimado(a),\n\nAdjunto enviamos el documento ${selectedDoc.type} folio ${selectedDoc.folio}.\n\nSaludos cordiales,\nLa Directiva`;
    shareEmail(subject, body);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const res = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: docType,
            title: file.name,
            content: `Archivo cargado: ${file.name}`,
            fileData: base64,
          }),
        });
        const newDoc = await res.json();
        setDocuments([newDoc, ...documents]);
      } catch (error) {
        console.error(error);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredDocs = filterType === 'Todos' 
    ? documents 
    : documents.filter(d => d.type === filterType);

  if (loading) return <div className="flex items-center justify-center h-full">Cargando...</div>;

  if (!canAccess('/secretaria')) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-full">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Acceso Denegado</h2>
        <p className="text-slate-500 text-center max-w-md">
          No tienes los permisos necesarios para acceder a la secretaría.
          Contacta al administrador si crees que esto es un error.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Secretaría y Documentación</h1>
          <p className="text-slate-500 mt-2">Gestión de actas, circulares y documentos importantes.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Cargando...' : 'Cargar Documento'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.doc,.docx,.jpg,.png"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 no-print">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-emerald-600" />
              Redacción Asistida por IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Documento</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Oficio">Oficio</option>
                <option value="Carta">Carta</option>
                <option value="Acta">Acta</option>
                <option value="Circular">Circular</option>
                <option value="Importante">Documento Importante</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tema o Detalles</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Solicitar a la municipalidad la limpieza del terreno colindante..."
                className="w-full py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px] resize-none"
              />
            </div>
            <button
              onClick={handleDraft}
              disabled={drafting || !prompt}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {drafting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {drafting ? 'Redactando...' : 'Generar Borrador'}
            </button>
          </CardContent>
        </Card>

        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Archivo de Documentos</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs py-1 px-2 rounded-lg border border-slate-200 focus:outline-none bg-white font-medium"
              >
                <option value="Todos">Todos</option>
                <option value="Oficio">Oficios</option>
                <option value="Carta">Cartas</option>
                <option value="Acta">Actas</option>
                <option value="Circular">Circulares</option>
                <option value="Importante">Importantes</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {filteredDocs.length === 0 ? (
                <p className="text-sm text-slate-500">No hay documentos registrados.</p>
              ) : (
                filteredDocs.map((doc) => (
                  <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 p-4 rounded-xl hover:bg-slate-50 transition-colors gap-4 group">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${doc.status === 'Cargado' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                        {doc.status === 'Cargado' ? <Upload className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                            {doc.folio}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            doc.status === 'Firmado' ? 'bg-blue-100 text-blue-700' : 
                            doc.status === 'Cargado' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {doc.status}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{doc.type}</span>
                        </div>
                        <p className="font-bold text-sm text-slate-900 mt-1">{doc.title}</p>
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">
                          {format(new Date(doc.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:self-center self-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSelectedDoc(doc)}
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Ver Documento"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {doc.fileData && (
                        <a 
                          href={doc.fileData} 
                          download={doc.title}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Descargar Archivo"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Draft Modal */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 no-print">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Borrador: {docType}</h2>
              <button onClick={() => setShowDraftModal(false)} className="text-slate-400 hover:text-slate-600">
                Cerrar
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                className="w-full h-[400px] p-4 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-sans text-sm leading-relaxed"
              />
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowDraftModal(false)}
                className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveDocument}
                className="px-4 py-2 rounded-lg font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Guardar Documento
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Document View Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 no-print">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Documento: {selectedDoc.folio}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={handlePrint} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors" title="Imprimir">
                  <Printer className="h-4 w-4" />
                </button>
                <button onClick={handleDownloadPDF} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors" title="Descargar PDF">
                  <Download className="h-4 w-4" />
                </button>
                <button onClick={handleShareWA} className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors" title="Enviar por WhatsApp">
                  <MessageCircle className="h-4 w-4" />
                </button>
                <button onClick={handleShareEmail} className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors" title="Enviar por Correo">
                  <Mail className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <button onClick={() => setSelectedDoc(null)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Preview Area (also used for PDF generation) */}
            <div className="p-12 overflow-y-auto bg-white text-black flex-1" id="print-area">
              {selectedDoc.fileData ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6 py-12">
                  <div className="p-6 bg-slate-50 rounded-full">
                    <Upload className="h-12 w-12 text-slate-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{selectedDoc.title}</p>
                    <p className="text-sm text-slate-500 mt-1">Este documento es un archivo externo cargado al sistema.</p>
                  </div>
                  <a 
                    href={selectedDoc.fileData} 
                    download={selectedDoc.title}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                  >
                    <Download className="h-5 w-5" />
                    Descargar Archivo
                  </a>
                  {selectedDoc.fileData.startsWith('data:image') && (
                    <div className="mt-8 border border-slate-100 rounded-2xl overflow-hidden max-w-full shadow-sm">
                      <img src={selectedDoc.fileData} alt={selectedDoc.title} className="max-w-full h-auto" />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      {config?.logo && (
                        <Image src={config.logo} alt="Logo" width={64} height={64} className="h-16 object-contain mb-2" referrerPolicy="no-referrer" />
                      )}
                      <p className="font-bold text-sm uppercase">{config?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Folio: {selectedDoc.folio}</p>
                      <p className="text-sm">Fecha: {format(new Date(selectedDoc.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-center mb-8 uppercase tracking-widest border-b-2 border-black pb-2">{selectedDoc.type}</h2>
                  <div className="whitespace-pre-wrap text-justify leading-relaxed mb-24">
                    {selectedDoc.content}
                  </div>
                  <div className="flex justify-around mt-16 pt-16">
                    <div className="text-center border-t border-black w-48 pt-2">
                      <p className="font-bold">Presidente</p>
                      <p className="text-sm">{config?.name}</p>
                    </div>
                    <div className="text-center border-t border-black w-48 pt-2">
                      <p className="font-bold">Secretario</p>
                      <p className="text-sm">{config?.name}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
