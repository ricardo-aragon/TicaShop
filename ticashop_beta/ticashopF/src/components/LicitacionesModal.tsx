import { useState } from 'react';
import { Licitacion, LicitacionStatus, LicitacionTipo } from '../types';
import { formatDate } from '../utils/helpers';
import { showNotification } from '../utils/notifications';

interface LicitacionesModalProps {
  licitaciones: Licitacion[];
  setLicitaciones: React.Dispatch<React.SetStateAction<Licitacion[]>>;
  onClose: () => void;
}

export default function LicitacionesModal({ licitaciones, setLicitaciones, onClose }: LicitacionesModalProps) {
  const [showNewLicitacion, setShowNewLicitacion] = useState(false);
  const [statusFilter, setStatusFilter] = useState<LicitacionStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<LicitacionTipo | ''>('');

  const filteredLicitaciones = licitaciones
    .filter(l => !statusFilter || l.status === statusFilter)
    .filter(l => !typeFilter || l.tipo === typeFilter)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const totalLicitaciones = licitaciones.length;
  const enProceso = licitaciones.filter(l => ['publicada', 'en-evaluacion'].includes(l.status)).length;
  const ganadas = licitaciones.filter(l => l.status === 'adjudicada').length;
  const perdidas = licitaciones.filter(l => l.status === 'cancelada').length;

  const statusColors: Record<LicitacionStatus, string> = {
    'borrador': 'bg-gray-100 text-gray-800 border-gray-200',
    'publicada': 'bg-blue-100 text-blue-800 border-blue-200',
    'en-evaluacion': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'adjudicada': 'bg-green-100 text-green-800 border-green-200',
    'cancelada': 'bg-red-100 text-red-800 border-red-200'
  };

  const typeIcons: Record<LicitacionTipo, string> = {
    'servicios': '🔧',
    'productos': '📦',
    'obras': '🏗️',
    'consultoria': '💼'
  };

  const statusNames: Record<LicitacionStatus, string> = {
    'borrador': 'Borrador',
    'publicada': 'Publicada',
    'en-evaluacion': 'En Evaluación',
    'adjudicada': 'Adjudicada',
    'cancelada': 'Cancelada'
  };

  const handleCreateLicitacion = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNewLicitacion(false);
    showNotification('Licitación creada exitosamente', 'success');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 my-8 max-h-[90vh] overflow-y-auto fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Gestión de Licitaciones</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowNewLicitacion(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                + Nueva Licitación
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
          {/* Estadísticas de Licitaciones */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Licitaciones</p>
                  <p className="text-2xl font-bold text-blue-900">{totalLicitaciones}</p>
                </div>
                <div className="text-2xl">📋</div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">En Proceso</p>
                  <p className="text-2xl font-bold text-yellow-900">{enProceso}</p>
                </div>
                <div className="text-2xl">⏳</div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Ganadas</p>
                  <p className="text-2xl font-bold text-green-900">{ganadas}</p>
                </div>
                <div className="text-2xl">🏆</div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Perdidas</p>
                  <p className="text-2xl font-bold text-red-900">{perdidas}</p>
                </div>
                <div className="text-2xl">❌</div>
              </div>
            </div>
          </div>

          {/* Filtros de Licitaciones */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as LicitacionStatus | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="borrador">Borrador</option>
                  <option value="publicada">Publicada</option>
                  <option value="en-evaluacion">En Evaluación</option>
                  <option value="adjudicada">Adjudicada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as LicitacionTipo | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Todos los tipos</option>
                  <option value="servicios">Servicios</option>
                  <option value="productos">Productos</option>
                  <option value="obras">Obras</option>
                  <option value="consultoria">Consultoría</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Licitaciones */}
          <div className="space-y-4">
            {filteredLicitaciones.map(licitacion => {
              const daysUntilClose = Math.ceil((licitacion.fechaCierre.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysUntilClose <= 7 && daysUntilClose > 0;

              return (
                <div key={licitacion.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow card-hover">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{typeIcons[licitacion.tipo]}</span>
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">{licitacion.numero}</h4>
                        <p className="text-sm text-gray-600">{licitacion.entidad}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[licitacion.status]}`}>
                        {statusNames[licitacion.status]}
                      </span>
                      {isUrgent && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">¡Urgente!</span>}
                    </div>
                  </div>

                  <h5 className="font-semibold text-gray-900 mb-3">{licitacion.titulo}</h5>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{licitacion.descripcion}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Monto:</span>
                      <p className="font-semibold text-green-600">${licitacion.monto.toLocaleString()} {licitacion.moneda}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tipo:</span>
                      <p className="font-medium capitalize">{licitacion.tipo}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Fecha Inicio:</span>
                      <p className="font-medium">{formatDate(licitacion.fechaInicio)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Fecha Cierre:</span>
                      <p className={`font-medium ${isUrgent ? 'text-red-600' : ''}`}>{formatDate(licitacion.fechaCierre)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {daysUntilClose > 0 ? `${daysUntilClose} días restantes` : daysUntilClose === 0 ? 'Vence hoy' : 'Vencida'}
                    </span>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-sm">
                        Editar
                      </button>
                      <button className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-sm">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Nueva Licitación (simplificado) */}
      {showNewLicitacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowNewLicitacion(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nueva Licitación</h3>
            <form onSubmit={handleCreateLicitacion} className="space-y-4">
              <p className="text-gray-600">Formulario de nueva licitación (simplificado para demo)</p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewLicitacion(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Crear Licitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
