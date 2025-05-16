"use client";

import React, { useState } from "react";
import FuelPriceTable from "@/components/fuelPrice/FuelPriceTable";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import AddFuelPriceModal from "@/components/fuelPrice/AddFuelPriceModal";

export default function FuelPricesPage() {
  const [showModal, setShowModal] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);

  const handleAddFuelPrice = () => {
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
          Fuel Price Management
        </h1>
        <Button variant="primary" onClick={handleAddFuelPrice} className="flex items-center">
          <PlusIcon className="mr-2 h-4 w-4 self-center" /> Add Fuel Price
        </Button>
      </div>
      <FuelPriceTable refresh={refreshTable} />
      {showModal && (
        <AddFuelPriceModal isOpen={showModal} onClose={handleCloseModal} onSuccess={handleSuccess} />
      )}
    </div>
  );
} 