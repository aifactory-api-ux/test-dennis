import type { UserLoginRequest, UserLoginResponse, UserResponse } from '../types/user';
import { api } from './config';

export async function login(data: UserLoginRequest): Promise<UserLoginResponse> {
  const res = await api.post<UserLoginResponse>('/auth/login', data);
  return res.data;
}

export async function getCurrentUser(token?: string): Promise<UserResponse> {
  const res = await api.get<UserResponse>('/auth/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}
