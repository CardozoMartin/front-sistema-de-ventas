// src/store/useSession.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import type { AuthState, DecodedToken, User } from "../types/auth.types";



const CHECK_INTERVAL = 60000; // Verificar cada minuto

// Verifica si un token JWT ha expirado
const isTokenExpired = (exp: number): boolean => {
  const currentTime = Math.floor(Date.now() / 1000);
  // Agregar un buffer de 30 segundos para anticipar la expiración
  return exp < currentTime + 30;
};

// Valida y decodifica el token
const validateToken = (token: string | null): AuthState => {
  if (!token) {
    return {
      user: null,
      isLoggedIn: false,
      token: null,
    };
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    console.log("Decoded token:", decoded);

    // Verificar si el token ha expirado
    if (!decoded.exp || isTokenExpired(decoded.exp)) {
      console.warn("Token expirado");
      return {
        user: null,
        isLoggedIn: false,
        token: null,
      };
    }

    // Normalizar el rol a un array de objetos
    const normalizedRol = decoded.role
      ? [{ nombre: decoded.role }]
      : decoded.roles
      ? decoded.roles
      : [];

    // Token válido
    return {
      user: {
        userId: decoded.id,
        email: decoded.email,
        nombre: decoded.nombre || decoded.name,
        role: decoded.role,
        rol: normalizedRol,
      },
      isLoggedIn: true,
      token,
    };
  } catch (error) {
    console.error("Error al decodificar token:", error);
    return {
      user: null,
      isLoggedIn: false,
      token: null,
    };
  }
};

interface SessionStore extends AuthState {
  login: (userData: User, token: string) => void;
  logout: () => void;
  checkSession: () => boolean;
  startSessionCheck: () => void;
  stopSessionCheck: () => void;
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export const useAuthSession = create<SessionStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      token: null,

      login: (userData: User, token: string) => {
        let finalUser: User = userData;
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          
          // Normalizar el rol a un array de objetos
          const normalizedRol = decoded.role
            ? [{ nombre: decoded.role }]
            : decoded.roles
            ? decoded.roles
            : (userData as any).rol;
          
          finalUser = {
            userId: decoded.id || userData.userId,
            email: decoded.email || userData.email,
            nombre: decoded.nombre || decoded.name || (userData as any).nombre,
            role: decoded.role || (userData as any).role,
            rol: normalizedRol,
          } as User;
        } catch (err) {
          console.warn("Failed to decode token during login:", err);
        }

        set({
          user: finalUser,
          isLoggedIn: true,
          token,
        });

        // Iniciar verificación automática
        get().startSessionCheck();
      },

      logout: () => {
        get().stopSessionCheck();
        set({
          user: null,
          isLoggedIn: false,
          token: null,
        });
      },

      checkSession: () => {
        const currentToken = get().token;
        const validatedState = validateToken(currentToken);

        if (!validatedState.isLoggedIn) {
          get().stopSessionCheck();
          set({
            user: null,
            isLoggedIn: false,
            token: null,
          });
          return false;
        }

        // Actualizar estado si es necesario
        if (validatedState.token !== currentToken) {
          set(validatedState);
        }

        return true;
      },

      startSessionCheck: () => {
        // Limpiar intervalo existente si hay uno
        if (intervalId) {
          clearInterval(intervalId);
        }

        // Verificar inmediatamente
        get().checkSession();

        // Configurar verificación periódica
        intervalId = setInterval(() => {
          const isValid = get().checkSession();
          if (!isValid) {
            console.log("Sesión inválida, redirigiendo al login...");
          }
        }, CHECK_INTERVAL);
      },

      stopSessionCheck: () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      },
    }),
    {
      name: "auth-storage", // nombre único para el storage
      // Opcionalmente puedes agregar una migración para limpiar tokens expirados
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          const validated = validateToken(state.token);
          if (!validated.isLoggedIn) {
            console.warn("Token expirado detectado al recargar, limpiando...");
            state.user = null;
            state.isLoggedIn = false;
            state.token = null;
          } else {
            // Iniciar verificación automática si la sesión es válida
            state.startSessionCheck();
          }
        }
      },
    }
  )
);