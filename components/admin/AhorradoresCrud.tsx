import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import React, { useState, useEffect } from "react";
import { Calendar, Edit3, Trash2, CheckCircle, XCircle, DollarSign, ChevronDown, ChevronUp, Clock, Award, User, Info } from "lucide-react";

export default function AhorradoresCrud() {
  interface Ahorrador {
    id: string;
    nombre: string;
    cedula: string;
    fechaIngreso: string;
    montoMes: string;
    telefono: string;
    direccion: string;
    email: string;
    ahorroTotal: number;
    pagosConsecutivos: number;
    historialPagos: Record<string, { pagado: boolean; monto: number }>;
    incentivoPorFidelidad: boolean;
  }

  const [ahorradores, setAhorradores] = useState<Ahorrador[]>([]);
  const [mesesEstado, setMesesEstado] = useState<string[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [detallesExpandidos, setDetallesExpandidos] = useState<Record<string, boolean>>({});
  const [mostrarInfoFidelidad, setMostrarInfoFidelidad] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState<Ahorrador>({
    id: "",
    nombre: "",
    cedula: "",
    fechaIngreso: "",
    montoMes: "",
    telefono: "",
    direccion: "",
    email: "",
    ahorroTotal: 0,
    pagosConsecutivos: 0,
    historialPagos: {},
    incentivoPorFidelidad: false
  });

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('ahorradores');
    if (savedData) {
      try {
        setAhorradores(JSON.parse(savedData));
      } catch (e) {
        console.error("Error al cargar datos guardados:", e);
      }
    }
  }, []);

  // Guardar en localStorage cuando cambian los ahorradores
  useEffect(() => {
    if (ahorradores.length > 0) {
      localStorage.setItem('ahorradores', JSON.stringify(ahorradores));
    }
  }, [ahorradores]);

  // Generar un ID único para cada ahorrador
  const generarId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Generar meses desde la fecha de inicio hasta hoy + ciclo anual completo
  const generarMesesDesdeInicio = (fechaInicio: string): string[] => {
    const meses = [];
    const fechaInicioObj = new Date(fechaInicio);
    const hoy = new Date();
    
    // Asegurar que siempre tengamos 12 meses (ciclo anual completo)
    const fechaFinal = new Date(hoy);
    fechaFinal.setMonth(fechaFinal.getMonth() + 12);
    
    let fechaActual = new Date(fechaInicioObj);
    
    while (fechaActual <= fechaFinal) {
      const año = fechaActual.getFullYear();
      const mes = fechaActual.getMonth();
      const mesFormateado = `${año}-${(mes + 1).toString().padStart(2, '0')}`;
      meses.push(mesFormateado);
      
      // Avanzar al siguiente mes
      fechaActual.setMonth(fechaActual.getMonth() + 1);
    }
    
    // Retornamos solo los primeros 12 meses para el ciclo anual
    return meses.slice(0, 12);
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    setForm({
      id: "",
      nombre: "",
      cedula: "",
      fechaIngreso: "",
      montoMes: "",
      telefono: "",
      direccion: "",
      email: "",
      ahorroTotal: 0,
      pagosConsecutivos: 0,
      historialPagos: {},
      incentivoPorFidelidad: false
    });
    setMesesEstado([]);
    setEditandoIndex(null);
  };

  // Manejar cambio de fecha de ingreso
  const handleFechaIngresoChange = (fecha: string) => {
    const mesesGenerados = generarMesesDesdeInicio(fecha);
    setMesesEstado(mesesGenerados);
    
    // Inicializar el historial de pagos con los meses generados
    const historialInicial: Record<string, { pagado: boolean; monto: number }> = {};
    mesesGenerados.forEach(mes => {
      historialInicial[mes] = { pagado: false, monto: 0 };
    });
    
    setForm({
      ...form,
      fechaIngreso: fecha,
      historialPagos: historialInicial
    });
  };

  // Alternar el estado de pago de un mes
  const alternarEstadoPago = (index: number, mes: string) => {
    const ahorradorActualizado = { ...ahorradores[index] };
    ahorradorActualizado.historialPagos[mes].pagado = !ahorradorActualizado.historialPagos[mes].pagado;
    
    // Recalcular pagos consecutivos
    calcularPagosConsecutivos(ahorradorActualizado);
    
    // Recalcular ahorro total
    recalcularAhorroTotal(ahorradorActualizado);
    
    // Actualizar lista de ahorradores
    const nuevosAhorradores = [...ahorradores];
    nuevosAhorradores[index] = ahorradorActualizado;
    setAhorradores(nuevosAhorradores);
  };

  // Alternar estado de pago en el formulario
  const alternarEstadoPagoFormulario = (mes: string) => {
    const historialActualizado = { ...form.historialPagos };
    historialActualizado[mes].pagado = !historialActualizado[mes].pagado;
    
    const formActualizado = { ...form, historialPagos: historialActualizado };
    calcularPagosConsecutivos(formActualizado);
    
    setForm(formActualizado);
  };

  // Calcular pagos consecutivos y activar incentivo desde el segundo mes
  const calcularPagosConsecutivos = (ahorrador: Ahorrador) => {
    let consecutivos = 0;
    const mesesOrdenados = Object.keys(ahorrador.historialPagos).sort();
    
    for (const mes of mesesOrdenados) {
      if (ahorrador.historialPagos[mes].pagado) {
        consecutivos++;
      } else {
        break;
      }
    }
    
    ahorrador.pagosConsecutivos = consecutivos;
    // Activar incentivo con 2 o más pagos consecutivos
    ahorrador.incentivoPorFidelidad = consecutivos >= 2;
  };

  // Recalcular ahorro total basado en historial de pagos
  const recalcularAhorroTotal = (ahorrador: Ahorrador) => {
  let ahorroAcumulado = 0;
  const mesesOrdenados = Object.keys(ahorrador.historialPagos).sort();
  for (const mes of mesesOrdenados) {
    const pago = ahorrador.historialPagos[mes];
    if (pago.pagado) {
      const montoMes = pago.monto || 0;
      ahorroAcumulado += montoMes;
    }
  }
  ahorrador.ahorroTotal = ahorroAcumulado;
};

  // Guardar ahorrador
  const guardarAhorrador = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ahorradorCompleto = {
      ...form,
      id: form.id || generarId()
    };
    
    // Calcular pagos consecutivos y ahorro total antes de guardar
    calcularPagosConsecutivos(ahorradorCompleto);
    recalcularAhorroTotal(ahorradorCompleto);
    
    if (editandoIndex !== null) {
      // Editar existente
      const nuevosAhorradores = [...ahorradores];
      nuevosAhorradores[editandoIndex] = ahorradorCompleto;
      setAhorradores(nuevosAhorradores);
    } else {
      // Agregar nuevo
      setAhorradores([...ahorradores, ahorradorCompleto]);
    }
    
    limpiarFormulario();
    setMostrarFormulario(false);
  };

  // Editar ahorrador
  const editarAhorrador = (index: number) => {
    const ahorrador = ahorradores[index];
    setForm(ahorrador);
    setEditandoIndex(index);
    setMostrarFormulario(true);
    
    // Regenerar meses desde la fecha de ingreso
    const mesesGenerados = generarMesesDesdeInicio(ahorrador.fechaIngreso);
    setMesesEstado(mesesGenerados);
  };

  // Eliminar ahorrador
  const eliminarAhorrador = (index: number) => {
    if (confirm("¿Estás seguro de eliminar este ahorrador? Esta acción no se puede deshacer.")) {
      const nuevosAhorradores = ahorradores.filter((_, i) => i !== index);
      setAhorradores(nuevosAhorradores);
    }
  };

  // Alternar detalles expandidos
  const alternarDetalles = (id: string) => {
    setDetallesExpandidos({
      ...detallesExpandidos,
      [id]: !detallesExpandidos[id]
    });
  };

  // Formatear fecha para presentación
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear mes para presentación
  const formatearMes = (mesStr: string) => {
    const [año, mes] = mesStr.split('-');
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[parseInt(mes) - 1]} ${año}`;
  };

  // Calcular tasa de interés actual
  const calcularTasaInteres = (ahorrador: Ahorrador) => {
    const tasaBase = 6;
    const bonusFidelidad = ahorrador.incentivoPorFidelidad ? 1 : 0;
    return tasaBase + bonusFidelidad; // Devuelve el número
  };

  // Formatear moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Filtrar ahorradores según la búsqueda
  const ahorradoreFiltrados = ahorradores.filter(ahorrador => 
    ahorrador.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    ahorrador.cedula.includes(busqueda)
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-900 text-gray-200 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-4 sm:mb-0">Sistema de Gestión de Ahorradores</h1>
        <button
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg shadow flex items-center w-full sm:w-auto justify-center transition-colors"
          onClick={() => {
            limpiarFormulario();
            setMostrarFormulario(!mostrarFormulario);
          }}
        >
          {mostrarFormulario ? "Cancelar" : "Nuevo Ahorrador"}
        </button>
      </div>
      
      {mostrarFormulario && (
        <div className="bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 mb-8 border border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-emerald-400">
            {editandoIndex !== null ? "Editar Ahorrador" : "Registrar Nuevo Ahorrador"}
          </h2>
          <form onSubmit={guardarAhorrador} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nombre completo</label>
              <input
                required
                className="p-3 border border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-700 text-white"
                placeholder="Nombre y apellidos"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Número de cédula</label>
              <input
                required
                className="p-3 border border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-700 text-white"
                placeholder="Ej: 123456789"
                value={form.cedula}
                onChange={e => setForm({ ...form, cedula: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Fecha de ingreso</label>
              <div className="relative">
                <input
                  required
                  className="p-3 pl-10 border border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-700 text-white"
                  type="date"
                  value={form.fechaIngreso}
                  onChange={e => handleFechaIngresoChange(e.target.value)}
                />
                <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Primer Aporte</label>
              <div className="relative">
                <input
                  required
                  className="p-3 pl-10 border border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-700 text-white"
                  type="number"
                  placeholder="Ej: 100000"
                  value={form.montoMes}
                  onChange={e => setForm({ ...form, montoMes: e.target.value })}
                />
                <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
              <input
                required
                className="p-3 border border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-700 text-white"
                placeholder="Ej: 3001234567"
                value={form.telefono}
                onChange={e => setForm({ ...form, telefono: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Dirección</label>
              <input
                required
                className="p-3 border border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-700 text-white"
                placeholder="Dirección completa"
                value={form.direccion}
                onChange={e => setForm({ ...form, direccion: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Correo electrónico</label>
              <input
                type="email"
                className="p-3 border border-gray-600 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-700 text-white"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mb-4">
                <div className="flex items-center mb-2">
                  <Award size={18} className="text-yellow-500 mr-2" />
                  <h3 className="text-lg font-medium text-emerald-400">Programa de Fidelidad</h3>
                  <button 
                    type="button"
                    className="ml-2 p-1 rounded-full hover:bg-gray-700"
                    onClick={() => setMostrarInfoFidelidad(!mostrarInfoFidelidad)}
                  >
                    <Info size={16} className="text-gray-400" />
                  </button>
                </div>
                
                {mostrarInfoFidelidad && (
                  <div className="mb-3 p-3 text-sm text-gray-300 bg-gray-800 rounded-lg border border-gray-700">
                    <p>El programa de fidelidad otorga un <strong className="text-emerald-400">1% adicional de rendimiento anual</strong> a partir del segundo mes consecutivo de ahorro.</p>
                    <p className="mt-1">Si se interrumpe el ahorro mensual, la racha se pierde y el beneficio se suspende hasta alcanzar nuevamente 2 meses consecutivos.</p>
                  </div>
                )}
              </div>
            </div>
            
            {mesesEstado.length > 0 && (
              <div className="md:col-span-2 mt-2">
                <h3 className="text-lg font-semibold mb-3 text-gray-200">Estado de pagos mensuales:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {mesesEstado.map((mes, index) => (
                    <div key={index} className="p-2 bg-gray-800 rounded-lg flex flex-col items-center">
                      <span className="text-xs mb-1">{formatearMes(mes)}</span>
                      <input
                        type="number"
                        min="0"
                        className="w-20 p-1 rounded bg-gray-700 text-white text-xs mb-1"
                        placeholder="Aporte"
                        value={form.historialPagos[mes]?.monto ?? ""}
                        onChange={e => {
                          const nuevoHistorial = { ...form.historialPagos };
                          nuevoHistorial[mes] = {
                            ...nuevoHistorial[mes],
                            monto: parseFloat(e.target.value) || 0,
                          };
                          setForm({ ...form, historialPagos: nuevoHistorial });
                        }}
                      />
                      <button
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${form.historialPagos[mes]?.pagado ? "bg-emerald-600" : "bg-gray-600"}`}
                        type="button"
                        onClick={() => {
                          const nuevoHistorial = { ...form.historialPagos };
                          nuevoHistorial[mes] = {
                            ...nuevoHistorial[mes],
                            pagado: !nuevoHistorial[mes]?.pagado,
                          };
                          setForm({ ...form, historialPagos: nuevoHistorial });
                        }}
                      >
                        {form.historialPagos[mes]?.pagado ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-medium shadow-md transition-colors"
              >
                {editandoIndex !== null ? "Actualizar Ahorrador" : "Guardar Nuevo Ahorrador"}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {!mostrarFormulario && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}
      
      {ahorradores.length === 0 ? (
        <div className="bg-gray-800 p-8 text-center rounded-lg border border-gray-700">
          <p className="text-gray-400 mb-3">No hay ahorradores registrados aún.</p>
          <div className="flex flex-col items-center">
            <svg className="w-20 h-20 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <button
              className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg shadow transition-colors"
              onClick={() => {
                limpiarFormulario();
                setMostrarFormulario(true);
              }}
            >
              Registrar mi primer ahorrador
            </button>
          </div>
        </div>
      ) : ahorradoreFiltrados.length === 0 ? (
        <div className="bg-gray-800 p-6 text-center rounded-lg border border-gray-700">
          <p className="text-gray-400">No se encontraron ahorradores que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {ahorradoreFiltrados.map((ahorrador, index) => {
            // Encontrar el índice real en el array original
            const indiceOriginal = ahorradores.findIndex(a => a.id === ahorrador.id);
            
            return (
              <div key={ahorrador.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
                <div className="bg-emerald-800 text-white p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-xl text-white">{ahorrador.nombre}</h3>
                      <p className="text-emerald-200">CC: {ahorrador.cedula}</p>
                    </div>
                    {ahorrador.incentivoPorFidelidad && (
                      <div className="bg-yellow-600 text-white p-1 px-2 rounded-full flex items-center">
                        <Award size={16} className="mr-1" />
                        <span className="text-xs font-medium">+1% Fidelidad</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Fecha de ingreso</p>
                      <p className="font-medium text-gray-200">{formatearFecha(ahorrador.fechaIngreso)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Monto mensual</p>
                      <p className="font-medium text-gray-200">{formatCurrency(parseFloat(ahorrador.montoMes))}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 p-3 rounded-lg mb-4 border border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400">Ahorro total</p>
                        <p className="font-bold text-xl text-emerald-400">
                          {formatCurrency(ahorrador.ahorroTotal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Rendimiento</p>
                        <p className="font-bold text-emerald-400">
                          {calcularTasaInteres(ahorrador)}% anual
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Ganancia estimada:</p>
                        <p className="font-bold text-emerald-300">
                          {formatCurrency(ahorrador.ahorroTotal * (calcularTasaInteres(ahorrador) / 100))}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-gray-300">Estado de pagos:</p>
                      <div className="text-xs text-emerald-400 flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{ahorrador.pagosConsecutivos} consecutivos</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {/* ...los cuadritos... */}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <button 
                      className="w-full text-sm text-gray-400 flex items-center justify-center py-1 hover:bg-gray-700 rounded transition-colors"
                      onClick={() => alternarDetalles(ahorrador.id)}
                    >
                      {detallesExpandidos[ahorrador.id] ? (
                        <>
                          <ChevronUp size={16} className="mr-1" /> 
                          Ocultar detalles
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} className="mr-1" /> 
                          Ver detalles
                        </>
                      )}
                    </button>
                  </div>
                  
                  {detallesExpandidos[ahorrador.id] && (
                    <div className="border-t border-gray-700 pt-3 mb-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center">
                          <User size={16} className="text-gray-400 mr-2" />
                          <div>
                            <span className="font-medium text-gray-200">{ahorrador.nombre}</span>
                            <span className="ml-2 text-xs text-gray-400">({ahorrador.cedula})</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar size={16} className="text-gray-400 mr-2" />
                          <span className="text-gray-300">Ingreso: {formatearFecha(ahorrador.fechaIngreso)}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign size={16} className="text-gray-400 mr-2" />
                          <span className="text-gray-300">Monto mensual: {formatCurrency(parseFloat(ahorrador.montoMes))}</span>
                        </div>
                        <div className="flex items-center">
                          <Award size={16} className="text-yellow-500 mr-2" />
                          <span className="text-gray-300">Pagos consecutivos: {ahorrador.pagosConsecutivos}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">Teléfono:</span>
                          <span className="text-gray-300">{ahorrador.telefono}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2">Dirección:</span>
                          <span className="text-gray-300">{ahorrador.direccion}</span>
                        </div>
                        {ahorrador.email && (
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-2">Email:</span>
                            <span className="text-gray-300">{ahorrador.email}</span>
                          </div>
                        )}
                        <div className="flex flex-col gap-1 mt-2">
                          <span className="text-sm font-semibold text-gray-300 mb-1">Pagos realizados:</span>
                          {Object.entries(ahorrador.historialPagos)
                            .filter(([_, { pagado }]) => pagado)
                            .map(([mes, { monto }], idx) => (
                              <div key={mes} className="flex items-center text-xs">
                                <span className="mr-2">{idx + 1}</span>
                                <span className="mr-2">{formatearMes(mes)}:</span>
                                <span className="font-semibold text-emerald-300">{formatCurrency(monto)}</span>
                              </div>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded transition-colors"
                            onClick={() => editarAhorrador(indiceOriginal)}
                          >
                            <Edit3 size={16} className="inline mr-1" /> Editar
                          </button>
                          <button
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded transition-colors"
                            onClick={() => eliminarAhorrador(indiceOriginal)}
                          >
                            <Trash2 size={16} className="inline mr-1" /> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}