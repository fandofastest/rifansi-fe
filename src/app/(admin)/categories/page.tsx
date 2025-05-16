"use client";

import React, { useState } from "react";
import { CategoryTable } from "@/components/tables/CategoryTable";
import { EditCategoryModal } from "@/components/category/EditCategoryModal";
import { useModalContext } from "@/context/ModalContext";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";

export default function CategoriesPage() {
  const { openModal } = useModalContext();
  const [showModal, setShowModal] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);

  const handleAddCategory = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setRefreshTable((prev) => !prev);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Categories
        </h1>
        <Button
          variant="primary"
          onClick={handleAddCategory}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      <CategoryTable refresh={refreshTable} />
      {showModal && (
        <EditCategoryModal 
          onClose={handleCloseModal} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
} 