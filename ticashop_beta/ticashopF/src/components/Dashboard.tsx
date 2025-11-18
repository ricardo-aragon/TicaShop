import { useState, useEffect } from 'react';
import { Ticket, Licitacion, Priority, TicketStatus, Category } from '../types';
import StatsCards from './StatsCards';
import TicketList from './TicketList';
import Filters from './Filters';
import QuickActions from './QuickActions';
import PerformanceMetrics from './PerformanceMetrics';
import NewTicketModal from './NewTicketModal';
import TicketDetailModal from './TicketDetailModal';
import LicitacionesModal from './LicitacionesModal';
import ReportesModal from './ReportesModal';
import { showNotification } from '../utils/notifications';
import { getCurrentUser } from "../api/api"; 
import { 
  getAllTickets, 
  createTicket, 
  updateTicket,
  deleteTicket,
  getAllLicitaciones,
  getAllReportes 
} from '../api/api';

interface DashboardProps {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  licitaciones: Licitacion[];
  setLicitaciones: React.Dispatch<React.SetStateAction<Licitacion[]>>;
}

export default function Dashboard({ tickets, setTickets, licitaciones, setLicitaciones }: DashboardProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showTicketDetailModal, setShowTicketDetailModal] = useState(false);
  const [showLicitacionesModal, setShowLicitacionesModal] = useState(false);
  const [showReportesModal, setShowReportesModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('');


  
  
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [ticketsRes, licitacionesRes] = await Promise.all([
        getAllTickets(),
        getAllLicitaciones()
      ]);
      
      console.log("=== TICKETS DESDE BACKEND ===");
      console.log("Cantidad de tickets:", ticketsRes.data.length);
      console.log("Primer ticket RAW:", ticketsRes.data[0]);
      console.log("============================");
      
      // ✅ USAR LA FUNCIÓN mapDjangoTicket EXISTENTE EN LUGAR DE DUPLICAR CÓDIGO
      const ticketsMapeados: Ticket[] = ticketsRes.data.map((t: any) => mapDjangoTicket(t));

      const licitacionesMapeadas: Licitacion[] = licitacionesRes.data.map((l: any) => ({
        id: l.id,
        titulo: (l.desc || l.titulo || "Sin título").substring(0, 50), // ✅ Validación segura
        descripcion: l.desc || l.descripcion || "",
        propuesta: l.propuesta || "",
        estado: l.estado || "borrador",
        fechaCreacion: new Date(l.fecha_creacion),
        cliente: l.idUsuario?.nombre || 'Cliente Desconocido',
        monto: l.monto || 0
      }));

      setTickets(ticketsMapeados);
      setLicitaciones(licitacionesMapeadas);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  
  const mapPriorityFromEstado = (estado: string): Priority => {
    if (estado.toLowerCase().includes('urgente')) return 'high';
    if (estado.toLowerCase().includes('importante')) return 'medium';
    return 'low';
  };

  
  const mapStatusFromEstado = (estado: string): TicketStatus => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('abierto') || estadoLower.includes('nuevo')) return 'open';
    if (estadoLower.includes('proceso') || estadoLower.includes('progreso')) return 'in-progress';
    if (estadoLower.includes('cerrado') || estadoLower.includes('resuelto')) return 'closed';
    return 'open';
  };

  
  const mapStatusToDjango = (status: TicketStatus): string => {
    const statusMap: Record<TicketStatus, string> = {
      'open': 'Abierto',
      'in-progress': 'En Proceso',
      'closed': 'Cerrado'
    };
    return statusMap[status] || 'Abierto';
  };

  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter && ticket.status !== statusFilter) return false;
    if (priorityFilter && ticket.priority !== priorityFilter) return false;
    if (categoryFilter && ticket.category !== categoryFilter) return false;
    return true;
  }).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const handleCreateTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'assignedTo'>) => {
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        showNotification('Error: Usuario no identificado', 'error');
        return;
      }
      console.log("=== DEBUG CREAR TICKET ===");
      console.log("ticketData recibido:", ticketData);
      console.log("customer:", ticketData.customer);
      console.log("email:", ticketData.email);
      console.log("phone:", ticketData.phone);
      console.log("========================");

      // Mapear prioridad al formato Django
      const prioridadMap: Record<string, string> = {
        'high': 'alta',
        'medium': 'media',
        'low': 'baja'
      };

      // Mapear categoría al formato Django
      const categoriaMap: Record<string, string> = {
        'technical': 'technical',
        'account': 'account',
        'order': 'order',
        'billing': 'billing',
        'other': 'other'
      };

      // ✅ NUEVO: Incluir TODOS los campos del cliente
      const nuevoTicketDjango = {
        idUsuario_id: parseInt(userId),
        
        // Información del cliente
        nombre_cliente: ticketData.customer,
        email_cliente: ticketData.email,
        telefono_cliente: ticketData.phone || '',
        
        // Información del ticket
        titulo: ticketData.title,
        desc: ticketData.description,
        categoria: categoriaMap[ticketData.category] || 'technical',
        prioridad: prioridadMap[ticketData.priority] || 'media',
        estado: mapStatusToDjango(ticketData.status)
      };

      console.log("📤 Enviando ticket con datos del cliente:", nuevoTicketDjango);

      const response = await createTicket(nuevoTicketDjango);

      console.log("✅ Respuesta completa de Django:", response.data);

      // Recargar datos
      await cargarDatos();
      
      setShowNewTicketModal(false);
      showNotification('Ticket creado exitosamente', 'success');
    } catch (error: any) {
      console.error('Error al crear ticket:', error);
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.idUsuario_id?.[0] || 
                      'Error al crear el ticket';
      showNotification(errorMsg, 'error');
    }
  };

  const handleTicketClick = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    setShowTicketDetailModal(true);
  };

  const mapDjangoTicket = (t: any): Ticket => ({
    id: t.id,
    
    // ✅ Validación segura en el title
    title: t.titulo || t.title || (t.desc ? t.desc.substring(0, 50) : "Ticket sin título"),
    
    description: t.desc || t.descripcion || "",

    // ✅ Usar los datos transformados que vienen de la API
    customer: t.customer || t.nombre_cliente || "Cliente Desconocido",
    email: t.email || t.email_cliente || "",
    phone: t.phone || t.telefono_cliente || undefined,

    // Estado → status interno
    status:
      (t.status === "open" || t.estado?.toLowerCase() === "abierto") ? "open" :
      (t.status === "in-progress" || t.estado?.toLowerCase() === "en proceso") ? "in-progress" :
      (t.status === "closed" || t.estado?.toLowerCase() === "cerrado") ? "closed" :
      "open",

    // Prioridad
    priority:
      (t.priority === "high" || t.prioridad?.toLowerCase() === "alta") ? "high" :
      (t.priority === "medium" || t.prioridad?.toLowerCase() === "media") ? "medium" :
      (t.priority === "low" || t.prioridad?.toLowerCase() === "baja") ? "low" :
      "medium",

    // Categoría
    category: (t.category || t.categoria || "technical") as Category,

    // Técnico asignado - Soporta ambos formatos
    assignedTo: t.assignedTo || 
                (t.idTecnico ? `${t.idTecnico.nombre} ${t.idTecnico.apellido}` : null),

    // Fechas
    createdAt: t.createdAt || new Date(t.fecha_creacion),
    updatedAt: t.updatedAt || new Date(t.fecha_actualizacion ?? t.fecha_creacion),

    // Comentarios
    comments: t.comments || []
  });

  const handleUpdateTicket = (responseTicket: any) => {
    const ticketMapped = mapDjangoTicket(responseTicket);

    setTickets(prev =>
      prev.map(t => (t.id === ticketMapped.id ? ticketMapped : t))
    );
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este ticket?')) {
      try {
        await deleteTicket(ticketId);
        setTickets(tickets.filter(t => t.id !== ticketId));
        showNotification('Ticket eliminado exitosamente', 'success');
      } catch (error) {
        console.error('Error al eliminar ticket:', error);
        showNotification('Error al eliminar el ticket', 'error');
      }
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
  };

  const showTicketsByStatus = (status: TicketStatus) => {
    setStatusFilter(status);
    setPriorityFilter('');
    setCategoryFilter('');
  };

  const showTicketsByPriority = (priority: Priority) => {
    setStatusFilter('');
    setPriorityFilter(priority);
    setCategoryFilter('');
  };

  const showTicketsToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt);
      ticketDate.setHours(0, 0, 0, 0);
      return ticketDate.getTime() === today.getTime();
    });
    
    showNotification(`Se encontraron ${todayTickets.length} tickets creados hoy`, 'info');
    clearFilters();
  };

  const exportTickets = () => {
    const headers = ['ID', 'Título', 'Cliente', 'Email', 'Prioridad', 'Categoría', 'Estado', 'Creado', 'Actualizado'];
    const rows = tickets.map(ticket => [
      ticket.id,
      `"${ticket.title}"`,
      `"${ticket.customer}"`,
      ticket.email,
      ticket.priority,
      ticket.category,
      ticket.status,
      ticket.createdAt.toLocaleDateString('es-ES'),
      ticket.updatedAt.toLocaleDateString('es-ES')
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
    
    showNotification('Reporte exportado exitosamente', 'success');
  };

  const selectedTicket = selectedTicketId ? tickets.find(t => t.id === selectedTicketId) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <StatsCards tickets={tickets} />

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-lg font-semibold text-gray-800">Tickets de Soporte</h3>
                <div className="flex space-x-2 flex-wrap gap-2">
                  <button
                    onClick={() => setShowNewTicketModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    + Nuevo Ticket
                  </button>
                  <button
                    onClick={cargarDatos}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    🔄 Recargar
                  </button>
                  <button
                    onClick={() => setShowLicitacionesModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    📋 Licitaciones
                  </button>
                  <button
                    onClick={() => setShowReportesModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    📊 Reportes
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <TicketList 
                tickets={filteredTickets} 
                onTicketClick={handleTicketClick}
              />
            </div>
          </div>
        </div>

        
        <div className="space-y-6">
          <Filters
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            categoryFilter={categoryFilter}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
            onCategoryChange={setCategoryFilter}
            onClearFilters={clearFilters}
          />
          <QuickActions
            onShowTicketsByStatus={showTicketsByStatus}
            onShowTicketsByPriority={showTicketsByPriority}
            onShowTicketsToday={showTicketsToday}
            onExportTickets={exportTickets}
          />
          <PerformanceMetrics />
        </div>
      </div>

      
      {showNewTicketModal && (
        <NewTicketModal
          onClose={() => setShowNewTicketModal(false)}
          onCreateTicket={handleCreateTicket}
        />
      )}

      {showTicketDetailModal && selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => {
            setShowTicketDetailModal(false);
            setSelectedTicketId(null);
          }}
          onUpdateTicket={handleUpdateTicket}
          onDeleteTicket={handleDeleteTicket}
          currentUser={currentUser}
        />
      )}


      {showLicitacionesModal && (
        <LicitacionesModal
          licitaciones={licitaciones}
          setLicitaciones={setLicitaciones}
          onClose={() => setShowLicitacionesModal(false)}
        />
      )}

      {showReportesModal && (
        <ReportesModal
          tickets={tickets}
          licitaciones={licitaciones}
          onClose={() => setShowReportesModal(false)}
        />
      )}
    </div>
  );
}