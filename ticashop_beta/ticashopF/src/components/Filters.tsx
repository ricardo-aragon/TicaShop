import { Priority, TicketStatus, Category } from '../types';

interface FiltersProps {
  statusFilter: TicketStatus | '';
  priorityFilter: Priority | '';
  categoryFilter: Category | '';
  onStatusChange: (value: TicketStatus | '') => void;
  onPriorityChange: (value: Priority | '') => void;
  onCategoryChange: (value: Category | '') => void;
  onClearFilters: () => void;
}

export default function Filters({
  statusFilter,
  priorityFilter,
  categoryFilter,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onClearFilters
}: FiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as TicketStatus | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="abierto">Abierto</option>
            <option value="en-progreso">En Progreso</option>
            <option value="resuelto">Resuelto</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value as Priority | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value as Category | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            <option value="tecnico">Problema Técnico</option>
            <option value="cuenta">Problema de Cuenta</option>
            <option value="pedido">Problema con Pedido</option>
            <option value="facturacion">Facturación</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <button
          onClick={onClearFilters}
          className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
}
