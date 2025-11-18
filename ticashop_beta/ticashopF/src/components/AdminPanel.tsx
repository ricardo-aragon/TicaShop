import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2, Users, FileText, Briefcase, BarChart3, Settings, Plus, Edit2, Trash2, RefreshCw, Database, UserCog } from 'lucide-react';
import {
  getAllUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getAllTickets,
  getAllLicitaciones,
  createLicitacion,
  updateLicitacion,
  deleteLicitacion,
  getAllReportes,
  createReporte,
  updateReporte,
  deleteReporte,
} from '../api/api';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  password?: string;
}

interface Ticket {
  id: number;
  idUsuario: number;
  idTecnico?: number;
  desc: string;
  estado: string;
  fecha_creacion: string;
  fecha_cierre?: string;
}

interface Licitacion {
  id: number;
  idUsuario: number;
  desc: string;
  propuesta: string;
  estado: string;
  fecha_creacion: string;
}

interface Reporte {
  idReporte: number;
  fecha: string;
  ticketsAbiertos: number;
  ticketsCerrados: number;
  tiempoProResolucion: number;
}

type TabType = 'dashboard' | 'usuarios' | 'tickets' | 'licitaciones' | 'reportes' | 'sistema';

// Custom Hook para manejo de datos
function useDataManager() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usuariosRes, ticketsRes, licitacionesRes, reportesRes] = await Promise.all([
        getAllUsuarios(),
        getAllTickets(),
        getAllLicitaciones(),
        getAllReportes(),
      ]);
      
      // Axios devuelve los datos en response.data
      setUsuarios(usuariosRes.data);
      setTickets(ticketsRes.data);
      setLicitaciones(licitacionesRes.data);
      setReportes(reportesRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los datos. Por favor, intenta nuevamente.');
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  return { usuarios, tickets, licitaciones, reportes, loading, error, cargarDatos };
}

