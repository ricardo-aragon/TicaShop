import { Priority, TicketStatus, Category } from '../types';

export function getPriorityColor(priority: Priority): string {
  const colors = {
    'alta': 'bg-red-100 text-red-800 border-red-200',
    'media': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'baja': 'bg-green-100 text-green-800 border-green-200'
  };
  return colors[priority];
}

export function getStatusColor(status: TicketStatus): string {
  const colors = {
    'abierto': 'bg-orange-100 text-orange-800 border-orange-200',
    'en-progreso': 'bg-blue-100 text-blue-800 border-blue-200',
    'resuelto': 'bg-green-100 text-green-800 border-green-200'
  };
  return colors[status];
}

export function getCategoryIcon(category: Category): string {
  const icons = {
    'tecnico': '🔧',
    'cuenta': '👤',
    'pedido': '📦',
    'facturacion': '💳',
    'otro': '❓'
  };
  return icons[category];
}

export function getCategoryName(category: Category): string {
  const names = {
    'tecnico': 'Problema Técnico',
    'cuenta': 'Problema de Cuenta',
    'pedido': 'Problema con Pedido',
    'facturacion': 'Facturación',
    'otro': 'Otro'
  };
  return names[category];
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Ahora mismo';
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Hace ${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Hace ${diffInDays}d`;
  
  return formatDate(date);
}
