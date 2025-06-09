"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import TextArea from "@/components/ui/textarea/TextArea";
import { updateFuelPrice, FuelPrice } from "@/services/fuelPrice";
import { useAuth } from "@/context/AuthContext";

interface EditFuelPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fuelPrice: FuelPrice | null;
}

const EditFuelPriceModal: React.FC<EditFuelPriceModalProps> = ({ isOpen, onClose, onSuccess, fuelPrice }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fuelType: "Solar",
    pricePerLiter: fuelPrice?.pricePerLiter?.toString() || "",
    effectiveDate: fuelPrice?.effectiveDate || "",
    description: fuelPrice?.description || "",
  });

  useEffect(() => {
    if (fuelPrice) {
      setFormData({
        fuelType: "Solar",
        pricePerLiter: fuelPrice.pricePerLiter?.toString() || "",
        effectiveDate: fuelPrice.effectiveDate || "",
        description: fuelPrice.description || "",
      });
    }
  }, [fuelPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !fuelPrice) {
      setError("No authentication token available");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateFuelPrice({
        id: fuelPrice.id,
        fuelType: "Solar",
        pricePerLiter: parseFloat(formData.pricePerLiter),
        effectiveDate: formData.effectiveDate,
        description: formData.description || undefined,
      }, token);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to update fuel price");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5">
      <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">Edit Fuel Price</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Fuel Type</label>
          <Input
            type="text"
            value="Solar"
            disabled
            className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
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
          <Button variant="primary" disabled={loading}>{loading ? "Saving..." : "Update"}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditFuelPriceModal; 