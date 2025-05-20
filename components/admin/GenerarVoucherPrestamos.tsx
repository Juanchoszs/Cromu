import React, { useEffect, useRef, useState } from 'react';
import { Prestamo } from './FromularioPrestamo';
import { Printer, Download, Share2, ChevronLeft } from 'lucide-react';
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface GenerarVoucherPrestamosProps {
  prestamo: Prestamo;
  onClose: () => void;
}

const formatearMoneda = (valor: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
};

// Función para calcular la cuota mensual
const calcularCuotaMensual = (prestamo: Prestamo) => {
  const monto = prestamo.monto;
  const tasaMensual = prestamo.tasaInteres / 100;
  const plazo = prestamo.plazoMeses;
  
  // Fórmula de cuota fija: P = (monto * tasa) / (1 - (1 + tasa)^-plazo)
  const cuotaExacta = (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazo));
  
  // Aproximar a miles superiores
  return Math.ceil(cuotaExacta / 1000) * 1000;
};

// Función para generar la tabla de amortización
const generarTablaAmortizacion = (prestamo: Prestamo) => {
  const monto = prestamo.monto;
  const tasaMensual = prestamo.tasaInteres / 100;
  const plazo = prestamo.plazoMeses;
  const cuotaMensual = calcularCuotaMensual(prestamo);

  const tabla = [];
  let saldoPendiente = monto;

  for (let mes = 1; mes <= plazo; mes++) {
    const interesMes = saldoPendiente * tasaMensual;
    const abonoCapital = cuotaMensual - interesMes;
    saldoPendiente -= abonoCapital;

    // Leer estado real de la cuota desde historialPagos
    let estado = "Pendiente";
    let fechaPago = "";

    const cuotaHistorial = prestamo.historialPagos?.[mes];
    if (cuotaHistorial) {
      if (cuotaHistorial.estado === "pagado") {
        estado = "Pagado";
      } else if (cuotaHistorial.estado === "aplazado") {
        estado = "Aplazado";
      } else {
        estado = "Pendiente";
      }
    } else {
      // Calcular si está vencida
      const fechaDesembolso = new Date(prestamo.fechaDesembolso);
      const fechaVencimientoCuota = new Date(fechaDesembolso);
      fechaVencimientoCuota.setMonth(fechaDesembolso.getMonth() + mes);

      if (fechaVencimientoCuota < new Date()) {
        estado = "Vencido";
      }
    }

    tabla.push({
      mes: mes.toString(),
      cuota: cuotaMensual,
      interes: interesMes,
      abonoCapital,
      saldo: saldoPendiente < 0 ? 0 : saldoPendiente,
      estado,
      fechaPago
    });

    // Si hay subcuotas, agrégalas como filas adicionales
    if (cuotaHistorial && Array.isArray(cuotaHistorial.subcuotas)) {
      cuotaHistorial.subcuotas.forEach((sub, idx) => {
        tabla.push({
          mes: `${mes}.${idx + 1}`,
          cuota: sub.monto,
          interes: 0, // Puedes calcular el interés real si lo necesitas
          abonoCapital: sub.monto,
          saldo: saldoPendiente < 0 ? 0 : saldoPendiente,
          estado:
            sub.estado === "pagado"
              ? "Pagado"
              : sub.estado === "aplazado"
              ? "Aplazado"
              : "Pendiente",
          fechaPago: "", // Si tienes fecha de pago, agrégala aquí
        });
      });
    }
  }

  return tabla;
};

// Función para obtener datos para el gráfico de distribución
const obtenerDatosDistribucion = (prestamo: Prestamo) => {
  const tabla = generarTablaAmortizacion(prestamo);
  
  // Calcular totales
  const totalInteres = tabla.reduce((sum, row) => sum + row.interes, 0);
  const totalCapital = prestamo.monto;
  
  return {
    totalInteres,
    totalCapital
  };
};

// Función para obtener datos para el gráfico de estado de cuotas
const obtenerDatosEstadoCuotas = (prestamo: Prestamo) => {
  const tabla = generarTablaAmortizacion(prestamo);
  
  const pagadas = tabla.filter(row => row.estado === "Pagado").length;
  const vencidas = tabla.filter(row => row.estado === "Vencido").length;
  const pendientes = tabla.filter(row => row.estado === "Pendiente").length;
  
  return {
    pagadas,
    vencidas,
    pendientes
  };
};

