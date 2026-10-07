export interface ProfileInstitution {
  id: string;
  name: string;
  code?: string | null;
}

export interface ProfileRole {
  id: string;
  name: string;
}

export interface ProfileReligion {
  id: string;
  name: string;
}

export interface ProfileNationality {
  id: string;
  name: string;
}

export interface Profile {
  id: string;
  userId: string;
  institutionId: string;
  roleId: string;
  fullName: string;
  identityNumber?: string | null;
  gender?: string | null;
  birthPlace?: string | null;
  birthDate?: string | null;
  religionId?: string | null;
  nationalityId?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  institution?: ProfileInstitution | null;
  role?: ProfileRole | null;
  religion?: ProfileReligion | null;
  nationality?: ProfileNationality | null;
}

export interface UpdateProfileInput {
  fullName?: string;
  identityNumber?: string;
  gender?: string;
  birthPlace?: string;
  birthDate?: string;
  religionId?: string;
  nationalityId?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  photoUrl?: string;
}
