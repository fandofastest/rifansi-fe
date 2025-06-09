export type UserRole = 'superadmin' | 'admin' | 'mandor' | 'supervisor' | 'user';

export interface SalaryComponentInfo {
  gajiPokok: number;
  tunjanganTetap: number;
  tunjanganTidakTetap: number;
  transport: number;
  biayaTetapHarian: number | null;
  upahLemburHarian: number | null;
}

export interface Role {
  id: string | 'default';
  roleCode: string;
  roleName: string;
  description?: string;
  salaryComponent?: SalaryComponentInfo | null;
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