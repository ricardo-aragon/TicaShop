import { useState } from 'react';
import { User } from '../types';
import { login } from "../api/api";

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
   
      const response = await login(username, password);
      
      const { user: usuario, token } = response.data;

    
      localStorage.setItem('token', token);
      
    
      const userMapped: User = {
        username: usuario.correo,
        name: `${usuario.nombre} ${usuario.apellido}`,
        role: usuario.rol,
        avatar: `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`,
        permissions: getPermissionsByRole(usuario.rol)
      };

     
      localStorage.setItem('user', JSON.stringify(userMapped));
      localStorage.setItem('userId', usuario.id.toString());

    
      onLogin(userMapped);

    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      
   
      if (error.response?.status === 404) {
        setError('Usuario no encontrado');
      } else if (error.response?.status === 401) {
        setError('Contraseña incorrecta');
      } else if (error.response?.status === 403) {
        setError('No tienes permisos de acceso al sistema de soporte');
      } else {
        setError(error.response?.data?.error || 'Error al conectar con el servidor');
      }
    } finally {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
     
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-center">
          <div className="text-5xl mb-3">🔧</div>
          <h1 className="text-3xl font-bold text-white mb-1">TiCaShop</h1>
          <p className="text-blue-100 text-sm">Sistema de Gestión de Soporte</p>
        </div>

 
        <div className="px-8 py-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Iniciar Sesión</h2>
            <p className="text-gray-600 text-sm">Ingresa tus credenciales de acceso</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
      
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400"></span>
                </div>
                <input
                  type="email"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder=" ejemplo@ticashop.com"
                  autoComplete="email"
                />
              </div>
            </div>

       
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400"></span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder=" Ingresa tu contraseña"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  <span className="text-xl">{showPassword ? '🙈' : '👁️'}</span>
                </button>
              </div>
            </div>

     
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-md p-4 animate-shake">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

        
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl mt-0.5">🔧</span>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Acceso para Personal de Soporte</h4>
                  <p className="text-sm text-blue-700">
                    Solo usuarios con rol de <strong>Soporte Técnico</strong> o <strong>Admin</strong> pueden acceder a este sistema.
                  </p>
                </div>
              </div>
            </div>

      
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 px-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <span>Iniciar Sesión →</span>
              )}
            </button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2024 TiCaShop - Sistema de Gestión Empresarial
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Versión 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}