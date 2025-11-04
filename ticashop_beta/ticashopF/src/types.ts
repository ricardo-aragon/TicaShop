export type Priority = 'alta' | 'media' | 'baja';
export type TicketStatus = 'abierto' | 'en-progreso' | 'resuelto';
export type Category = 'tecnico' | 'cuenta' | 'pedido' | 'facturacion' | 'otro';
export type LicitacionStatus = 'borrador' | 'publicada' | 'en-evaluacion' | 'adjudicada' | 'cancelada';
export type LicitacionTipo = 'servicios' | 'productos' | 'obras' | 'consultoria';
export type CommentType = 'system' | 'agent' | 'customer';

export interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: Date;
  type: CommentType;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  status: TicketStatus;
  customer: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo: string | null;
  comments: Comment[];
}

export interface Licitacion {
  id: number;
  numero: string;
  titulo: string;
  descripcion: string;
  tipo: LicitacionTipo;
  monto: number;
  moneda: string;
  entidad: string;
  fechaInicio: Date;
  fechaCierre: Date;
  status: LicitacionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  username: string;
  name: string;
  role: string;
  avatar: string;
  permissions: string[];
}
