import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // URL base de la API
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir token
api.interceptors.request.use((config) => {
    // Antes de cada petición HTTP, busca el token guardado en localStorage
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Tipos
export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Property {
    id: number;
    user_id: number;
    type: 'casa' | 'apartamento' | 'local' | 'oficina';
    title: string;
    description?: string;
    address: string;
    city: string;
    area_m2?: number;
    bedrooms?: number;
    bathrooms?: number;
    monthly_rent: number;
    status: 'disponible' | 'arrendado' | 'mantenimiento';
    image_url?: string;
    created_at: string;
    updated_at: string;
}

export interface Stats {
    total: number;
    disponibles: number;
    arrendadas: number;
    ingresos_mensuales: number;
}

// Auth
export const authService = {
    login: (email: string, password: string) =>
        api.post<{ user: User; token: string }>('/login', { email, password }), // Inicia sesión, devuelve usuario y token

    register: (name: string, email: string, password: string) =>
        api.post<{ user: User; token: string }>('/register', { name, email, password }), // Registra nuevo usuario

    logout: () => api.post('/logout'),

    me: () => api.get<User>('/me'), // 	Obtiene datos del usuario actual
};

// Properties
export const propertyService = {
    getAll: () => api.get<Property[]>('/properties'),

    getById: (id: number) => api.get<Property>(`/properties/${id}`),

    create: (data: Partial<Property>) => api.post<Property>('/properties', data),

    update: (id: number, data: Partial<Property>) =>
        api.put<Property>(`/properties/${id}`, data),

    delete: (id: number) => api.delete(`/properties/${id}`),

    getStats: () => api.get<Stats>('/properties/stats'),
};

export default api;