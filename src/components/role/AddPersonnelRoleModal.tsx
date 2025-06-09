"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/ui/input/Input";
import TextArea from "@/components/ui/textarea/TextArea";
import { useAuth } from "@/context/AuthContext";
import { createPersonnelRole } from "@/services/personnelRole";
import { toast } from "react-hot-toast";
import AddSalaryComponentModal from "@/components/salary/AddSalaryComponentModal";

interface AddPersonnelRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPersonnelRoleModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: AddPersonnelRoleModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    roleCode: "",
    roleName: "",
    description: "",
    isPersonel: false
  });
  const [createdRoleId, setCreatedRoleId] = useState<string | null>(null);
  const [showSalaryModal, setShowSalaryModal] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string | boolean } }
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
      const response = await createPersonnelRole(formData, token);
      toast.success("Personnel role created successfully");
      setCreatedRoleId(response.id);
      setShowSalaryModal(true);
    } catch (err) {
      console.error("Error creating personnel role:", err);
      setError("Failed to create personnel role");
      toast.error("Failed to create personnel role");
      setLoading(false);
    }
  };

  const handleSalarySuccess = () => {
    setShowSalaryModal(false);
    onSuccess();
    onClose();
  };

  const handleSkipSalary = () => {
    onSuccess();
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5">
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          Add New Personnel Role
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

          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isPersonel"
                checked={formData.isPersonel}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange({
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

          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" disabled={loading}>
              {loading ? "Saving..." : "Create Role"}
            </Button>
          </div>
        </form>
      </Modal>

      {showSalaryModal && createdRoleId && (
        <AddSalaryComponentModal
          isOpen={showSalaryModal}
          onClose={handleSkipSalary}
          onSuccess={handleSalarySuccess}
          personnelRoleId={createdRoleId}
        />
      )}
    </>
  );
} 