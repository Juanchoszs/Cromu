import React, { useEffect, useRef, useState } from 'react';
import { Ahorrador } from './AhorradoresCrud';
import { Printer, Download, Share2, ChevronLeft } from 'lucide-react';
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface GenerarVoucherProps {
  ahorrador: Ahorrador;
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

const calcularRentabilidadAnual = (ahorrador: Ahorrador) => {
  const tasaBase = 6; // 6% anual base
  const tasaFidelidad = ahorrador.incentivoPorFidelidad ? 1 : 0; // 1% adicional por fidelidad
  return tasaBase + tasaFidelidad;
};

// Calcula interés compuesto mensual y saldo total
function calcularInteresYSaldoCompuesto(ahorrador: Ahorrador) {
  const tasaAnual = 6 + (ahorrador.incentivoPorFidelidad ? 1 : 0); // 6% o 7%
  const tasaMensual = tasaAnual / 12 / 100;
  let interesTotal = 0;
  let saldoAcumulado = 0;
  const mesesOrdenados = Object.keys(ahorrador.historialPagos).sort();
  for (const mes of mesesOrdenados) {
    const pago = ahorrador.historialPagos[mes];
    if (pago.pagado) {
      const interesMes = saldoAcumulado * tasaMensual;
      interesTotal += interesMes;
      saldoAcumulado += pago.monto + interesMes;
    }
  }
  return { interesTotal, saldoAcumulado };
}

// Función para obtener datos para el gráfico
const obtenerDatosGrafico = (ahorrador: Ahorrador) => {
  const mesesOrdenados = Object.keys(ahorrador.historialPagos).sort();
  const labels = [];
  const datosAhorro = [];
  const datosInteres = [];
  
  let saldoAcumulado = 0;
  let interesAcumulado = 0;
  const tasaAnual = calcularRentabilidadAnual(ahorrador);
  const tasaMensual = tasaAnual / 12 / 100;
  
  for (const mes of mesesOrdenados) {
    const pago = ahorrador.historialPagos[mes];
    if (pago.pagado) {
      // Calcular interés del mes
      const interesMes = saldoAcumulado * tasaMensual;
      interesAcumulado += interesMes;
      
      // Actualizar saldo
      saldoAcumulado += pago.monto + interesMes;
      
      // Formatear etiqueta del mes
      const [año, mesNum] = mes.split('-');
      const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      labels.push(`${nombresMeses[parseInt(mesNum) - 1]} ${año.substring(2)}`);
      
      // Guardar datos
      datosAhorro.push(saldoAcumulado - interesAcumulado);
      datosInteres.push(interesAcumulado);
    }
  }
  
  return { labels, datosAhorro, datosInteres };
};

export default function GenerarVoucher({ ahorrador, onClose }: GenerarVoucherProps) {
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
  
  const rentabilidadAnual = calcularRentabilidadAnual(ahorrador);
  const { interesTotal, saldoAcumulado } = calcularInteresYSaldoCompuesto(ahorrador);
  
  // Referencias para los gráficos y contenedor del PDF
  const graficoAhorroRef = useRef<HTMLCanvasElement>(null);
  const graficoPagosRef = useRef<HTMLCanvasElement>(null);
  const voucherContenidoRef = useRef<HTMLDivElement>(null);
  
  // Gráficos
  const chartAhorroRef = useRef<Chart | null>(null);
  const chartPagosRef = useRef<Chart | null>(null);
  
  // Configurar los gráficos
  useEffect(() => {
    const configurarGraficos = async () => {
      setLoading(true);
      
      try {
        // Esperar un momento para asegurar que el DOM esté listo
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Gráfico de evolución de ahorro
        if (graficoAhorroRef.current) {
          const ctx = graficoAhorroRef.current.getContext('2d');
          if (ctx) {
            const { labels, datosAhorro, datosInteres } = obtenerDatosGrafico(ahorrador);
            
            // Destruir gráfico existente si hay uno
            if (chartAhorroRef.current) {
              chartAhorroRef.current.destroy();
            }
            
            chartAhorroRef.current = new Chart(ctx, {
              type: 'bar',
              data: {
                labels: labels,
                datasets: [
                  {
                    label: 'Capital',
                    data: datosAhorro,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                  },
                  {
                    label: 'Interés',
                    data: datosInteres,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    stacked: true,
                    grid: {
                      display: false
                    }
                  },
                  y: {
                    stacked: true,
                    ticks: {
                      callback: function(value) {
                        return formatearMoneda(Number(value));
                      }
                    }
                  }
                },
                plugins: {
                  title: {
                    display: true,
                    text: 'Evolución de Ahorro e Interés',
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
                        return context.dataset.label + ': ' + formatearMoneda(context.parsed.y);
                      }
                    }
                  }
                }
              }
            });
          }
        }
        
        // Gráfico de estado de pagos
        if (graficoPagosRef.current) {
          const ctx = graficoPagosRef.current.getContext('2d');
          if (ctx) {
            // Contar pagos por mes
            const mesesOrdenados = Object.keys(ahorrador.historialPagos).sort();
            const pagados = mesesOrdenados.filter(mes => ahorrador.historialPagos[mes].pagado).length;
            const pendientes = mesesOrdenados.length - pagados;
            
            // Destruir gráfico existente si hay uno
            if (chartPagosRef.current) {
              chartPagosRef.current.destroy();
            }
            
            chartPagosRef.current = new Chart(ctx, {
              type: 'doughnut',
              data: {
                labels: ['Pagados', 'Pendientes'],
                datasets: [{
                  data: [pagados, pendientes],
                  backgroundColor: [
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(239, 68, 68, 0.7)'
                  ],
                  borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)'
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
                    text: 'Estado de Pagos',
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
                        const percentage = Math.round((value / mesesOrdenados.length) * 100);
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
      if (chartAhorroRef.current) {
        chartAhorroRef.current.destroy();
      }
      if (chartPagosRef.current) {
        chartPagosRef.current.destroy();
      }
    };
  }, [ahorrador]);
  
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
      pdf.save(`Comprobante_${ahorrador.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Hubo un error al generar el PDF. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };
  
  // Compartir el voucher (ejemplo básico que podría expandirse)
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
          title: `Comprobante de Ahorro - ${ahorrador.nombre}`,
          text: `Comprobante de ahorro de ${ahorrador.nombre} - CROMU Finance Services`,
          files: [
            new File([blob], `comprobante_${ahorrador.nombre.replace(/\s+/g, '_')}.png`, { 
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
              <h2 className="text-2xl font-bold text-emerald-700">Comprobante de Ahorro</h2>
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
                <p className="text-sm text-gray-800">No. Comprobante: {ahorrador.id.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Información del Ahorrador</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-800 font-medium">Nombre:</p>
                  <p className="font-semibold text-gray-900">{ahorrador.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-800 font-medium">Cédula:</p>
                  <p className="font-semibold text-gray-900">{ahorrador.cedula}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-800 font-medium">Fecha de Ingreso:</p>
                  <p className="font-semibold text-gray-900">{new Date(ahorrador.fechaIngreso).toLocaleDateString('es-ES')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-800 font-medium">Teléfono:</p>
                  <p className="font-semibold text-gray-900">{ahorrador.telefono}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Resumen de Ahorro</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Ahorro Total:</p>
                    <p className="font-bold text-xl text-emerald-700">{formatearMoneda(ahorrador.ahorroTotal)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Interés Anual:</p>
                    <p className="font-bold text-emerald-700">{formatearMoneda(interesTotal)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Saldo Total:</p>
                    <p className="font-bold text-emerald-700">{formatearMoneda(saldoAcumulado)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Evolución del Ahorro</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4 h-72">
                  <canvas ref={graficoAhorroRef}></canvas>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">Estado de Pagos</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4 h-72">
                  <canvas ref={graficoPagosRef}></canvas>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Detalle de Pagos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left text-gray-900">Mes</th>
                      <th className="py-2 px-4 border-b text-left text-gray-900">Estado</th>
                      <th className="py-2 px-4 border-b text-right text-gray-900">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(ahorrador.historialPagos)
                      .sort(([mesA], [mesB]) => mesA.localeCompare(mesB))
                      .map(([mes, { pagado, monto }]) => (
                        <tr key={mes} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 text-gray-900">
                            {mes.split('-')[1]}/{mes.split('-')[0]}
                          </td>
                          <td className="py-2 px-4">
                            {pagado ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Pagado
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Pendiente
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4 text-right text-gray-900">
                            {pagado ? formatearMoneda(monto) : '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t">
              <div className="flex flex-col sm:flex-row justify-between">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-800 font-medium">Generado por:</p>
                  <p className="font-semibold text-gray-900">Administrador CROMU</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-800 font-medium">Firma Digital:</p>
                  <p className="font-semibold text-emerald-700">CROMU-{Date.now().toString(36).substring(0, 6).toUpperCase()}</p>
                </div>
              </div>
              <p className="text-xs text-gray-800 mt-4 text-center">
                Este documento es un comprobante informativo de los ahorros registrados en CROMU Finance Services.
                Para cualquier aclaración, comuníquese con nuestro servicio al cliente.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos para impresión */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          
          body * {
            visibility: hidden;
          }
          
          #root > div > div {
            visibility: visible;
            width: 100%;
            position: absolute;
            left: 0;
            top: 0;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          canvas {
            height: auto !important;
            width: 100% !important;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>
    </div>
  );
}