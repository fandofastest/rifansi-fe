"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Equipment, deleteEquipment, getEquipments } from "@/services/equipment";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModalContext } from "@/context/ModalContext";
import { EditEquipmentModal } from "@/components/equipment/EditEquipmentModal";
import { EquipmentDetailModal } from "@/components/equipment/EquipmentDetailModal";
import { PencilIcon, TrashBinIcon, EyeIcon, DocumentTextIcon } from "@/icons";
import { toast } from "react-hot-toast";
import { ContractManagementModal } from "@/components/equipment/ContractManagementModal";

export const EquipmentTable: React.FC = () => {
  const { token } = useAuth();
  const { isOpen, openModal, closeModal } = useModalContext();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);
  const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);
  const [equipmentToView, setEquipmentToView] = useState<Equipment | null>(null);
  const [equipmentForContracts, setEquipmentForContracts] = useState<Equipment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const fetchEquipments = async () => {
    try {
      if (!token) {
        setError("No authentication token available");
        return [];
      }
      setLoading(true);
      const data = await getEquipments(token);
      setEquipments(data);
      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error fetching equipments:', err);
      if (err.response?.errors) {
        setError(err.response.errors[0].message || "Failed to fetch equipments");
      } else {
        setError("Failed to fetch equipments. Please try again later.");
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, [token]);

  const handleDelete = (equipment: Equipment) => {
    setEquipmentToDelete(equipment);
    setIsDeleteModalOpen(true);
  };

  const handleEdit = (equipment: Equipment) => {
    setEquipmentToEdit(equipment);
    openModal();
  };

  const handleManageContracts = (equipment: Equipment) => {
    setEquipmentForContracts(equipment);
    setIsContractModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!token) {
      setError("No authentication token available");
      return;
    }
    if (equipmentToDelete) {
      try {
        await deleteEquipment(equipmentToDelete.id, token);
        await fetchEquipments();
        toast.success("Equipment deleted successfully");
        setIsDeleteModalOpen(false);
        setEquipmentToDelete(null);
      } catch (err) {
        console.error("Failed to delete equipment:", err);
        toast.error("Failed to delete equipment");
      }
    }
  };

  const handleContractSuccess = async () => {
    // Reload the equipment data after contract changes
    await fetchEquipments();
    toast.success("Contracts updated successfully");
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-error-500">Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Equipment Code
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Plate/Serial No
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Type
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Status
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {equipments.map((equipment) => (
                <tr key={equipment.id}>
                  <td className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {equipment.equipmentCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {equipment.plateOrSerialNo}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {equipment.equipmentType}
                  </td>
                  <td className="px-4 py-3 text-start">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      equipment.serviceStatus === 'OPERATIONAL' 
                        ? 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400' 
                        : equipment.serviceStatus === 'MAINTENANCE'
                        ? 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400'
                        : 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400'
                    }`}>
                      {equipment.serviceStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-start">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEquipmentToView(equipment)}
                      >
                        <EyeIcon className="fill-current" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(equipment)}
                      >
                        <PencilIcon className="fill-current" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManageContracts(equipment)}
                      >
                        <DocumentTextIcon className="fill-current" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(equipment)}
                      >
                        <TrashBinIcon className="fill-current" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => {
        setIsDeleteModalOpen(false);
        setEquipmentToDelete(null);
      }} className="max-w-[400px] p-5">
        <div className="text-center">
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Delete Equipment
          </h4>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Are you sure you want to delete equipment {equipmentToDelete?.equipmentCode}? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setEquipmentToDelete(null);
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
      {equipmentToEdit && (
        <EditEquipmentModal
          equipment={equipmentToEdit}
          onClose={() => {
            closeModal();
            setEquipmentToEdit(null);
          }}
          onSuccess={fetchEquipments}
        />
      )}

      {/* Detail Modal */}
      {equipmentToView && (
        <EquipmentDetailModal
          equipment={equipmentToView}
          onClose={() => setEquipmentToView(null)}
        />
      )}

      {/* Contract Management Modal */}
      {equipmentForContracts && (
        <ContractManagementModal
          equipment={equipmentForContracts}
          isOpen={isContractModalOpen}
          onClose={() => {
            setIsContractModalOpen(false);
            setEquipmentForContracts(null);
          }}
          onSuccess={handleContractSuccess}
        />
      )}
    </div>
  );
}; 