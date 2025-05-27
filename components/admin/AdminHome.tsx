import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  Calendar, AlertTriangle, CheckCircle, Clock, 
  Activity, PieChart as PieChartIcon
} from 'lucide-react';
import { Ahorrador } from './AhorradoresCrud';
import { PrestamoData } from '@/lib/api/prestamos';

// Componente para mostrar una métrica con un icono y tendencia
const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'neutral',
  description,
  formatter = (val: any) => val
}: { 
  title: string;
  value: any;
  icon: any;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  formatter?: (val: any) => any;
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-md">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          <p className="text-2xl font-bold text-white">{formatter(value)}</p>
        </div>
        <div className={`p-2 rounded-full ${
          changeType === 'positive' ? 'bg-emerald-900/30 text-emerald-400' : 
          changeType === 'negative' ? 'bg-red-900/30 text-red-400' : 
          'bg-gray-700 text-gray-400'
        }`}>
          <Icon size={20} />
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center mt-2">
          {changeType === 'positive' ? <TrendingUp size={16} className="text-emerald-400 mr-1" /> : 
           changeType === 'negative' ? <TrendingDown size={16} className="text-red-400 mr-1" /> : null}
          <span className={`text-sm ${
            changeType === 'positive' ? 'text-emerald-400' : 
            changeType === 'negative' ? 'text-red-400' : 
            'text-gray-400'
          }`}>
            {change > 0 ? '+' : ''}{change}% {changeType === 'positive' ? 'incremento' : changeType === 'negative' ? 'decremento' : ''} 
          </span>
        </div>
      )}
      {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
    </div>
  );
};

// Función para formatear moneda colombiana
const formatearMoneda = (valor: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
};

