"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import TextArea from "@/components/ui/textarea/TextArea";
import { updateUnit, Unit } from "@/services/unit";
import { useAuth } from "@/context/AuthContext";

interface EditUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  unit: Unit | null;
}

const EditUnitModal: React.FC<EditUnitModalProps> = ({ isOpen, onClose, onSuccess, unit }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: unit?.code || "",
    name: unit?.name || "",
    description: unit?.description || "",
  });

  useEffect(() => {
    if (unit) {
      setFormData({
        code: unit.code || "",
        name: unit.name || "",
        description: unit.description || "",
      });
    }
  }, [unit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !unit) {
      setError("No authentication token available");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateUnit({ id: unit.id, ...formData }, token);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to update unit");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5">
      <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">Edit Unit</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Code</label>
          <Input
            type="text"
            value={formData.code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, code: e.target.value })}
            required
            placeholder="Enter unit code"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter unit name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <TextArea
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter unit description"
            rows={3}
          />
        </div>
        {error && <div className="text-sm text-error-500 dark:text-error-400">{error}</div>}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" disabled={loading}>{loading ? "Saving..." : "Update"}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditUnitModal; 