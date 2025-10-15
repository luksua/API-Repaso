import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/api';

// Tipos base
export type Role = 'owner' | 'admin' | 'tenant';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: Role;
  avatar?: string;
}

interface AuthState {
  // state
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // acciones
  setAuth: (user: User, token: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  me: () => Promise<void>;
  logout: () => Promise<void> | void;

  // utilidades
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,

        setAuth: (user, token) => {
          set({ user, token, isAuthenticated: true, error: null }, false, 'auth/setAuth');
        },

        login: async (email, password) => {
          set({ loading: true, error: null }, false, 'auth/login:start');
          try {
            const { data } = await authService.login(email, password);
            set(
              { user: data.user, token: data.token, isAuthenticated: true, loading: false },
              false,
              'auth/login:success'
            );
          } catch (e: any) {
            set({ loading: false, error: e?.response?.data?.message || 'Error al iniciar sesión' }, false, 'auth/login:error');
            throw e;
          }
        },

        register: async (name, email, password) => {
          set({ loading: true, error: null }, false, 'auth/register:start');
          try {
            const { data } = await authService.register(name, email, password);
            set(
              { user: data.user, token: data.token, isAuthenticated: true, loading: false },
              false,
              'auth/register:success'
            );
          } catch (e: any) {
            set({ loading: false, error: e?.response?.data?.message || 'Error en registro' }, false, 'auth/register:error');
            throw e;
          }
        },

        me: async () => {
          const token = get().token;
          if (!token) return;
          try {
            const { data } = await authService.me();
            set({ user: data, isAuthenticated: true }, false, 'auth/me:success');
          } catch {
            // token inválido: reset
            get().reset();
          }
        },

        logout: async () => {
          try {
            await authService.logout();
          } catch {
            // si falla el logout en servidor, igual limpiamos cliente
          } finally {
            get().reset();
          }
        },

        reset: () =>
          set(
            { user: null, token: null, isAuthenticated: false, loading: false, error: null },
            false,
            'auth/reset'
          ),
      }),
      {
        name: 'auth-store',
        version: 1,
        storage: createJSONStorage(() => localStorage),
        // Persistimos solo lo necesario
        partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
        onRehydrateStorage: () => (state) => {
          // opcional: side effects tras hidratar
        },
      }
    ),
    { name: 'AuthStore' }
  )
);

// Helper para leer el token fuera de componentes (ej. interceptores)
export const getAuthToken = () => useAuthStore.getState().token;