import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { Equipment } from "@/services/equipment";

interface EquipmentDetailModalProps {
  equipment: Equipment;
  onClose: () => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  equipment,
  onClose,
}) => {
  const formatDate = (timestamp: string | number) => {
    try {
      const date = new Date(Number(timestamp));
      if (isNaN(date.getTime())) {
        return "-";
      }
      return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
    } catch {
      return "-";
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-[600px] p-5">
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
            Equipment Details
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Equipment Code</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{equipment.equipmentCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Plate/Serial No</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{equipment.plateOrSerialNo}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Equipment Type</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{equipment.equipmentType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Service Status</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  equipment.serviceStatus.toUpperCase() === 'ACTIVE' 
                    ? 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400' 
                    : equipment.serviceStatus.toUpperCase() === 'MAINTENANCE'
                    ? 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400'
                    : equipment.serviceStatus.toUpperCase() === 'REPAIR'
                    ? 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {equipment.serviceStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Default Operator</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{equipment.defaultOperator || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Area</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{equipment.area?.name || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Year</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{equipment.year || "-"}</p>
            </div>
          </div>

          {equipment.description && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{equipment.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
              <p className="font-medium text-gray-800 dark:text-white/90">
                {formatDate(equipment.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Updated At</p>
              <p className="font-medium text-gray-800 dark:text-white/90">
                {formatDate(equipment.updatedAt)}
              </p>
            </div>
          </div>

          {equipment.contracts && equipment.contracts.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Contracts</p>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        Contract
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        Rental Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {equipment.contracts.map((contract, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-white/90">
                          {contract.contract?.contractNo || contract.contractId}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-white/90">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(contract.rentalRate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}; 