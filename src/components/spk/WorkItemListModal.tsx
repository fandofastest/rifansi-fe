import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { SPK, updateSPKWorkItem, UpdateSPKWorkItemInput } from "@/services/spk";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface WorkItemListModalProps {
  isOpen: boolean;
  onClose: () => void;
  spk: SPK | null;
  onAddWorkItem: () => void;
  onRemoveWorkItem: (workItemId: string) => void;
  onWorkItemUpdated?: (updatedSPK: SPK) => void;
}

interface EditableWorkItem {
  workItemId: string;
  boqVolumeNR: number;
  boqVolumeR: number;
  rateNR: number;
  rateR: number;
  description: string;
  isEditing: boolean;
}

export const WorkItemListModal: React.FC<WorkItemListModalProps> = ({
  isOpen,
  onClose,
  spk,
  onAddWorkItem,
  onRemoveWorkItem,
  onWorkItemUpdated,
}) => {
  const { token } = useAuth();
  const [editableItems, setEditableItems] = useState<EditableWorkItem[]>([]);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (spk?.workItems) {
      // Initialize editable items from spk work items
      const initialEditableItems = spk.workItems.map(item => ({
        workItemId: item.workItemId,
        boqVolumeNR: item.boqVolume?.nr || 0,
        boqVolumeR: item.boqVolume?.r || 0,
        rateNR: item.rates?.nr?.rate || 0,
        rateR: item.rates?.r?.rate || 0,
        description: item.description || "",
        isEditing: false
      }));
      setEditableItems(initialEditableItems);
    }
  }, [spk]);

  const handleEditToggle = (workItemId: string) => {
    setEditableItems(items => items.map(item => 
      item.workItemId === workItemId 
        ? { ...item, isEditing: !item.isEditing }
        : item
    ));
  };

  const handleInputChange = (workItemId: string, field: keyof EditableWorkItem, value: string | number) => {
    setEditableItems(items => items.map(item => 
      item.workItemId === workItemId 
        ? { ...item, [field]: typeof value === 'string' && !isNaN(Number(value)) ? Number(value) : value }
        : item
    ));
  };

  const handleApplyChanges = async (workItemId: string) => {
    if (!spk || !token) return;

    const itemToUpdate = editableItems.find(item => item.workItemId === workItemId);
    if (!itemToUpdate) return;

    setIsLoading(prev => ({ ...prev, [workItemId]: true }));

    try {
      const input: UpdateSPKWorkItemInput = {
        boqVolume: {
          nr: itemToUpdate.boqVolumeNR,
          r: itemToUpdate.boqVolumeR
        },
        rates: {
          nr: {
            rate: itemToUpdate.rateNR,
            description: ""
          },
          r: {
            rate: itemToUpdate.rateR,
            description: ""
          }
        },
        description: itemToUpdate.description
      };

      // Kirim update ke server
      await updateSPKWorkItem(spk.id, workItemId, input, token);
      toast.success("Work item updated successfully");
      
      // Dapatkan nilai terbaru untuk workItem
      const updatedBoqVolumeNR = itemToUpdate.boqVolumeNR;
      const updatedBoqVolumeR = itemToUpdate.boqVolumeR;
      const updatedRateNR = itemToUpdate.rateNR;
      const updatedRateR = itemToUpdate.rateR;
      
      // Hitung jumlah terbaru
      const updatedAmount = 
        (updatedBoqVolumeNR * updatedRateNR) + 
        (updatedBoqVolumeR * updatedRateR);
      
      // Perbarui array workItems di SPK untuk update UI
      if (spk) {
        // Update editable items state
        setEditableItems(prevItems => 
          prevItems.map(item => 
            item.workItemId === workItemId 
              ? {
                  ...item,
                  boqVolumeNR: updatedBoqVolumeNR,
                  boqVolumeR: updatedBoqVolumeR,
                  rateNR: updatedRateNR,
                  rateR: updatedRateR,
                  isEditing: false
                }
              : item
          )
        );
        
        // Update local spk state jika ada
        const updatedWorkItems = spk.workItems.map(item => {
          if (item.workItemId === workItemId) {
            return {
              ...item,
              boqVolume: {
                nr: updatedBoqVolumeNR,
                r: updatedBoqVolumeR
              },
              rates: {
                nr: {
                  rate: updatedRateNR,
                  description: item.rates.nr.description || "Non-Remote Rate"
                },
                r: {
                  rate: updatedRateR,
                  description: item.rates.r.description || "Remote Rate"
                }
              },
              amount: updatedAmount
            };
          }
          return item;
        });
        
        const updatedSPK: SPK = {
          ...spk,
          workItems: updatedWorkItems
        };
        
        // Call the callback untuk update parent component
        if (onWorkItemUpdated) {
          onWorkItemUpdated(updatedSPK);
        }
      }
    } catch (error) {
      console.error('Error updating work item:', error);
      toast.error("Failed to update work item");
    } finally {
      setIsLoading(prev => ({ ...prev, [workItemId]: false }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[800px] p-5"
    >
      <div className="space-y-4">
        {/* Sticky Header with SPK Details */}
        <div className="border-b pb-4 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
            Work Items
          </h4>
          <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <p><span className="font-medium">SPK No:</span> {spk?.spkNo}</p>
            <p><span className="font-medium">WAP No:</span> {spk?.wapNo}</p>
            <p><span className="font-medium">Title:</span> {spk?.title}</p>
            <p><span className="font-medium">Project:</span> {spk?.projectName}</p>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="primary"
              onClick={onAddWorkItem}
            >
              Add Work Item
            </Button>
          </div>
        </div>

        {/* Scrollable Work Items List */}
        <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 400 }}>
          {spk?.workItems && spk.workItems.length > 0 ? (
            spk.workItems.map((item, index) => {
              const editableItem = editableItems.find(ei => ei.workItemId === item.workItemId);
              const isEditing = editableItem?.isEditing || false;
              const isUpdating = isLoading[item.workItemId] || false;
              
              return (
                <div key={index} className="p-4 border rounded-lg border-gray-200 dark:border-white/[0.1] bg-white dark:bg-gray-900">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-800 dark:text-white/90">{item.workItem?.name}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                    </div>
                    <div className="text-right text-gray-800 dark:text-white/90 flex-1">
                      {!isEditing ? (
                        <>
                          <p>Volume: Non-Remote: {item.boqVolume?.nr ?? 0} {item.workItem?.unit?.name}, Remote: {item.boqVolume?.r ?? 0} {item.workItem?.unit?.name}</p>
                          <p>Non-Remote Rate: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.rates?.nr?.rate || 0)}</p>
                          <p>Remote Rate: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.rates?.r?.rate || 0)}</p>
                          <p>Amount: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.amount || 0)}</p>
                        </>
                      ) : (
                        <>
                          <div className="mb-2">
                            <label className="block text-sm font-medium mb-1 text-left">Non-Remote Volume:</label>
                            <input 
                              type="number"
                              value={editableItem?.boqVolumeNR || 0}
                              onChange={(e) => handleInputChange(item.workItemId, 'boqVolumeNR', e.target.value)}
                              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                            />
                            <span className="text-xs">{item.workItem?.unit?.name}</span>
                          </div>
                          <div className="mb-2">
                            <label className="block text-sm font-medium mb-1 text-left">Remote Volume:</label>
                            <input 
                              type="number"
                              value={editableItem?.boqVolumeR || 0}
                              onChange={(e) => handleInputChange(item.workItemId, 'boqVolumeR', e.target.value)}
                              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                            />
                            <span className="text-xs">{item.workItem?.unit?.name}</span>
                          </div>
                          <div className="mb-2">
                            <label className="block text-sm font-medium mb-1 text-left">Non-Remote Rate (IDR):</label>
                            <input 
                              type="number"
                              value={editableItem?.rateNR || 0}
                              onChange={(e) => handleInputChange(item.workItemId, 'rateNR', e.target.value)}
                              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                            />
                          </div>
                          <div className="mb-2">
                            <label className="block text-sm font-medium mb-1 text-left">Remote Rate (IDR):</label>
                            <input 
                              type="number"
                              value={editableItem?.rateR || 0}
                              onChange={(e) => handleInputChange(item.workItemId, 'rateR', e.target.value)}
                              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                            />
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-end space-x-2 mt-2">
                        {isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                              onClick={() => handleEditToggle(item.workItemId)}
                              disabled={isUpdating}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApplyChanges(item.workItemId)}
                              disabled={isUpdating}
                            >
                              {isUpdating ? 'Updating...' : 'Apply Update'}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                              onClick={() => handleEditToggle(item.workItemId)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-error-500 border-error-500 hover:bg-error-50 dark:hover:bg-error-900/20"
                              onClick={() => onRemoveWorkItem(item.workItemId)}
                            >
                              Remove
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No work items have been added yet.</p>
              <p className="text-sm mt-2">Click &quot;Add Work Item&quot; to start adding work items to this SPK.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}; 