// Componente de notificación
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`}>
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span className="font-medium">{message}</span>
    </div>
  );
}

// Componente de tarjeta de estadística
function StatCard({ title, value, icon: Icon, color, bgColor }: { title: string; value: number; icon: any; color: string; bgColor: string }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold" style={{ color }}>{value}</p>
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: bgColor }}>
          <Icon size={32} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

// Componente Modal mejorado
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Componente de tabla genérica
function Table({ columns, data, onEdit, onDelete }: { 
  columns: { key: string; label: string }[]; 
  data: any[]; 
  onEdit: (item: any) => void; 
  onDelete: (id: number) => void;
}) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <Database size={64} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 text-lg font-medium">No hay datos disponibles</p>
        <p className="text-gray-400 text-sm mt-1">Los registros aparecerán aquí una vez que sean creados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-4 text-left text-sm font-semibold text-purple-900">
                {col.label}
              </th>
            ))}
            <th className="px-4 py-4 text-right text-sm font-semibold text-purple-900">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item, idx) => (
            <tr key={idx} className="hover:bg-purple-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
                  {item[col.key] !== undefined && item[col.key] !== null ? String(item[col.key]) : '-'}
                </td>
              ))}
              <td className="px-4 py-3 text-right space-x-2">
                <button
                  onClick={() => onEdit(item)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Edit2 size={14} />
                  <span className="text-xs font-medium">Editar</span>
                </button>
                <button
                  onClick={() => onDelete(item.id || item.idReporte)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={14} />
                  <span className="text-xs font-medium">Eliminar</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Componente principal
export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const { usuarios, tickets, licitaciones, reportes, loading, error, cargarDatos } = useDataManager();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Estados de modales y formularios - USUARIOS
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [userForm, setUserForm] = useState<Partial<Usuario>>({});

  // Estados de modales y formularios - LICITACIONES
  const [showLicitacionModal, setShowLicitacionModal] = useState(false);
  const [editingLicitacion, setEditingLicitacion] = useState<Licitacion | null>(null);
  const [licitacionForm, setLicitacionForm] = useState<Partial<Licitacion>>({});

  // Estados de modales y formularios - REPORTES
  const [showReporteModal, setShowReporteModal] = useState(false);
  const [editingReporte, setEditingReporte] = useState<Reporte | null>(null);
  const [reporteForm, setReporteForm] = useState<Partial<Reporte>>({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // ============ HANDLERS DE USUARIO ============
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingUser) {
        await updateUsuario(editingUser.id, userForm);
        showToast('Usuario actualizado exitosamente', 'success');
      } else {
        await createUsuario(userForm);
        showToast('Usuario creado exitosamente', 'success');
      }
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({});
      await cargarDatos();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error al guardar usuario', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;
    setActionLoading(true);
    try {
      await deleteUsuario(id);
      showToast('Usuario eliminado exitosamente', 'success');
      await cargarDatos();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error al eliminar usuario', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ============ HANDLERS DE LICITACIÓN ============
  const handleSaveLicitacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingLicitacion) {
        await updateLicitacion(editingLicitacion.id, licitacionForm);
        showToast('Licitación actualizada exitosamente', 'success');
      } else {
        await createLicitacion(licitacionForm);
        showToast('Licitación creada exitosamente', 'success');
      }
      setShowLicitacionModal(false);
      setEditingLicitacion(null);
      setLicitacionForm({});
      await cargarDatos();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error al guardar licitación', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLicitacion = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta licitación?')) return;
    setActionLoading(true);
    try {
      await deleteLicitacion(id);
      showToast('Licitación eliminada exitosamente', 'success');
      await cargarDatos();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error al eliminar licitación', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ============ HANDLERS DE REPORTE ============
  const handleSaveReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingReporte) {
        await updateReporte(editingReporte.idReporte, reporteForm);
        showToast('Reporte actualizado exitosamente', 'success');
      } else {
        await createReporte(reporteForm);
        showToast('Reporte creado exitosamente', 'success');
      }
      setShowReporteModal(false);
      setEditingReporte(null);
      setReporteForm({});
      await cargarDatos();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error al guardar reporte', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReporte = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este reporte?')) return;
    setActionLoading(true);
    try {
      await deleteReporte(id);
      showToast('Reporte eliminado exitosamente', 'success');
      await cargarDatos();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error al eliminar reporte', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'tickets', label: 'Tickets', icon: FileText },
    { id: 'licitaciones', label: 'Licitaciones', icon: Briefcase },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
    { id: 'sistema', label: 'Sistema', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-purple-600" size={64} />
          <p className="text-gray-600 font-medium text-lg">Cargando datos del sistema...</p>
          <p className="text-gray-400 text-sm mt-2">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={cargarDatos} 
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-md"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-white shadow-md border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCog className="text-purple-600" size={32} />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Panel de Administración
              </h1>
            </div>
            <button 
              onClick={onBack} 
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm border-b sticky top-[73px] z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-5 py-3 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Resumen del Sistema</h2>
              <button
                onClick={cargarDatos}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <RefreshCw size={18} />
                Actualizar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Usuarios" value={usuarios.length} icon={Users} color="#8b5cf6" bgColor="#f3e8ff" />
              <StatCard title="Tickets" value={tickets.length} icon={FileText} color="#3b82f6" bgColor="#dbeafe" />
              <StatCard title="Licitaciones" value={licitaciones.length} icon={Briefcase} color="#10b981" bgColor="#d1fae5" />
              <StatCard title="Reportes" value={reportes.length} icon={BarChart3} color="#f59e0b" bgColor="#fef3c7" />
            </div>
            
            {/* Resumen adicional */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Users size={20} className="text-purple-600" />
                  Usuarios por Rol
                </h3>
                <div className="space-y-2">
                  {['admin', 'soporte', 'tecnico'].map(rol => {
                    const count = usuarios.filter(u => u.rol === rol).length;
                    return (
                      <div key={rol} className="flex justify-between items-center">
                        <span className="text-gray-600 capitalize">{rol}</span>
                        <span className="font-semibold text-purple-600">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  Estado de Tickets
                </h3>
                <div className="space-y-2">
                  {['Abierto', 'En Proceso', 'Cerrado'].map(estado => {
                    const count = tickets.filter(t => t.estado === estado).length;
                    return (
                      <div key={estado} className="flex justify-between items-center">
                        <span className="text-gray-600">{estado}</span>
                        <span className="font-semibold text-blue-600">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USUARIOS */}
        {activeTab === 'usuarios' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
              <button
                onClick={() => {
                  setUserForm({});
                  setEditingUser(null);
                  setShowUserModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
              >
                <Plus size={18} />
                Nuevo Usuario
              </button>
            </div>
            <Table
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'nombre', label: 'Nombre' },
                { key: 'apellido', label: 'Apellido' },
                { key: 'correo', label: 'Correo' },
                { key: 'rol', label: 'Rol' },
              ]}
              data={usuarios}
              onEdit={(u) => {
                setEditingUser(u);
                setUserForm({ ...u, password: '' });
                setShowUserModal(true);
              }}
              onDelete={handleDeleteUser}
            />
          </div>
        )}

        {/* TICKETS */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Tickets</h2>
            </div>
            <Table
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'idUsuario', label: 'Usuario ID' },
                { key: 'idTecnico', label: 'Técnico ID' },
                { key: 'desc', label: 'Descripción' },
                { key: 'estado', label: 'Estado' },
                { key: 'fecha_creacion', label: 'Fecha Creación' },
              ]}
              data={tickets}
              onEdit={(t) => {
                showToast('Funcionalidad de edición de tickets en desarrollo', 'error');
              }}
              onDelete={(id) => {
                showToast('Funcionalidad de eliminación de tickets en desarrollo', 'error');
              }}
            />
          </div>
        )}

        {/* LICITACIONES */}
        {activeTab === 'licitaciones' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Licitaciones</h2>
              <button
                onClick={() => {
                  setEditingLicitacion(null);
                  setLicitacionForm({ estado: 'Publicada' });
                  setShowLicitacionModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
              >
                <Plus size={18} />
                Nueva Licitación
              </button>
            </div>
            <Table
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'idUsuario', label: 'Usuario ID' },
                { key: 'desc', label: 'Descripción' },
                { key: 'propuesta', label: 'Propuesta' },
                { key: 'estado', label: 'Estado' },
                { key: 'fecha_creacion', label: 'Fecha' },
              ]}
              data={licitaciones}
              onEdit={(l) => {
                setEditingLicitacion(l);
                setLicitacionForm(l);
                setShowLicitacionModal(true);
              }}
              onDelete={handleDeleteLicitacion}
            />
          </div>
        )}

        {/* REPORTES */}
        {activeTab === 'reportes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Reportes</h2>
              <button
                onClick={() => {
                  setEditingReporte(null);
                  setReporteForm({});
                  setShowReporteModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
              >
                <Plus size={18} />
                Nuevo Reporte
              </button>
            </div>
            <Table
              columns={[
                { key: 'idReporte', label: 'ID' },
                { key: 'fecha', label: 'Fecha' },
                { key: 'ticketsAbiertos', label: 'Abiertos' },
                { key: 'ticketsCerrados', label: 'Cerrados' },
                { key: 'tiempoProResolucion', label: 'Promedio (hrs)' },
              ]}
              data={reportes}
              onEdit={(r) => {
                setEditingReporte(r);
                setReporteForm(r);
                setShowReporteModal(true);
              }}
              onDelete={handleDeleteReporte}
            />
          </div>
        )}

        {/* SISTEMA */}
        {activeTab === 'sistema' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Settings size={24} className="text-purple-600" />
              Herramientas del Sistema
            </h2>
            <div className="space-y-4">
              <button
                onClick={cargarDatos}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md w-full md:w-auto"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Recargar todos los datos
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  showToast('Cache y almacenamiento local limpiados exitosamente', 'success');
                }}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md w-full md:w-auto"
              >
                <Trash2 size={18} />
                Limpiar cache local
              </button>
              
              <div className="pt-6 border-t mt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total de registros:</span>
                  <span className="font-semibold text-gray-800">{usuarios.length + tickets.length + licitaciones.length + reportes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">API Base URL:</span>
                  <span className="font-mono text-sm text-gray-600">http://localhost:8000</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ MODAL USUARIO ============ */}
      {showUserModal && (
        <Modal title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'} onClose={() => setShowUserModal(false)}>
          <form onSubmit={handleSaveUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                value={userForm.nombre || ''}
                onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
                required
                placeholder="Ingrese el nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                value={userForm.apellido || ''}
                onChange={(e) => setUserForm({ ...userForm, apellido: e.target.value })}
                required
                placeholder="Ingrese el apellido"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                value={userForm.correo || ''}
                onChange={(e) => setUserForm({ ...userForm, correo: e.target.value })}
                required
                placeholder="usuario@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                value={userForm.rol || ''}
                onChange={(e) => setUserForm({ ...userForm, rol: e.target.value })}
                required
              >
                <option value="">Seleccione un rol</option>
                <option value="admin">Administrador</option>
                <option value="soporte">Soporte</option>
                <option value="tecnico">Técnico</option>
                <option value="especialista">especialista</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña {!editingUser && '*'}
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                value={userForm.password || ''}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                required={!editingUser}
                placeholder={editingUser ? 'Dejar en blanco para no cambiar' : 'Ingrese una contraseña'}
              />
              {editingUser && (
                <p className="text-xs text-gray-500 mt-1">Dejar en blanco si no desea cambiar la contraseña</p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 size={16} className="animate-spin" />}
                {editingUser ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============ MODAL LICITACIÓN ============ */}
      {showLicitacionModal && (
        <Modal title={editingLicitacion ? 'Editar Licitación' : 'Nueva Licitación'} onClose={() => setShowLicitacionModal(false)}>
          <form onSubmit={handleSaveLicitacion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Usuario *</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                value={licitacionForm.idUsuario || ''}
                onChange={(e) => setLicitacionForm({ ...licitacionForm, idUsuario: Number(e.target.value) })}
                required
                placeholder="Ingrese el ID del usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                value={licitacionForm.desc || ''}
                onChange={(e) => setLicitacionForm({ ...licitacionForm, desc: e.target.value })}
                required
                placeholder="Describa la licitación..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Propuesta *</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                value={licitacionForm.propuesta || ''}
                onChange={(e) => setLicitacionForm({ ...licitacionForm, propuesta: e.target.value })}
                required
                placeholder="Detalle la propuesta..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                value={licitacionForm.estado || 'Publicada'}
                onChange={(e) => setLicitacionForm({ ...licitacionForm, estado: e.target.value })}
              >
                <option value="Publicada">Publicada</option>
                <option value="En Evaluación">En Evaluación</option>
                <option value="Finalizada">Finalizada</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLicitacionModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 size={16} className="animate-spin" />}
                {editingLicitacion ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============ MODAL REPORTE ============ */}
      {showReporteModal && (
        <Modal title={editingReporte ? 'Editar Reporte' : 'Nuevo Reporte'} onClose={() => setShowReporteModal(false)}>
          <form onSubmit={handleSaveReporte} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tickets Abiertos *</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                value={reporteForm.ticketsAbiertos || ''}
                onChange={(e) => setReporteForm({ ...reporteForm, ticketsAbiertos: Number(e.target.value) })}
                required
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tickets Cerrados *</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                value={reporteForm.ticketsCerrados || ''}
                onChange={(e) => setReporteForm({ ...reporteForm, ticketsCerrados: Number(e.target.value) })}
                required
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo Promedio de Resolución (horas) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                value={reporteForm.tiempoProResolucion || ''}
                onChange={(e) => setReporteForm({ ...reporteForm, tiempoProResolucion: Number(e.target.value) })}
                required
                placeholder="0.0"
              />
              <p className="text-xs text-gray-500 mt-1">Ejemplo: 2.5 horas</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReporteModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 size={16} className="animate-spin" />}
                {editingReporte ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}         