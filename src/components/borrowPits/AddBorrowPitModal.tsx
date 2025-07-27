"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useAuth } from "@/context/AuthContext";
import { createBorrowPit } from "@/services/borrowPit";

interface AddBorrowPitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddBorrowPitModal: React.FC<AddBorrowPitModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    locationName: "",
    longitude: 0,
    latitude: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For longitude and latitude, convert string to number
    if (name === "longitude" || name === "latitude") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      await createBorrowPit(formData, token);
      onSuccess();
      onClose();
      setFormData({
        name: "",
        locationName: "",
        longitude: 0,
        latitude: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create borrow pit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5">
      <div>
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          Add New Borrow Pit
        </h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="mb-2 block font-medium text-sm text-gray-700 dark:text-gray-300"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80 dark:focus:border-primary-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="locationName"
              className="mb-2 block font-medium text-sm text-gray-700 dark:text-gray-300"
            >
              Location Name
            </label>
            <input
              id="locationName"
              name="locationName"
              type="text"
              value={formData.locationName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80 dark:focus:border-primary-500"
            />
          </div>
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label
                htmlFor="longitude"
                className="mb-2 block font-medium text-sm text-gray-700 dark:text-gray-300"
              >
                Longitude
              </label>
              <input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80 dark:focus:border-primary-500"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="latitude"
                className="mb-2 block font-medium text-sm text-gray-700 dark:text-gray-300"
              >
                Latitude
              </label>
              <input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80 dark:focus:border-primary-500"
              />
            </div>
          </div>
          
          {error && (
            <div className="mb-4 text-sm text-error-500">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
