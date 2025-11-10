import { useState, useEffect } from 'react';
import { Ticket, Licitacion } from '../types';
import { getCategoryName } from '../utils/helpers';
import { showNotification } from '../utils/notifications';
import { createReporte, getAllReportes } from '../api/api';

interface ReportesModalProps {
  tickets: Ticket[];
  licitaciones: Licitacion[];
  onClose: () => void;
}

type ReportTab = 'tickets' | 'licitaciones' | 'rendimiento' | 'historial';

interface Reporte {
  id: number;
  fecha: string;
  ticketsAbiertos: number;
  ticketsCerrados: number;
  tiempoProResolucion: number;
}

export default function ReportesModal({ tickets, licitaciones, onClose }: ReportesModalProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>('tickets');
  const [reportesGuardados, setReportesGuardados] = useState<Reporte[]>([]);
  const [loadingReportes, setLoadingReportes] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'closed').length;

  const categoryStats: Record<string, number> = {};
  tickets.forEach(ticket => {
    categoryStats[ticket.category] = (categoryStats[ticket.category] || 0) + 1;
  });

  const totalLicitacionValue = licitaciones.reduce((sum, l) => sum + (l.monto || 0), 0);
  const avgLicitacionValue = licitaciones.length > 0 ? totalLicitacionValue / licitaciones.length : 0;
  
  const winRate = licitaciones.length > 0 
    ? (licitaciones.filter(l => l.estado?.toLowerCase().includes('adjudicada')).length / licitaciones.length * 100) 
    : 0;

  // Calcular tiempo promedio de resolución (en horas)
  const calcularTiempoPromedioResolucion = (): number => {
    const ticketsCerrados = tickets.filter(t => t.status === 'closed');
    if (ticketsCerrados.length === 0) return 0;

    const tiempoTotal = ticketsCerrados.reduce((sum, ticket) => {
      const tiempoResolucion = (ticket.updatedAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
      return sum + tiempoResolucion;
    }, 0);

    return tiempoTotal / ticketsCerrados.length;
  };

  // Cargar reportes guardados
  useEffect(() => {
    cargarReportesGuardados();
  }, []);

  const cargarReportesGuardados = async () => {
    setLoadingReportes(true);
    try {
      const response = await getAllReportes();
      setReportesGuardados(response.data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoadingReportes(false);
    }
  };

  // Generar y guardar reporte en la base de datos
  const generarYGuardarReporte = async () => {
    setGeneratingReport(true);
    try {
      const nuevoReporte = {
        ticketsAbiertos: openTickets,
        ticketsCerrados: resolvedTickets,
        tiempoProResolucion: parseFloat(calcularTiempoPromedioResolucion().toFixed(2))
      };

      const response = await createReporte(nuevoReporte);
      
      setReportesGuardados([response.data, ...reportesGuardados]);
      showNotification('Reporte generado y guardado exitosamente', 'success');
      
      // Cambiar a la pestaña de historial
      setActiveTab('historial');
    } catch (error: any) {
      console.error('Error al generar reporte:', error);
      showNotification(error.response?.data?.detail || 'Error al generar el reporte', 'error');
    } finally {
      setGeneratingReport(false);
    }
  };

  const exportTicketsReport = () => {
    const headers = ['ID', 'Título', 'Estado', 'Prioridad', 'Categoría', 'Fecha Creación'];
    const rows = tickets.map(t => [
      t.id,
      `"${t.title}"`,
      t.status,
      t.priority,
      t.category,
      t.createdAt.toLocaleDateString('es-ES')
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_tickets_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Reporte de tickets exportado exitosamente', 'success');
  };

  const exportLicitacionesReport = () => {
    const headers = ['ID', 'Título', 'Estado', 'Monto', 'Cliente', 'Fecha'];
    const rows = licitaciones.map(l => [
      l.id,
      `"${l.titulo}"`,
      l.estado,
      l.monto || 0,
      `"${l.cliente}"`,
      l.fechaCreacion.toLocaleDateString('es-ES')
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_licitaciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Reporte de licitaciones exportado exitosamente', 'success');
  };

  const exportRendimientoReport = () => {
    const headers = ['Métrica', 'Valor'];
    const rows = [
      ['Tickets Abiertos', openTickets],
      ['Tickets en Progreso', inProgressTickets],
      ['Tickets Cerrados', resolvedTickets],
      ['Tasa de Resolución (%)', tickets.length > 0 ? ((resolvedTickets / tickets.length) * 100).toFixed(2) : 0],
      ['Tiempo Promedio Resolución (h)', calcularTiempoPromedioResolucion().toFixed(2)],
      ['Total Licitaciones', licitaciones.length],
      ['Tasa de Éxito Licitaciones (%)', winRate.toFixed(2)]
    ];
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_rendimiento_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Reporte de rendimiento exportado exitosamente', 'success');
  };

  const tabClasses = (tab: ReportTab) =>
    activeTab === tab
      ? 'py-2 px-1 border-b-2 border-purple-500 font-medium text-sm text-purple-600'
      : 'py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 my-8 max-h-[90vh] overflow-y-auto fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Centro de Reportes</h3>
            <div className="flex space-x-2">
              <button
                onClick={generarYGuardarReporte}
                disabled={generatingReport}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {generatingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Generar Reporte</span>
                  </>
                )}
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Tabs de Reportes */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button onClick={() => setActiveTab('tickets')} className={tabClasses('tickets')}>
                Reportes de Tickets
              </button>
              <button onClick={() => setActiveTab('licitaciones')} className={tabClasses('licitaciones')}>
                Reportes de Licitaciones
              </button>
              <button onClick={() => setActiveTab('rendimiento')} className={tabClasses('rendimiento')}>
                Rendimiento
              </button>
              <button onClick={() => setActiveTab('historial')} className={tabClasses('historial')}>
                Historial ({reportesGuardados.length})
              </button>
            </nav>
          </div>

          {/* Contenido de Reportes de Tickets */}
          {activeTab === 'tickets' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Estado</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <span className="text-sm text-gray-600">Abiertos</span>
                      </div>
                      <span className="font-semibold">{openTickets}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm text-gray-600">En Progreso</span>
                      </div>
                      <span className="font-semibold">{inProgressTickets}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm text-gray-600">Resueltos</span>
                      </div>
                      <span className="font-semibold">{resolvedTickets}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Métricas de Tiempo</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Tiempo Promedio de Resolución</span>
                        <span className="font-semibold text-blue-600">
                          {calcularTiempoPromedioResolucion().toFixed(1)}h
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Tiempo Promedio de Primera Respuesta</span>
                        <span className="font-semibold text-green-600">2.3h</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Tickets por Categoría</h4>
                  <div className="space-y-3">
                    {Object.entries(categoryStats).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{getCategoryName(category as any)}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Satisfacción del Cliente</h4>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-600 mb-2">4.6/5</div>
                    <div className="flex justify-center space-x-1 mb-3">
                      <span className="text-yellow-400 text-xl">★★★★★</span>
                    </div>
                    <p className="text-sm text-gray-600">Basado en 127 evaluaciones</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={exportTicketsReport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Exportar Reporte de Tickets
                </button>
              </div>
            </div>
          )}

          {/* Contenido de Reportes de Licitaciones */}
          {activeTab === 'licitaciones' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Valor Total de Licitaciones</h4>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        ${totalLicitacionValue.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600">Valor total de todas las licitaciones</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-semibold text-blue-600">
                          ${Math.round(avgLicitacionValue).toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-600">Valor promedio</p>
                      </div>
                      <div>
                        <div className="text-xl font-semibold text-purple-600">
                          {Math.round(winRate)}%
                        </div>
                        <p className="text-xs text-gray-600">Tasa de éxito</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Resumen</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Licitaciones</span>
                      <span className="font-semibold">{licitaciones.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Adjudicadas</span>
                      <span className="font-semibold text-green-600">
                        {licitaciones.filter(l => l.estado?.toLowerCase().includes('adjudicada')).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">En Proceso</span>
                      <span className="font-semibold text-blue-600">
                        {licitaciones.filter(l => {
                          const estado = l.estado?.toLowerCase() || '';
                          return estado.includes('publicada') || estado.includes('evaluacion');
                        }).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={exportLicitacionesReport}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Exportar Reporte de Licitaciones
                </button>
              </div>
            </div>
          )}

          {/* Contenido de Reportes de Rendimiento */}
          {activeTab === 'rendimiento' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">KPIs Principales</h4>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {tickets.length > 0 ? Math.round((resolvedTickets / tickets.length) * 100) : 0}%
                      </div>
                      <p className="text-sm text-gray-600">Tasa de Resolución</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {calcularTiempoPromedioResolucion().toFixed(1)}h
                      </div>
                      <p className="text-sm text-gray-600">Tiempo Promedio de Resolución</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">94%</div>
                      <p className="text-sm text-gray-600">SLA Cumplido</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Productividad del Equipo</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ana Rodríguez</span>
                      <span className="font-semibold text-green-600">23 tickets</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pedro Sánchez</span>
                      <span className="font-semibold text-blue-600">19 tickets</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Luis García</span>
                      <span className="font-semibold text-purple-600">15 tickets</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Carmen López</span>
                      <span className="font-semibold text-orange-600">12 tickets</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Tendencias</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Tickets Esta Semana</span>
                        <span className="font-semibold text-green-600">+15%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Tiempo de Resolución</span>
                        <span className="font-semibold text-blue-600">-8%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Satisfacción Cliente</span>
                        <span className="font-semibold text-purple-600">+3%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={exportRendimientoReport}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Exportar Reporte de Rendimiento
                </button>
              </div>
            </div>
          )}

          {/* Nueva pestaña: Historial de Reportes */}
          {activeTab === 'historial' && (
            <div>
              {loadingReportes ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : reportesGuardados.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <p className="text-gray-500 text-lg mb-4">No hay reportes guardados</p>
                  <button
                    onClick={generarYGuardarReporte}
                    className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Generar Primer Reporte
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportesGuardados.map((reporte) => (
                    <div key={reporte.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">
                            Reporte #{reporte.id}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(reporte.fecha).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          Guardado
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-orange-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Tickets Abiertos</p>
                          <p className="text-2xl font-bold text-orange-600">{reporte.ticketsAbiertos}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Tickets Cerrados</p>
                          <p className="text-2xl font-bold text-green-600">{reporte.ticketsCerrados}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Tiempo Promedio</p>
                          <p className="text-2xl font-bold text-blue-600">{reporte.tiempoProResolucion.toFixed(1)}h</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
