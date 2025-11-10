import { useState } from 'react';
import { Licitacion, LicitacionStatus, LicitacionTipo } from '../types';
import { formatDate } from '../utils/helpers';
import { showNotification } from '../utils/notifications';
import { createLicitacion, updateLicitacion, deleteLicitacion } from '../api/api';

interface LicitacionesModalProps {
  licitaciones: Licitacion[];
  setLicitaciones: React.Dispatch<React.SetStateAction<Licitacion[]>>;
  onClose: () => void;
}

export default function LicitacionesModal({ licitaciones, setLicitaciones, onClose }: LicitacionesModalProps) {
  const [showNewLicitacion, setShowNewLicitacion] = useState(false);
  const [statusFilter, setStatusFilter] = useState<LicitacionStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<LicitacionTipo | ''>('');
  const [loading, setLoading] = useState(false);

  // Formulario de nueva licitación
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    propuesta: '',
    tipo: '' as LicitacionTipo | '',
    monto: '',
    moneda: 'MXN',
    entidad: '',
    estado: 'borrador' as LicitacionStatus,
    fechaInicio: '',
    fechaCierre: '',
    numero: ''
  });

  // Helper para obtener el estado de la licitación
  const getEstado = (l: Licitacion): string => {
    return (l.estado || l.status || '').toLowerCase();
  };

  const filteredLicitaciones = licitaciones
    .filter(l => !statusFilter || getEstado(l).includes(statusFilter.toLowerCase()))
    .filter(l => !typeFilter || (l.tipo && l.tipo.toLowerCase() === typeFilter.toLowerCase()))
    .sort((a, b) => {
      const dateA = a.updatedAt || a.fechaCreacion;
      const dateB = b.updatedAt || b.fechaCreacion;
      return dateB.getTime() - dateA.getTime();
    });

  const totalLicitaciones = licitaciones.length;
  const enProceso = licitaciones.filter(l => {
    const estado = getEstado(l);
    return estado.includes('publicada') || estado.includes('evaluacion');
  }).length;
  const ganadas = licitaciones.filter(l => getEstado(l).includes('adjudicada')).length;
  const perdidas = licitaciones.filter(l => getEstado(l).includes('cancelada')).length;

  const statusColors: Record<string, string> = {
    'borrador': 'bg-gray-100 text-gray-800 border-gray-200',
    'publicada': 'bg-blue-100 text-blue-800 border-blue-200',
    'en-evaluacion': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'adjudicada': 'bg-green-100 text-green-800 border-green-200',
    'cancelada': 'bg-red-100 text-red-800 border-red-200'
  };

  const typeIcons: Record<string, string> = {
    'servicios': '🔧',
    'productos': '📦',
    'obras': '🏗️',
    'consultoria': '💼'
  };

  const statusNames: Record<string, string> = {
    'borrador': 'Borrador',
    'publicada': 'Publicada',
    'en-evaluacion': 'En Evaluación',
    'adjudicada': 'Adjudicada',
    'cancelada': 'Cancelada'
  };

  const getStatusName = (estado: string): string => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('borrador')) return 'Borrador';
    if (estadoLower.includes('publicada')) return 'Publicada';
    if (estadoLower.includes('evaluacion')) return 'En Evaluación';
    if (estadoLower.includes('adjudicada')) return 'Adjudicada';
    if (estadoLower.includes('cancelada')) return 'Cancelada';
    return estado;
  };

  const getStatusColor = (estado: string): string => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('borrador')) return statusColors['borrador'];
    if (estadoLower.includes('publicada')) return statusColors['publicada'];
    if (estadoLower.includes('evaluacion')) return statusColors['en-evaluacion'];
    if (estadoLower.includes('adjudicada')) return statusColors['adjudicada'];
    if (estadoLower.includes('cancelada')) return statusColors['cancelada'];
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleCreateLicitacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        showNotification('Error: Usuario no identificado', 'error');
        setLoading(false);
        return;
      }

      // Crear licitación en Django
      const nuevaLicitacion = {
        idUsuario_id: parseInt(userId),
        desc: formData.descripcion,
        propuesta: formData.propuesta,
        estado: formData.estado === 'borrador' ? 'Borrador' : 
                formData.estado === 'publicada' ? 'Publicada' :
                formData.estado === 'en-evaluacion' ? 'En Evaluación' :
                formData.estado === 'adjudicada' ? 'Adjudicada' : 'Cancelada'
      };

      const response = await createLicitacion(nuevaLicitacion);

      // Mapear la licitación creada al formato de la app
      const licitacionMapeada: Licitacion = {
        id: response.data.id,
        numero: formData.numero || `LIC-${response.data.id}`,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo as LicitacionTipo,
        monto: parseFloat(formData.monto) || 0,
        moneda: formData.moneda,
        entidad: formData.entidad,
        fechaInicio: formData.fechaInicio ? new Date(formData.fechaInicio) : new Date(),
        fechaCierre: formData.fechaCierre ? new Date(formData.fechaCierre) : new Date(),
        status: formData.estado,
        estado: response.data.estado,
        propuesta: formData.propuesta,
        fechaCreacion: new Date(response.data.fecha_creacion),
        cliente: response.data.idUsuario?.nombre || 'Usuario',
        createdAt: new Date(response.data.fecha_creacion),
        updatedAt: new Date(response.data.fecha_creacion)
      };

      // Agregar a la lista
      setLicitaciones([licitacionMapeada, ...licitaciones]);
      
      // Resetear formulario
      setFormData({
        titulo: '',
        descripcion: '',
        propuesta: '',
        tipo: '',
        monto: '',
        moneda: 'MXN',
        entidad: '',
        estado: 'borrador',
        fechaInicio: '',
        fechaCierre: '',
        numero: ''
      });
      
      setShowNewLicitacion(false);
      showNotification('Licitación creada exitosamente', 'success');
    } catch (error: any) {
      console.error('Error al crear licitación:', error);
      showNotification(error.response?.data?.detail || 'Error al crear la licitación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLicitacion = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta licitación?')) {
      try {
        await deleteLicitacion(id);
        setLicitaciones(licitaciones.filter(l => l.id !== id));
        showNotification('Licitación eliminada exitosamente', 'success');
      } catch (error) {
        console.error('Error al eliminar licitación:', error);
        showNotification('Error al eliminar la licitación', 'error');
      }
    }
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
            {filteredLicitaciones.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <p className="text-gray-500 text-lg">No hay licitaciones disponibles.</p>
              </div>
            ) : (
              filteredLicitaciones.map(licitacion => {
                const fechaCierre = licitacion.fechaCierre || licitacion.fechaCreacion;
                const daysUntilClose = fechaCierre ? Math.ceil((fechaCierre.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                const isUrgent = daysUntilClose <= 7 && daysUntilClose > 0;
                const tipo = licitacion.tipo || 'servicios';
                const numero = licitacion.numero || `LIC-${licitacion.id}`;
                const entidad = licitacion.entidad || 'Sin especificar';
                const estado = getEstado(licitacion);

                return (
                  <div key={licitacion.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow card-hover">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{typeIcons[tipo] || '📄'}</span>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{numero}</h4>
                          <p className="text-sm text-gray-600">{entidad}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(estado)}`}>
                          {getStatusName(estado)}
                        </span>
                        {isUrgent && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">¡Urgente!</span>}
                      </div>
                    </div>

                    <h5 className="font-semibold text-gray-900 mb-3">{licitacion.titulo}</h5>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{licitacion.descripcion}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Monto:</span>
                        <p className="font-semibold text-green-600">
                          ${(licitacion.monto || 0).toLocaleString()} {licitacion.moneda || 'MXN'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Tipo:</span>
                        <p className="font-medium capitalize">{tipo}</p>
                      </div>
                      {licitacion.fechaInicio && (
                        <div>
                          <span className="text-gray-500">Fecha Inicio:</span>
                          <p className="font-medium">{formatDate(licitacion.fechaInicio)}</p>
                        </div>
                      )}
                      {fechaCierre && (
                        <div>
                          <span className="text-gray-500">Fecha Cierre:</span>
                          <p className={`font-medium ${isUrgent ? 'text-red-600' : ''}`}>
                            {formatDate(fechaCierre)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {daysUntilClose > 0 ? `${daysUntilClose} días restantes` : daysUntilClose === 0 ? 'Vence hoy' : 'Vencida'}
                      </span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleDeleteLicitacion(licitacion.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                        >
                          Eliminar
                        </button>
                        <button className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-sm">
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal Nueva Licitación */}
      {showNewLicitacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" onClick={() => !loading && setShowNewLicitacion(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 my-8 max-h-[90vh] overflow-y-auto fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-800">Nueva Licitación</h3>
            </div>
            
            <form onSubmit={handleCreateLicitacion} className="p-6 space-y-4">
              {/* Información Básica */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-gray-800">Información Básica</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Licitación *
                    </label>
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="LIC-2024-001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entidad *
                    </label>
                    <input
                      type="text"
                      value={formData.entidad}
                      onChange={(e) => setFormData({ ...formData, entidad: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Nombre de la entidad"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Título de la licitación"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Descripción detallada de la licitación"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Propuesta *
                  </label>
                  <textarea
                    value={formData.propuesta}
                    onChange={(e) => setFormData({ ...formData, propuesta: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Propuesta técnica y económica"
                  />
                </div>
              </div>

              {/* Clasificación */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-gray-800">Clasificación</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo *
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value as LicitacionTipo })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="servicios">Servicios</option>
                      <option value="productos">Productos</option>
                      <option value="obras">Obras</option>
                      <option value="consultoria">Consultoría</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado *
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value as LicitacionStatus })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="borrador">Borrador</option>
                      <option value="publicada">Publicada</option>
                      <option value="en-evaluacion">En Evaluación</option>
                      <option value="adjudicada">Adjudicada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Información Financiera */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-gray-800">Información Financiera</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto *
                    </label>
                    <input
                      type="number"
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Moneda *
                    </label>
                    <select
                      value={formData.moneda}
                      onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="MXN">MXN - Peso Mexicano</option>
                      <option value="USD">USD - Dólar Estadounidense</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="CLP">CLP - Peso Chileno</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-gray-800">Fechas Importantes</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Cierre
                    </label>
                    <input
                      type="date"
                      value={formData.fechaCierre}
                      onChange={(e) => setFormData({ ...formData, fechaCierre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => !loading && setShowNewLicitacion(false)}
                  disabled={loading}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creando...</span>
                    </>
                  ) : (
                    <span>Crear Licitación</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}