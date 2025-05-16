"use client";
import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/ui/input/Input";
import TextArea from "@/components/ui/textarea/TextArea";
import { useAuth } from "@/context/AuthContext";
import { createMaterial } from "@/services/material";
import { getUnits, Unit } from "@/services/unit";

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMaterialModal({ isOpen, onClose, onSuccess }: AddMaterialModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    unitId: "",
    unitRate: 0,
    description: "",
  });

  useEffect(() => {
    const fetchUnits = async () => {
      if (token) {
        try {
          const unitsData = await getUnits(token);
          setUnits(unitsData);
        } catch (error) {
          console.error('Error fetching units:', error);
        }
      }
    };

    if (isOpen) {
      fetchUnits();
      // Reset form when modal opens
      setFormData({
        name: "",
        unitId: "",
        unitRate: 0,
        description: "",
      });
      setError(null);
    }
  }, [isOpen, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("No authentication token available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createMaterial(formData, token);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to create material");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5">
      <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">Add New Material</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setFormData({ ...formData, name: e.target.value })
            }
            required
            placeholder="Enter material name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
          <select
            value={formData.unitId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
              setFormData({ ...formData, unitId: e.target.value })
            }
            required
            className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500"
          >
            <option value="">Select a unit</option>
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.code})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Unit Rate</label>
          <Input
            type="number"
            value={formData.unitRate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setFormData({ ...formData, unitRate: parseFloat(e.target.value) })
            }
            required
            placeholder="Enter unit rate"
            step="0.01"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <TextArea
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter material description"
            rows={3}
          />
        </div>
        {error && <div className="text-sm text-error-500 dark:text-error-400">{error}</div>}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" disabled={loading}>{loading ? "Saving..." : "Create"}</Button>
        </div>
      </form>
    </Modal>
  );
} 