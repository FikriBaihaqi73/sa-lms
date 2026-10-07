import { apiFetch } from '@/lib/api';
import type { EmploymentStatus } from '../types';
import type { EmploymentStatusFormValues } from '../schemas/employmentStatusSchema';

export async function getEmploymentStatuses(): Promise<EmploymentStatus[]> {
  const response = await apiFetch('/employment-statuses');
  const items = Array.isArray(response.data) ? response.data : (response.data?.data || []);
  return items.map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description || null,
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
    updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
  }));
}

export async function createEmploymentStatus(values: EmploymentStatusFormValues): Promise<EmploymentStatus> {
  const response = await apiFetch('/employment-statuses', {
    method: 'POST',
    body: JSON.stringify(values),
  });
  const item = response.data;
  return {
    id: item.id,
    name: item.name,
    description: item.description || null,
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
    updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
  };
}

export async function updateEmploymentStatus({ id, input }: { id: string; input: EmploymentStatusFormValues }): Promise<EmploymentStatus> {
  const response = await apiFetch(`/employment-statuses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  const item = response.data;
  return {
    id: item.id,
    name: item.name,
    description: item.description || null,
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
    updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
  };
}

export async function deleteEmploymentStatus(id: string): Promise<void> {
  await apiFetch(`/employment-statuses/${id}`, {
    method: 'DELETE',
  });
}
