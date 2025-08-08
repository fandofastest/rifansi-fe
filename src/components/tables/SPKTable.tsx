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
  const [filteredSPKs, setFilteredSPKs] = useState<SPK[]>([]);
  const [contractNoFilter, setContractNoFilter] = useState<string>("");
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
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

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

  // Apply filters when SPKs or filter values change
  useEffect(() => {
    filterSPKs();
  }, [spks, contractNoFilter]);

  // Filter SPKs based on filter criteria
  const filterSPKs = () => {
    let result = [...spks];
    
    // Filter by contract number if specified
    if (contractNoFilter && contractNoFilter !== "all") {
      result = result.filter(spk => spk.contractNo === contractNoFilter);
    }
    
    setFilteredSPKs(result);
  };

  // Get unique contract numbers for the dropdown
  const getUniqueContractNumbers = () => {
    const contractNumbers = spks.map(spk => spk.contractNo || "")
      .filter(contractNo => contractNo !== "");
    return Array.from(new Set(contractNumbers)).sort();
  };

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
      {/* Filter section */}
      <div className="p-4 border-b border-gray-200 dark:border-white/[0.05]">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="contractNoFilter" className="block text-sm font-medium mb-1 text-gray-700 dark:text-white/70">Filter by Contract No</label>
            <select
              id="contractNoFilter"
              value={contractNoFilter}
              onChange={(e) => setContractNoFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-white/10 dark:bg-white/[0.05] dark:text-white"
            >
              <option value="all">Semua Kontrak</option>
              {getUniqueContractNumbers().map((contractNo) => (
                <option key={contractNo} value={contractNo}>
                  {contractNo}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  SPK No
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
              {filteredSPKs.map((spk) => (
                <React.Fragment key={spk.id}>
                  <tr 
                    className={`cursor-pointer ${expandedRows[spk.id] ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`} 
                    onClick={() => toggleRowExpansion(spk.id)}
                  >
                    <td className="border-b border-[#eee] px-4 py-3 text-black dark:border-strokedark dark:text-white font-medium">
                      <div className="flex items-center">
                        <span className="mr-2">
                          {expandedRows[spk.id] ? '▼' : '▶'}
                        </span>
                        {spk.spkNo}
                      </div>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-3 dark:border-strokedark">
                      <div className="flex items-center">
                        <span className={`mr-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(spk.status)}`}>
                          {spk.status.charAt(0).toUpperCase() + spk.status.slice(1)}
                        </span>
                        <select
                          className="cursor-pointer rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            e.stopPropagation();
                            handleStatusChange(spk, e.target.value);
                          }}
                          value={spk.status}
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
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
                  {expandedRows[spk.id] && (
                    <tr className="bg-gray-50 dark:bg-gray-800/30">
                      <td colSpan={3} className="px-4 py-3">
                        <div className="p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contract No</p>
                              <p className="text-sm text-black dark:text-white">{spk.contractNo || "-"}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">WAP No</p>
                              <p className="text-sm text-black dark:text-white">{spk.wapNo || "-"}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Name</p>
                              <p className="text-sm text-black dark:text-white">{spk.projectName}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</p>
                              <p className="text-sm text-black dark:text-white">
                                {spk.budget
                                  ? new Intl.NumberFormat("id-ID", {
                                      style: "currency",
                                      currency: "IDR",
                                    }).format(spk.budget)
                                  : "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</p>
                              <p className="text-sm text-black dark:text-white">{formatDate(spk.startDate?.toString())}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</p>
                              <p className="text-sm text-black dark:text-white">{formatDate(spk.endDate?.toString())}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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