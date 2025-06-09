"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { PersonnelRole, getPersonnelRoles, getPersonnelRole, deletePersonnelRole, updatePersonnelRole } from "@/services/personnelRole";
import { EyeIcon, PencilIcon, TrashBinIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import TextArea from "@/components/ui/textarea/TextArea";
import { useRouter } from "next/navigation";

interface PersonnelRoleTableProps {
  refresh?: boolean;
}

export default function PersonnelRoleTable({ refresh }: PersonnelRoleTableProps) {
  const { token } = useAuth();
  const router = useRouter();
  const [roles, setRoles] = useState<PersonnelRole[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<PersonnelRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  
  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<PersonnelRole | null>(null);
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    id: string;
    roleCode: string;
    roleName: string;
    description: string;
    isPersonel: boolean;
  }>({
    id: '',
    roleCode: '',
    roleName: '',
    description: '',
    isPersonel: false,
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchRoles = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const data = await getPersonnelRoles(token);
      setRoles(data);
      setFilteredRoles(data);
    } catch (error) {
      console.error("Error fetching personnel roles:", error);
      toast.error("Failed to load personnel roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [token, refresh]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRoles(roles);
    } else {
      const filtered = roles.filter(
        (role) =>
          role.roleCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          role.roleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          role.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRoles(filtered);
    }
  }, [searchTerm, roles]);

  const handleDelete = async () => {
    if (!roleToDelete || !token) return;
    
    try {
      await deletePersonnelRole({ id: roleToDelete }, token);
      setRoles(roles.filter((role) => role.id !== roleToDelete));
      toast.success("Personnel role deleted successfully");
    } catch (error) {
      console.error("Error deleting personnel role:", error);
      toast.error("Failed to delete personnel role");
    } finally {
      setDeleteModalOpen(false);
      setRoleToDelete(null);
    }
  };

  const openDeleteModal = (id: string) => {
    setRoleToDelete(id);
    setDeleteModalOpen(true);
  };

  const openDetailModal = async (id: string) => {
    if (!token) return;

    try {
      const roleData = await getPersonnelRole(id, token);
      setSelectedRole(roleData);
      setDetailModalOpen(true);
    } catch (error) {
      console.error("Error fetching role details:", error);
      toast.error("Failed to load role details");
    }
  };

  const openEditModal = async (id: string) => {
    if (!token) return;

    try {
      const roleData = await getPersonnelRole(id, token);
      setEditFormData({
        id: roleData.id,
        roleCode: roleData.roleCode,
        roleName: roleData.roleName,
        description: roleData.description || '',
        isPersonel: roleData.isPersonel || false,
      });
      setEditModalOpen(true);
    } catch (error) {
      console.error("Error fetching role for edit:", error);
      toast.error("Failed to load role data for editing");
    }
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string | boolean } }
  ) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setEditError("Authentication token is missing");
      return;
    }

    setSaving(true);
    setEditError(null);

    try {
      const updatedRole = await updatePersonnelRole(editFormData, token);
      
      // Update the roles list with the edited role
      setRoles(roles.map(role => 
        role.id === updatedRole.id ? updatedRole : role
      ));
      
      toast.success("Personnel role updated successfully");
      setEditModalOpen(false);
    } catch (err) {
      console.error("Error updating personnel role:", err);
      setEditError("Failed to update personnel role");
      toast.error("Failed to update personnel role");
    } finally {
      setSaving(false);
    }
  };

  const handleViewSalaryComponents = (roleId: string) => {
    setDetailModalOpen(false);
    router.push(`/salary-components?roleId=${roleId}`);
  };

  const handleViewOvertimeRates = (roleId: string) => {
    setDetailModalOpen(false);
    router.push(`/overtime-rates?roleId=${roleId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Role Code
              </th>
              <th scope="col" className="px-6 py-3">
                Role Name
              </th>
              <th scope="col" className="px-6 py-3">
                Description
              </th>
              <th scope="col" className="px-6 py-3">
                Personnel Role
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.length > 0 ? (
              filteredRoles.map((role) => (
                <tr
                  key={role.id}
                  className="bg-white border-b dark:bg-gray-900 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {role.roleCode}
                  </td>
                  <td className="px-6 py-4">{role.roleName}</td>
                  <td className="px-6 py-4">{role.description}</td>
                  <td className="px-6 py-4">
                    {role.isPersonel ? (
                      <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-gray-300">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => openDetailModal(role.id)}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openEditModal(role.id)}
                        className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(role.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashBinIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="bg-white dark:bg-gray-900">
                <td colSpan={4} className="px-6 py-4 text-center">
                  No personnel roles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)}
        className="max-w-[400px] p-5"
      >
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">Delete Personnel Role</h4>
        <p className="mb-5 text-gray-600 dark:text-gray-400">
          Are you sure you want to delete this personnel role? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</Button>
        </div>
      </Modal>

      {/* Detail View Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        className="max-w-[600px] p-5"
      >
        <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
          Personnel Role Details
        </h4>
        
        {selectedRole && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Role Code
                </h3>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                  {selectedRole.roleCode}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Role Name
                </h3>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                  {selectedRole.roleName}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Personnel Role
                </h3>
                <p className="mt-1">
                  {selectedRole.isPersonel ? (
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
                      Yes
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-gray-300">
                      No
                    </span>
                  )}
                </p>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Description
                </h3>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {selectedRole.description || "No description provided"}
                </p>
              </div>

              {selectedRole.salaryComponent && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Salary Components
                  </h3>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Basic Salary</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        Rp {selectedRole.salaryComponent.gajiPokok.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fixed Allowance</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        Rp {selectedRole.salaryComponent.tunjanganTetap.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Variable Allowance</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        Rp {selectedRole.salaryComponent.tunjanganTidakTetap.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Additional Information
                </h3>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                    <p className="text-base text-gray-900 dark:text-white">
                      {new Date(selectedRole.createdAt || '').toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                    <p className="text-base text-gray-900 dark:text-white">
                      {new Date(selectedRole.updatedAt || '').toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => handleViewSalaryComponents(selectedRole.id)}
                className="w-full"
              >
                Lihat Komponen Gaji
              </Button>
              <Button
                variant="outline"
                onClick={() => handleViewOvertimeRates(selectedRole.id)}
                className="w-full"
              >
                Lihat Tarif Lembur
              </Button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  setDetailModalOpen(false);
                  openEditModal(selectedRole.id);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        className="max-w-[600px] p-5"
      >
        <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
          Edit Personnel Role
        </h4>
        
        <form onSubmit={handleEditSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role Code
              </label>
              <Input
                type="text"
                name="roleCode"
                value={editFormData.roleCode}
                onChange={handleEditChange}
                required
                placeholder="Enter role code"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role Name
              </label>
              <Input
                type="text"
                name="roleName"
                value={editFormData.roleName}
                onChange={handleEditChange}
                required
                placeholder="Enter role name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <TextArea
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                placeholder="Enter role description"
                rows={4}
              />
            </div>

            <div className="md:col-span-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isPersonel"
                  checked={editFormData.isPersonel}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEditChange({
                    target: {
                      name: 'isPersonel',
                      value: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Personnel Role
                </span>
              </label>
            </div>
          </div>

          {editError && <div className="text-sm text-red-500">{editError}</div>}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button variant="primary" disabled={saving}>
              {saving ? "Updating..." : "Update Role"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 