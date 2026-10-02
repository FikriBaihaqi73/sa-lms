import { apiFetch } from '@/lib/api';
import type {
  ApiResponse,
  CreateNationalityInput,
  Nationality,
  UpdateNationalityInput,
} from '../types';

const INITIAL_MOCK_NATIONALITIES: Nationality[] = [
  {
    id: 'nat-1',
    name: 'Indonesia',
    description: 'Warga Negara Indonesia (WNI)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nat-2',
    name: 'Malaysia',
    description: 'Warga Negara Malaysia',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nat-3',
    name: 'Singapore',
    description: 'Warga Negara Singapura',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nat-4',
    name: 'Japan',
    description: 'Warga Negara Jepang',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const LOCAL_STORAGE_KEY = 'mock_nationalities_data';

const getMockStorage = (): Nationality[] => {
  if (typeof window === 'undefined') return INITIAL_MOCK_NATIONALITIES;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_NATIONALITIES));
    return INITIAL_MOCK_NATIONALITIES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_MOCK_NATIONALITIES;
  }
};

const setMockStorage = (items: Nationality[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  }
};

export const getNationalitiesApi = async (): Promise<Nationality[]> => {
  try {
    const response: ApiResponse<Nationality[]> = await apiFetch('/nationalities');
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Backend server offline, using preview nationalities data.');
      return getMockStorage();
    }
    throw error;
  }
};

export const getNationalityByIdApi = async (id: string): Promise<Nationality> => {
  try {
    const response: ApiResponse<Nationality> = await apiFetch(`/nationalities/${id}`);
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      const items = getMockStorage();
      const found = items.find((item) => item.id === id);
      if (found) return found;
    }
    throw error;
  }
};

export const createNationalityApi = async (input: CreateNationalityInput): Promise<Nationality> => {
  try {
    const response: ApiResponse<Nationality> = await apiFetch('/nationalities', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      const items = getMockStorage();
      const newItem: Nationality = {
        id: `nat-${Date.now()}`,
        name: input.name,
        description: input.description || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newItem, ...items];
      setMockStorage(updated);
      return newItem;
    }
    throw error;
  }
};

export const updateNationalityApi = async (
  id: string,
  input: UpdateNationalityInput,
): Promise<Nationality> => {
  try {
    const response: ApiResponse<Nationality> = await apiFetch(`/nationalities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      const items = getMockStorage();
      let updatedItem: Nationality | null = null;
      const updatedList = items.map((item) => {
        if (item.id === id) {
          updatedItem = {
            ...item,
            name: input.name ?? item.name,
            description: input.description !== undefined ? input.description : item.description,
            updatedAt: new Date().toISOString(),
          };
          return updatedItem;
        }
        return item;
      });
      setMockStorage(updatedList);
      if (updatedItem) return updatedItem;
    }
    throw error;
  }
};

export const deleteNationalityApi = async (id: string): Promise<{ id: string }> => {
  try {
    const response: ApiResponse<{ id: string }> = await apiFetch(`/nationalities/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      const items = getMockStorage();
      const filtered = items.filter((item) => item.id !== id);
      setMockStorage(filtered);
      return { id };
    }
    throw error;
  }
};
