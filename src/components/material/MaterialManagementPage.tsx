"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import MaterialTable from "@/components/tables/MaterialTable";
import AddMaterialModal from "@/components/material/AddMaterialModal";
import { PlusIcon } from "@/icons";

export default function MaterialManagementPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);

  const handleAddSuccess = () => {
    setRefreshTable(!refreshTable);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">Material Management</h4>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Material</span>
        </Button>
      </div>
      
      <MaterialTable refresh={refreshTable} />
      
      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
} 