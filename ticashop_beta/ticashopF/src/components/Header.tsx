import { useState } from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

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
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-800"
                >
                  🔔
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                    3
                  </span>
                </button>

                {showNotifications && (
                  <div className="absolute top-12 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800">Notificaciones</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                        <div className="text-red-600">🚨</div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">Ticket de alta prioridad</p>
                          <p className="text-xs text-gray-600">Hace 5 minutos</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <div className="text-blue-600">💬</div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">Nuevo comentario en ticket #003</p>
                          <p className="text-xs text-gray-600">Hace 15 minutos</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="text-green-600">✅</div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">Ticket #001 resuelto</p>
                          <p className="text-xs text-gray-600">Hace 1 hora</p>
                        </div>
                      </div>
                    </div>
                  </div>
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
