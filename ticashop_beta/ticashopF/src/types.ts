export type Priority = 'high' | 'medium' | 'low';
export type TicketStatus = 'open' | 'in-progress' | 'closed';
export type Category = 'technical' | 'account' | 'order' | 'billing' | 'other';
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
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo: string | null;
  comments: Comment[];
}

export interface Licitacion {
  id: number;
  numero?: string;
  titulo: string;
  descripcion: string;
  tipo?: LicitacionTipo;
  monto?: number;
  moneda?: string;
  entidad?: string;
  fechaInicio?: Date;
  fechaCierre?: Date;
  status?: LicitacionStatus;
  estado: string;
  propuesta: string;
  fechaCreacion: Date;
  cliente: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  username: string;
  name: string;
  role: string;
  avatar: string;
  permissions: string[];
}