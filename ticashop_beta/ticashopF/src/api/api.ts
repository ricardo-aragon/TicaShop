import axios from "axios";

const API_BASE_URL = 'http://localhost:8000/ticashop/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para agregar token
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userId');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// ============ TRANSFORMADORES DE DATOS ============

/**
 * Transforma los datos de un ticket del backend al formato del frontend
 */
const transformTicketFromBackend = (backendTicket: any) => {
    // Mapeo de estados del backend al frontend
    const statusMap: Record<string, any> = {
        'Abierto': 'open',
        'En Proceso': 'in-progress',
        'Cerrado': 'closed',
        'open': 'open',
        'in-progress': 'in-progress',
        'closed': 'closed'
    };

    // Mapeo de prioridades
    const priorityMap: Record<string, any> = {
        'Alta': 'high',
        'Media': 'medium',
        'Baja': 'low',
        'high': 'high',
        'medium': 'medium',
        'low': 'low'
    };

    // Mapeo de categorías
    const categoryMap: Record<string, any> = {
        'Tecnico': 'technical',
        'Cuenta': 'account',
        'Pedido': 'order',
        'Facturacion': 'billing',
        'Otro': 'other',
        'technical': 'technical',
        'account': 'account',
        'order': 'order',
        'billing': 'billing',
        'other': 'other'
    };

    return {
        id: backendTicket.id || backendTicket.idTicket,
        title: backendTicket.titulo || backendTicket.title || 'Sin título',
        description: backendTicket.descripcion || backendTicket.description || 'Sin descripción',
        priority: priorityMap[backendTicket.prioridad] || priorityMap[backendTicket.priority] || 'medium',
        category: categoryMap[backendTicket.categoria] || categoryMap[backendTicket.category] || 'other',
        status: statusMap[backendTicket.estado] || statusMap[backendTicket.status] || 'open',
        
        // 🔥 INFORMACIÓN DEL CLIENTE - CORREGIDO CON LOS NOMBRES REALES DEL BACKEND
        customer: backendTicket.nombre_cliente || 
                  backendTicket.cliente || 
                  backendTicket.customer || 
                  backendTicket.nombreCliente || 
                  backendTicket.idUsuario?.nombre || 
                  backendTicket.idUsuario?.username || 
                  'Cliente no especificado',
        
        email: backendTicket.email_cliente || 
               backendTicket.correo || 
               backendTicket.email || 
               backendTicket.correoCliente || 
               backendTicket.idUsuario?.correo || 
               backendTicket.idUsuario?.email || 
               'sin@email.com',
        
        phone: backendTicket.telefono_cliente || 
               backendTicket.telefono || 
               backendTicket.phone || 
               backendTicket.telefonoCliente || 
               backendTicket.idUsuario?.telefono || 
               null,
        
        // Fechas
        createdAt: new Date(backendTicket.fecha_creacion || backendTicket.createdAt || Date.now()),
        updatedAt: new Date(backendTicket.fecha_actualizacion || backendTicket.updatedAt || Date.now()),
        
        // Asignación - También corregido
        assignedTo: backendTicket.idTecnico?.nombre || 
                    backendTicket.idTecnico?.username || 
                    backendTicket.tecnico?.nombre || 
                    backendTicket.tecnico?.username || 
                    backendTicket.nombreTecnico || 
                    backendTicket.assignedTo || 
                    null,
        
        // Comentarios
        comments: (backendTicket.comentarios || backendTicket.comments || []).map((comment: any) => ({
            id: comment.id || comment.idComentario,
            author: comment.autor || comment.author || comment.usuario?.nombre || 'Usuario',
            content: comment.contenido || comment.content || comment.texto || '',
            timestamp: new Date(comment.fecha_creacion || comment.timestamp || comment.fecha || Date.now()),
            type: comment.tipo || comment.type || 'agent'
        }))
    };
};

/**
 * Transforma datos del frontend al formato del backend
 */
const transformTicketToBackend = (frontendTicket: any) => {
    const statusMap: Record<string, string> = {
        'open': 'Abierto',
        'in-progress': 'En Proceso',
        'closed': 'Cerrado'
    };

    const priorityMap: Record<string, string> = {
        'high': 'Alta',
        'medium': 'Media',
        'low': 'Baja'
    };

    return {
        titulo: frontendTicket.title,
        descripcion: frontendTicket.description,
        prioridad: priorityMap[frontendTicket.priority] || frontendTicket.priority,
        estado: statusMap[frontendTicket.status] || frontendTicket.status,
        categoria: frontendTicket.category,
        nombre_cliente: frontendTicket.customer,
        email_cliente: frontendTicket.email,
        telefono_cliente: frontendTicket.phone
    };
};

