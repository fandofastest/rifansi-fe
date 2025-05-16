"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { SPK, deleteSPK, getSPKs, removeWorkItemFromSPK } from "@/services/spk";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModalContext } from "@/context/ModalContext";
import { EditSPKModal } from "@/components/spk/EditSPKModal";
import { SPKDetailModal } from "@/components/spk/SPKDetailModal";
import { PencilIcon, TrashBinIcon, EyeIcon, ListIcon } from "@/icons";
import { AddWorkItemModal } from "@/components/spk/AddWorkItemModal";
import { WorkItem } from "@/services/workItem";
import { getWorkItems } from "@/services/workItem";
import { toast } from "react-hot-toast";
import { addWorkItemToSPK } from "@/services/spk";
import { WorkItemListModal } from "@/components/spk/WorkItemListModal";

export const SPKTable: React.FC = () => {
  const { token } = useAuth();
  const { isOpen, openModal, closeModal } = useModalContext();
  const [spks, setSPKs] = useState<SPK[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spkToDelete, setSPKToDelete] = useState<SPK | null>(null);
  const [spkToEdit, setSPKToEdit] = useState<SPK | null>(null);
  const [spkToView, setSPKToView] = useState<SPK | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showWorkItemModal, setShowWorkItemModal] = useState(false);
  const [showWorkItemListModal, setShowWorkItemListModal] = useState(false);
  const [selectedSPK, setSelectedSPK] = useState<SPK | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);

  const fetchSPKs = async () => {
    try {
      if (!token) {
        setError("No authentication token available");
        return [];
      }
      setLoading(true);
      // Get current date and first day of current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startDate = firstDayOfMonth.toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      
      const data = await getSPKs(token);
      setSPKs(data);
      setError(null);
      return data; // Return the fetched data
    } catch (err: any) {
      console.error('Error fetching SPKs:', err);
      if (err.response?.errors) {
        setError(err.response.errors[0].message || "Failed to fetch SPKs");
      } else {
        setError("Failed to fetch SPKs. Please try again later.");
      }
      return []; // Return empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkItems = async () => {
    if (!token) return;
    try {
      const data = await getWorkItems(token);
      setWorkItems(data);
    } catch (err) {
      console.error('Error fetching work items:', err);
    }
  };

  useEffect(() => {
    fetchSPKs();
    fetchWorkItems();
  }, [token]);

  const handleDelete = (spk: SPK) => {
    setSPKToDelete(spk);
    setIsDeleteModalOpen(true);
  };

  const handleEdit = (spk: SPK) => {
    setSPKToEdit(spk);
    openModal();
  };

  const handleViewWorkItems = (spk: SPK) => {
    setSelectedSPK(spk);
    setShowWorkItemListModal(true);
  };

  const handleAddWorkItem = () => {
    setShowWorkItemModal(true);
  };

  const handleWorkItemSuccess = async (workItem: {
    workItemId: string;
    quantityNr: number;
    quantityR: number;
    amount: number;
    rates: {
      nr: {
        rate: number;
        description: string;
      };
      r: {
        rate: number;
        description: string;
      };
    };
    description: string;
  }) => {
    if (!token || !selectedSPK) return;

    try {
      await addWorkItemToSPK(selectedSPK.id, {
        workItemId: workItem.workItemId,
        boqVolume: {
          nr: workItem.quantityNr,
          r: workItem.quantityR
        },
        rates: workItem.rates,
        description: workItem.description
      }, token);
      toast.success("Work item added successfully");
      const updatedSPKs = await fetchSPKs(); // Get the updated SPKs
      // Update selectedSPK with the latest data
      const updatedSPK = updatedSPKs.find(spk => spk.id === selectedSPK.id);
      if (updatedSPK) {
        setSelectedSPK(updatedSPK);
      }
      setShowWorkItemModal(false);
    } catch (error) {
      console.error("Error adding work item:", error);
      toast.error("Failed to add work item");
    }
  };

  const handleRemoveWorkItem = async (workItemId: string) => {
    if (!token || !selectedSPK) return;

    try {
      await removeWorkItemFromSPK(selectedSPK.id, workItemId, token);
      toast.success("Work item removed successfully");
      const updatedSPKs = await fetchSPKs(); // Get the updated SPKs
      // Update selectedSPK with the latest data
      const updatedSPK = updatedSPKs.find(spk => spk.id === selectedSPK.id);
      if (updatedSPK) {
        setSelectedSPK(updatedSPK);
      }
    } catch (error) {
      console.error("Error removing work item:", error);
      toast.error("Failed to remove work item");
    }
  };

  const confirmDelete = async () => {
    if (!token) {
      setError("No authentication token available");
      return;
    }
    if (spkToDelete) {
      try {
        await deleteSPK({ id: spkToDelete.id }, token);
        await fetchSPKs();
        setIsDeleteModalOpen(false);
        setSPKToDelete(null);
      } catch (err) {
        console.error("Failed to delete SPK:", err);
      }
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
                  SPK No
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  WAP No
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Title
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Project Name
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Contractor
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Area
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Budget
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {spks.map((spk) => (
                <tr key={spk.id}>
                  <td className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {spk.spkNo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {spk.wapNo}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {spk.title}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {spk.projectName}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {spk.contractor}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {spk.location?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {spk.budget ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(spk.budget) : '-'}
                  </td>
                  <td className="px-4 py-3 text-start">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSPKToView(spk)}
                      >
                        <EyeIcon className="fill-current" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(spk)}
                      >
                        <PencilIcon className="fill-current" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewWorkItems(spk)}
                      >
                        <ListIcon className="fill-current" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(spk)}
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
        setSPKToDelete(null);
      }} className="max-w-[400px] p-5">
        <div className="text-center">
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Delete SPK
          </h4>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Are you sure you want to delete SPK {spkToDelete?.spkNo}? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSPKToDelete(null);
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
      {spkToEdit && (
        <EditSPKModal
          spk={spkToEdit}
          onClose={() => {
            closeModal();
            setSPKToEdit(null);
          }}
          onSuccess={fetchSPKs}
        />
      )}

      {/* Detail Modal */}
      {spkToView && (
        <SPKDetailModal
          spk={spkToView}
          onClose={() => setSPKToView(null)}
        />
      )}

      {/* Work Items List Modal */}
      <WorkItemListModal
        isOpen={showWorkItemListModal}
        onClose={() => {
          setShowWorkItemListModal(false);
          setSelectedSPK(null);
        }}
        spk={selectedSPK}
        onAddWorkItem={handleAddWorkItem}
        onRemoveWorkItem={handleRemoveWorkItem}
      />

      {/* Add Work Item Modal */}
      <AddWorkItemModal
        isOpen={showWorkItemModal}
        onClose={() => {
          setShowWorkItemModal(false);
        }}
        onSuccess={handleWorkItemSuccess}
        workItems={workItems}
        spk={{
          spkNo: selectedSPK?.spkNo || "",
          wapNo: selectedSPK?.wapNo || "",
          title: selectedSPK?.title || "",
          projectName: selectedSPK?.projectName || ""
        }}
      />
    </div>
  );
}; 