export default function GenerarVoucherPrestamos({ prestamo, onClose }: GenerarVoucherPrestamosProps) {
  const [graficosGenerados, setGraficosGenerados] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const horaActual = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Referencias para los gráficos y contenedor del PDF
  const graficoDistribucionRef = useRef<HTMLCanvasElement>(null);
  const graficoEstadoCuotasRef = useRef<HTMLCanvasElement>(null);
  const voucherContenidoRef = useRef<HTMLDivElement>(null);
  
  // Referencias para los objetos Chart
  const chartDistribucionRef = useRef<Chart | null>(null);
  const chartEstadoCuotasRef = useRef<Chart | null>(null);
  
  // Calcular datos para el resumen
  const cuotaMensual = calcularCuotaMensual(prestamo);
  const tablaAmortizacion = generarTablaAmortizacion(prestamo);
  const totalPagado = tablaAmortizacion.reduce((sum, row) => 
    row.estado === "Pagado" ? sum + row.cuota : sum, 0);
  const totalPendiente = tablaAmortizacion.reduce((sum, row) => 
    row.estado !== "Pagado" ? sum + row.cuota : sum, 0);
  
  // Configurar los gráficos
  useEffect(() => {
    const configurarGraficos = async () => {
      setLoading(true);
      
      try {
        // Esperar un momento para asegurar que el DOM esté listo
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Gráfico de distribución Capital vs Interés
        if (graficoDistribucionRef.current) {
          const ctx = graficoDistribucionRef.current.getContext('2d');
          if (ctx) {
            const { totalInteres, totalCapital } = obtenerDatosDistribucion(prestamo);
            
            // Destruir gráfico existente si hay uno
            if (chartDistribucionRef.current) {
              chartDistribucionRef.current.destroy();
            }
            
            chartDistribucionRef.current = new Chart(ctx, {
              type: 'pie',
              data: {
                labels: ['Capital', 'Intereses'],
                datasets: [{
                  data: [totalCapital, totalInteres],
                  backgroundColor: [
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(59, 130, 246, 0.7)'
                  ],
                  borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(59, 130, 246, 1)'
                  ],
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: 'Distribución Capital vs Intereses',
                    color: '#1f2937',
                    font: {
                      size: 16,
                      weight: 'bold'
                    }
                  },
                  legend: {
                    position: 'bottom'
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const value = context.raw as number;
                        const total = totalCapital + totalInteres;
                        const percentage = Math.round((value / total) * 100);
                        return `${context.label}: ${formatearMoneda(value)} (${percentage}%)`;
                      }
                    }
                  }
                }
              }
            });
          }
        }
        
        // Gráfico de estado de cuotas
        if (graficoEstadoCuotasRef.current) {
          const ctx = graficoEstadoCuotasRef.current.getContext('2d');
          if (ctx) {
            const { pagadas, vencidas, pendientes } = obtenerDatosEstadoCuotas(prestamo);
            
            // Destruir gráfico existente si hay uno
            if (chartEstadoCuotasRef.current) {
              chartEstadoCuotasRef.current.destroy();
            }
            
            chartEstadoCuotasRef.current = new Chart(ctx, {
              type: 'doughnut',
              data: {
                labels: ['Pagadas', 'Vencidas', 'Pendientes'],
                datasets: [{
                  data: [pagadas, vencidas, pendientes],
                  backgroundColor: [
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(251, 191, 36, 0.7)'
                  ],
                  borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(251, 191, 36, 1)'
                  ],
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: 'Estado de Cuotas',
                    color: '#1f2937',
                    font: {
                      size: 16,
                      weight: 'bold'
                    }
                  },
                  legend: {
                    position: 'bottom'
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const value = context.raw as number;
                        const total = pagadas + vencidas + pendientes;
                        const percentage = Math.round((value / total) * 100);
                        return `${context.label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                }
              }
            });
          }
        }
        
        // Indicar que los gráficos se han renderizado
        setGraficosGenerados(true);
      } catch (error) {
        console.error("Error al configurar gráficos:", error);
      } finally {
        setLoading(false);
      }
    };
    
    configurarGraficos();
    
    // Limpiar los gráficos al desmontar el componente
    return () => {
      if (chartDistribucionRef.current) {
        chartDistribucionRef.current.destroy();
      }
      if (chartEstadoCuotasRef.current) {
        chartEstadoCuotasRef.current.destroy();
      }
    };
  }, [prestamo]);
  
  // Función para imprimir o generar PDF del voucher
  const imprimirVoucher = () => {
    window.print();
  };
  
  // Función para descargar el voucher como PDF
  const descargarPDF = async () => {
    if (!voucherContenidoRef.current || !graficosGenerados) return;
    
    setLoading(true);
    
    try {
      const voucherElement = voucherContenidoRef.current;
      
      // Configuración para mejor captura de canvas y tablas
      const options = {
        scale: 2, // Mayor escala para mejor calidad
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        height: voucherElement.scrollHeight,
        windowHeight: voucherElement.scrollHeight
      };
      
      // Crear canvas con todo el contenido
      const canvas = await html2canvas(voucherElement, options);
      
      // Determinar dimensiones del PDF (A4)
      const imgWidth = 210; // A4 ancho en mm
      const pageHeight = 297; // A4 alto en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Inicializar PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Primera página
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Agregar páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Descargar el PDF
      pdf.save(`Comprobante_Prestamo_${prestamo.nombreDeudor.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Hubo un error al generar el PDF. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };
  
  // Compartir el voucher
  const compartirVoucher = async () => {
    if (!voucherContenidoRef.current) return;
    
    setLoading(true);
    
    try {
      const voucherElement = voucherContenidoRef.current;
      const canvas = await html2canvas(voucherElement, { scale: 2 });
      
      // Convertir canvas a blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("No se pudo crear la imagen para compartir");
        }
        
        // Crear objeto para compartir
        const shareData = {
          title: `Comprobante de Préstamo - ${prestamo.nombreDeudor}`,
          text: `Comprobante de préstamo de ${prestamo.nombreDeudor} - CROMU Finance Services`,
          files: [
            new File([blob], `comprobante_prestamo_${prestamo.nombreDeudor.replace(/\s+/g, '_')}.png`, { 
              type: 'image/png' 
            })
          ]
        };
        
        // Verificar si la API de compartir está disponible
        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else {
          alert("Su navegador no admite la función de compartir archivos");
        }
      }, 'image/png');
    } catch (error) {
      console.error("Error al compartir:", error);
      alert("Hubo un error al compartir el comprobante");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:p-0 print:bg-white print:inset-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto print:shadow-none print:max-h-full print:overflow-visible">
        <div className="p-6 print:p-2">
          {/* Barra de herramientas - Se oculta al imprimir */}
          <div className="flex justify-between items-center mb-6 print:hidden">
            <div className="flex items-center">
              <button 
                onClick={onClose}
                className="mr-3 p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                disabled={loading}
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold text-emerald-700">Comprobante de Préstamo</h2>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={descargarPDF}
                className="p-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                title="Descargar como PDF"
                disabled={loading || !graficosGenerados}
              >
                <Download size={20} />
              </button>
              <button 
                onClick={compartirVoucher}
                className="p-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
                title="Compartir comprobante"
                disabled={loading || !graficosGenerados}
              >
                <Share2 size={20} />
              </button>
              <button 
                onClick={imprimirVoucher}
                className="p-2 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200"
                title="Imprimir comprobante"
                disabled={loading || !graficosGenerados}
              >
                <Printer size={20} />
              </button>
            </div>
          </div>
          
          {/* Estado de carga */}
          {loading && (
            <div className="print:hidden text-center py-2 mb-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent"></div>
              <span className="ml-2 text-gray-700">Generando documento...</span>
            </div>
          )}
          
          {/* Contenido del voucher */}
          <div 
            ref={voucherContenidoRef} 
            className="border border-gray-300 p-6 rounded-lg print:border-none print:p-0"
          >
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h1 className="text-xl font-bold text-emerald-800">CROMU Finance Services</h1>
                <p className="text-gray-800 text-sm">NIT: 901.234.567-8</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-800">Fecha: {fechaActual}</p>
                <p className="text-sm text-gray-800">Hora: {horaActual}</p>
                <p className="text-sm text-gray-800">No. Comprobante: {prestamo.id.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Información del Deudor</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-800 font-medium">Nombre:</p>
                  <p className="font-semibold text-gray-900">{prestamo.nombreDeudor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-800 font-medium">Cédula:</p>
                  <p className="font-semibold text-gray-900">{prestamo.cedula}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-800 font-medium">Teléfono:</p>
                  <p className="font-semibold text-gray-900">{prestamo.telefono || "No registrado"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-800 font-medium">Dirección:</p>
                  <p className="font-semibold text-gray-900">{prestamo.direccion || "No registrada"}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Resumen del Préstamo</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Monto del Préstamo:</p>
                    <p className="font-bold text-xl text-emerald-700">{formatearMoneda(prestamo.monto)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Tasa de Interés:</p>
                    <p className="font-bold text-emerald-700">{prestamo.tasaInteres}% mensual</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Plazo:</p>
                    <p className="font-bold text-emerald-700">{prestamo.plazoMeses} meses</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Cuota Mensual:</p>
                    <p className="font-bold text-emerald-700">{formatearMoneda(cuotaMensual)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Fecha de Desembolso:</p>
                    <p className="font-bold text-emerald-700">{new Date(prestamo.fechaDesembolso).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Estado del Préstamo:</p>
                    <p className={`font-bold ${
                      prestamo.estado === 'Activo' ? 'text-blue-600' : 
                      prestamo.estado === 'Pagado' ? 'text-emerald-600' : 
                      prestamo.estado === 'Vencido' ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {prestamo.estado}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Distribución del Préstamo</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4 h-72">
                  <canvas ref={graficoDistribucionRef}></canvas>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Estado de Cuotas</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4 h-72">
                  <canvas ref={graficoEstadoCuotasRef}></canvas>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Tabla de Amortización</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-3 border-b text-left text-gray-900 text-sm">Cuota</th>
                      <th className="py-2 px-3 border-b text-left text-gray-900 text-sm">Valor Cuota</th>
                      <th className="py-2 px-3 border-b text-left text-gray-900 text-sm">Interés</th>
                      <th className="py-2 px-3 border-b text-left text-gray-900 text-sm">Capital</th>
                      <th className="py-2 px-3 border-b text-left text-gray-900 text-sm">Saldo</th>
                      <th className="py-2 px-3 border-b text-left text-gray-900 text-sm">Estado</th>
                      <th className="py-2 px-3 border-b text-left text-gray-900 text-sm">Fecha Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablaAmortizacion.map((fila, idx) => (
                      <tr key={idx} className={`border-b hover:bg-gray-50 ${
                        fila.estado === 'Pagado' ? 'bg-green-50' : 
                        fila.estado === 'Vencido' ? 'bg-red-50' : ''
                      }`}>
                        <td className="py-2 px-3 text-gray-900 text-sm">
                          {fila.mes}
                        </td>
                        <td className="py-2 px-3 text-gray-900 text-sm">
                          {formatearMoneda(fila.cuota)}
                        </td>
                        <td className="py-2 px-3 text-gray-900 text-sm">
                          {formatearMoneda(fila.interes)}
                        </td>
                        <td className="py-2 px-3 text-gray-900 text-sm">
                          {formatearMoneda(fila.abonoCapital)}
                        </td>
                        <td className="py-2 px-3 text-gray-900 text-sm">
                          {formatearMoneda(fila.saldo)}
                        </td>
                        <td className="py-2 px-3 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            fila.estado === 'Pagado' ? 'bg-green-100 text-green-800' : 
                            fila.estado === 'Vencido' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {fila.estado}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-900 text-sm">
                          {fila.fechaPago || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Resumen de Pagos</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Total Pagado:</p>
                    <p className="font-bold text-xl text-emerald-700">{formatearMoneda(totalPagado)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Total Pendiente:</p>
                    <p className="font-bold text-xl text-red-600">{formatearMoneda(totalPendiente)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Total Préstamo:</p>
                    <p className="font-bold text-xl text-gray-900">{formatearMoneda(totalPagado + totalPendiente)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-6 border-t border-gray-300 text-center text-gray-600 text-sm">
              <p>Este documento es un comprobante informativo del estado de su préstamo.</p>
              <p>Para cualquier consulta adicional, comuníquese con CROMU Finance Services.</p>
              <p className="mt-2">© {new Date().getFullYear()} CROMU Finance Services. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
