"use client";

import React, { useState } from "react";
import UnitTable from "@/components/tables/UnitTable";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import AddUnitModal from "@/components/unit/AddUnitModal";

export default function UnitsPage() {
  const [showModal, setShowModal] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);

  const handleAddUnit = () => {
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
          Units
        </h1>
        <Button variant="primary" onClick={handleAddUnit} className="flex items-center">
          <PlusIcon className="mr-2 h-4 w-4 self-center" /> Add Unit
        </Button>
      </div>
      <UnitTable refresh={refreshTable} />
      {showModal && (
        <AddUnitModal isOpen={showModal} onClose={handleCloseModal} onSuccess={handleSuccess} />
      )}
    </div>
  );
} 