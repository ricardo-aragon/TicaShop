import { useState } from 'react';
import { Ticket, TicketStatus } from '../types';
import { formatDateTime, getPriorityColor, getStatusColor, getCategoryName } from '../utils/helpers';
import { showNotification } from '../utils/notifications';

interface TicketDetailModalProps {
  ticket: Ticket;
  onClose: () => void;
  onUpdateTicket: (ticket: Ticket) => void;
}

export default function TicketDetailModal({ ticket, onClose, onUpdateTicket }: TicketDetailModalProps) {
  const [newComment, setNewComment] = useState('');
  const [statusUpdate, setStatusUpdate] = useState<TicketStatus | ''>('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    const updatedTicket = { ...ticket };
    
    // Agregar comentario
    const comment = {
      id: ticket.comments.length + 1,
      author: 'Agente de Soporte',
      content: newComment,
      timestamp: new Date(),
      type: 'agent' as const
    };
    updatedTicket.comments.push(comment);

    // Actualizar estado si se seleccionó uno nuevo
    if (statusUpdate && statusUpdate !== ticket.status) {
      updatedTicket.status = statusUpdate;
      const statusComment = {
        id: updatedTicket.comments.length + 1,
        author: 'Sistema',
        content: `Estado cambiado a: ${statusUpdate === 'en-progreso' ? 'En Progreso' : statusUpdate.charAt(0).toUpperCase() + statusUpdate.slice(1)}`,
        timestamp: new Date(),
        type: 'system' as const
      };
      updatedTicket.comments.push(statusComment);
    }

    updatedTicket.updatedAt = new Date();
    
    onUpdateTicket(updatedTicket);
    setNewComment('');
    setStatusUpdate('');
    showNotification('Comentario agregado exitosamente', 'success');
  };

  const changeTicketStatus = (newStatus: TicketStatus) => {
    if (ticket.status === newStatus) return;

    const updatedTicket = { ...ticket };
    updatedTicket.status = newStatus;
    updatedTicket.updatedAt = new Date();

    const statusComment = {
      id: ticket.comments.length + 1,
      author: 'Sistema',
      content: `Estado cambiado a: ${newStatus === 'en-progreso' ? 'En Progreso' : newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      timestamp: new Date(),
      type: 'system' as const
    };
    updatedTicket.comments.push(statusComment);

    onUpdateTicket(updatedTicket);
    showNotification(`Ticket marcado como ${newStatus === 'en-progreso' ? 'En Progreso' : newStatus}`, 'success');
  };

  const escalateTicket = () => {
    const updatedTicket = { ...ticket };
    updatedTicket.priority = 'alta';
    updatedTicket.updatedAt = new Date();

    const escalationComment = {
      id: ticket.comments.length + 1,
      author: 'Sistema',
      content: 'Ticket escalado a prioridad alta y enviado al supervisor',
      timestamp: new Date(),
      type: 'system' as const
    };
    updatedTicket.comments.push(escalationComment);

    onUpdateTicket(updatedTicket);
    showNotification('Ticket escalado exitosamente', 'warning');
  };

  const assignTicket = () => {
    const specialists = ['Ana Rodríguez', 'Pedro Sánchez', 'Luis García', 'Carmen López'];
    const randomSpecialist = specialists[Math.floor(Math.random() * specialists.length)];

    const updatedTicket = { ...ticket };
    updatedTicket.assignedTo = randomSpecialist;
    updatedTicket.updatedAt = new Date();

    const assignmentComment = {
      id: ticket.comments.length + 1,
      author: 'Sistema',
      content: `Ticket asignado a ${randomSpecialist}`,
      timestamp: new Date(),
      type: 'system' as const
    };
    updatedTicket.comments.push(assignmentComment);

    onUpdateTicket(updatedTicket);
    showNotification(`Ticket asignado a ${randomSpecialist}`, 'success');
  };

  const timeOpen = Math.floor((new Date().getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60));
  const responseTime = ticket.comments.length > 1 
    ? Math.floor((ticket.comments[1].timestamp.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60))
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto fade-in" onClick={(e) => e.stopPropagation()}>
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

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información del Ticket */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(ticket.priority)}`}>
                    Prioridad: {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)}`}>
                    Estado: {ticket.status === 'en-progreso' ? 'En Progreso' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    Categoría: {getCategoryName(ticket.category)}
                  </span>
                  {ticket.assignedTo && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      Asignado a: {ticket.assignedTo}
                    </span>
                  )}
                </div>

                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Descripción del Problema</h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{ticket.description}</p>
                  </div>
                </div>

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
              </div>

              {/* Sección de comentarios */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-4">Historial de Comentarios</h4>
                <div className="space-y-4 mb-6">
                  {ticket.comments.map((comment) => {
                    const isSystem = comment.type === 'system';
                    const isAgent = comment.type === 'agent';

                    return (
                      <div
                        key={comment.id}
                        className={`rounded-lg p-4 ${
                          isSystem ? 'bg-gray-100 border-l-4 border-gray-400' :
                          isAgent ? 'bg-blue-50 border-l-4 border-blue-400' :
                          'bg-green-50 border-l-4 border-green-400'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-800">{comment.author}</span>
                            {isSystem && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Sistema</span>}
                            {isAgent && <span className="text-xs bg-blue-200 text-blue-600 px-2 py-1 rounded">Agente</span>}
                          </div>
                          <span className="text-sm text-gray-500">{formatDateTime(comment.timestamp)}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleAddComment} className="space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Agregar un comentario o actualización..."
                  />
                  <div className="flex justify-between items-center">
                    <select
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value as TicketStatus | '')}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Mantener estado actual</option>
                      <option value="abierto">Cambiar a Abierto</option>
                      <option value="en-progreso">Cambiar a En Progreso</option>
                      <option value="resuelto">Cambiar a Resuelto</option>
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Agregar Comentario
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Panel de Acciones */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-3">Acciones Rápidas</h5>
                <div className="space-y-2">
                  <button
                    onClick={() => changeTicketStatus('en-progreso')}
                    className="w-full px-3 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-sm"
                  >
                    Marcar En Progreso
                  </button>
                  <button
                    onClick={() => changeTicketStatus('resuelto')}
                    className="w-full px-3 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-sm"
                  >
                    Marcar Resuelto
                  </button>
                  <button
                    onClick={escalateTicket}
                    className="w-full px-3 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                  >
                    Escalar Ticket
                  </button>
                  <button
                    onClick={assignTicket}
                    className="w-full px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors text-sm"
                  >
                    Asignar a Especialista
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-3">Información del Cliente</h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Nombre:</span>
                    <p className="text-gray-800">{ticket.customer}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <p className="text-gray-800">{ticket.email}</p>
                  </div>
                  {ticket.phone && (
                    <div>
                      <span className="font-medium text-gray-600">Teléfono:</span>
                      <p className="text-gray-800">{ticket.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-3">Métricas del Ticket</h5>
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
