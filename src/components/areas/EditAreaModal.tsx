"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateArea } from "@/services/area";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Area } from "@/services/area";

interface EditAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  area: Area | null;
}

export const EditAreaModal: React.FC<EditAreaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  area,
}) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    latitude: 0,
    longitude: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (area) {
      setFormData({
        name: area.name,
        latitude: area.location.coordinates[0],
        longitude: area.location.coordinates[1],
      });
    }
  }, [area]);

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
      if (!token || !area) {
        setError('Authentication token or area is missing');
        setLoading(false);
        return;
      }

      await updateArea({
        id: area.id,
        name: formData.name,
        latitude: formData.latitude,
        longitude: formData.longitude,
      }, token);
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update area');
    } finally {
      setLoading(false);
    }
  };

  if (!area) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="p-6">
        <h3 className="text-lg font-medium text-black dark:text-white mb-4">
          Edit Area
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
                step={0.000001}
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
                step={0.000001}
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}; 