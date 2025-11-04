import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import { Ticket, Licitacion, User } from './types';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([]);

  // Verificar sesión existente al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // Cargar datos de ejemplo cuando el usuario inicia sesión
  useEffect(() => {
    if (isLoggedIn) {
      loadSampleTickets();
      loadSampleLicitaciones();
    }
  }, [isLoggedIn]);

  const loadSampleTickets = () => {
    const sampleTickets: Ticket[] = [
      {
        id: 1,
        title: 'Error en el proceso de pago con tarjeta de crédito',
        description: 'El cliente no puede completar el pago con su tarjeta de crédito Visa. El sistema muestra el error "Transacción rechazada" pero la tarjeta tiene fondos suficientes. Ha intentado con diferentes navegadores.',
        priority: 'alta',
        category: 'tecnico',
        status: 'abierto',
        customer: 'Juan Pérez Martínez',
        email: 'juan.perez@email.com',
        phone: '+52 55 1234-5678',
        createdAt: new Date('2024-01-15T10:30:00'),
        updatedAt: new Date('2024-01-15T10:30:00'),
        assignedTo: null,
        comments: [
          {
            id: 1,
            author: 'Sistema',
            content: 'Ticket creado automáticamente desde el formulario web',
            timestamp: new Date('2024-01-15T10:30:00'),
            type: 'system'
          }
        ]
      },
      {
        id: 2,
        title: 'Consulta sobre garantía extendida de MacBook Air',
        description: 'Cliente compró MacBook Air M2 hace 3 meses y desea información sobre opciones de garantía extendida. También pregunta sobre cobertura de daños accidentales.',
        priority: 'media',
        category: 'cuenta',
        status: 'en-progreso',
        customer: 'María García López',
        email: 'maria.garcia@email.com',
        phone: '+52 55 9876-5432',
        createdAt: new Date('2024-01-14T15:45:00'),
        updatedAt: new Date('2024-01-15T09:20:00'),
        assignedTo: 'Ana Rodríguez',
        comments: [
          {
            id: 1,
            author: 'Sistema',
            content: 'Ticket creado automáticamente desde el formulario web',
            timestamp: new Date('2024-01-14T15:45:00'),
            type: 'system'
          },
          {
            id: 2,
            author: 'Ana Rodríguez',
            content: 'Hola María, he revisado tu compra y efectivamente tienes opciones de garantía extendida disponibles. Te enviaré la información por email.',
            timestamp: new Date('2024-01-15T09:20:00'),
            type: 'agent'
          }
        ]
      },
      {
        id: 3,
        title: 'Doble cobro en pedido #ORD-001',
        description: 'El cliente fue cobrado dos veces por el mismo pedido. El primer cargo fue de $1,299 y el segundo de $1,299. Solo recibió un producto. Solicita reembolso inmediato.',
        priority: 'alta',
        category: 'facturacion',
        status: 'resuelto',
        customer: 'Carlos López Hernández',
        email: 'carlos.lopez@email.com',
        phone: '+52 55 5555-1234',
        createdAt: new Date('2024-01-13T11:20:00'),
        updatedAt: new Date('2024-01-14T16:30:00'),
        assignedTo: 'Pedro Sánchez',
        comments: [
          {
            id: 1,
            author: 'Sistema',
            content: 'Ticket creado automáticamente desde el formulario web',
            timestamp: new Date('2024-01-13T11:20:00'),
            type: 'system'
          },
          {
            id: 2,
            author: 'Pedro Sánchez',
            content: 'He identificado el problema en nuestro sistema de pagos. Procesando el reembolso ahora.',
            timestamp: new Date('2024-01-14T14:15:00'),
            type: 'agent'
          },
          {
            id: 3,
            author: 'Pedro Sánchez',
            content: 'Reembolso procesado exitosamente. El cliente recibirá el dinero en 3-5 días hábiles.',
            timestamp: new Date('2024-01-14T16:30:00'),
            type: 'agent'
          },
          {
            id: 4,
            author: 'Sistema',
            content: 'Estado cambiado a: Resuelto',
            timestamp: new Date('2024-01-14T16:30:00'),
            type: 'system'
          }
        ]
      },
      {
        id: 4,
        title: 'Problema con la aplicación móvil en iOS',
        description: 'La aplicación se cierra inesperadamente al intentar ver el historial de pedidos. Ocurre en iPhone 13 Pro con iOS 17.2. Ha reinstalado la app sin éxito.',
        priority: 'media',
        category: 'tecnico',
        status: 'abierto',
        customer: 'Ana Martínez Silva',
        email: 'ana.martinez@email.com',
        phone: '+52 55 7777-8888',
        createdAt: new Date('2024-01-15T14:20:00'),
        updatedAt: new Date('2024-01-15T14:20:00'),
        assignedTo: null,
        comments: [
          {
            id: 1,
            author: 'Sistema',
            content: 'Ticket creado automáticamente desde el formulario web',
            timestamp: new Date('2024-01-15T14:20:00'),
            type: 'system'
          }
        ]
      }
    ];
    setTickets(sampleTickets);
  };

  const loadSampleLicitaciones = () => {
    const sampleLicitaciones: Licitacion[] = [
      {
        id: 1,
        numero: 'LIC-2024-001',
        titulo: 'Suministro de equipos de cómputo para oficinas centrales',
        descripcion: 'Adquisición de 50 computadoras de escritorio, 25 laptops y equipos periféricos para modernización de oficinas centrales.',
        tipo: 'productos',
        monto: 850000,
        moneda: 'MXN',
        entidad: 'Secretaría de Administración Pública',
        fechaInicio: new Date('2024-01-10'),
        fechaCierre: new Date('2024-02-15'),
        status: 'publicada',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: 2,
        numero: 'LIC-2024-002',
        titulo: 'Servicios de mantenimiento preventivo y correctivo de sistemas',
        descripcion: 'Contratación de servicios especializados para mantenimiento de infraestructura tecnológica por 12 meses.',
        tipo: 'servicios',
        monto: 1200000,
        moneda: 'MXN',
        entidad: 'Instituto Nacional de Tecnología',
        fechaInicio: new Date('2024-01-15'),
        fechaCierre: new Date('2024-03-01'),
        status: 'en-evaluacion',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 3,
        numero: 'LIC-2024-003',
        titulo: 'Construcción de centro de datos empresarial',
        descripcion: 'Diseño, construcción e implementación de centro de datos con capacidad para 200 servidores y sistemas de respaldo.',
        tipo: 'obras',
        monto: 5500000,
        moneda: 'MXN',
        entidad: 'Corporación de Desarrollo Tecnológico',
        fechaInicio: new Date('2024-02-01'),
        fechaCierre: new Date('2024-03-15'),
        status: 'borrador',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-22')
      },
      {
        id: 4,
        numero: 'LIC-2023-045',
        titulo: 'Consultoría en transformación digital',
        descripcion: 'Servicios de consultoría especializada para implementación de estrategia de transformación digital organizacional.',
        tipo: 'consultoria',
        monto: 2800000,
        moneda: 'MXN',
        entidad: 'Ministerio de Innovación',
        fechaInicio: new Date('2023-11-01'),
        fechaCierre: new Date('2023-12-15'),
        status: 'adjudicada',
        createdAt: new Date('2023-10-15'),
        updatedAt: new Date('2023-12-20')
      }
    ];
    setLicitaciones(sampleLicitaciones);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('currentUser');
    setTickets([]);
    setLicitaciones([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <>
          <Header user={currentUser} onLogout={handleLogout} />
          <Dashboard 
            tickets={tickets} 
            setTickets={setTickets}
            licitaciones={licitaciones}
            setLicitaciones={setLicitaciones}
          />
        </>
      )}
    </div>
  );
}

export default App;
