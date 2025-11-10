import { useState, useEffect } from 'react';
import { User } from '../types';
import { getAllTickets } from '../api/api';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

interface Notification {
  id: number;
  type: 'high-priority' | 'comment' | 'resolved' | 'new' | 'assigned';
  title: string;
  message: string;
  timestamp: Date;
  ticketId?: number;
  isRead: boolean;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    cargarNotificaciones();
    // Recargar notificaciones cada 30 segundos
    const interval = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarNotificaciones = async () => {
    setLoading(true);
    try {
      const response = await getAllTickets();
      const tickets = response.data;
      
      const nuevasNotificaciones: Notification[] = [];

      // Notificaciones de tickets de alta prioridad abiertos
      const ticketsAltaPrioridad = tickets.filter((t: any) => {
        const estado = t.estado?.toLowerCase() || '';
        return estado.includes('urgente') || estado.includes('alta prioridad');
      });

      ticketsAltaPrioridad.forEach((ticket: any) => {
        nuevasNotificaciones.push({
          id: ticket.id,
          type: 'high-priority',
          title: 'Ticket de alta prioridad',
          message: ticket.desc.substring(0, 50) + '...',
          timestamp: new Date(ticket.fecha_creacion),
          ticketId: ticket.id,
          isRead: false
        });
      });

      // Notificaciones de tickets nuevos (últimas 24 horas)
      const hace24Horas = new Date();
      hace24Horas.setHours(hace24Horas.getHours() - 24);

      const ticketsNuevos = tickets.filter((t: any) => {
        const fechaCreacion = new Date(t.fecha_creacion);
        return fechaCreacion > hace24Horas;
      });

      ticketsNuevos.slice(0, 3).forEach((ticket: any) => {
        nuevasNotificaciones.push({
          id: ticket.id + 1000, // Offset para evitar duplicados de ID
          type: 'new',
          title: 'Nuevo ticket recibido',
          message: `De: ${ticket.idUsuario?.nombre || 'Usuario'}`,
          timestamp: new Date(ticket.fecha_creacion),
          ticketId: ticket.id,
          isRead: false
        });
      });

      // Notificaciones de tickets resueltos recientemente
      const ticketsResueltos = tickets.filter((t: any) => {
        const estado = t.estado?.toLowerCase() || '';
        return (estado.includes('cerrado') || estado.includes('resuelto')) && 
               t.fecha_cierre && 
               new Date(t.fecha_cierre) > hace24Horas;
      });

      ticketsResueltos.slice(0, 2).forEach((ticket: any) => {
        nuevasNotificaciones.push({
          id: ticket.id + 2000,
          type: 'resolved',
          title: `Ticket #${ticket.id} resuelto`,
          message: 'Caso cerrado exitosamente',
          timestamp: new Date(ticket.fecha_cierre || ticket.fecha_creacion),
          ticketId: ticket.id,
          isRead: false
        });
      });

      // Notificaciones de tickets asignados al usuario actual
      const ticketsAsignados = tickets.filter((t: any) => {
        return t.idTecnico?.id === parseInt(localStorage.getItem('userId') || '0');
      });

      ticketsAsignados.slice(0, 2).forEach((ticket: any) => {
        nuevasNotificaciones.push({
          id: ticket.id + 3000,
          type: 'assigned',
          title: 'Ticket asignado a ti',
          message: ticket.desc.substring(0, 50) + '...',
          timestamp: new Date(ticket.fecha_creacion),
          ticketId: ticket.id,
          isRead: false
        });
      });

      // Ordenar por fecha más reciente y limitar a 10 notificaciones
      nuevasNotificaciones.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setNotifications(nuevasNotificaciones.slice(0, 10));
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const marcarComoLeida = (notificationId: number) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const marcarTodasComoLeidas = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'high-priority':
        return '🚨';
      case 'comment':
        return '💬';
      case 'resolved':
        return '✅';
      case 'new':
        return '🆕';
      case 'assigned':
        return '👤';
      default:
        return '📌';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'high-priority':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'comment':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'resolved':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'new':
        return 'bg-purple-50 border-l-4 border-purple-500';
      case 'assigned':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500';
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
  };

  const notificacionesNoLeidas = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="text-3xl">🔧</div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Soporte Técnico TiCaShop
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) {
                      cargarNotificaciones();
                    }
                  }}
                  className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span className="text-2xl">🔔</span>
                  {notificacionesNoLeidas > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[20px] text-center">
                      {notificacionesNoLeidas}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <>
                    {/* Overlay para cerrar al hacer clic fuera */}
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setShowNotifications(false)}
                    ></div>
                    
                    <div className="absolute top-12 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-40 max-h-[600px] overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Notificaciones {notificacionesNoLeidas > 0 && `(${notificacionesNoLeidas})`}
                        </h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={marcarTodasComoLeidas}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Marcar todas como leídas
                          </button>
                        )}
                      </div>
                      
                      <div className="overflow-y-auto flex-1">
                        {loading ? (
                          <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 text-sm mt-2">Cargando...</p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <div className="text-gray-400 text-5xl mb-2">🔕</div>
                            <p className="text-gray-500">No tienes notificaciones</p>
                          </div>
                        ) : (
                          <div className="p-2">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => marcarComoLeida(notification.id)}
                                className={`flex items-start space-x-3 p-3 rounded-lg mb-2 cursor-pointer hover:shadow-md transition-all ${
                                  getNotificationColor(notification.type)
                                } ${notification.isRead ? 'opacity-60' : ''}`}
                              >
                                <div className="text-2xl flex-shrink-0">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                      {notification.title}
                                    </p>
                                    {!notification.isRead && (
                                      <span className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0"></span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {getTimeAgo(notification.timestamp)}
                                  </p>
                                  {notification.ticketId && (
                                    <p className="text-xs text-blue-600 mt-1">
                                      Ticket #{notification.ticketId}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                          <button
                            onClick={() => {
                              setShowNotifications(false);
                              // Aquí podrías redirigir a una página de todas las notificaciones
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 w-full text-center"
                          >
                            Ver todas las notificaciones
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-700 font-medium">{user?.name}</span>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.avatar}
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modal de confirmación de logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 fade-in">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cerrar Sesión</h3>
            <p className="text-gray-600 mb-6">¿Estás seguro de que deseas cerrar sesión?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}