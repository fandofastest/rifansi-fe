"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Subcategory, createSubcategory, updateSubcategory } from "@/services/subcategory";
import { Category, getCategories } from "@/services/category";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/ui/input/Input";
import TextArea from "@/components/ui/textarea/TextArea";
import Select from "@/components/ui/select/Select";

interface EditSubcategoryModalProps {
  subcategory?: Subcategory;
  parentCategoryId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditSubcategoryModal: React.FC<EditSubcategoryModalProps> = ({
  subcategory,
  parentCategoryId,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: subcategory?.name || "",
    description: subcategory?.description || "",
    categoryId: subcategory?.category?.id || (subcategory as { categoryId?: string })?.categoryId || parentCategoryId || "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;
      try {
        const data = await getCategories(token);
        setCategories(data);
        if (subcategory && subcategory.category?.id) {
          setFormData((prev) => ({ ...prev, categoryId: subcategory.category.id }));
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("No authentication token available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (subcategory) {
        await updateSubcategory(
          {
            id: subcategory.id,
            ...formData,
          },
          token
        );
      } else {
        await createSubcategory(formData, token);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to save subcategory");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-[500px] p-5">
      <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
        {subcategory ? "Edit Subcategory" : "Add Subcategory"}
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <Select
            value={formData.categoryId || parentCategoryId || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, categoryId: e.target.value })}
            required
            disabled={!!subcategory}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
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
            placeholder="Enter subcategory name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <TextArea
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter subcategory description"
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
            {loading ? "Saving..." : subcategory ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}; 