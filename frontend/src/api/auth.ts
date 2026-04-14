import type { UserLoginRequest, UserLoginResponse, UserResponse } from '../types/user';

const API_BASE = '/api/auth';

export async function login(data: UserLoginRequest): Promise<UserLoginResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function getCurrentUser(token?: string): Promise<UserResponse> {
  const res = await fetch(`${API_BASE}/me`, {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch user');
  }
  return res.json();
}
