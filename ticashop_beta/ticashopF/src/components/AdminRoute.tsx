
import { useEffect } from 'react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  useEffect(() => {
    const user = localStorage.getItem('user');
    
    if (!user) {
     
      window.location.href = '/';
      return;
    }
    
    try {
      const userData = JSON.parse(user);
      
      
      if (userData.role !== 'admin') {
        alert('⚠️ Acceso denegado. Solo administradores pueden acceder a esta sección.');
        window.location.href = '/';
        return;
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      window.location.href = '/';
    }
  }, []);

  return <>{children}</>;
}