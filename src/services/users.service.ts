/**
 * Servicio de API para el módulo de Usuarios
 * Maneja autenticación y operaciones CRUD de usuarios
 */

import { apiClient } from './api.config';
import type {
  ApiResponse,
  User,
  CreateUserDto,
  UpdateUserDto,
  LoginCredentials,
  LoginResponse,
} from './types';

/**
 * Iniciar sesión (login)
 * POST /api/v1/users/login
 * @param credentials - Email y contraseña del usuario
 * @returns Token de autenticación y datos del usuario
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    '/users/login',
    credentials
  );
  // Guardar el token en localStorage
  if (response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
  }
  return response.data.data;
};

/**
 * Cerrar sesión (logout)
 * Limpia el token del localStorage
 */
export const logout = (): void => {
  localStorage.removeItem('token');
};

/**
 * Obtener todos los usuarios
 * GET /api/v1/users
 * @returns Lista de todos los usuarios
 */
export const getAllUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<ApiResponse<User[]>>('/users');
  return response.data.data;
};

/**
 * Obtener un usuario por ID
 * GET /api/v1/users/:id
 * @param id - ID del usuario a buscar
 * @returns Usuario encontrado
 */
export const getUserById = async (id: number): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
  return response.data.data;
};

/**
 * Crear un nuevo usuario
 * POST /api/v1/users
 * @param user - Datos del usuario a crear
 * @returns Usuario creado
 */
export const createUser = async (user: CreateUserDto): Promise<User> => {
  const response = await apiClient.post<ApiResponse<User>>('/users', user);
  return response.data.data;
};

/**
 * Actualizar un usuario existente
 * PUT /api/v1/users/:id
 * @param id - ID del usuario a actualizar
 * @param user - Datos del usuario a actualizar
 * @returns Usuario actualizado
 */
export const updateUser = async (id: number, user: UpdateUserDto): Promise<User> => {
  const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, user);
  return response.data.data;
};

/**
 * Eliminar un usuario
 * DELETE /api/v1/users/:id
 * @param id - ID del usuario a eliminar
 * @returns Confirmación de eliminación
 */
export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};