// ============ AUTENTICACIÓN ============
export const login = (username: string, password: string) => {
    return api.post('/auth/login/', { username, password });
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    return Promise.resolve();
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// ============ USUARIOS ============
export const getAllUsuarios = () => api.get('/Usuario/');
export const getUsuarioById = (id: number) => api.get(`/Usuario/${id}/`);
export const getUsuarioByCorreo = (correo: string) => api.get(`/Usuario/?correo=${correo}`);
export const createUsuario = (data: any) => api.post('/Usuario/', data);
export const updateUsuario = (id: number, data: any) => api.put(`/Usuario/${id}/`, data);
export const deleteUsuario = (id: number) => api.delete(`/Usuario/${id}/`);
export const getUsuariosByRol = (rol: string) => api.get(`/Usuario/?rol=${rol}`);

// ============ TICKETS - CON TRANSFORMACIÓN ============
export const getAllTickets = async () => {
    const response = await api.get('/Ticket/');
    console.log('📥 Datos RAW del backend:', response.data);
    
    const transformedData = Array.isArray(response.data) 
        ? response.data.map(transformTicketFromBackend)
        : response.data.results?.map(transformTicketFromBackend) || [];
    
    console.log('✅ Datos transformados:', transformedData);
    return { ...response, data: transformedData };
};

export const getTicketById = async (id: number) => {
    const response = await api.get(`/Ticket/${id}/`);
    console.log('📥 Ticket RAW del backend:', response.data);
    
    const transformedData = transformTicketFromBackend(response.data);
    console.log('✅ Ticket transformado:', transformedData);
    
    return { ...response, data: transformedData };
};

export const createTicket = async (data: any) => {
    const backendData = transformTicketToBackend(data);
    console.log('📤 Enviando al backend:', backendData);
    return api.post('/Ticket/', backendData);
};

export const updateTicket = async (id: number, data: any) => {
    // Para updates parciales, solo transformamos lo que viene
    const backendData = data.estado ? { estado: data.estado } : data;
    const response = await api.patch(`/Ticket/${id}/`, backendData);
    return { ...response, data: transformTicketFromBackend(response.data) };
};

export const deleteTicket = (id: number) => api.delete(`/Ticket/${id}/`);

export const cerrarTicket = async (id: number, fecha_cierre: string) => {
    const response = await api.patch(`/Ticket/${id}/cerrar/`, { fecha_cierre });
    return { ...response, data: transformTicketFromBackend(response.data) };
};

// Filtros específicos de Tickets
export const getTicketsByUsuario = async (usuarioId: number) => {
    const response = await api.get(`/Ticket/?idUsuario=${usuarioId}`);
    const transformedData = Array.isArray(response.data) 
        ? response.data.map(transformTicketFromBackend)
        : response.data.results?.map(transformTicketFromBackend) || [];
    return { ...response, data: transformedData };
};

export const getTicketsByTecnico = async (tecnicoId: number) => {
    const response = await api.get(`/Ticket/?idTecnico=${tecnicoId}`);
    const transformedData = Array.isArray(response.data) 
        ? response.data.map(transformTicketFromBackend)
        : response.data.results?.map(transformTicketFromBackend) || [];
    return { ...response, data: transformedData };
};

export const getTicketsByEstado = async (estado: string) => {
    const response = await api.get(`/Ticket/?estado=${estado}`);
    const transformedData = Array.isArray(response.data) 
        ? response.data.map(transformTicketFromBackend)
        : response.data.results?.map(transformTicketFromBackend) || [];
    return { ...response, data: transformedData };
};

export const asignarTecnico = async (ticketId: number, tecnicoId: number) => {
    const response = await api.patch(`/Ticket/${ticketId}/asignar_tecnico/`, { 
        idTecnico: tecnicoId 
    });
    return { ...response, data: transformTicketFromBackend(response.data) };
};

export const escalarPrioridad = async (ticketId: number) => {
    const response = await api.patch(`/Ticket/${ticketId}/escalar_prioridad/`);
    return { ...response, data: transformTicketFromBackend(response.data) };
};

// ============ LICITACIONES ============
export const getAllLicitaciones = () => api.get('/Licitacion/');
export const getLicitacionById = (id: number) => api.get(`/Licitacion/${id}/`);
export const createLicitacion = (data: any) => api.post('/Licitacion/', data);
export const updateLicitacion = (id: number, data: any) => api.patch(`/Licitacion/${id}/`, data);
export const deleteLicitacion = (id: number) => api.delete(`/Licitacion/${id}/`);
export const getLicitacionesByUsuario = (usuarioId: number) => api.get(`/Licitacion/?idUsuario=${usuarioId}`);
export const getLicitacionesByEstado = (estado: string) => api.get(`/Licitacion/?estado=${estado}`);

// ============ REPORTES ============
export const getAllReportes = () => api.get('/Reporte/');
export const getReporteById = (id: number) => api.get(`/Reporte/${id}/`);
export const createReporte = (data: any) => api.post('/Reporte/', data);
export const updateReporte = (id: number, data: any) => api.patch(`/Reporte/${id}/`, data);
export const deleteReporte = (id: number) => api.delete(`/Reporte/${id}/`);
export const getReportesByFecha = (fecha: string) => api.get(`/Reporte/?fecha=${fecha}`);
export const getUltimoReporte = () => api.get('/Reporte/?ordering=-fecha&limit=1');

// ============ COMENTARIOS ============
export const getComentariosPorTicket = (ticketId: number) => api.get(`/Comentario/?ticket=${ticketId}`);
export const createComentario = (data: any) => api.post('/Comentario/', data);
export const deleteComentario = (id: number) => api.delete(`/Comentario/${id}/`);

export default api;