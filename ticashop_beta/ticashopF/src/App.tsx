import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import AdminPanel from './components/AdminPanel';
import AdminRoute from './components/AdminRoute';
import { Ticket, Licitacion, User } from './types';

type View = 'dashboard' | 'admin';

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
            onNavigateToAdmin={navigateToAdmin}
            showAdminButton={currentUser?.role === 'admin'}
          />
          
          {currentView === 'dashboard' ? (
            <Dashboard 
              tickets={tickets} 
              setTickets={setTickets}
              licitaciones={licitaciones}
              setLicitaciones={setLicitaciones}
            />
          ) : (
            <AdminRoute>
              <AdminPanel onBack={navigateToDashboard} />
            </AdminRoute>
          )}
        </>
      )}
    </div>
  );
}

export default App;