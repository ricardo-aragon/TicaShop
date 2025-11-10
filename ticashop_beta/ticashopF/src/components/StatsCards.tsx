import { Ticket } from '../types';

interface StatsCardsProps {
  tickets: Ticket[];
}

export default function StatsCards({ tickets }: StatsCardsProps) {
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'open').length; 
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length; 
  const resolvedTickets = tickets.filter(t => t.status === 'closed').length;  

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-sm p-6 card-hover">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Tickets</p>
            <p className="text-3xl font-bold text-gray-900">{totalTickets}</p>
          </div>
          <div className="text-3xl">📋</div>
        </div>
        <p className="text-sm text-blue-600 mt-2">Todos los tickets</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 card-hover">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Abiertos</p>
            <p className="text-3xl font-bold text-orange-600">{openTickets}</p>
          </div>
          <div className="text-3xl">🔓</div>
        </div>
        <p className="text-sm text-orange-600 mt-2">Requieren atención</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 card-hover">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">En Progreso</p>
            <p className="text-3xl font-bold text-blue-600">{inProgressTickets}</p>
          </div>
          <div className="text-3xl">⚙️</div>
        </div>
        <p className="text-sm text-blue-600 mt-2">Siendo procesados</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 card-hover">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Resueltos</p>
            <p className="text-3xl font-bold text-green-600">{resolvedTickets}</p>
          </div>
          <div className="text-3xl">✅</div>
        </div>
        <p className="text-sm text-green-600 mt-2">Completados</p>
      </div>
    </div>
  );
}