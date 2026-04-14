import type { Opportunity, OpportunityCreate } from '../types/opportunity';

const API_BASE = '/api/opportunities';

function getAuthHeader() {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function getOpportunities(): Promise<Opportunity[]> {
  const res = await fetch(`${API_BASE}`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al cargar oportunidades');
  }
  return res.json();
}

export async function getOpportunity(id: string): Promise<Opportunity> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al cargar oportunidad');
  }
  return res.json();
}

export async function createOpportunity(data: OpportunityCreate): Promise<Opportunity> {
  const res = await fetch(`${API_BASE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al crear oportunidad');
  }
  return res.json();
}

export async function updateOpportunity(id: string, data: OpportunityCreate): Promise<Opportunity> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al actualizar oportunidad');
  }
  return res.json();
}

export async function deleteOpportunity(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al eliminar oportunidad');
  }
  return true;
}
