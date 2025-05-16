"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import TextArea from "@/components/ui/textarea/TextArea";
import { createFuelPrice } from "@/services/fuelPrice";
import { useAuth } from "@/context/AuthContext";

interface AddFuelPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddFuelPriceModal: React.FC<AddFuelPriceModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    fuelType: "",
    pricePerLiter: "",
    effectiveDate: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("No authentication token available");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createFuelPrice({
        fuelType: formData.fuelType,
        pricePerLiter: parseFloat(formData.pricePerLiter),
        effectiveDate: formData.effectiveDate,
        description: formData.description || undefined,
      }, token);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to create fuel price");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5">
      <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">Add Fuel Price</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Fuel Type</label>
          <Input
            type="text"
            value={formData.fuelType}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fuelType: e.target.value })}
            required
            placeholder="Enter fuel type"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Price Per Liter</label>
          <Input
            type="number"
            value={formData.pricePerLiter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, pricePerLiter: e.target.value })}
            required
            placeholder="Enter price per liter"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Effective Date</label>
          <Input
            type="date"
            value={formData.effectiveDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, effectiveDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <TextArea
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter description (optional)"
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
};

export default AddFuelPriceModal; 