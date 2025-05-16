"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Category, createCategory, updateCategory } from "@/services/category";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import TextArea from "@/components/ui/textarea/TextArea";

interface EditCategoryModalProps {
  category?: Category;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  category,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: category?.code || "",
    name: category?.name || "",
    description: category?.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("No authentication token available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (category) {
        await updateCategory(
          {
            id: category.id,
            ...formData,
          },
          token
        );
      } else {
        await createCategory(formData, token);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to save category");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-[500px] p-5">
      <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
        {category ? "Edit Category" : "Add Category"}
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Code
          </label>
          <Input
            type="text"
            value={formData.code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, code: e.target.value })}
            required
            placeholder="Enter category code"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter category name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <TextArea
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter category description"
            rows={3}
          />
        </div>
        {error && (
          <div className="text-sm text-error-500 dark:text-error-400">{error}</div>
        )}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button variant="primary" disabled={loading}>
            {loading ? "Saving..." : category ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}; 