import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, 
  Wallet, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  UserPlus, 
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'motion/react';
import { useAuth } from '@/components/AuthProvider';
import { GoogleGenAI } from '@google/genai';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

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

  if (loading || !data) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Cargando panel de control...</p>
    </div>
  );

  const canSeeFinancials = role === 'Administrador' || role === 'Tesorero';

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp': return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
      case 'TrendingDown': return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case 'UserPlus': return <UserPlus className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Panel de Control</h1>
          <p className="text-slate-500 mt-1">Visión general del estado del comité Tierra Esperanza.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
          <Clock className="h-4 w-4" />
          Actualizado: {format(new Date(), "d 'de' MMMM, HH:mm", { locale: es })}
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {canSeeFinancials && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium opacity-80">Saldo en Caja</CardTitle>
                <Wallet className="h-4 w-4 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${data.balance.toLocaleString('es-CL')}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs opacity-90">
                  <span className="flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> ${data.income.toLocaleString('es-CL')}</span>
                  <span className="opacity-50">|</span>
                  <span className="flex items-center gap-0.5"><TrendingDown className="h-3 w-3" /> ${data.expenses.toLocaleString('es-CL')}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Socios Activos</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{data.activeMembers}</div>
              <p className="text-xs text-slate-500 mt-1">
                De un total de <span className="font-semibold">{data.totalMembers}</span> socios
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">RHS Cumplimiento</CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {data.totalMembers > 0 ? Math.round((data.hogarSocialSegments.cumple / data.totalMembers) * 100) : 0}%
              </div>
              <div className="flex gap-2 mt-1">
                <div className="h-1.5 flex-1 bg-emerald-500 rounded-full" style={{ width: `${(data.hogarSocialSegments.cumple / data.totalMembers) * 100}%` }}></div>
                <div className="h-1.5 flex-1 bg-yellow-500 rounded-full" style={{ width: `${(data.hogarSocialSegments.observado / data.totalMembers) * 100}%` }}></div>
                <div className="h-1.5 flex-1 bg-red-500 rounded-full" style={{ width: `${(data.hogarSocialSegments.noCumple / data.totalMembers) * 100}%` }}></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Próxima Asamblea</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-slate-900 truncate">
                {data.upcomingAssemblies.length > 0 
                  ? format(new Date(data.upcomingAssemblies[0].date), "d 'de' MMM", { locale: es })
                  : 'Sin fecha'}
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {data.upcomingAssemblies.length > 0 ? data.upcomingAssemblies[0].type : 'No hay programadas'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {canSeeFinancials && (
          <Card className="lg:col-span-2 shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Flujo de Caja Mensual</CardTitle>
              <CardDescription>Comparativa de ingresos y egresos de los últimos 6 meses.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => [`$${value.toLocaleString('es-CL')}`, '']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar dataKey="egresos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Estado de Socios</CardTitle>
            <CardDescription>Distribución por estado actual.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.memberStatusStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.memberStatusStats.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & AI Analysis */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Actividad Reciente</CardTitle>
              <CardDescription>Últimos movimientos y registros en el sistema.</CardDescription>
            </div>
            <FileText className="h-5 w-5 text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Activity className="h-12 w-12 opacity-20 mb-2" />
                  <p>No hay actividad reciente registrada.</p>
                </div>
              ) : (
                data.recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-slate-50 rounded-full border border-slate-100">
                      {getActivityIcon(activity.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">{activity.title}</p>
                        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                          {format(new Date(activity.date), "d MMM", { locale: es })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{activity.subtitle}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          {canSeeFinancials && (
            <Card className="shadow-sm border-slate-200 bg-slate-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Análisis Financiero IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!analysis ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-500 mb-4">
                      Genera un análisis inteligente de la situación financiera actual.
                    </p>
                    <button
                      onClick={generateAnalysis}
                      disabled={analyzing}
                      className="w-full bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
                    >
                      {analyzing ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="h-3 w-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                          Analizando...
                        </span>
                      ) : 'Generar Informe IA'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-sm italic">
                      &quot;{analysis}&quot;
                    </div>
                    <button
                      onClick={() => setAnalysis('')}
                      className="text-xs text-slate-400 hover:text-slate-600 font-medium underline"
                    >
                      Nuevo análisis
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Próximas Asambleas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.upcomingAssemblies.length === 0 ? (
                  <p className="text-sm text-slate-500">No hay asambleas programadas.</p>
                ) : (
                  data.upcomingAssemblies.slice(0, 3).map((assembly: any) => (
                    <div key={assembly.id} className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                          {assembly.type}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {format(new Date(assembly.date), "d MMM", { locale: es })}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {format(new Date(assembly.date), "HH:mm 'hrs'", { locale: es })}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{assembly.status}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
