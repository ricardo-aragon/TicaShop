import { useState } from 'react';
import { Ticket, Licitacion } from '../types';
import { getCategoryName } from '../utils/helpers';
import { showNotification } from '../utils/notifications';

interface ReportesModalProps {
  tickets: Ticket[];
  licitaciones: Licitacion[];
  onClose: () => void;
}

type ReportTab = 'tickets' | 'licitaciones' | 'rendimiento';

export default function ReportesModal({ tickets, licitaciones, onClose }: ReportesModalProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>('tickets');

  const openTickets = tickets.filter(t => t.status === 'abierto').length;
  const inProgressTickets = tickets.filter(t => t.status === 'en-progreso').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resuelto').length;

  const categoryStats: Record<string, number> = {};
  tickets.forEach(ticket => {
    categoryStats[ticket.category] = (categoryStats[ticket.category] || 0) + 1;
  });

  const totalLicitacionValue = licitaciones.reduce((sum, l) => sum + l.monto, 0);
  const avgLicitacionValue = licitaciones.length > 0 ? totalLicitacionValue / licitaciones.length : 0;
  const winRate = licitaciones.length > 0 
    ? (licitaciones.filter(l => l.status === 'adjudicada').length / licitaciones.length * 100) 
    : 0;

  const exportTicketsReport = () => {
    showNotification('Reporte de tickets exportado exitosamente', 'success');
  };

  const exportLicitacionesReport = () => {
    showNotification('Reporte de licitaciones exportado exitosamente', 'success');
  };

  const exportRendimientoReport = () => {
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
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
            </nav>
          </div>

          {/* Contenido de Reportes de Tickets */}
          {activeTab === 'tickets' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Estados */}
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

                {/* Métricas de Tiempo */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Métricas de Tiempo</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Tiempo Promedio de Resolución</span>
                        <span className="font-semibold text-blue-600">24.5h</span>
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

                {/* Tickets por Categoría */}
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

                {/* Satisfacción del Cliente */}
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
                        {licitaciones.filter(l => l.status === 'adjudicada').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">En Proceso</span>
                      <span className="font-semibold text-blue-600">
                        {licitaciones.filter(l => ['publicada', 'en-evaluacion'].includes(l.status)).length}
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
                      <div className="text-2xl font-bold text-blue-600">87%</div>
                      <p className="text-sm text-gray-600">Tasa de Resolución</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">2.5h</div>
                      <p className="text-sm text-gray-600">Tiempo Promedio de Respuesta</p>
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
        </div>
      </div>
    </div>
  );
}
