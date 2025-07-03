"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { registerUser } from "@/services/user";
import { useAuth } from "@/context/AuthContext";
import { getPersonnelRoles, PersonnelRole } from "@/services/personnelRole";
import { toast } from "react-hot-toast";

interface AddUserFormData {
  username: string;
  password: string;
  fullName: string;
  role: string;
  email: string;
  phone?: string;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState<AddUserFormData>({
    username: '',
    password: '',
    fullName: '',
    role: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<PersonnelRole[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        try {
          const rolesData = await getPersonnelRoles(token);
          
          setRoles(rolesData);
          
          if (rolesData.length > 0) {
            setFormData(prev => ({
              ...prev,
              role: rolesData[0].roleCode
            }));
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          setFormData(prev => ({
            ...prev,
            role: "USER"
          }));
        }
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  interface GraphQLError {
    response?: {
      errors?: Array<{ message: string }>;
    };
    message?: string;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Authentication token is missing');
      return;
    }
    
    if (!formData.role) {
      setError('Please select a role');
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
      await registerUser(formData, token);
      toast.success('User created successfully');
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      const graphqlError = error as GraphQLError;
      const errorMessage = graphqlError.response?.errors?.[0]?.message || 'Failed to create user';
      setError(errorMessage);
      toast.error(errorMessage); // Keep toast as backup
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10 bg-transparent"
    >
      <form onSubmit={handleSubmit}>
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          Add New User
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
            <Label>Password <span className="text-error-500">*</span></Label>
            <Input
              type="password"
              name="password"
              defaultValue={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
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
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/[0.05] dark:bg-gray-800 dark:text-white/90"
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
        </div>

        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 