import axios from "axios";

const API_BASE_URL = 'http://localhost:8000/ticashop/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

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


api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            // Token inválido o expirado
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============ AUTENTICACIÓN ============
export const login = (username, password) => {
    return api.post('/auth/login/', { username, password });
};

// ============ USUARIOS ============
export const getAllUsuarios = () => api.get('/Usuario/');
export const getUsuarioById = (id) => api.get(`/Usuario/${id}/`);
export const getUsuarioByCorreo = (correo) => api.get(`/Usuario/?correo=${correo}`);
export const createUsuario = (data) => api.post('/Usuario/', data);
export const updateUsuario = (id, data) => api.put(`/Usuario/${id}/`, data);
export const deleteUsuario = (id) => api.delete(`/Usuario/${id}/`);
export const getUsuariosByRol = (rol) => api.get(`/Usuario/?rol=${rol}`);

// ============ TICKETS ============
export const getAllTickets = () => api.get('/Ticket/');
export const getTicketById = (id) => api.get(`/Ticket/${id}/`);
export const createTicket = (data) => api.post('/Ticket/', data);
export const updateTicket = (id, data) => api.put(`/Ticket/${id}/`, data);
export const deleteTicket = (id) => api.delete(`/Ticket/${id}/`);
export const cerrarTicket = (id, fecha_cierre) => api.patch(`/Ticket/${id}/`, { 
    estado: 'Cerrado',
    fecha_cierre 
});

// Filtros específicos de Tickets
export const getTicketsByUsuario = (usuarioId) => api.get(`/Ticket/?idUsuario=${usuarioId}`);
export const getTicketsByTecnico = (tecnicoId) => api.get(`/Ticket/?idTecnico=${tecnicoId}`);
export const getTicketsByEstado = (estado) => api.get(`/Ticket/?estado=${estado}`);
export const asignarTecnico = (ticketId, tecnicoId) => api.patch(`/Ticket/${ticketId}/`, { 
    idTecnico: tecnicoId 
});

// ============ LICITACIONES ============
export const getAllLicitaciones = () => api.get('/Licitacion/');
export const getLicitacionById = (id) => api.get(`/Licitacion/${id}/`);
export const createLicitacion = (data) => api.post('/Licitacion/', data);
export const updateLicitacion = (id, data) => api.put(`/Licitacion/${id}/`, data);
export const deleteLicitacion = (id) => api.delete(`/Licitacion/${id}/`);
export const getLicitacionesByUsuario = (usuarioId) => api.get(`/Licitacion/?idUsuario=${usuarioId}`);
export const getLicitacionesByEstado = (estado) => api.get(`/Licitacion/?estado=${estado}`);

// ============ REPORTES ============
export const getAllReportes = () => api.get('/Reporte/');
export const getReporteById = (id) => api.get(`/Reporte/${id}/`);
export const createReporte = (data) => api.post('/Reporte/', data);
export const getReportesByFecha = (fecha) => api.get(`/Reporte/?fecha=${fecha}`);
export const getUltimoReporte = () => api.get('/Reporte/?ordering=-fecha&limit=1');

export default api;