"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { SPK, deleteSPK, getSPKs, removeWorkItemFromSPK, updateSPK, updateSpkStatus } from "@/services/spk";
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
import { format, isValid, parseISO } from "date-fns";
import { id } from "date-fns/locale/id";

export const SPKTable: React.FC = () => {
  // Helper function to format dates safely
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "-";
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "-";
      return format(date, "dd MMM yyyy", { locale: id });
    } catch (error) {
      return "-";
    }
  };
  const { token } = useAuth();
  const { openModal, closeModal } = useModalContext();
  const [spks, setSPKs] = useState<SPK[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spkToDelete, setSPKToDelete] = useState<SPK | null>(null);
  const [spkToEdit, setSPKToEdit] = useState<SPK | null>(null);
  const [spkToView, setSPKToView] = useState<SPK | null>(null);
  const [spkToUpdateStatus, setSpkToUpdateStatus] = useState<SPK | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
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
      const data = await getSPKs(token);
      setSPKs(data);
      setError(null);
      return data;
    } catch (err: unknown) {
      console.error('Error fetching SPKs:', err);
      const errorResponse = err as { response?: { errors?: Array<{ message: string }> } };
      if (errorResponse.response?.errors) {
        setError(errorResponse.response.errors[0].message || "Failed to fetch SPKs");
      } else {
        setError("Failed to fetch SPKs. Please try again later.");
      }
      return [];
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
      toast.success("Work item berhasil ditambahkan");
      const updatedSPKs = await fetchSPKs();
      const updatedSPK = updatedSPKs.find(spk => spk.id === selectedSPK.id);
      if (updatedSPK) {
        setSelectedSPK(updatedSPK);
      }
      setShowWorkItemModal(false);
    } catch (error) {
      console.error("Error adding work item:", error);
      toast.error("Gagal menambahkan work item");
    }
  };

  const handleRemoveWorkItem = async (workItemId: string) => {
    if (!token || !selectedSPK) return;

    try {
      await removeWorkItemFromSPK(selectedSPK.id, workItemId, token);
      toast.success("Work item berhasil dihapus");
      const updatedSPKs = await fetchSPKs();
      const updatedSPK = updatedSPKs.find(spk => spk.id === selectedSPK.id);
      if (updatedSPK) {
        setSelectedSPK(updatedSPK);
      }
    } catch (error) {
      console.error("Error removing work item:", error);
      toast.error("Gagal menghapus work item");
    }
  };

  const confirmDelete = async () => {
    if (!token || !spkToDelete) return;

    try {
      await deleteSPK({ id: spkToDelete.id }, token);
      toast.success("SPK berhasil dihapus");
      setIsDeleteModalOpen(false);
      setSPKToDelete(null);
      fetchSPKs();
    } catch (err) {
      console.error('Error deleting SPK:', err);
      toast.error("Gagal menghapus SPK");
    }
  };

  const handleStatusChange = (spk: SPK, status: string) => {
    setSpkToUpdateStatus(spk);
    setNewStatus(status);
    setIsStatusModalOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!token || !spkToUpdateStatus || !newStatus) return;

    try {
      // Menggunakan mutation updateSpkStatus yang baru
      await updateSpkStatus(spkToUpdateStatus.id, newStatus, token);
      toast.success("Status SPK berhasil diperbarui");
      setIsStatusModalOpen(false);
      setSpkToUpdateStatus(null);
      setNewStatus("");
      fetchSPKs();
    } catch (err) {
      console.error('Error updating SPK status:', err);
      toast.error("Gagal memperbarui status SPK");
    }
  };

  // Helper function to get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-200 text-gray-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  SPK No
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Contract No
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  WAP No
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Project Name
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Budget
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {spks.map((spk) => (
                <tr key={spk.id}>
                  <td className="border-b border-[#eee] px-4 py-3 text-black dark:border-strokedark dark:text-white">
                    {spk.spkNo}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-3 text-black dark:border-strokedark dark:text-white">
                    {spk.contractNo || "-"}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-3 text-black dark:border-strokedark dark:text-white">
                    {spk.wapNo || "-"}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-3 text-black dark:border-strokedark dark:text-white">
                    {spk.projectName}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-3 text-black dark:border-strokedark dark:text-white">
                    {spk.budget
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(spk.budget)
                      : "-"}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-3 dark:border-strokedark">
                    <div className="flex items-center">
                      <span className={`mr-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(spk.status)}`}>
                        {spk.status.charAt(0).toUpperCase() + spk.status.slice(1)}
                      </span>
                      <select
                        className="cursor-pointer rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        onChange={(e) => handleStatusChange(spk, e.target.value)}
                        value={spk.status}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
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
            Hapus SPK
          </h4>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Apakah Anda yakin ingin menghapus SPK {spkToDelete?.spkNo}? Tindakan ini tidak dapat dibatalkan.
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
              Batal
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="bg-error-500 hover:bg-error-600"
              onClick={confirmDelete}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>

      {/* Status Update Confirmation Modal */}
      <Modal isOpen={isStatusModalOpen} onClose={() => {
        setIsStatusModalOpen(false);
        setSpkToUpdateStatus(null);
        setNewStatus("");
      }} className="max-w-[400px] p-5">
        <div className="text-center">
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Update Status SPK
          </h4>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Apakah Anda yakin ingin mengubah status SPK {spkToUpdateStatus?.spkNo} menjadi <span className="font-medium">{newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</span>?
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsStatusModalOpen(false);
                setSpkToUpdateStatus(null);
                setNewStatus("");
              }}
            >
              Batal
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={confirmStatusUpdate}
            >
              Ubah Status
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

export default SPKTable; 