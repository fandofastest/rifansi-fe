import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { Equipment, addContractToEquipment, removeContractFromEquipment, updateEquipmentContract, getEquipmentById } from "@/services/equipment";
import { getContracts, Contract } from "@/services/contract";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { PlusIcon, PencilIcon, TrashBinIcon } from "@/icons";

interface ContractManagementModalProps {
  equipment: Equipment;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ContractManagementModal: React.FC<ContractManagementModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingContractIndex, setEditingContractIndex] = useState<number | null>(null);
  const [currentEquipment, setCurrentEquipment] = useState<Equipment>(equipment);
  
  const [newContract, setNewContract] = useState({
    contractId: "",
    equipmentId: 0,
    rentalRate: 0,
  });

  useEffect(() => {
    const fetchContractsData = async () => {
      if (!token) return;
      try {
        const contractsData = await getContracts(token);
        setContracts(contractsData);
      } catch (error) {
        console.error('Error fetching contracts:', error);
        toast.error('Failed to load contracts');
      }
    };

    if (isOpen) {
      fetchContractsData();
    }
  }, [token, isOpen]);

  // Update current equipment when prop changes
  useEffect(() => {
    setCurrentEquipment(equipment);
  }, [equipment]);

  // Function to refresh equipment data
  const refreshEquipmentData = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const updatedEquipment = await getEquipmentById(currentEquipment.id, token);
      setCurrentEquipment(updatedEquipment);
    } catch (error) {
      console.error('Error refreshing equipment data:', error);
      toast.error('Failed to refresh equipment data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewContract({
      contractId: "",
      equipmentId: 0,
      rentalRate: 0,
    });
    setIsAddMode(false);
    setIsEditMode(false);
    setEditingContractIndex(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewContract(prev => ({
      ...prev,
      [name]: name === 'rentalRate' || name === 'equipmentId' ? Number(value) : value,
    }));
  };

  const handleAddContract = async () => {
    if (!token) {
      toast.error("No authentication token available");
      return;
    }

    if (!newContract.contractId || newContract.rentalRate <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const updatedEquipment = await addContractToEquipment(
        currentEquipment.id,
        {
          contractId: newContract.contractId,
          equipmentId: newContract.equipmentId || 0,
          rentalRate: newContract.rentalRate,
        },
        token
      );
      toast.success("Contract added successfully");
      setCurrentEquipment(updatedEquipment);
      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Error adding contract:", error);
      toast.error("Failed to add contract");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContract = async () => {
    if (!token || editingContractIndex === null) {
      toast.error("No authentication token available or no contract selected");
      return;
    }

    const contractToUpdate = currentEquipment.contracts?.[editingContractIndex];
    if (!contractToUpdate) return;

    setLoading(true);
    try {
      const updatedEquipment = await updateEquipmentContract(
        currentEquipment.id,
        contractToUpdate.contractId,
        newContract.rentalRate,
        token
      );
      toast.success("Contract updated successfully");
      setCurrentEquipment(updatedEquipment);
      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Error updating contract:", error);
      toast.error("Failed to update contract");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveContract = async (contractId: string) => {
    if (!token) {
      toast.error("No authentication token available");
      return;
    }

    setLoading(true);
    try {
      const updatedEquipment = await removeContractFromEquipment(currentEquipment.id, contractId, token);
      toast.success("Contract removed successfully");
      setCurrentEquipment(updatedEquipment);
      onSuccess();
    } catch (error) {
      console.error("Error removing contract:", error);
      toast.error("Failed to remove contract");
    } finally {
      setLoading(false);
    }
  };

  const startEditingContract = (index: number) => {
    const contractToEdit = currentEquipment.contracts?.[index];
    if (!contractToEdit) return;

    setNewContract({
      contractId: contractToEdit.contractId,
      equipmentId: contractToEdit.equipmentId,
      rentalRate: contractToEdit.rentalRate,
    });
    setIsEditMode(true);
    setEditingContractIndex(index);
    setIsAddMode(false);
  };

  const getContractName = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    return contract 
      ? `${contract.contractNo} - ${contract.vendorName || 'N/A'}`
      : contractId;
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-5">
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
            Manage Contracts - {currentEquipment.equipmentCode}
          </h3>
        </div>

        {/* Contract List */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-md font-medium text-gray-800 dark:text-white/90">
              Current Contracts
            </h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={refreshEquipmentData}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddMode(true);
                  setIsEditMode(false);
                  setEditingContractIndex(null);
                }}
                startIcon={<PlusIcon className="fill-current" />}
                disabled={isAddMode || isEditMode}
              >
                Add Contract
              </Button>
            </div>
          </div>

          {currentEquipment.contracts && currentEquipment.contracts.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      Contract
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      Equipment ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      Rental Rate
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {currentEquipment.contracts.map((contract, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-800 dark:text-white/90">
                        {getContractName(contract.contractId)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 dark:text-white/90">
                        {contract.equipmentId}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800 dark:text-white/90">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(contract.rentalRate)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-brand-500"
                            onClick={() => startEditingContract(index)}
                            disabled={isAddMode || isEditMode}
                          >
                            <PencilIcon className="fill-current" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-error-500"
                            onClick={() => handleRemoveContract(contract.contractId)}
                            disabled={isAddMode || isEditMode || loading}
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
          ) : (
            <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">No contracts assigned yet.</p>
            </div>
          )}
        </div>

        {/* Add/Edit Contract Form */}
        {(isAddMode || isEditMode) && (
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <h4 className="mb-3 text-md font-medium text-gray-800 dark:text-white/90">
              {isAddMode ? "Add New Contract" : "Edit Contract"}
            </h4>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              {isAddMode && (
                <div>
                  <label className="mb-2 block text-sm text-gray-800 dark:text-white/90">
                    Contract <span className="text-error-500">*</span>
                  </label>
                  <select
                    name="contractId"
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    value={newContract.contractId}
                    onChange={handleChange}
                    disabled={loading || isEditMode}
                  >
                    <option value="">Select Contract</option>
                    {contracts.map(contract => (
                      <option key={contract.id} value={contract.id}>
                        {contract.contractNo} - {contract.vendorName || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isAddMode && (
                <div>
                  <label className="mb-2 block text-sm text-gray-800 dark:text-white/90">
                    Equipment ID
                  </label>
                  <Input
                    type="number"
                    name="equipmentId"
                    defaultValue={newContract.equipmentId.toString()}
                    onChange={handleChange}
                    placeholder="Enter equipment ID"
                    disabled={loading}
                  />
                </div>
              )}

              <div className={isAddMode ? "" : "col-span-2"}>
                <label className="mb-2 block text-sm text-gray-800 dark:text-white/90">
                  Rental Rate (IDR) <span className="text-error-500">*</span>
                </label>
                <Input
                  type="number"
                  name="rentalRate"
                  defaultValue={newContract.rentalRate.toString()}
                  onChange={handleChange}
                  placeholder="Enter rental rate"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={isAddMode ? handleAddContract : handleUpdateContract}
                disabled={loading || (!newContract.contractId && isAddMode) || newContract.rentalRate <= 0}
              >
                {loading 
                  ? "Processing..." 
                  : isAddMode 
                    ? "Add Contract" 
                    : "Update Contract"
                }
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}; 