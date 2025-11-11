import { Priority, TicketStatus, Category } from '../types';

interface FiltersProps {
  statusFilter: TicketStatus | '';
  priorityFilter: Priority | '';
  categoryFilter: Category | '';
  onStatusChange: (status: TicketStatus | '') => void;
  onPriorityChange: (priority: Priority | '') => void;
  onCategoryChange: (category: Category | '') => void;
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
  const hasActiveFilters = statusFilter || priorityFilter || categoryFilter;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-800">Filtros</h4>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>
      
      <div className="space-y-4">
       
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as TicketStatus | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="open">Abierto</option>
            <option value="in-progress">En Progreso</option>
            <option value="closed">Cerrado</option>
          </select>
        </div>

       
        <div>
          <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Prioridad
          </label>
          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value as Priority | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>


        <div>
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value as Category | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            <option value="technical">Problema Técnico</option>
            <option value="account">Problema de Cuenta</option>
            <option value="order">Problema con Pedido</option>
            <option value="billing">Facturación</option>
            <option value="other">Otro</option>
          </select>
        </div>

  
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Filtros activos:</p>
            <div className="flex flex-wrap gap-2">
              {statusFilter && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Estado: {statusFilter === 'open' ? 'Abierto' : statusFilter === 'in-progress' ? 'En Progreso' : 'Cerrado'}
                </span>
              )}
              {priorityFilter && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                  Prioridad: {priorityFilter === 'high' ? 'Alta' : priorityFilter === 'medium' ? 'Media' : 'Baja'}
                </span>
              )}
              {categoryFilter && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Categoría: {categoryFilter}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
