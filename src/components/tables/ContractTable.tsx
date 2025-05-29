"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Contract, getContracts, deleteContract } from "@/services/contract";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModalContext } from "@/context/ModalContext";
import { EditContractModal } from "@/components/contract/EditContractModal";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { formatDateIndonesia } from "@/utils/date";

export const ContractTable: React.FC<{ refresh?: boolean }> = ({ refresh }) => {
  const { token } = useAuth();
  const { openModal, closeModal } = useModalContext();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);

  const fetchContracts = async () => {
    try {
      if (!token) {
        setError("No authentication token available");
        return;
      }
      setLoading(true);
      const contractsData = await getContracts(token);
      setContracts(contractsData);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, refresh]);

  const handleDelete = (contract: Contract) => {
    setContractToDelete(contract);
    openModal();
  };

  const handleEdit = (contract: Contract) => {
    setContractToEdit(contract);
    openModal();
  };

  const confirmDelete = async () => {
    if (!token || !contractToDelete) {
      setError("No authentication token available");
      return;
    }
      try {
        await deleteContract(contractToDelete.id, token);
        await fetchContracts();
      closeModal();
        setContractToDelete(null);
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
                    Contract No
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Vendor
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Start Date
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    End Date
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {contracts.map((contract) => (
                  <tr key={contract.id}>
                    <td className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {contract.contractNo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {contract.vendorName || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {contract.startDate ? formatDateIndonesia(contract.startDate) : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {contract.endDate ? formatDateIndonesia(contract.endDate) : '-'}
                    </td>
                    <td className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(contract)}
                        >
                          <PencilIcon className="fill-current" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(contract)}
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
      <Modal isOpen={!!contractToDelete} onClose={() => {
        closeModal();
        setContractToDelete(null);
      }} className="max-w-[400px] p-5">
        <div className="text-center">
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Delete Contract
          </h4>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this contract? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                closeModal();
                setContractToDelete(null);
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
      {contractToEdit && (
        <EditContractModal
          contract={contractToEdit}
          onClose={() => {
            closeModal();
            setContractToEdit(null);
          }}
          onSuccess={fetchContracts}
        />
      )}
    </div>
  );
}; 