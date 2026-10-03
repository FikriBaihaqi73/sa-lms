import { apiFetch } from '@/lib/api';
import { enrichAcademicStatus, MOCK_ACADEMIC_STATUSES } from '../data/mockAcademicStatuses';
import type {
  AcademicStatus,
  ApiResponse,
  CreateAcademicStatusInput,
  UpdateAcademicStatusInput,
} from '../types';

const LOCAL_STORAGE_KEY = 'mock_academic_statuses_v2';

const getMockStorage = (): AcademicStatus[] => {
  if (typeof window === 'undefined') return MOCK_ACADEMIC_STATUSES;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_ACADEMIC_STATUSES));
    return MOCK_ACADEMIC_STATUSES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return MOCK_ACADEMIC_STATUSES;
  }
};

const setMockStorage = (items: AcademicStatus[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  }
};

export const getAcademicStatusesApi = async (): Promise<AcademicStatus[]> => {
  try {
    const response: ApiResponse<AcademicStatus[]> = await apiFetch('/academic-statuses');
    return response.data.map(enrichAcademicStatus);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Backend server offline, using preview academic statuses data.');
      return getMockStorage();
    }
    throw error;
  }
};

export const getAcademicStatusByIdApi = async (id: string): Promise<AcademicStatus> => {
  try {
    const response: ApiResponse<AcademicStatus> = await apiFetch(`/academic-statuses/${id}`);
    return enrichAcademicStatus(response.data);
  } catch (error) {
    if (import.meta.env.DEV) {
      const found = getMockStorage().find((item) => item.id === id);
      if (found) return found;
    }
    throw error;
  }
};

export const createAcademicStatusApi = async (
  input: CreateAcademicStatusInput,
): Promise<AcademicStatus> => {
  try {
    const response: ApiResponse<AcademicStatus> = await apiFetch('/academic-statuses', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return enrichAcademicStatus(response.data);
  } catch (error) {
    if (import.meta.env.DEV) {
      const newItem = enrichAcademicStatus({
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

export const updateAcademicStatusApi = async (
  id: string,
  input: UpdateAcademicStatusInput,
): Promise<AcademicStatus> => {
  try {
    const response: ApiResponse<AcademicStatus> = await apiFetch(`/academic-statuses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return enrichAcademicStatus(response.data);
  } catch (error) {
    if (import.meta.env.DEV) {
      let updatedItem: AcademicStatus | null = null;
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

export const deleteAcademicStatusApi = async (id: string): Promise<{ id: string }> => {
  try {
    const response: ApiResponse<{ id: string }> = await apiFetch(`/academic-statuses/${id}`, {
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
