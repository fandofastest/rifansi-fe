"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/ui/input/Input";
import TextArea from "@/components/ui/textarea/TextArea";
import { useAuth } from "@/context/AuthContext";
import { updatePersonnelRole, getPersonnelRole } from "@/services/personnelRole";
import { getSalaryComponentByPersonnelRole } from "@/services/salaryComponent";
import { toast } from "react-hot-toast";
import SalaryComponentDetails from "@/components/salary/SalaryComponentDetails";
import AddSalaryComponentModal from "@/components/salary/AddSalaryComponentModal";

interface EditPersonnelRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roleId: string;
}

export default function EditPersonnelRoleModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  roleId
}: EditPersonnelRoleModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: roleId,
    roleCode: "",
    roleName: "",
    description: ""
  });
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [hasSalaryComponent, setHasSalaryComponent] = useState(false);
  const [showSalaryDetails, setShowSalaryDetails] = useState(false);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (token) {
      fetchRoleData();
    }
  }, [token]);

  const fetchRoleData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const roleData = await getPersonnelRole(roleId, token);
      setFormData({
        id: roleId,
        roleCode: roleData.roleCode || "",
        roleName: roleData.roleName || "",
        description: roleData.description || ""
      });
      
      // Check if salary component exists
      const salaryComponent = await getSalaryComponentByPersonnelRole(roleId, token);
      setHasSalaryComponent(!!salaryComponent);
    } catch (err) {
      console.error("Error fetching role data:", err);
      setError("Failed to fetch role data");
      toast.error("Failed to fetch role data");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Authentication token is missing");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updatePersonnelRole(formData, token);
      toast.success("Personnel role updated successfully");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error updating personnel role:", err);
      setError("Failed to update personnel role");
      toast.error("Failed to update personnel role");
    } finally {
      setLoading(false);
    }
  };

  const handleSalarySuccess = () => {
    setShowSalaryModal(false);
    setHasSalaryComponent(true);
    fetchRoleData();
  };

  const handleToggleSalaryDetails = () => {
    setShowSalaryDetails(!showSalaryDetails);
  };

  if (loadingData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5">
        <div className="flex justify-center items-center h-40">
          <div className="loader">Loading...</div>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5">
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          Edit Personnel Role
        </h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role Code
            </label>
            <Input
              type="text"
              name="roleCode"
              value={formData.roleCode}
              onChange={handleChange}
              required
              placeholder="Enter role code (e.g. OP-EXCV)"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role Name
            </label>
            <Input
              type="text"
              name="roleName"
              value={formData.roleName}
              onChange={handleChange}
              required
              placeholder="Enter role name (e.g. Excavator Operator)"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter role description"
              rows={3}
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-md font-medium text-gray-800 dark:text-white/90">
                Komponen Gaji
              </h5>
              {hasSalaryComponent ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleSalaryDetails}
                >
                  {showSalaryDetails ? "Sembunyikan Detail" : "Lihat Detail"}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowSalaryModal(true)}
                >
                  Tambah Komponen Gaji
                </Button>
              )}
            </div>
            
            {showSalaryDetails && hasSalaryComponent && (
              <SalaryComponentDetails
                personnelRoleId={roleId}
                onAddSalary={() => setShowSalaryModal(true)}
                onRefresh={fetchRoleData}
              />
            )}
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" disabled={loading}>
              {loading ? "Saving..." : "Update Role"}
            </Button>
          </div>
        </form>
      </Modal>

      {showSalaryModal && (
        <AddSalaryComponentModal
          isOpen={showSalaryModal}
          onClose={() => setShowSalaryModal(false)}
          onSuccess={handleSalarySuccess}
          personnelRoleId={roleId}
        />
      )}
    </>
  );
} 