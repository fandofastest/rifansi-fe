import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { Contract } from "@/services/contract";
import { Equipment, getEquipmentsByContract } from "@/services/equipment";
import { useAuth } from "@/context/AuthContext";

interface ContractDetailModalProps {
  contract: Contract;
  onClose: () => void;
}

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({
  contract,
  onClose,
}) => {
  const { token } = useAuth();
  const [relatedEquipment, setRelatedEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRelatedEquipment = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const equipment = await getEquipmentsByContract(contract.id, token);
        setRelatedEquipment(equipment);
      } catch (error) {
        console.error("Error fetching related equipment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedEquipment();
  }, [contract.id, token]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      // Check if the string is a timestamp (all digits)
      if (/^\d+$/.test(dateString)) {
        return new Date(parseInt(dateString)).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
      // Otherwise, treat as ISO date
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return dateString;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error, timestamp);
      return String(timestamp);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-[600px] p-5">
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
            Contract Details
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Contract No</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{contract.contractNo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Vendor Name</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{contract.vendorName || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{formatDate(contract.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{formatDate(contract.endDate)}</p>
            </div>
          </div>

          {contract.description && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{contract.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{formatTimestamp(contract.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Updated At</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{formatTimestamp(contract.updatedAt)}</p>
            </div>
          </div>

          {/* Related Equipment Section */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Related Equipment</p>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : relatedEquipment.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        Equipment Code
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        Rental Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {relatedEquipment.map((equip) => (
                      <tr key={equip.id}>
                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-white/90">
                          {equip.equipmentCode}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-white/90">
                          {equip.equipmentType}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-white/90">
                          {equip.contracts && equip.contracts[0] && 
                            new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })
                              .format(equip.contracts[0].rentalRate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No equipment associated with this contract.</p>
              </div>
            )}
          </div>
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