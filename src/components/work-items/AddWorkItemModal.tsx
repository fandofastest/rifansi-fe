"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { createWorkItem } from "@/services/workItem";
import { useAuth } from "@/context/AuthContext";
import { getCategories } from "@/services/category";
import { getSubcategories } from "@/services/subcategory";
import { getUnits } from "@/services/unit";
import type { Category } from "@/services/category";
import type { Subcategory } from "@/services/subcategory";
import type { Unit } from "@/services/unit";
import { toast } from "react-hot-toast";

interface AddWorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddWorkItemModal({ isOpen, onClose, onSuccess }: AddWorkItemModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    subCategoryId: "",
    unitId: "",
    description: "",
    rates: {
      nr: {
        rate: 0,
        description: "Non-Remote Rate"
      },
      r: {
        rate: 0,
        description: "Remote Rate"
      }
    }
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [allSubCategories, setAllSubCategories] = useState<Subcategory[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<Subcategory[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (isOpen && token) {
      fetchData();
    }
  }, [isOpen, token]);

  useEffect(() => {
    // Reset subCategoryId when category changes
    if (formData.categoryId) {
      const filtered = allSubCategories.filter(
        (sub) => sub.categoryId === formData.categoryId
      );
      setFilteredSubCategories(filtered);
      setFormData(prev => ({ ...prev, subCategoryId: "" }));
    } else {
      setFilteredSubCategories([]);
    }
  }, [formData.categoryId, allSubCategories]);

  const fetchData = async () => {
    if (!token) return;
    try {
      const [categoriesData, subCategoriesData, unitsData] = await Promise.all([
        getCategories(token),
        getSubcategories(token),
        getUnits(token),
      ]);
      setCategories(categoriesData);
      setAllSubCategories(subCategoriesData);
      setUnits(unitsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('rates.')) {
      const [_, type, field] = name.split('.'); // _ untuk mengabaikan 'rates'
      setFormData(prev => ({
        ...prev,
        rates: {
          ...prev.rates,
          [type]: {
            ...prev.rates[type as 'nr' | 'r'],
            [field]: field === 'rate' ? (value === '' ? 0 : Number(value)) : value
          }
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      await createWorkItem({
        ...formData,
        rates: {
          nr: {
            rate: formData.rates.nr.rate || 0,
            description: formData.rates.nr.description || ""
          },
          r: {
            rate: formData.rates.r.rate || 0,
            description: formData.rates.r.description || ""
          }
        }
      }, token);
      toast.success("Work item created successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating work item:", error);
      toast.error("Failed to create work item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] p-5">
      <div>
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          Add Work Item
        </h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2.5 block text-black dark:text-white">
              Name
            </label>
            <Input
              type="text"
              name="name"
              defaultValue={formData.name}
              onChange={handleChange}
              placeholder="Enter work item name"
              required
            />
          </div>
          <div>
            <label className="mb-2.5 block text-black dark:text-white">
              Category
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2.5 block text-black dark:text-white">
              Sub Category
            </label>
            <select
              name="subCategoryId"
              value={formData.subCategoryId}
              onChange={handleChange}
              className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              required
              disabled={!formData.categoryId}
            >
              <option value="">Select Sub Category</option>
              {filteredSubCategories.map((subCategory) => (
                <option key={subCategory.id} value={subCategory.id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2.5 block text-black dark:text-white">
              Unit
            </label>
            <select
              name="unitId"
              value={formData.unitId}
              onChange={handleChange}
              className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              required
            >
              <option value="">Select Unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                Non-Remote Rate <span className="text-error-500">*</span>
              </label>
              <Input
                type="number"
                name="rates.nr.rate"
                value={formData.rates.nr.rate}
                onChange={handleChange}
                placeholder="Enter Non-Remote Rate"
                required
              />
            </div>

            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                Remote Rate <span className="text-error-500">*</span>
              </label>
              <Input
                type="number"
                name="rates.r.rate"
                value={formData.rates.r.rate}
                onChange={handleChange}
                placeholder="Enter Remote Rate"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2.5 block text-black dark:text-white">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              className="h-24 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              required
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
} 