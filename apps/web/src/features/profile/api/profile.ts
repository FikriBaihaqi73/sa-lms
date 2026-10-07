import { apiFetch } from '@/lib/api';
import type { Profile, UpdateProfileInput } from '../types';

export async function getMyProfileApi(): Promise<Profile> {
  const response = await apiFetch('/profiles/me');
  const data = response.data;
  return {
    id: data.id,
    userId: data.userId || data.user_id,
    institutionId: data.institutionId || data.institution_id,
    roleId: data.roleId || data.role_id,
    fullName: data.fullName || data.full_name || 'Admin Institusi',
    identityNumber: data.identityNumber || data.identity_number || null,
    gender: data.gender || null,
    birthPlace: data.birthPlace || data.birth_place || null,
    birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : null,
    religionId: data.religionId || data.religion_id || null,
    nationalityId: data.nationalityId || data.nationality_id || null,
    address: data.address || null,
    phoneNumber: data.phoneNumber || data.phone_number || null,
    email: data.email || null,
    photoUrl: data.photoUrl || data.photo_url || null,
    createdAt: data.createdAt || data.created_at,
    updatedAt: data.updatedAt || data.updated_at,
    institution: data.institution || null,
    role: data.role || null,
    religion: data.religion || null,
    nationality: data.nationality || null,
  };
}

export async function updateMyProfileApi(input: UpdateProfileInput): Promise<Profile> {
  const response = await apiFetch('/profiles/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  const data = response.data;
  return {
    id: data.id,
    userId: data.userId || data.user_id,
    institutionId: data.institutionId || data.institution_id,
    roleId: data.roleId || data.role_id,
    fullName: data.fullName || data.full_name,
    identityNumber: data.identityNumber || data.identity_number || null,
    gender: data.gender || null,
    birthPlace: data.birthPlace || data.birth_place || null,
    birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : null,
    religionId: data.religionId || data.religion_id || null,
    nationalityId: data.nationalityId || data.nationality_id || null,
    address: data.address || null,
    phoneNumber: data.phoneNumber || data.phone_number || null,
    email: data.email || null,
    photoUrl: data.photoUrl || data.photo_url || null,
    createdAt: data.createdAt || data.created_at,
    updatedAt: data.updatedAt || data.updated_at,
    institution: data.institution || null,
    role: data.role || null,
    religion: data.religion || null,
    nationality: data.nationality || null,
  };
}
