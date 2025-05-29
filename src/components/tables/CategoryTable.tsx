"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { CategoryWithSubcategories, getCategoriesWithSubcategories, deleteCategory, Category } from "@/services/category";
import { deleteSubcategory, Subcategory } from "@/services/subcategory";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModalContext } from "@/context/ModalContext";
import { EditCategoryModal } from "@/components/category/EditCategoryModal";
import { EditSubcategoryModal } from "@/components/category/EditSubcategoryModal";
import { PencilIcon, TrashBinIcon, PlusIcon } from "@/icons";

type EditItem = {
  type: 'category';
  data: Category;
} | {
  type: 'subcategory';
  data: Subcategory | { parentCategoryId: string };
};

export const CategoryTable: React.FC<{ refresh?: boolean }> = ({ refresh }) => {
  const { token } = useAuth();
  const { isOpen, openModal, closeModal } = useModalContext();
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'category' | 'subcategory', id: string } | null>(null);
  const [itemToEdit, setItemToEdit] = useState<EditItem | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    try {
      if (!token) {
        setError("No authentication token available");
        return;
      }
      setLoading(true);
      const categoriesData = await getCategoriesWithSubcategories(token);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, refresh]);

  const handleDelete = (type: 'category' | 'subcategory', id: string) => {
    setItemToDelete({ type, id });
    openModal();
  };

  const handleEdit = (type: 'category' | 'subcategory', data: Category | Subcategory | { parentCategoryId: string }) => {
    if (type === 'category' && 'code' in data) {
      setItemToEdit({ type: 'category', data: data as Category });
    } else if (type === 'subcategory' && ('categoryId' in data || 'parentCategoryId' in data)) {
      setItemToEdit({ type: 'subcategory', data: data as Subcategory | { parentCategoryId: string } });
    }
    openModal();
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const confirmDelete = async () => {
    if (!token || !itemToDelete) {
      setError("No authentication token available");
      return;
    }
    try {
      if (itemToDelete.type === 'category') {
        await deleteCategory({ id: itemToDelete.id }, token);
      } else {
        await deleteSubcategory({ id: itemToDelete.id }, token);
      }
      await fetchData();
      closeModal();
      setItemToDelete(null);
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Code
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Name
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Description
                </th>
               
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {categories.map((category) => (
                <React.Fragment key={category.id}>
                  <tr>
                    <td className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {category.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {expandedCategories.has(category.id) ? '▼' : '▶'}
                        </button>
                        {category.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {category.description || '-'}
                    </td>
                   
                    <td className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit('category', category)}
                        >
                          <PencilIcon className="fill-current" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete('category', category.id)}
                        >
                          <TrashBinIcon className="fill-current" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit('subcategory', { parentCategoryId: category.id })}
                        >
                          <PlusIcon className="fill-current" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedCategories.has(category.id) && (category.subCategories ?? [])
                    .map(subcategory => (
                      <tr key={subcategory.id} className="bg-gray-50 dark:bg-white/[0.02]">
                        <td className="px-5 py-4 sm:px-6 text-start pl-12">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {subcategory.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 pl-12">
                          {subcategory.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {subcategory.description || '-'}
                        </td>
                       
                        <td className="px-4 py-3 text-start">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit('subcategory', { 
                                ...subcategory, 
                                categoryId: category.id,
                                category: {
                                  id: category.id,
                                  code: category.code,
                                  name: category.name
                                }
                              })}
                            >
                              <PencilIcon className="fill-current" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete('subcategory', subcategory.id)}
                            >
                              <TrashBinIcon className="fill-current" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen && !!itemToDelete} onClose={() => {
        closeModal();
        setItemToDelete(null);
      }} className="max-w-[400px] p-5">
        <div className="text-center">
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Delete {itemToDelete?.type === 'category' ? 'Category' : 'Subcategory'}
          </h4>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                closeModal();
                setItemToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="bg-error-500 hover:bg-error-600"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      {itemToEdit && (
        itemToEdit.type === 'category' ? (
          <EditCategoryModal
            category={itemToEdit.data}
            onClose={() => {
              closeModal();
              setItemToEdit(null);
            }}
            onSuccess={fetchData}
          />
        ) : (
          <EditSubcategoryModal
            subcategory={'id' in itemToEdit.data ? itemToEdit.data : undefined}
            parentCategoryId={'parentCategoryId' in itemToEdit.data ? itemToEdit.data.parentCategoryId : undefined}
            onClose={() => {
              closeModal();
              setItemToEdit(null);
            }}
            onSuccess={fetchData}
          />
        )
      )}
    </div>
  );
}; 