import type { Interaction, InteractionCreate } from '../types/interaction';

const API_BASE = '/api/interactions';

function getAuthHeader() {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function getInteractions(opportunityId?: string): Promise<Interaction[]> {
  let url = API_BASE;
  if (opportunityId) {
    url += `?opportunityId=${encodeURIComponent(opportunityId)}`;
  }
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      ...getAuthHeader(),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al obtener interacciones');
  }
  return res.json();
}

export async function createInteraction(data: InteractionCreate): Promise<Interaction> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al crear interacción');
  }
  return res.json();
}
