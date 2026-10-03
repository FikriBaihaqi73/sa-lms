import { useState, useCallback } from 'react';
import type { EmploymentStatus } from '../types';
import type { EmploymentStatusFormValues } from '../schemas/employmentStatusSchema';

const INITIAL_DATA: EmploymentStatus[] = [
  { id: '1', name: 'Permanent', description: 'Karyawan tetap dengan kontrak tidak terbatas waktu', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Contract', description: 'Karyawan kontrak dengan batas waktu tertentu', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Internship', description: 'Program magang untuk mahasiswa atau fresh graduate', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', name: 'Freelance', description: 'Pekerja lepas berdasarkan project', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

let mockData = [...INITIAL_DATA];

export function useEmploymentStatuses() {
  const [data, setData] = useState<EmploymentStatus[]>(mockData);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(() => {
    setData([...mockData]);
  }, []);

  return { data, isPending, isError: !!error, error, refresh };
}

export function useCreateEmploymentStatus() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (values: EmploymentStatusFormValues) => {
    setIsPending(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newItem: EmploymentStatus = {
      id: Math.random().toString(36).substring(7),
      name: values.name,
      description: values.description || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockData = [newItem, ...mockData];
    setIsPending(false);
    return newItem;
  };

  return { mutateAsync, isPending };
}

export function useUpdateEmploymentStatus() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async ({ id, input }: { id: string; input: EmploymentStatusFormValues }) => {
    setIsPending(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockData.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Data not found');
    
    const updatedItem = {
      ...mockData[index],
      name: input.name,
      description: input.description || null,
      updatedAt: new Date().toISOString(),
    };
    
    mockData[index] = updatedItem;
    setIsPending(false);
    return updatedItem;
  };

  return { mutateAsync, isPending };
}

export function useDeleteEmploymentStatus() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (id: string) => {
    setIsPending(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    mockData = mockData.filter(item => item.id !== id);
    setIsPending(false);
  };

  return { mutateAsync, isPending };
}
