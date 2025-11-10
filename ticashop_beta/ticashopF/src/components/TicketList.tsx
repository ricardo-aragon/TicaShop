import { Ticket } from '../types';
import { getTimeAgo, getPriorityColor, getStatusColor, getCategoryIcon } from '../utils/helpers';

interface TicketListProps {
  tickets: Ticket[];
  onTicketClick: (ticketId: number) => void;
}

export default function TicketList({ tickets, onTicketClick }: TicketListProps) {
  // Mapear status de inglés a español para mostrar
  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'open': 'Abierto',
      'in-progress': 'En Progreso',
      'closed': 'Cerrado'
    };
    return labels[status] || status;
  };

  // Mapear prioridad de inglés a español para mostrar
  const getPriorityLabel = (priority: string): string => {
    const labels: Record<string, string> = {
      'high': 'Alta',
      'medium': 'Media',
      'low': 'Baja'
    };
    return labels[priority] || priority;
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <p className="text-gray-500 text-lg">No hay tickets que coincidan con los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map(ticket => (
        <div
          key={ticket.id}
          onClick={() => onTicketClick(ticket.id)}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer card-hover"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getCategoryIcon(ticket.category)}</span>
              <h4 className="font-semibold text-gray-800">#{ticket.id.toString().padStart(3, '0')}</h4>
            </div>
            <div className="flex space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                {getPriorityLabel(ticket.priority)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                {getStatusLabel(ticket.status)}
              </span>
            </div>
          </div>
          <h5 className="font-medium text-gray-900 mb-2">{ticket.title}</h5>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {ticket.description.substring(0, 120)}{ticket.description.length > 120 ? '...' : ''}
          </p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <span>👤</span>
                <span>{ticket.customer}</span>
              </span>
              {ticket.assignedTo && (
                <span className="flex items-center space-x-1">
                  <span>👨‍💼</span>
                  <span>{ticket.assignedTo}</span>
                </span>
              )}
            </div>
            <span>{getTimeAgo(ticket.updatedAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}