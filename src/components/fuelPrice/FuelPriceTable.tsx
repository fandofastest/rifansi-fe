"use client";
import React, { useEffect, useState, useCallback } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";
import {
  getFuelPrices,
  deleteFuelPrice,
  FuelPrice,
} from "@/services/fuelPrice";
import AddFuelPriceModal from "./AddFuelPriceModal";
import EditFuelPriceModal from "./EditFuelPriceModal";
import { formatDateIndonesia } from "@/utils/date";
// import EditFuelPriceModal from "./EditFuelPriceModal"; // To be created

const FuelPriceTable: React.FC<{ refresh?: boolean }> = ({ refresh }) => {
  const { token } = useAuth();
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [fuelPriceToDelete, setFuelPriceToDelete] = useState<FuelPrice | null>(null);
  const [fuelPriceToEdit, setFuelPriceToEdit] = useState<FuelPrice | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchFuelPrices = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getFuelPrices(token);
      setFuelPrices(data);
    } catch (error) {
      console.error("Error fetching fuel prices:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchFuelPrices();
    }
  }, [token, refresh, fetchFuelPrices]);

  const handleDelete = (fuelPrice: FuelPrice) => {
    setFuelPriceToDelete(fuelPrice);
  };

  const handleEdit = (fuelPrice: FuelPrice) => {
    setFuelPriceToEdit(fuelPrice);
    setIsEditModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!token || !fuelPriceToDelete) return;
    try {
      await deleteFuelPrice(fuelPriceToDelete.id, token);
      setFuelPrices(fuelPrices.filter(fp => fp.id !== fuelPriceToDelete.id));
      setFuelPriceToDelete(null);
    } catch (error) {
      console.error("Error deleting fuel price:", error);
    }
  };

  if (!token) {
    return <div>Please login to view fuel prices</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Fuel Type</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Price Per Liter</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Effective Date</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Description</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {fuelPrices.map((fp) => (
                <tr key={fp.id}>
                  <td className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{fp.fuelType}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{fp.pricePerLiter.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatDateIndonesia(fp.effectiveDate)}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{fp.description || '-'}</td>
                  <td className="px-4 py-3 text-start">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(fp)}>
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(fp)}>
                        <TrashBinIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add Fuel Price Modal */}
      <AddFuelPriceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchFuelPrices} />
      {/* Edit Fuel Price Modal */}
      <EditFuelPriceModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={fetchFuelPrices} fuelPrice={fuelPriceToEdit} />
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!fuelPriceToDelete}
        onClose={() => setFuelPriceToDelete(null)}
        className="max-w-[400px] p-5"
      >
        <div className="text-center">
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Delete Fuel Price
          </h4>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Are you sure you want to delete fuel price for &quot;{fuelPriceToDelete?.fuelType}&quot;? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFuelPriceToDelete(null)}
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
    </div>
  );
};

export default FuelPriceTable; 