'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wallet, Calendar, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'motion/react';
import { useAuth } from '@/components/AuthProvider';
import { GoogleGenAI } from '@google/genai';

export default function Dashboard() {
  const { role } = useAuth();
  const [data, setData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  const generateAnalysis = async () => {
    if (!data) return;
    setAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      const prompt = `Actúa como un analista financiero para un comité de vivienda llamado "Tierra Esperanza".
      Aquí están los datos actuales:
      - Ingresos totales: $${data.income}
      - Egresos totales: $${data.expenses}
      - Saldo actual: $${data.balance}
      - Socios activos: ${data.activeMembers}
      
      Genera un breve resumen ejecutivo (máximo 3 párrafos) sobre la salud financiera del comité, detectando tendencias y dando una recomendación.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAnalysis(response.text || 'No se pudo generar el análisis.');
    } catch (error) {
      console.error(error);
      setAnalysis('Error al generar el análisis con IA.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || !data) return <div className="flex items-center justify-center h-full">Cargando...</div>;

  const canSeeFinancials = role === 'Administrador' || role === 'Tesorero';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Panel de Control</h1>
        <p className="text-slate-500 mt-2">Visión general del estado del comité Tierra Esperanza.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {canSeeFinancials && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Saldo en Caja</CardTitle>
                <Wallet className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  ${data.balance.toLocaleString('es-CL')}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Ingresos: ${data.income.toLocaleString('es-CL')} | Egresos: ${data.expenses.toLocaleString('es-CL')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Socios Activos</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{data.activeMembers}</div>
              <p className="text-xs text-slate-500 mt-1">
                De un total de {data.totalMembers} socios registrados
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Próxima Asamblea</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {data.upcomingAssemblies.length > 0 
                  ? format(new Date(data.upcomingAssemblies[0].date), "d MMM yyyy", { locale: es })
                  : 'Ninguna'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {data.upcomingAssemblies.length > 0 ? data.upcomingAssemblies[0].type : 'No hay asambleas programadas'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {canSeeFinancials && (
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Análisis Financiero con IA</CardTitle>
            </CardHeader>
            <CardContent>
              {!analysis ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Activity className="h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-slate-500 mb-4 max-w-sm">
                    Utiliza Google Gemini para generar un resumen ejecutivo sobre la salud financiera del comité.
                  </p>
                  <button
                    onClick={generateAnalysis}
                    disabled={analyzing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {analyzing ? 'Analizando...' : 'Generar Análisis'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                    {analysis}
                  </div>
                  <button
                    onClick={() => setAnalysis('')}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Limpiar análisis
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className={canSeeFinancials ? "col-span-3" : "col-span-7"}>
          <CardHeader>
            <CardTitle>Próximas Asambleas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.upcomingAssemblies.length === 0 ? (
                <p className="text-sm text-slate-500">No hay asambleas programadas.</p>
              ) : (
                data.upcomingAssemblies.map((assembly: any) => (
                  <div key={assembly.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-slate-900">{assembly.type}</p>
                      <p className="text-sm text-slate-500">
                        {format(new Date(assembly.date), "EEEE d 'de' MMMM, HH:mm", { locale: es })}
                      </p>
                    </div>
                    <div className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-600">
                      {assembly.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
