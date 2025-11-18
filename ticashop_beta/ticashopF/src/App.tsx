import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import AdminPanel from './components/AdminPanel';
import EspecialistaPanel from './components/EspecialistaPanel';
import AdminRoute from './components/AdminRoute';
import { Ticket, Licitacion, User } from './types';

type View = 'dashboard' | 'admin' | 'especialista';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentView('dashboard');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setTickets([]);
    setLicitaciones([]);
  };

  const navigateToAdmin = () => {
    if (currentUser?.role === 'admin') {
      setCurrentView('admin');
    } else {
      alert('⚠️ Acceso denegado. Solo administradores pueden acceder.');
    }
  };

  const navigateToEspecialista = () => {
    if (currentUser?.role === 'especialista' || currentUser?.role === 'admin') {
      setCurrentView('especialista');
    } else {
      alert('⚠️ Acceso denegado. Solo especialistas pueden acceder.');
    }
  };

  const navigateToDashboard = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <>
          <Header 
            user={currentUser} 
            onLogout={handleLogout}
            onNavigateToAdmin={currentUser?.role === 'admin' ? navigateToAdmin : undefined}
            onNavigateToEspecialista={
            (currentUser?.role === 'admin' || currentUser?.role === 'especialista') 
              ? navigateToEspecialista 
              : undefined
          }
            showAdminButton={currentUser?.role === 'admin'}
          />
        
          {currentView === 'dashboard' ? (
            <Dashboard 
              tickets={tickets} 
              setTickets={setTickets}
              licitaciones={licitaciones}
              setLicitaciones={setLicitaciones}
            />
          ) : currentView === 'admin' ? (
            <AdminRoute>
              <AdminPanel onBack={navigateToDashboard} />
            </AdminRoute>
          ) : (
            <EspecialistaPanel onBack={navigateToDashboard} />
          )}
        </>
      )}
    </div>
  );
}

export default App;