// Función para formatear fechas
const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function AdminHome() {
  const [ahorradores, setAhorradores] = useState<Ahorrador[]>([]);
  const [prestamos, setPrestamos] = useState<PrestamoData[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metricas, setMetricas] = useState({
    totalAhorros: 0,
    totalPrestamos: 0,
    interesGenerado: 0,
    saldoTotal: 0,
    totalAhorradores: 0,
    totalDeudores: 0,
    prestamosPorVencer: 0,
    prestamosVencidos: 0,
    tasaPromedio: 0,
    crecimientoMensual: 0
  });
  
  // Cargar datos de ahorradores y préstamos
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        // Cargar ahorradores
        const resAhorradores = await fetch('/api/ahorradores');
        if (!resAhorradores.ok) throw new Error('Error al cargar ahorradores');
        const dataAhorradores = await resAhorradores.json();
        
        // Cargar préstamos
        const resPrestamos = await fetch('/api/prestamos');
        if (!resPrestamos.ok) throw new Error('Error al cargar préstamos');
        const dataPrestamos = await resPrestamos.json();
        
        setAhorradores(dataAhorradores);
        setPrestamos(dataPrestamos);
        
        // Calcular métricas
        calcularMetricas(dataAhorradores, dataPrestamos);
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'Error al cargar datos');
      } finally {
        setCargando(false);
      }
    };
    
    cargarDatos();
  }, []);
  
  // Calcular métricas basadas en los datos
  const calcularMetricas = (ahorradores: Ahorrador[], prestamos: PrestamoData[]) => {
    // Calcular totales
    const totalAhorros = ahorradores.reduce((sum, a) => sum + a.ahorroTotal, 0);
    const totalPrestamos = prestamos.reduce((sum, p) => sum + p.monto, 0);
    
    // Calcular interés generado por ahorros
    const interesGenerado = ahorradores.reduce((sum, a) => {
      const tasaAnual = 6 + (a.incentivoPorFidelidad ? 1 : 0); // 6% o 7%
      return sum + Math.round(a.ahorroTotal * (tasaAnual / 100));
    }, 0);
    
    // Calcular saldo total (ahorros + interés)
    const saldoTotal = totalAhorros + interesGenerado;
    
    // Contar ahorradores y deudores únicos
    const totalAhorradores = ahorradores.length;
    const cedulasDeudores = new Set(prestamos.map(p => p.cedula));
    const totalDeudores = cedulasDeudores.size;
    
    // Calcular préstamos por vencer (próximos 30 días) y vencidos
    const hoy = new Date();
    const treintaDiasDespues = new Date();
    treintaDiasDespues.setDate(hoy.getDate() + 30);
    
    const prestamosPorVencer = prestamos.filter(p => {
      if (p.estado !== 'Activo') return false;
      const fechaVencimiento = new Date(p.fechaVencimiento || '');
      return fechaVencimiento > hoy && fechaVencimiento <= treintaDiasDespues;
    }).length;
    
    const prestamosVencidos = prestamos.filter(p => {
      return p.estado === 'Vencido' || (
        p.estado === 'Activo' && 
        new Date(p.fechaVencimiento || '') < hoy
      );
    }).length;
    
    // Calcular tasa promedio de préstamos
    const tasaPromedio = prestamos.length > 0 
      ? prestamos.reduce((sum, p) => sum + p.tasaInteres, 0) / prestamos.length 
      : 0;
    
    // Calcular crecimiento mensual (simulado)
    const crecimientoMensual = 5.2; // Ejemplo, en un sistema real se calcularía con datos históricos
    
    setMetricas({
      totalAhorros,
      totalPrestamos,
      interesGenerado,
      saldoTotal,
      totalAhorradores,
      totalDeudores,
      prestamosPorVencer,
      prestamosVencidos,
      tasaPromedio,
      crecimientoMensual
    });
  };
  
  // Preparar datos para gráficos
  const prepararDatosPrestamos = () => {
    // Agrupar préstamos por mes
    const prestamosPorMes: Record<string, { total: number, count: number }> = {};
    
    prestamos.forEach(prestamo => {
      const fecha = new Date(prestamo.fechaDesembolso);
      const mesAno = `${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
      
      if (!prestamosPorMes[mesAno]) {
        prestamosPorMes[mesAno] = { total: 0, count: 0 };
      }
      
      prestamosPorMes[mesAno].total += prestamo.monto;
      prestamosPorMes[mesAno].count += 1;
    });
    
    // Convertir a array para el gráfico
    return Object.entries(prestamosPorMes)
      .map(([mes, datos]) => ({
        mes,
        total: datos.total,
        promedio: datos.count > 0 ? datos.total / datos.count : 0,
        cantidad: datos.count
      }))
      .sort((a, b) => {
        const [mesA, anoA] = a.mes.split('/').map(Number);
        const [mesB, anoB] = b.mes.split('/').map(Number);
        return (anoA - anoB) || (mesA - mesB);
      })
      .slice(-6); // Últimos 6 meses
  };
  
  const prepararDatosAhorros = () => {
    // Agrupar ahorros por mes basado en historialPagos
    const ahorrosPorMes: Record<string, number> = {};
    
    ahorradores.forEach(ahorrador => {
      Object.entries(ahorrador.historialPagos || {}).forEach(([mes, pago]) => {
        if (pago.pagado) {
          if (!ahorrosPorMes[mes]) {
            ahorrosPorMes[mes] = 0;
          }
          ahorrosPorMes[mes] += pago.monto;
        }
      });
    });
    
    // Convertir a array para el gráfico
    return Object.entries(ahorrosPorMes)
      .map(([mes, total]) => ({ mes, total }))
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .slice(-6); // Últimos 6 meses
  };
  
  const prepararDistribucionPrestamos = () => {
    // Agrupar préstamos por estado
    const distribucion = {
      Activo: 0,
      Pagado: 0,
      Vencido: 0,
      Refinanciado: 0
    };
    
    prestamos.forEach(prestamo => {
      distribucion[prestamo.estado] += 1;
    });
    
    // Convertir a array para el gráfico
    return Object.entries(distribucion).map(([estado, cantidad]) => ({
      estado,
      cantidad,
      porcentaje: prestamos.length > 0 ? (cantidad / prestamos.length) * 100 : 0
    }));
  };
  
  // Calcular próximos cobros
  const calcularProximosCobros = () => {
    const hoy = new Date();
    const treintaDiasDespues = new Date();
    treintaDiasDespues.setDate(hoy.getDate() + 30);
    
    // Filtrar préstamos activos
    const prestamosActivos = prestamos.filter(p => p.estado === 'Activo');
    
    // Calcular próximos cobros (simplificado)
    return prestamosActivos.map(prestamo => {
      // Calcular cuota mensual (capital + interés)
      const tasaMensual = prestamo.tasaInteres / 100 / 12;
      const cuotaMensual = (prestamo.monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -prestamo.plazoMeses));
      
      // Calcular fecha del próximo pago
      const fechaDesembolso = new Date(prestamo.fechaDesembolso);
      const fechaProximoPago = new Date(fechaDesembolso);
      
      // Encontrar el próximo pago desde hoy
      let mesesTranscurridos = 0;
      while (fechaProximoPago < hoy) {
        fechaProximoPago.setMonth(fechaProximoPago.getMonth() + 1);
        mesesTranscurridos++;
      }
      
      // Si ya pasamos el plazo total, no hay próximo pago
      if (mesesTranscurridos >= prestamo.plazoMeses) {
        return null;
      }
      
      return {
        id: prestamo.id,
        deudor: prestamo.nombreDeudor,
        cedula: prestamo.cedula,
        fechaPago: fechaProximoPago,
        cuota: cuotaMensual,
        numeroCuota: mesesTranscurridos + 1,
        totalCuotas: prestamo.plazoMeses
      };
    })
    .filter(pago => pago !== null)
    .sort((a, b) => a!.fechaPago.getTime() - b!.fechaPago.getTime())
    .slice(0, 5); // Próximos 5 pagos
  };
  
  // Datos para gráficos
  const datosPrestamos = prepararDatosPrestamos();
  const datosAhorros = prepararDatosAhorros();
  const distribucionPrestamos = prepararDistribucionPrestamos();
  const proximosCobros = calcularProximosCobros();
  
  // Colores para gráficos
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg text-red-400">
        <h2 className="text-lg font-semibold mb-2">Error al cargar datos</h2>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Panel Administrativo</h1>
      <p className="text-gray-300 mb-6">
        Bienvenido al panel administrativo. Usa el menú lateral para gestionar ahorradores, préstamos o simular un préstamo.
      </p>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Análisis Financiero</h2>
          <p className="text-gray-400 mb-6">
            Métricas y análisis del fondo de ahorros CROMU Finance Services
          </p>
        </div>
        
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total de Ahorros"
            value={metricas.totalAhorros}
            icon={DollarSign}
            change={metricas.crecimientoMensual}
            changeType="positive"
            formatter={formatearMoneda}
          />
          <MetricCard
            title="Interés Generado"
            value={metricas.interesGenerado}
            icon={TrendingUp}
            formatter={formatearMoneda}
          />
          <MetricCard
            title="Total de Préstamos"
            value={metricas.totalPrestamos}
            icon={DollarSign}
            formatter={formatearMoneda}
          />
          <MetricCard
            title="Saldo Total"
            value={metricas.saldoTotal}
            icon={Activity}
            formatter={formatearMoneda}
          />
        </div>
        
        {/* Métricas secundarias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Ahorradores"
            value={metricas.totalAhorradores}
            icon={Users}
          />
          <MetricCard
            title="Total Deudores"
            value={metricas.totalDeudores}
            icon={Users}
          />
          <MetricCard
            title="Préstamos por Vencer"
            value={metricas.prestamosPorVencer}
            icon={Clock}
            changeType={metricas.prestamosPorVencer > 0 ? "negative" : "neutral"}
          />
          <MetricCard
            title="Préstamos Vencidos"
            value={metricas.prestamosVencidos}
            icon={AlertTriangle}
            changeType={metricas.prestamosVencidos > 0 ? "negative" : "neutral"}
          />
        </div>
        
        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de evolución de préstamos */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Evolución de Préstamos</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={datosPrestamos}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="mes" 
                    stroke="#9CA3AF"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    tickFormatter={(value) => `$${value / 1000000}M`}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: any) => formatearMoneda(value)}
                    labelFormatter={(label) => `Mes: ${label}`}
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      borderColor: '#374151',
                      padding: '10px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{ paddingTop: '10px' }}
                  />
                  <Bar 
                    dataKey="total" 
                    name="Monto Total" 
                    fill="#10B981" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="cantidad" 
                    name="Cantidad" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Gráfico de evolución de ahorros */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Evolución de Ahorros</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={datosAhorros}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="mes" 
                    stroke="#9CA3AF"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    tickFormatter={(value) => `$${value / 1000000}M`}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: any) => formatearMoneda(value)}
                    labelFormatter={(label) => `Mes: ${label}`}
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      borderColor: '#374151',
                      padding: '10px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{ paddingTop: '10px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    name="Total Ahorros" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Gráficos secundarios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribución de préstamos por estado */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Distribución de Préstamos</h3>
            <div className="h-80 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <Pie
                    data={distribucionPrestamos}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cantidad"
                    nameKey="estado"
                    label={({ estado, porcentaje }) => `${porcentaje.toFixed(1)}%`}
                  >
                    {distribucionPrestamos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => [
                      `${value} préstamos (${props.payload.porcentaje.toFixed(1)}%)`, 
                      props.payload.estado
                    ]}
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      borderColor: '#374151',
                      padding: '10px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Próximos cobros */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Próximos Cobros</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Deudor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Cuota</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Progreso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {proximosCobros.length > 0 ? (
                    proximosCobros.map((cobro, index) => (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="px-4 py-3 text-sm text-white">{cobro!.deudor}</td>
                        <td className="px-4 py-3 text-sm text-white">{formatearFecha(cobro!.fechaPago.toISOString())}</td>
                        <td className="px-4 py-3 text-sm text-white text-right">{formatearMoneda(cobro!.cuota)}</td>
                        <td className="px-4 py-3 text-sm text-white">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                              <div 
                                className="bg-emerald-600 h-2.5 rounded-full" 
                                style={{ width: `${(cobro!.numeroCuota / cobro!.totalCuotas) * 100}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-xs">{cobro!.numeroCuota}/{cobro!.totalCuotas}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-sm text-gray-400 text-center">No hay próximos cobros</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Análisis y recomendaciones - Versión mejorada */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-5">Insights Financieros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center mb-3">
                <Activity className="text-emerald-400 mr-2" size={20} />
                <h4 className="font-medium text-emerald-400">Salud del Fondo</h4>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {metricas.prestamosVencidos > 3 
                  ? 'El fondo requiere atención inmediata debido a préstamos vencidos.' 
                  : 'El fondo mantiene un balance saludable entre ahorros y préstamos.'}
                {metricas.crecimientoMensual > 0 
                  ? ` Crecimiento mensual: ${metricas.crecimientoMensual}%.` 
                  : ' No hay crecimiento en el último mes.'}
              </p>
            </div>
            
            <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-blue-500/50 transition-colors">
              <div className="flex items-center mb-3">
                <AlertTriangle className={`${metricas.prestamosVencidos > 0 ? 'text-red-400' : 'text-blue-400'} mr-2`} size={20} />
                <h4 className="font-medium text-blue-400">Alertas</h4>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {metricas.prestamosVencidos > 0 || metricas.prestamosPorVencer > 0 
                  ? `${metricas.prestamosVencidos > 0 ? `${metricas.prestamosVencidos} préstamos vencidos. ` : ''}${metricas.prestamosPorVencer > 0 ? `${metricas.prestamosPorVencer} préstamos vencen pronto.` : ''}`
                  : 'No hay alertas activas. Todos los préstamos están al día.'}
              </p>
            </div>
            
            <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-purple-500/50 transition-colors">
              <div className="flex items-center mb-3">
                <TrendingUp className="text-purple-400 mr-2" size={20} />
                <h4 className="font-medium text-purple-400">Oportunidades</h4>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {metricas.totalAhorros > 0 && metricas.totalPrestamos < metricas.totalAhorros * 0.7 
                  ? 'Potencial para aumentar préstamos y maximizar rendimientos.' 
                  : metricas.totalAhorros > 0 && metricas.totalPrestamos > metricas.totalAhorros * 0.9 
                  ? 'Buscar nuevos ahorradores para equilibrar el fondo.' 
                  : 'El fondo mantiene un balance óptimo entre ahorros y préstamos.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}