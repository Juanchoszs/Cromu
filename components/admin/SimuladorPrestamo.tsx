import React, { useState, useEffect } from "react";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatDecimal = (value: number): string => {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

function calcularFrancesa(monto: number, tasa: number, plazo: number) {
  const mensual = tasa / 100;
  const cuota = monto * (mensual * Math.pow(1 + mensual, plazo)) / (Math.pow(1 + mensual, plazo) - 1);
  let saldo = monto;
  const tabla = [];
  
  let totalPagado = 0;
  let totalInteres = 0;
  
  for (let i = 1; i <= plazo; i++) {
    const interes = saldo * mensual;
    const abono = cuota - interes;
    saldo -= abono;
    
    totalInteres += interes;
    totalPagado += cuota;
    
    tabla.push({
      mes: i,
      cuota: cuota,
      interes: interes,
      abono: abono,
      saldo: saldo > 0 ? saldo : 0,
    });
  }
  
  return {
    tabla,
    resumen: {
      cuotaMensual: cuota,
      totalPagado: totalPagado,
      totalInteres: totalInteres,
      totalCapital: monto
    }
  };
}

const montosPreconfigurados = [
  { label: "1 millón", valor: 1000000 },
  { label: "3 millones", valor: 3000000 },
  { label: "5 millones", valor: 5000000 }
];

const plazosPreconfigurados = [
  { label: "12 meses", valor: 12 },
  { label: "24 meses", valor: 24 },
  { label: "36 meses", valor: 36 },
  { label: "48 meses", valor: 48 }
];

export default function SimuladorPrestamo() {
  const [monto, setMonto] = useState("");
  const [tasa, setTasa] = useState("");
  const [plazo, setPlazo] = useState("");
  const [resultado, setResultado] = useState<{
    tabla: { mes: number; cuota: number; interes: number; abono: number; saldo: number }[];
    resumen: { cuotaMensual: number; totalPagado: number; totalInteres: number; totalCapital: number };
  } | null>(null);
  const [montoPersonalizado, setMontoPersonalizado] = useState(true);
  const [plazoPersonalizado, setPlazoPersonalizado] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 12;

  useEffect(() => {
    if (resultado && resultado.tabla.length > itemsPorPagina) {
      setPaginaActual(1);
    }
  }, [resultado]);

  const handleCalcular = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const m = parseFloat(monto);
    const t = parseFloat(tasa);
    const p = parseInt(plazo);
    if (m > 0 && t > 0 && p > 0) {
      setResultado(calcularFrancesa(m, t, p));
    }
  };

  const seleccionarMontoPreconfigurado = (valor: number) => {
    setMonto(valor.toString());
    setMontoPersonalizado(false);
  };

  const seleccionarPlazoPreconfigurado = (valor: number) => {
    setPlazo(valor.toString());
    setPlazoPersonalizado(false);
  };

  const handleChangeMontoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonto(e.target.value);
    setMontoPersonalizado(true);
  };

  const handleChangePlazoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlazo(e.target.value);
    setPlazoPersonalizado(true);
  };

  const filasTabla = resultado?.tabla || [];
  const totalPaginas = Math.ceil(filasTabla.length / itemsPorPagina);
  const filasPaginadas = filasTabla.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-8 text-center text-white">
        Simulador de Préstamos
      </h2>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-200">
          Parámetros del Préstamo
        </h3>
        
        <form onSubmit={handleCalcular}>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Monto del préstamo
              </label>
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {montosPreconfigurados.map((opcion) => (
                    <button
                      key={opcion.valor}
                      type="button"
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        !montoPersonalizado && monto === opcion.valor.toString()
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-700 text-gray-200 hover:bg-emerald-500 hover:text-white"
                      }`}
                      onClick={() => seleccionarMontoPreconfigurado(opcion.valor)}
                    >
                      {opcion.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">$</span>
                <input
                  className="w-full pl-8 p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                  placeholder="Ingrese monto"
                  value={monto}
                  onChange={handleChangeMontoInput}
                  type="number"
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tasa de interés mensual (%)
              </label>
              <input
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                placeholder="Ej: 1.5"
                value={tasa}
                onChange={(e) => setTasa(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Plazo (meses)
              </label>
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {plazosPreconfigurados.map((opcion) => (
                    <button
                      key={opcion.valor}
                      type="button"
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        !plazoPersonalizado && plazo === opcion.valor.toString()
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-700 text-gray-200 hover:bg-emerald-500 hover:text-white"
                      }`}
                      onClick={() => seleccionarPlazoPreconfigurado(opcion.valor)}
                    >
                      {opcion.label}
                    </button>
                  ))}
                </div>
              </div>
              <input
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                placeholder="Ingrese plazo"
                value={plazo}
                onChange={handleChangePlazoInput}
                type="number"
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-md shadow-md hover:shadow-lg transition-all flex items-center space-x-2" 
              type="submit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
              </svg>
              <span>Calcular Préstamo</span>
            </button>
          </div>
        </form>
      </div>
      
      {resultado && (
        <>
          <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-200">
              Resumen del Préstamo
            </h3>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Capital solicitado</p>
                <p className="text-xl font-bold text-white">{formatCurrency(resultado.resumen.totalCapital)}</p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Cuota mensual</p>
                <p className="text-xl font-bold text-white">{formatCurrency(resultado.resumen.cuotaMensual)}</p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Total intereses</p>
                <p className="text-xl font-bold text-emerald-400">{formatCurrency(resultado.resumen.totalInteres)}</p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Total a pagar</p>
                <p className="text-xl font-bold text-white">{formatCurrency(resultado.resumen.totalPagado)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-200">
              Tabla de Amortización
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 divide-y divide-gray-700">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Mes
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Cuota
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Interés
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Abono a Capital
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Saldo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filasPaginadas.map((fila: { mes: number; cuota: number; interes: number; abono: number; saldo: number }, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}>
                      <td className="py-3 px-4 text-sm text-gray-200">
                        {fila.mes}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-200">
                        {formatCurrency(fila.cuota)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-200">
                        {formatCurrency(fila.interes)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-200">
                        {formatCurrency(fila.abono)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-200">
                        {formatCurrency(fila.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPaginas > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="flex items-center space-x-1">
                  <button
                    onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                    disabled={paginaActual === 1}
                    className={`px-3 py-1 rounded-md ${
                      paginaActual === 1
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-700 text-gray-300 hover:bg-emerald-600"
                    }`}
                  >
                    Anterior
                  </button>
                  
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === totalPaginas || 
                      (page >= paginaActual - 1 && page <= paginaActual + 1)
                    )
                    .map((page, i, arr) => {
                      // Añadir puntos suspensivos si hay saltos entre páginas
                      if (i > 0 && page > arr[i - 1] + 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="px-3 py-1 text-gray-500">...</span>
                            <button
                              onClick={() => setPaginaActual(page)}
                              className={`px-3 py-1 rounded-md ${
                                paginaActual === page
                                  ? "bg-emerald-600 text-white"
                                  : "bg-gray-700 text-gray-300 hover:bg-emerald-600"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setPaginaActual(page)}
                          className={`px-3 py-1 rounded-md ${
                            paginaActual === page
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-emerald-600"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  
                  <button
                    onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                    disabled={paginaActual === totalPaginas}
                    className={`px-3 py-1 rounded-md ${
                      paginaActual === totalPaginas
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-700 text-gray-300 hover:bg-emerald-600"
                    }`}
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}