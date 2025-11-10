import { Priority, TicketStatus } from '../types';

interface QuickActionsProps {
  onShowTicketsByStatus: (status: TicketStatus) => void;
  onShowTicketsByPriority: (priority: Priority) => void;
  onShowTicketsToday: () => void;
  onExportTickets: () => void;
}

export default function QuickActions({
  onShowTicketsByStatus,
  onShowTicketsByPriority,
  onShowTicketsToday,
  onExportTickets
}: QuickActionsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h4>
      <div className="space-y-3">
        <button
          onClick={() => onShowTicketsByStatus('open')}  
          className="w-full px-3 py-2 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 transition-colors"
        >
          Ver Tickets Abiertos
        </button>
        <button
          onClick={() => onShowTicketsByPriority('high')} 
          className="w-full px-3 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
        >
          Ver Prioridad Alta
        </button>
        <button
          onClick={onShowTicketsToday}
          className="w-full px-3 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
        >
          Tickets de Hoy
        </button>
        <button
          onClick={onExportTickets}
          className="w-full px-3 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
        >
          Exportar Reporte
        </button>
      </div>
    </div>
  );
}