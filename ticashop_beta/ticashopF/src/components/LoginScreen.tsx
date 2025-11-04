import { useState } from 'react';
import { User } from '../types';
import { getUsuarioByCorreo } from "../api/api";

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [userType, setUserType] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAccessInfo, setShowAccessInfo] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (userType !== 'soporte') {
      setError('Solo se permite acceso a usuarios de Soporte Técnico');
      setIsLoading(false);
      return;
    }

    try {
      // Buscar usuario por correo (username)
      const response = await getUsuarioByCorreo(username);
      
      if (response.data.length === 0) {
        setError('Usuario no encontrado');
        setIsLoading(false);
        return;
      }

      const usuario = response.data[0];

      // Verificar contraseña (en producción esto debería ser en el backend)
      if (usuario.password !== password) {
        setError('Contraseña incorrecta');
        setIsLoading(false);
        return;
      }

      // Verificar que sea rol de soporte
      if (usuario.rol !== 'soporte' && usuario.rol !== 'admin') {
        setError('No tienes permisos de acceso al sistema de soporte');
        setIsLoading(false);
        return;
      }

      // Mapear usuario de Django a formato de la app
      const userMapped: User = {
        username: usuario.correo,
        name: `${usuario.nombre} ${usuario.apellido}`,
        role: usuario.rol,
        avatar: `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`,
        permissions: getPermissionsByRole(usuario.rol)
      };

      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(userMapped));
      localStorage.setItem('userId', usuario.id.toString());

      setTimeout(() => {
        onLogin(userMapped);
      }, 1500);

    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      setError(error.response?.data?.message || 'Error al conectar con el servidor');
      setIsLoading(false);
    }
  };

  const getPermissionsByRole = (rol: string): string[] => {
    const permissionsMap: Record<string, string[]> = {
      'admin': ['tickets', 'licitaciones', 'reportes', 'admin'],
      'soporte': ['tickets', 'licitaciones', 'reportes'],
      'tecnico': ['tickets', 'reportes']
    };
    return permissionsMap[rol] || ['tickets'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden fade-in">
        {/* Header del Login */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-center">
          <div className="text-4xl mb-2">🔧</div>
          <h1 className="text-2xl font-bold text-white">TiCaShop</h1>
          <p className="text-blue-100 text-sm">Sistema de Gestión Empresarial</p>
        </div>

        {/* Formulario de Login */}
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Usuario
              </label>
              <select
                id="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar tipo de usuario</option>
                <option value="cliente" disabled className="text-gray-400">👤 Cliente (No disponible)</option>
                <option value="vendedor" disabled className="text-gray-400">🛍️ Vendedor (No disponible)</option>
                <option value="comercial" disabled className="text-gray-400">📊 Área Comercial (No disponible)</option>
                <option value="bodega" disabled className="text-gray-400">📦 Encargado de Bodega (No disponible)</option>
                <option value="admin" disabled className="text-gray-400">⚙️ Admin (No disponible)</option>
                <option value="finanzas" disabled className="text-gray-400">💰 Finanzas (No disponible)</option>
                <option value="rrhh" disabled className="text-gray-400">👥 RRHH (No disponible)</option>
                <option value="soporte" className="text-green-600">🔧 Soporte Técnico</option>
                <option value="administrador" disabled className="text-gray-400">👨‍💼 Administrador (No disponible)</option>
                <option value="auditor" disabled className="text-gray-400">🔍 Auditor (No disponible)</option>
              </select>
            </div>

            {userType === 'soporte' && (
              <div className="space-y-4 fade-in">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ejemplo@ticashop.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                      placeholder="Ingrese su contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <span>{showPassword ? '🙈' : '👁️'}</span>
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🔧</span>
                    <div>
                      <h4 className="font-semibold text-blue-900">Soporte Técnico</h4>
                      <p className="text-sm text-blue-700">Acceso completo al sistema de tickets, licitaciones y reportes</p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 fade-in">
                    <div className="flex items-center space-x-2">
                      <span>❌</span>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </div>
            )}
          </form>

          {/* Información de acceso */}
          {showAccessInfo && userType === 'soporte' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg fade-in">
              <h4 className="font-semibold text-gray-800 mb-2">Instrucciones:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>1. Crea un usuario en Django con rol 'soporte'</p>
                <p>2. Usa el correo del usuario para iniciar sesión</p>
                <p>3. Ingresa la contraseña configurada</p>
              </div>
            </div>
          )}

          {/* Enlaces adicionales */}
          <div className="mt-6 text-center space-y-2">
            {userType === 'soporte' && (
              <button
                type="button"
                onClick={() => setShowAccessInfo(!showAccessInfo)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                ¿Cómo obtener acceso?
              </button>
            )}
            <div className="text-xs text-gray-500">
              <p>© 2024 TiCaShop - Sistema de Gestión Empresarial</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}