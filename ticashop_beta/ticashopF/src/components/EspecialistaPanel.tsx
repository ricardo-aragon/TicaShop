import { useState, useEffect } from 'react';
import { Users, FileText, Briefcase, BarChart3, Plus, Edit2, Trash2, RefreshCw, UserPlus, ClipboardList } from 'lucide-react';
import {
  getAllUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getAllTickets,
  asignarTecnico,
  getAllLicitaciones,
  createLicitacion,
  updateLicitacion,
  deleteLicitacion,
  getAllReportes,
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
  titulo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  customer: string;
  email: string;
  assignedTo: string | null;
  fecha_creacion: string;
}

type TabType = 'dashboard' | 'usuarios-soporte' | 'tickets' | 'licitaciones' | 'reportes';

// Toast Component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`}>
      <span className="font-medium">{message}</span>
    </div>
  );
}

// Modal Component
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
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

// StatCard Component
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

export default function EspecialistaPanel({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Estados de datos
  const [usuariosSoporte, setUsuariosSoporte] = useState<Usuario[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [licitaciones, setLicitaciones] = useState<any[]>([]);
  const [reportes, setReportes] = useState<any[]>([]);

  // Estados de modales - USUARIOS SOPORTE
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [userForm, setUserForm] = useState<Partial<Usuario>>({});

  // Estados de modales - LICITACIONES
  const [showLicitacionModal, setShowLicitacionModal] = useState(false);
  const [editingLicitacion, setEditingLicitacion] = useState<any>(null);
  const [licitacionForm, setLicitacionForm] = useState<any>({});

  // Estados de modales - ASIGNAR TICKETS
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedSoporte, setSelectedSoporte] = useState<number | ''>('');

  useEffect(() => {
    cargarDatos();
  }, []);
    
    const transformTicketFromBackend = (t: any): Ticket => {
    return {
        id: t.id,
        titulo: t.titulo || t.title || 'Sin título',
        descripcion: t.desc || t.description || t.descripcion || '',
        prioridad: t.prioridad || t.priority || 'media',
        estado: t.estado || t.status || 'Abierto',
        customer: t.nombre_cliente || t.customer || 'Cliente desconocido',
        email: t.email_cliente || t.email || '',
        assignedTo: t.idTecnico?.nombre 
        ? `${t.idTecnico.nombre} ${t.idTecnico.apellido}` 
        : t.assignedTo || null,
        fecha_creacion: t.fecha_creacion || new Date().toISOString()
    };
    };

    const transformLicitacionFromBackend = (l: any) => {
    return {
        id: l.id,
        desc: l.desc || l.descripcion || 'Sin descripción',
        propuesta: l.propuesta || '',
        estado: l.estado || 'Publicada',
        fecha_creacion: l.fecha_creacion || new Date().toISOString(),
        idUsuario: l.idUsuario || {}
    };
    };

    // ============ CARGAR DATOS CON TRANSFORMACIÓN ============
    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [usuariosRes, ticketsRes, licitacionesRes, reportesRes] = await Promise.all([
            getAllUsuarios(),
            getAllTickets(),
            getAllLicitaciones(),
            getAllReportes(),
            ]);

            console.log('🔍 DEBUG - Respuesta RAW de tickets:', ticketsRes.data);
            console.log('🔍 DEBUG - Primer ticket RAW:', ticketsRes.data[0]);

            // Filtrar solo usuarios con rol "soporte"
            const soporte = usuariosRes.data.filter((u: Usuario) => u.rol === 'soporte');
            setUsuariosSoporte(soporte);
            
            // Transformar tickets
            const ticketsTransformados = ticketsRes.data.map(transformTicketFromBackend);
            setTickets(ticketsTransformados);
            console.log('✅ DEBUG - Tickets transformados:', ticketsTransformados);
            console.log('✅ DEBUG - Primer ticket transformado:', ticketsTransformados[0]);
            // Transformar licitaciones
            const licitacionesTransformadas = licitacionesRes.data.map(transformLicitacionFromBackend);
            setLicitaciones(licitacionesTransformadas);
            
            // Reportes ya vienen en formato correcto
            setReportes(reportesRes.data);

            console.log('✅ Datos cargados:', {
            soporte: soporte.length,
            tickets: ticketsTransformados.length,
            licitaciones: licitacionesTransformadas.length,
            reportes: reportesRes.data.length
            });
        } catch (error) {
            console.error('❌ Error al cargar datos:', error);
            showToast('Error al cargar los datos', 'error');
        } finally {
            setLoading(false);
        }
        };
    
        const showToast = (message: string, type: 'success' | 'error') => {
            setToast({ message, type });
            };
        
        const handleSaveUser = async (e: React.FormEvent) => {
            e.preventDefault();
            setActionLoading(true);
            try {
                const userData = {
                ...userForm,
                rol: 'soporte'
                };

                if (editingUser) {
                await updateUsuario(editingUser.id, userData);
                showToast('Usuario de soporte actualizado exitosamente', 'success');
                } else {
                await createUsuario(userData);
                showToast('Usuario de soporte creado exitosamente', 'success');
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
    if (!confirm('¿Estás seguro de eliminar este usuario de soporte?')) return;
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

  // ============ ASIGNACIÓN DE TICKETS ============
  const handleOpenAssignModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSelectedSoporte('');
    setShowAssignModal(true);
  };

  const handleAssignTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !selectedSoporte) return;

    setActionLoading(true);
    try {
      await asignarTecnico(selectedTicket.id, Number(selectedSoporte));
      showToast('Ticket asignado exitosamente', 'success');
      setShowAssignModal(false);
      setSelectedTicket(null);
      setSelectedSoporte('');
      await cargarDatos();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Error al asignar ticket', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAutoAssign = async (ticketId: number) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      showToast('Error: Usuario no identificado', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await asignarTecnico(ticketId, parseInt(userId));
      showToast('Ticket auto-asignado exitosamente', 'success');
      await cargarDatos();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Error al auto-asignar ticket', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ============ GESTIÓN DE LICITACIONES ============
  const handleSaveLicitacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const licitacionData = {
        ...licitacionForm,
        idUsuario_id: parseInt(userId || '0')
      };

      if (editingLicitacion) {
        await updateLicitacion(editingLicitacion.id, licitacionData);
        showToast('Licitación actualizada exitosamente', 'success');
      } else {
        await createLicitacion(licitacionData);
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

  // Filtrar tickets según prioridad (media o alta)
  const ticketsAsignables = tickets.filter(t => {
    const prioridad = (t.prioridad || '').toLowerCase();
    const esMedia = prioridad === 'media' || prioridad === 'medium';
    const esAlta = prioridad === 'alta' || prioridad === 'high' || prioridad === 'urgente';
    
    console.log(`🎯 Ticket ${t.id} - Prioridad: "${t.prioridad}" - Pasa filtro: ${esMedia || esAlta}`);
    
    return esMedia || esAlta;
    });

    console.log('📋 Total tickets asignables:', ticketsAsignables.length);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'usuarios-soporte', label: 'Usuarios Soporte', icon: Users },
    { id: 'tickets', label: 'Tickets', icon: FileText },
    { id: 'licitaciones', label: 'Licitaciones', icon: Briefcase },
    { id: 'reportes', label: 'Reportes', icon: ClipboardList },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Cargando panel de especialista...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-white shadow-md border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                <Users className="text-white" size={28} />
              </div>
              <h1 className="text-3xl font-bold from-indigo-600 to-purple-600 bg-clip-text text-purple">
                Panel de Especialista
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
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
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
              <h2 className="text-2xl font-bold text-gray-800">Resumen General</h2>
              <button
                onClick={cargarDatos}
                className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <RefreshCw size={18} />
                Actualizar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Usuarios Soporte" value={usuariosSoporte.length} icon={Users} color="#6366f1" bgColor="#eef2ff" />
              <StatCard title="Tickets Asignables" value={ticketsAsignables.length} icon={FileText} color="#8b5cf6" bgColor="#f3e8ff" />
              <StatCard title="Licitaciones" value={licitaciones.length} icon={Briefcase} color="#ec4899" bgColor="#fce7f3" />
              <StatCard title="Reportes" value={reportes.length} icon={ClipboardList} color="#14b8a6" bgColor="#ccfbf1" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-indigo-600" />
                  Tickets por Prioridad
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Alta</span>
                    <span className="font-semibold text-red-600">
                      {tickets.filter(t => t.prioridad?.toLowerCase() === 'alta').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Media</span>
                    <span className="font-semibold text-yellow-600">
                      {tickets.filter(t => t.prioridad?.toLowerCase() === 'media').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Baja</span>
                    <span className="font-semibold text-green-600">
                      {tickets.filter(t => t.prioridad?.toLowerCase() === 'baja').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Users size={20} className="text-purple-600" />
                  Personal de Soporte
                </h3>
                <div className="space-y-2">
                  {usuariosSoporte.slice(0, 5).map(user => (
                    <div key={user.id} className="flex justify-between items-center">
                      <span className="text-gray-600">{user.nombre} {user.apellido}</span>
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                        Soporte
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USUARIOS SOPORTE */}
        {activeTab === 'usuarios-soporte' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios Soporte</h2>
              <button
                onClick={() => {
                  setUserForm({ rol: 'soporte' });
                  setEditingUser(null);
                  setShowUserModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
              >
                <UserPlus size={18} />
                Nuevo Usuario Soporte
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-indigo-900">ID</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-indigo-900">Nombre</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-indigo-900">Apellido</th>
                    <th className="px-4 py-4 text-left text-sm font-semibold text-indigo-900">Correo</th>
                    <th className="px-4 py-4 text-right text-sm font-semibold text-indigo-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {usuariosSoporte.map((user) => (
                    <tr key={user.id} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-700">{user.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{user.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{user.apellido}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{user.correo}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setUserForm({ ...user, password: '' });
                            setShowUserModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit2 size={14} />
                          <span className="text-xs font-medium">Editar</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
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
          </div>
        )}

        {/* TICKETS */}
        {activeTab === 'tickets' && (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de Tickets (Prioridad Media/Alta)</h2>
                <div className="flex gap-4 items-center">
                    <div className="text-sm text-gray-600">
                    <span className="font-semibold">{ticketsAsignables.length}</span> tickets asignables
                    </div>
                    <div className="text-xs text-gray-500">
                    (Total en sistema: {tickets.length})
                    </div>
                </div>
                </div>

                {/* 🔍 DEBUG: Mostrar información detallada */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">🔍 Información de Debug</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                    <span className="text-blue-700">Total tickets:</span>
                    <span className="font-bold ml-2">{tickets.length}</span>
                    </div>
                    <div>
                    <span className="text-blue-700">Prioridad Alta:</span>
                    <span className="font-bold ml-2">
                        {tickets.filter(t => {
                        const p = (t.prioridad || '').toLowerCase();
                        return p === 'alta' || p === 'high';
                        }).length}
                    </span>
                    </div>
                    <div>
                    <span className="text-blue-700">Prioridad Media:</span>
                    <span className="font-bold ml-2">
                        {tickets.filter(t => {
                        const p = (t.prioridad || '').toLowerCase();
                        return p === 'media' || p === 'medium';
                        }).length}
                    </span>
                    </div>
                    <div>
                    <span className="text-blue-700">Asignables:</span>
                    <span className="font-bold ml-2">{ticketsAsignables.length}</span>
                    </div>
                </div>
                
                {/* Mostrar todas las prioridades únicas */}
                <details className="mt-3">
                    <summary className="text-xs text-blue-700 cursor-pointer hover:text-blue-900">
                    Ver todas las prioridades en el sistema
                    </summary>
                    <div className="mt-2 bg-white p-3 rounded text-xs">
                    <p className="font-semibold mb-2">Prioridades encontradas:</p>
                    {[...new Set(tickets.map(t => t.prioridad))].map((prioridad, idx) => (
                        <span key={idx} className="inline-block bg-gray-100 px-2 py-1 rounded mr-2 mb-2">
                        "{prioridad}" ({tickets.filter(t => t.prioridad === prioridad).length} tickets)
                        </span>
                    ))}
                    </div>
                </details>
                </div>

                {/* Mensaje si no hay tickets */}
                {ticketsAsignables.length === 0 && tickets.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                    <div className="text-4xl">⚠️</div>
                    <div>
                        <h3 className="text-yellow-900 font-semibold mb-2">
                        No hay tickets con prioridad Media o Alta
                        </h3>
                        <p className="text-yellow-800 text-sm mb-3">
                        Hay {tickets.length} tickets en total, pero ninguno tiene prioridad media o alta.
                        </p>
                        <button
                        onClick={() => {
                            console.log('📋 Todos los tickets:', tickets);
                            alert('Revisa la consola del navegador (F12) para ver los detalles de todos los tickets');
                        }}
                        className="text-xs bg-yellow-200 hover:bg-yellow-300 text-yellow-900 px-3 py-1 rounded"
                        >
                        Ver detalles en consola
                        </button>
                    </div>
                    </div>
                </div>
                )}

                {ticketsAsignables.length === 0 && tickets.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-6xl mb-3">📭</div>
                    <h3 className="text-gray-700 font-semibold mb-2">No hay tickets en el sistema</h3>
                    <p className="text-gray-600 text-sm">
                    Aún no se han creado tickets en el sistema.
                    </p>
                </div>
                )}

                {/* Lista de tickets */}
                <div className="grid grid-cols-1 gap-4">
                {ticketsAsignables.map((ticket) => (
                    <div key={ticket.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            Ticket #{ticket.id} - {ticket.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{ticket.customer}</p>
                        </div>
                        <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            ticket.prioridad?.toLowerCase() === 'alta' || ticket.prioridad?.toLowerCase() === 'high'
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {ticket.prioridad}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {ticket.estado}
                        </span>
                        </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{ticket.descripcion}</p>

                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                        {ticket.assignedTo ? (
                            <span className="text-green-600 font-medium">
                            Asignado a: {ticket.assignedTo}
                            </span>
                        ) : (
                            <span className="text-orange-600 font-medium">Sin asignar</span>
                        )}
                        </div>
                        <div className="flex gap-2">
                        <button
                            onClick={() => handleAutoAssign(ticket.id)}
                            disabled={!!ticket.assignedTo}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            Auto-asignarme
                        </button>
                        <button
                            onClick={() => handleOpenAssignModal(ticket)}
                            disabled={!!ticket.assignedTo}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            Asignar a Soporte
                        </button>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
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
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-md"
              >
                <Plus size={18} />
                Nueva Licitación
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {licitaciones.map((lic) => (
                <div key={lic.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{lic.desc}</h3>
                      <p className="text-sm text-gray-600 mt-1">Estado: {lic.estado}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingLicitacion(lic);
                          setLicitacionForm(lic);
                          setShowLicitacionModal(true);
                        }}
                        className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteLicitacion(lic.id)}
                        className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{lic.propuesta}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORTES */}
        {activeTab === 'reportes' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Visualización de Reportes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Reportes Totales</h3>
                <p className="text-4xl font-bold text-indigo-600">{reportes.length}</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tickets en Sistema</h3>
                <p className="text-4xl font-bold text-purple-600">{tickets.length}</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Licitaciones Activas</h3>
                <p className="text-4xl font-bold text-pink-600">{licitaciones.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Últimos Reportes</h3>
              <div className="space-y-3">
                {reportes.slice(0, 5).map((rep) => ( // ⬅️ Deja solo este .map()
                  <div key={rep.idReporte} className="border-b pb-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Reporte #{rep.idReporte}</span>
                      <span className="text-sm text-gray-500">{new Date(rep.fecha).toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-gray-600">Abiertos: </span>
                        <span className="font-semibold text-orange-600">{rep.ticketsAbiertos}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Cerrados: </span>
                        <span className="font-semibold text-green-600">{rep.ticketsCerrados}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tiempo Prom: </span>
                        <span className="font-semibold text-blue-600">{rep.tiempoProResolucion}h</span>
                      </div>
                    </div>
                  </div>
                ))} 
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ MODAL USUARIO SOPORTE ============ */}
      {showUserModal && (
        <Modal title={editingUser ? 'Editar Usuario Soporte' : 'Nuevo Usuario Soporte'} onClose={() => setShowUserModal(false)}>
          <form onSubmit={handleSaveUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  value={userForm.apellido || ''}
                  onChange={(e) => setUserForm({ ...userForm, apellido: e.target.value })}
                  required
                  placeholder="Ingrese el apellido"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                value={userForm.correo || ''}
                onChange={(e) => setUserForm({ ...userForm, correo: e.target.value })}
                required
                placeholder="usuario@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña {!editingUser && '*'}
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                value={userForm.password || ''}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                required={!editingUser}
                placeholder={editingUser ? 'Dejar en blanco para no cambiar' : 'Ingrese una contraseña'}
              />
              {editingUser && (
                <p className="text-xs text-gray-500 mt-1">Dejar en blanco si no desea cambiar la contraseña</p>
              )}
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg">
              <p className="text-sm text-indigo-800">
                <strong>Rol:</strong> Soporte (asignado automáticamente)
              </p>
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
                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
              >
                {actionLoading ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============ MODAL ASIGNAR TICKET ============ */}
    {showAssignModal && selectedTicket && (
    <Modal title={`Asignar Ticket #${selectedTicket.id}`} onClose={() => setShowAssignModal(false)}>
        <form onSubmit={handleAssignTicket} className="space-y-4">
        {/* Información del ticket */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            {selectedTicket.titulo}
            </h4>
            <p className="text-sm text-gray-600 mb-3">{selectedTicket.descripcion}</p>
            <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                selectedTicket.prioridad?.toLowerCase() === 'alta' 
                ? 'bg-red-100 text-red-800 border border-red-200' 
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}>
                🔥 {selectedTicket.prioridad}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                📊 {selectedTicket.estado}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                👤 {selectedTicket.customer}
            </span>
            </div>
        </div>

        {/* Selector de usuario */}
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
            👨‍💼 Seleccionar Usuario de Soporte *
            </label>
            <select
            value={selectedSoporte}
            onChange={(e) => setSelectedSoporte(Number(e.target.value))}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-base"
            >
            <option value="">-- Seleccione un usuario --</option>
            {usuariosSoporte.map(user => (
                <option key={user.id} value={user.id}>
                {user.nombre} {user.apellido} • {user.correo}
                </option>
            ))}
            </select>
            
            {usuariosSoporte.length === 0 && (
            <p className="text-xs text-red-600 mt-2">
                ⚠️ No hay usuarios de soporte disponibles. Crea uno primero.
            </p>
            )}
        </div>

        {/* Información adicional */}
        {selectedSoporte && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
                ✅ El ticket será asignado a: <strong>
                {usuariosSoporte.find(u => u.id === Number(selectedSoporte))?.nombre}{' '}
                {usuariosSoporte.find(u => u.id === Number(selectedSoporte))?.apellido}
                </strong>
            </p>
            </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
            type="button"
            onClick={() => setShowAssignModal(false)}
            className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-base"
            >
            ❌ Cancelar
            </button>
            <button
            type="submit"
            disabled={actionLoading || !selectedSoporte}
            className="flex-1 py-3 px-4 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base shadow-lg flex items-center justify-center gap-2"
            >
            {actionLoading ? (
                <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Asignando...</span>
                </>
            ) : (
                <>
                <span>✅</span>
                <span>Asignar Ticket</span>
                </>
            )}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                value={licitacionForm.desc || ''}
                onChange={(e) => setLicitacionForm({ ...licitacionForm, desc: e.target.value })}
                required
                placeholder="Describe la licitación..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Propuesta *</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                value={licitacionForm.propuesta || ''}
                onChange={(e) => setLicitacionForm({ ...licitacionForm, propuesta: e.target.value })}
                required
                placeholder="Detalle la propuesta..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                value={licitacionForm.estado || 'Publicada'}
                onChange={(e) => setLicitacionForm({ ...licitacionForm, estado: e.target.value })}
              >
                <option value="Publicada">Publicada</option>
                <option value="En Evaluación">En Evaluación</option>
                <option value="Finalizada">Finalizada</option>
                <option value="Cancelada">Cancelada</option>
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
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {actionLoading ? 'Guardando...' : (editingLicitacion ? 'Actualizar' : 'Crear')}
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