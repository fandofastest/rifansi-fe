"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { updateUser } from "@/services/user";
import type { User } from "@/services/user";
import { useAuth } from "@/context/AuthContext";
import { getPersonnelRoles, PersonnelRole } from "@/services/personnelRole";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: User | null;
}

interface UpdateUserFormData {
  id: string;
  username?: string;
  password?: string;
  fullName?: string;
  email?: string;
  role?: string;
  phone?: string;
}

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState<UpdateUserFormData>({
    id: '',
    username: '',
    fullName: '',
    role: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<PersonnelRole[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      if (token) {
        try {
          const rolesData = await getPersonnelRoles(token);
          setRoles(rolesData);
        } catch (error) {
          console.error('Error fetching roles:', error);
        }
      }
    };

    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen, token]);

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role?.roleCode || '',
        email: user.email,
        phone: user.phone || '',
        password: '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: UpdateUserFormData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;
    
    setError(null);
    setLoading(true);

    try {
      await updateUser(formData, token);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10 bg-transparent"
    >
      <form onSubmit={handleSubmit}>
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          Edit User
        </h4>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <Label>Username <span className="text-error-500">*</span></Label>
            <Input
              type="text"
              name="username"
              defaultValue={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
            />
          </div>

          <div>
            <Label>Full Name <span className="text-error-500">*</span></Label>
            <Input
              type="text"
              name="fullName"
              defaultValue={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
            />
          </div>

          <div>
            <Label>Role</Label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-white/90"
            >
              <option value="">No Role</option>
              {roles.map(role => (
                <option 
                  key={role.id} 
                  value={role.roleCode}
                  className="dark:bg-gray-800 dark:text-white/90"
                >
                  {role.roleName} ({role.roleCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Email <span className="text-error-500">*</span></Label>
            <Input
              type="email"
              name="email"
              defaultValue={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              type="text"
              name="phone"
              defaultValue={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              defaultValue={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
            />
          </div>
        </div>

        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" disabled={loading}>
            {loading ? 'Updating...' : 'Update User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 