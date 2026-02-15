/**
 * Hooks personalizados para el módulo de Usuarios usando TanStack Query
 * Proporciona hooks para autenticación y operaciones CRUD de usuarios
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as usersService from '../services/users.service';
import type { CreateUserDto, UpdateUserDto, LoginCredentials } from '../services/types';
import { useAuthSession } from '../store/useAuthSession';

// ==================== QUERY KEYS ====================
// Claves para identificar las queries en el caché
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: () => [...userKeys.lists()] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

// ==================== QUERIES (GET) ====================

/**
 * Hook para obtener todos los usuarios
 * @returns Query con la lista de usuarios
 * 
 * @example
 * const { data: users, isLoading, error } = useUsers();
 */
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: usersService.getAllUsers,
    staleTime: 5 * 60 * 1000, // Los datos se consideran frescos por 5 minutos
  });
};

/**
 * Hook para obtener un usuario específico por ID
 * @param id - ID del usuario a obtener
 * @param enabled - Si la query debe ejecutarse
 * @returns Query con el usuario específico
 * 
 * @example
 * const { data: user, isLoading } = useUser(1);
 */
export const useUser = (id: number, enabled = true) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersService.getUserById(id),
    enabled: enabled && id > 0, // Solo ejecutar si está habilitado y el ID es válido
    staleTime: 5 * 60 * 1000,
  });
};

// ==================== MUTATIONS (POST, PUT, DELETE) ====================

/**
 * Hook para iniciar sesión (login)
 * @returns Mutation para login con token y datos del usuario
 * 
 * @example
 * const login = useLogin();
 * login.mutate({ email: 'user@test.com', password: '123456' }, {
 *   onSuccess: (data) => {
 *     console.log('Token:', data.token);
 *     console.log('Usuario:', data.user);
 *   },
 *   onError: (error) => console.error('Error en login:', error)
 * });
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { login: loginSession } = useAuthSession();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => usersService.login(credentials),
    onSuccess: (data) => {
      // data contiene { token, user }
      // Convertir el user del servicio al formato del store
      const userData = {
        userId: data.user.id.toString(),
        email: data.user.email,
        nombre: data.user.name,
        rol: [{ nombre: data.user.role }],
      };
      
      // Guardar el estado de autenticación en el store
      loginSession(userData, data.token);
      
      // Limpiar el caché al hacer login
      queryClient.clear();
    },
  });
};

/**
 * Hook para cerrar sesión (logout)
 * @returns Mutation para logout que limpia el token y el caché
 * 
 * @example
 * const logout = useLogout();
 * logout.mutate();
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout: logoutSession } = useAuthSession();

  return useMutation({
    mutationFn: () => {
      // Limpiar localStorage
      usersService.logout();
      logoutSession();
      
      // Limpiar productos y promociones del localStorage
      try {
        localStorage.removeItem('products');
        localStorage.removeItem('promotions');
      } catch (err) {
        // Error silently ignored
      }
      
      return Promise.resolve();
    },
    onSuccess: () => {
      // Limpiar todo el caché al cerrar sesión
      queryClient.clear();
    },
  });
};

/**
 * Hook para crear un nuevo usuario
 * @returns Mutation para crear usuario
 * 
 * @example
 * const createUser = useCreateUser();
 * createUser.mutate(newUser, {
 *   onSuccess: () => console.log('Usuario creado!'),
 *   onError: (error) => console.error('Error:', error)
 * });
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: CreateUserDto) => usersService.createUser(user),
    onSuccess: () => {
      // Invalidar el caché de la lista de usuarios
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

/**
 * Hook para actualizar un usuario existente
 * @returns Mutation para actualizar usuario
 * 
 * @example
 * const updateUser = useUpdateUser();
 * updateUser.mutate({ id: 1, data: updatedData });
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
      usersService.updateUser(id, data),
    onSuccess: (_, variables) => {
      // Invalidar tanto la lista como el detalle del usuario
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook para eliminar un usuario
 * @returns Mutation para eliminar usuario
 * 
 * @example
 * const deleteUser = useDeleteUser();
 * deleteUser.mutate(userId);
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersService.deleteUser(id),
    onSuccess: () => {
      // Invalidar la lista de usuarios
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};
