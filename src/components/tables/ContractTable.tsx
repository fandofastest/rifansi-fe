"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Contract, getContracts, deleteContract } from "@/services/contract";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModalContext } from "@/context/ModalContext";
import { PencilIcon, TrashBinIcon, EyeIcon, DocumentTextIcon } from "@/icons";
import { toast } from "react-hot-toast";
import { AddContractModal } from "@/components/contract/AddContractModal";
import { EditContractModal } from "@/components/contract/EditContractModal";
import { ContractDetailModal } from "@/components/contract/ContractDetailModal";

export const ContractTable: React.FC = () => {
  const { token } = useAuth();
  const { isOpen, openModal, closeModal } = useModalContext();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);
  const [contractToView, setContractToView] = useState<Contract | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchContracts = async () => {
    try {
      if (!token) {
        setError("No authentication token available");
        return [];
      }
      setLoading(true);
      const data = await getContracts(token);
      setContracts(data);
      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error fetching contracts:', err);
      if (err.response?.errors) {
        setError(err.response.errors[0].message || "Failed to fetch contracts");
      } else {
        setError("Failed to fetch contracts. Please try again later.");
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [token]);

  const handleDelete = (contract: Contract) => {
    setContractToDelete(contract);
    setIsDeleteModalOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setContractToEdit(contract);
    openModal();
  };

  const confirmDelete = async () => {
    if (!token) {
      setError("No authentication token available");
      return;
    }
    if (contractToDelete) {
      try {
        await deleteContract(contractToDelete.id, token);
        await fetchContracts();
        toast.success("Contract deleted successfully");
        setIsDeleteModalOpen(false);
        setContractToDelete(null);
      } catch (err) {
        console.error("Failed to delete contract:", err);
        toast.error("Failed to delete contract");
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      // Check if the string is a timestamp (all digits)
      if (/^\d+$/.test(dateString)) {
        return new Date(parseInt(dateString)).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
      }
      // Otherwise, treat as ISO date
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return dateString;
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-error-500">Error: {error}</div>;

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Contracts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage all contracts in the system
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add New Contract
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Contract No
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Vendor Name
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
                      {contract.vendorName || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatDate(contract.startDate)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatDate(contract.endDate)}
                    </td>
                    <td className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setContractToView(contract)}
                        >
                          <EyeIcon className="fill-current" />
                        </Button>
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
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => {
        setIsDeleteModalOpen(false);
        setContractToDelete(null);
      }} className="max-w-[400px] p-5">
        <div className="text-center">
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Delete Contract
          </h4>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Are you sure you want to delete contract {contractToDelete?.contractNo}? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <AddContractModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchContracts}
        />
      )}

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

      {/* Detail Modal */}
      {contractToView && (
        <ContractDetailModal
          contract={contractToView}
          onClose={() => setContractToView(null)}
        />
      )}
    </div>
  );
}; 