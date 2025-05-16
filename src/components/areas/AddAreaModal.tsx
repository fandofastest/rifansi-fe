"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createArea } from "@/services/area";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

interface AddAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddAreaModal: React.FC<AddAreaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    latitude: 0,
    longitude: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "name" ? value : parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!token) {
        setError('Authentication token is missing');
        setLoading(false);
        return;
      }

      await createArea({
        name: formData.name,
        latitude: formData.latitude,
        longitude: formData.longitude,
      }, token);
      
      onSuccess();
      onClose();
      setFormData({ name: "", latitude: 0, longitude: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create area');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="p-6">
        <h3 className="text-lg font-medium text-black dark:text-white mb-4">
          Add New Area
        </h3>
        {error && (
          <div className="mb-4 text-error-500 dark:text-error-400">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                Area Name
              </label>
              <Input
                type="text"
                name="name"
                defaultValue={formData.name}
                onChange={handleChange}
                placeholder="Enter area name"
              />
            </div>
            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                Latitude
              </label>
              <Input
                type="number"
                name="latitude"
                defaultValue={formData.latitude}
                onChange={handleChange}
                placeholder="Enter latitude"
                step="any"
              />
            </div>
            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                Longitude
              </label>
              <Input
                type="number"
                name="longitude"
                defaultValue={formData.longitude}
                onChange={handleChange}
                placeholder="Enter longitude"
                step="any"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Area"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}; 