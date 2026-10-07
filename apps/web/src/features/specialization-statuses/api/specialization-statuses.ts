import { apiFetch } from '@/lib/api';
import { enrichSpecializationStatus, MOCK_SPECIALIZATION_STATUSES } from '../data/mockSpecializationStatuses';
import type {
  SpecializationStatus,
  ApiResponse,
  CreateSpecializationStatusInput,
  UpdateSpecializationStatusInput,
} from '../types';

const LOCAL_STORAGE_KEY = 'mock_academic_statuses_v2';

const getMockStorage = (): SpecializationStatus[] => {
  if (typeof window === 'undefined') return MOCK_SPECIALIZATION_STATUSES;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_SPECIALIZATION_STATUSES));
    return MOCK_SPECIALIZATION_STATUSES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return MOCK_SPECIALIZATION_STATUSES;
  }
};

const setMockStorage = (items: SpecializationStatus[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  }
};

export const getSpecializationStatusesApi = async (): Promise<SpecializationStatus[]> => {
  try {
    const response: ApiResponse<SpecializationStatus[]> = await apiFetch('/specialization-statuses');
    return response.data.map(enrichSpecializationStatus);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Backend server offline, using preview academic statuses data.');
      return getMockStorage();
    }
    throw error;
  }
};

export const getSpecializationStatusByIdApi = async (id: string): Promise<SpecializationStatus> => {
  try {
    const response: ApiResponse<SpecializationStatus> = await apiFetch(`/specialization-statuses/${id}`);
    return enrichSpecializationStatus(response.data);
  } catch (error) {
    if (import.meta.env.DEV) {
      const found = getMockStorage().find((item) => item.id === id);
      if (found) return found;
    }
    throw error;
  }
};

export const createSpecializationStatusApi = async (
  input: CreateSpecializationStatusInput,
): Promise<SpecializationStatus> => {
  try {
    const response: ApiResponse<SpecializationStatus> = await apiFetch('/specialization-statuses', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return enrichSpecializationStatus(response.data);
  } catch (error) {
    if (import.meta.env.DEV) {
      const newItem = enrichSpecializationStatus({
        id: `as-${Date.now()}`,
        name: input.name,
        description: input.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setMockStorage([newItem, ...getMockStorage()]);
      return newItem;
    }
    throw error;
  }
};

export const updateSpecializationStatusApi = async (
  id: string,
  input: UpdateSpecializationStatusInput,
): Promise<SpecializationStatus> => {
  try {
    const response: ApiResponse<SpecializationStatus> = await apiFetch(`/specialization-statuses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return enrichSpecializationStatus(response.data);
  } catch (error) {
    if (import.meta.env.DEV) {
      let updatedItem: SpecializationStatus | null = null;
      const updatedList = getMockStorage().map((item) => {
        if (item.id !== id) return item;
        updatedItem = {
          ...item,
          name: input.name ?? item.name,
          description: input.description !== undefined ? input.description : item.description,
          updatedAt: new Date().toISOString(),
        };
        return updatedItem;
      });
      setMockStorage(updatedList);
      if (updatedItem) return updatedItem;
    }
    throw error;
  }
};

export const deleteSpecializationStatusApi = async (id: string): Promise<{ id: string }> => {
  try {
    const response: ApiResponse<{ id: string }> = await apiFetch(`/specialization-statuses/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      setMockStorage(getMockStorage().filter((item) => item.id !== id));
      return { id };
    }
    throw error;
  }
};
