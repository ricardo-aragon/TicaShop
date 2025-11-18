import { useState, useEffect } from 'react';
import { Ticket, TicketStatus } from '../types';
import { formatDateTime, getPriorityColor, getStatusColor, getCategoryName } from '../utils/helpers';
import { showNotification } from '../utils/notifications';
import CommentsPanel from "./CommentsPanel";
import CommentsPanelEspecialista from "./CommentsPanelEspecialista";
import { asignarTecnico, escalarPrioridad, updateTicket, cerrarTicket } from '../api/api';

interface TicketDetailModalProps {
  ticket: Ticket;
  onClose: () => void;
  onUpdateTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticketId: number) => void;
  currentUser: any; 
}

export default function TicketDetailModal({
  ticket,
  onClose,
  onDeleteTicket,
  onUpdateTicket,
  currentUser
}: TicketDetailModalProps) {
  const safeUser = currentUser ?? { role: "", id: null };
  const userRole = safeUser.role || safeUser.rol || "";
  
  // 🔍 DEBUG MEJORADO - Ver datos del ticket
  useEffect(() => {
    console.log("=== 🔍 DEBUG COMPLETO DEL TICKET ===");
    console.log("1. Ticket completo:", ticket);
    console.log("2. Propiedades disponibles:", Object.keys(ticket));
    console.log("3. Customer:", ticket.customer);
    console.log("4. Email:", ticket.email);
    console.log("5. Phone:", ticket.phone);
    console.log("6. Tipo de customer:", typeof ticket.customer);
    console.log("7. ¿Customer es undefined?:", ticket.customer === undefined);
    console.log("8. ¿Customer es null?:", ticket.customer === null);
    console.log("9. ¿Customer es string vacío?:", ticket.customer === "");
    console.log("===================================");
  }, [ticket]);

  const [loadingAssign, setLoadingAssign] = useState(false);
  const [loadingEscalate, setLoadingEscalate] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingClose, setLoadingClose] = useState(false);

  const handleAssign = async () => {
    if (userRole !== 'soporte') {
      showNotification("Solo soporte puede auto-asignarse.", "error");
      return;
    }

    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      showNotification("Error: No se encontró el ID del usuario. Por favor, inicia sesión nuevamente.", "error");
      return;
    }

    try {
      setLoadingAssign(true);
      const response = await asignarTecnico(ticket.id, parseInt(userId));
      onUpdateTicket(response.data);
      showNotification("Ticket asignado a tu usuario.", "success");
    } catch (err: any) {
      console.error("Error completo:", err);
      showNotification(err.response?.data?.error || "Error al asignar ticket", "error");
    } finally {
      setLoadingAssign(false);
    }
  };

  const handleEscalar = async () => {
    if (userRole !== 'soporte' && userRole !== 'admin') {
      showNotification("No tienes permiso para escalar prioridad.", "error");
      return;
    }

    try {
      setLoadingEscalate(true);
      const response = await escalarPrioridad(ticket.id);
      onUpdateTicket(response.data);
      showNotification("Prioridad escalada correctamente", "warning");
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Error al escalar prioridad", "error");
    } finally {
      setLoadingEscalate(false);
    }
  };

  const handleMarkInProgress = async () => {
    if (userRole !== 'soporte' && userRole !== 'admin') {
      showNotification("No tienes permiso para cambiar el estado.", "error");
      return;
    }

    try {
      setLoadingStatus(true);
      const response = await updateTicket(ticket.id, { estado: "En Proceso" });
      onUpdateTicket(response.data);
      showNotification("Ticket marcado como 'En Progreso'", "info");
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Error al actualizar estado", "error");
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!window.confirm('¿Estás seguro de cerrar este ticket?')) return;

    try {
      setLoadingClose(true);
      const fechaCierre = new Date().toISOString();
      const response = await cerrarTicket(ticket.id, fechaCierre);
      onUpdateTicket(response.data);
      showNotification("Ticket cerrado exitosamente", "success");
    } catch (err: any) {
      showNotification(err.response?.data?.error || "Error al cerrar ticket", "error");
    } finally {
      setLoadingClose(false);
    }
  };

  const handleCopyTicket = () => {
    const ticketInfo = `
Ticket #${ticket.id.toString().padStart(3, '0')}
Cliente: ${ticket.customer || 'No especificado'}
Email: ${ticket.email || 'No especificado'}
Estado: ${getStatusLabel(ticket.status)}
Prioridad: ${getPriorityLabel(ticket.priority)}
Descripción: ${ticket.description}
    `.trim();

    navigator.clipboard.writeText(ticketInfo);
    showNotification("Información del ticket copiada al portapapeles", "success");
  };

  const handlePrint = () => {
    window.print();
    showNotification("Vista de impresión abierta", "info");
  };

  const handleDelete = () => {
    if (userRole !== 'admin') {
      showNotification("Solo administradores pueden eliminar tickets.", "error");
      return;
    }

    if (window.confirm('⚠️ ¿Estás seguro de eliminar este ticket? Esta acción no se puede deshacer.')) {
      onDeleteTicket(ticket.id);
      onClose();
    }
  };

  const getStatusLabel = (status: TicketStatus): string => {
    const labels: Record<TicketStatus, string> = {
      'open': 'Abierto',
      'in-progress': 'En Progreso',
      'closed': 'Cerrado'
    };
    return labels[status];
  };

  const getPriorityLabel = (priority: string): string => {
    const labels: Record<string, string> = {
      'high': 'Alta',
      'medium': 'Media',
      'low': 'Baja'
    };
    return labels[priority] || priority;
  };

  const timeOpen = Math.floor((new Date().getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60));
  const responseTime = ticket.comments.length > 1
    ? Math.floor((ticket.comments[1].timestamp.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60))
    : 0;

  // 🆕 Función auxiliar para mostrar info del cliente de forma segura
  const getCustomerInfo = () => {
    const customer = ticket.customer || (ticket as any).cliente || 'No especificado';
    const email = ticket.email || (ticket as any).correo || 'No especificado';
    const phone = ticket.phone || (ticket as any).telefono || null;

    return { customer, email, phone };
  };

  const customerInfo = getCustomerInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto fade-in" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Ticket #{ticket.id.toString().padStart(3, '0')} - {ticket.title}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* IZQUIERDA */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Etiquetas */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(ticket.priority)}`}>
                  Prioridad: {getPriorityLabel(ticket.priority)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)}`}>
                  Estado: {getStatusLabel(ticket.status)}
                </span>
                {ticket.assignedTo && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    Asignado a: {ticket.assignedTo}
                  </span>
                )}
              </div>

              {/* Descripción */}
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Descripción del Problema</h5>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{ticket.description}</p>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Fecha de Creación:</span>
                  <p className="text-gray-800">{formatDateTime(ticket.createdAt)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Última Actualización:</span>
                  <p className="text-gray-800">{formatDateTime(ticket.updatedAt)}</p>
                </div>
              </div>

              {/* Comentarios */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Comentarios</h4>
                
                {/* Renderizar panel según el rol del usuario */}
                {currentUser?.role === 'especialista' || currentUser?.role === 'admin' ? (
                  <CommentsPanelEspecialista 
                    ticketId={ticket.id} 
                    userRole={currentUser?.role}
                  />
                ) : (
                  <CommentsPanel ticketId={ticket.id} />
                )}
              </div>
            </div>

            {/* DERECHA */}
            <div className="space-y-4">

              {/* ACCIONES RÁPIDAS */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-gray-800">⚡ Acciones Rápidas</h5>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {userRole || "invitado"}
                  </span>
                </div>
                
                <div className="space-y-2">
                  
                  <button
                    onClick={handleCopyTicket}
                    className="w-full px-3 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm border border-gray-200 flex items-center justify-center gap-2"
                  >
                    📋 Copiar Información
                  </button>

                  <button
                    onClick={handlePrint}
                    className="w-full px-3 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm border border-gray-200 flex items-center justify-center gap-2"
                  >
                    🖨️ Imprimir Ticket
                  </button>

                  {ticket.status !== 'closed' && (
                    <button
                      onClick={handleCloseTicket}
                      disabled={loadingClose}
                      className="w-full px-3 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-sm font-medium"
                    >
                      {loadingClose ? "Cerrando..." : "✅ Cerrar Ticket"}
                    </button>
                  )}

                  {userRole === 'soporte' && (
                    <>
                      <div className="border-t border-blue-200 my-2 pt-2">
                        <p className="text-xs text-gray-500 mb-2 font-medium">Acciones de Soporte:</p>
                      </div>

                      <button
                        onClick={handleAssign}
                        disabled={loadingAssign || ticket.assignedTo !== null}
                        className={`w-full px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                          ticket.assignedTo 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {loadingAssign 
                          ? "⏳ Asignando..." 
                          : ticket.assignedTo 
                            ? "✅ Ya asignado" 
                            : "👤 Auto-asignarme este ticket"
                        }
                      </button>

                      {ticket.status === 'open' && (
                        <button
                          onClick={handleMarkInProgress}
                          disabled={loadingStatus}
                          className="w-full px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors text-sm"
                        >
                          {loadingStatus ? "Actualizando..." : "⏳ Marcar En Progreso"}
                        </button>
                      )}

                      <button
                        onClick={handleEscalar}
                        disabled={loadingEscalate}
                        className="w-full px-3 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                      >
                        {loadingEscalate ? "Escalando..." : "🚨 Escalar Prioridad"}
                      </button>
                    </>
                  )}

                  {userRole === 'admin' && (
                    <>
                      <div className="border-t border-blue-200 my-2 pt-2">
                        <p className="text-xs text-gray-500 mb-2 font-medium">Acciones de Admin:</p>
                      </div>

                      <button
                        onClick={handleEscalar}
                        disabled={loadingEscalate}
                        className="w-full px-3 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                      >
                        {loadingEscalate ? "Escalando..." : "🚨 Escalar Prioridad"}
                      </button>

                      <button
                        onClick={handleDelete}
                        className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        🗑️ Eliminar Ticket
                      </button>
                    </>
                  )}

                  {!userRole && (
                    <div className="text-xs text-gray-500 text-center py-2 bg-gray-50 rounded border border-gray-200">
                      ℹ️ Inicia sesión para ver más acciones
                    </div>
                  )}
                </div>
              </div>

              {/* 🆕 INFO DEL CLIENTE - MEJORADA CON DEBUG VISUAL */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-2 border-gray-300">
                <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  👤 Información del Cliente
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    {customerInfo.customer !== 'No especificado' ? '✅' : '⚠️'}
                  </span>
                </h5>
                <div className="space-y-3 text-sm">
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <span className="font-medium text-gray-600 block mb-1">Nombre:</span>
                    <p className="text-gray-800 font-medium">
                      {customerInfo.customer}
                    </p>
                    <span className="text-xs text-gray-400">
                      Campo: {ticket.customer ? 'customer ✅' : 'no encontrado ❌'}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <span className="font-medium text-gray-600 block mb-1">Email:</span>
                    <p className="text-gray-800 break-all">
                      {customerInfo.email}
                    </p>
                    <span className="text-xs text-gray-400">
                      Campo: {ticket.email ? 'email ✅' : 'no encontrado ❌'}
                    </span>
                  </div>
                  {customerInfo.phone && (
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <span className="font-medium text-gray-600 block mb-1">Teléfono:</span>
                      <p className="text-gray-800">{customerInfo.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Métricas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-3">📊 Métricas del Ticket</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiempo Abierto:</span>
                    <span className="font-medium">{timeOpen}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Comentarios:</span>
                    <span className="font-medium">{ticket.comments.length}</span>
                  </div>
                  {responseTime > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiempo de Respuesta:</span>
                      <span className="font-medium">{responseTime}h</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}