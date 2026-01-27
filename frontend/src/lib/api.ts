import axios from 'axios';

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  const port = import.meta.env.VITE_API_PORT || '8000';
  const host = window.location.hostname || 'localhost';
  return `http://${host}:${port}/api`;
};

export const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', new URLSearchParams({ username: email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  register: (data: { email: string; password: string; nombre: string; apellido: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Imagenes (Cloudinary)
export const imagenApi = {
  upload: async (file: File, folder: string = 'general'): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post('/imagenes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { folder }
    });

    return response.data;
  },
  delete: async (publicId: string) => {
    return api.delete(`/imagenes/delete/${publicId}`);
  }
};

// Chat/BI API (para Panel BI)
export const chatApi = {
  getPills: async () => {
    const response = await api.get('/chat/pills');
    return response.data;
  },
  getKPIs: async () => {
    const response = await api.get('/chat/kpis');
    return response.data;
  },
  getEntities: async () => {
    const response = await api.get('/chat/entities');
    return response.data;
  },
  getSchema: async () => {
    const response = await api.get('/chat/schema');
    return response.data;
  },
  consulta: async (consulta: string, formato?: string) => {
    const response = await api.post('/chat/consulta', { consulta, formato });
    return response.data;
  },
  getConsultasGuardadas: async () => {
    const response = await api.get('/chat/consultas-guardadas');
    return response.data;
  },
  crearConsultaGuardada: async (data: { nombre: string; pregunta_original: string; sql_query?: string }) => {
    const response = await api.post('/chat/consultas-guardadas', data);
    return response.data;
  },
  ejecutarConsultaGuardada: async (id: number) => {
    const response = await api.post(`/chat/consultas-guardadas/${id}/ejecutar`);
    return response.data;
  },
  eliminarConsultaGuardada: async (id: number) => {
    const response = await api.delete(`/chat/consultas-guardadas/${id}`);
    return response.data;
  },
};
