export type UserRole = 'superadmin' | 'admin' | 'mandor' | 'supervisor' | 'user';

export interface Role {
  id: string;
  roleCode: string;
  roleName: string;
  hourlyRate: number;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role?: Role | null;
  email: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginInput {
  username: string;
  password: string;
} 