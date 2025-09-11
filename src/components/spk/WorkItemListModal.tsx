import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { SPK, updateSPKWorkItem, UpdateSPKWorkItemInput } from "@/services/spk";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { EditWorkItemModal } from "@/components/spk/EditWorkItemModal";

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
  const [currentSpk, setCurrentSpk] = useState<SPK | null>(spk);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editTarget,
    setEditTarget] = useState<{
      workItemId: string;
      name?: string;
      unitName?: string;
      boqVolumeNR: number;
      boqVolumeR: number;
      rateNR: number;
      rateR: number;
      description: string;
    } | null>(null);

  useEffect(() => {
    setCurrentSpk(spk || null);
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

  // Handle update coming back from EditWorkItemModal
  const handleUpdatedFromModal = (payload: { workItemId: string; input: UpdateSPKWorkItemInput }) => {
    if (!currentSpk) return;
    const { workItemId, input } = payload;
    const updatedAmount = (input.boqVolume.nr * input.rates.nr.rate) + (input.boqVolume.r * input.rates.r.rate);
    // Update editable snapshot
    setEditableItems(prev => prev.map(e => e.workItemId === workItemId ? {
      ...e,
      boqVolumeNR: input.boqVolume.nr,
      boqVolumeR: input.boqVolume.r,
      rateNR: input.rates.nr.rate,
      rateR: input.rates.r.rate,
      description: input.description || e.description,
      isEditing: false
    } : e));
    // Update parent via callback
    const updatedSPK: SPK = {
      ...currentSpk,
      workItems: currentSpk.workItems.map(w => w.workItemId === workItemId ? {
        ...w,
        boqVolume: { nr: input.boqVolume.nr, r: input.boqVolume.r },
        rates: { nr: { rate: input.rates.nr.rate, description: w.rates.nr.description || "" }, r: { rate: input.rates.r.rate, description: w.rates.r.description || "" } },
        amount: updatedAmount,
        description: input.description ?? w.description,
      } : w)
    };
    setCurrentSpk(updatedSPK);
    onWorkItemUpdated?.(updatedSPK);
    setEditTarget(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[1100px] w-full p-5"
    >
      <div className="space-y-4">
        {/* Sticky Header with SPK Details */}
        <div className="border-b pb-4 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
            Work Items
          </h4>
          <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
            <p><span className="font-medium">SPK No:</span> {currentSpk?.spkNo}</p>
            <p><span className="font-medium">WAP No:</span> {currentSpk?.wapNo}</p>
            <p><span className="font-medium">Title:</span> {currentSpk?.title}</p>
            <p><span className="font-medium">Project:</span> {currentSpk?.projectName}</p>
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

        {/* Scrollable Work Items List - Table */}
        <div className="overflow-x-auto" style={{ maxHeight: 420 }}>
          {currentSpk?.workItems && currentSpk.workItems.length > 0 ? (
            <table className="w-full text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg bg-white dark:bg-gray-900">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                <tr>
                  <th className="p-2 text-left text-black dark:text-white w-12">No</th>
                  <th className="p-2 text-left text-black dark:text-white min-w-[220px]">Work Item</th>
                  <th className="p-2 text-center text-black dark:text-white" colSpan={2}>Non Remote</th>
                  <th className="p-2 text-center text-black dark:text-white" colSpan={2}>Remote</th>
                  <th className="p-2 text-right text-black dark:text-white">Amount</th>
                  <th className="p-2 text-center text-black dark:text-white w-36">Aksi</th>
                </tr>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th></th>
                  <th></th>
                  <th className="p-2 text-center text-black dark:text-white">Volume</th>
                  <th className="p-2 text-center text-black dark:text-white">Rate (Rp)</th>
                  <th className="p-2 text-center text-black dark:text-white">Volume</th>
                  <th className="p-2 text-center text-black dark:text-white">Rate (Rp)</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {currentSpk.workItems.map((item, index) => (
                  <tr key={item.workItemId}>
                    <td className="p-2 text-gray-800 dark:text-white/90">{index + 1}</td>
                    <td className="p-2 text-gray-800 dark:text-white/90">
                      <div
                        className="font-medium truncate whitespace-nowrap max-w-[380px]"
                        title={(item.workItem?.name || '').replace(/-/g, ' ').replace(/\s+/g, ' ').trim()}
                      >
                        {(item.workItem?.name || '').replace(/-/g, ' ').replace(/\s+/g, ' ').trim()}
                      </div>
                      {(() => {
                        const desc = (item.description || '').trim();
                        if (!desc || desc === '-') return null;
                        return (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate whitespace-nowrap max-w-[380px]" title={desc}>
                            {desc}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-2 text-center text-gray-800 dark:text-white/90">{item.boqVolume?.nr ?? 0}</td>
                    <td className="p-2 text-center text-gray-800 dark:text-white/90">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.rates?.nr?.rate || 0)}</td>
                    <td className="p-2 text-center text-gray-800 dark:text-white/90">{item.boqVolume?.r ?? 0}</td>
                    <td className="p-2 text-center text-gray-800 dark:text-white/90">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.rates?.r?.rate || 0)}</td>
                    <td className="p-2 text-right text-gray-800 dark:text-white/90">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.amount || 0)}</td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                          onClick={() => setEditTarget({
                            workItemId: item.workItemId,
                            name: item.workItem?.name,
                            unitName: item.workItem?.unit?.name,
                            boqVolumeNR: item.boqVolume?.nr || 0,
                            boqVolumeR: item.boqVolume?.r || 0,
                            rateNR: item.rates?.nr?.rate || 0,
                            rateR: item.rates?.r?.rate || 0,
                            description: item.description || "",
                          })}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-error-500 border-error-500 hover:bg-error-50 dark:hover:bg-error-900/20"
                          onClick={() => setDeleteTargetId(item.workItemId)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="p-2 font-semibold text-right bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200">TOTAL</td>
                  <td className="p-2 font-semibold text-right bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
                      currentSpk.workItems.reduce((sum, it) => sum + (it.amount || 0), 0)
                    )}
                  </td>
                  <td className="p-2 bg-blue-100 dark:bg-blue-900/30"></td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No work items have been added yet.</p>
              <p className="text-sm mt-2">Click &quot;Add Work Item&quot; to start adding work items to this SPK.</p>
            </div>
          )}
        </div>
      </div>
      {/* Edit Work Item Modal */}
      {spk && editTarget && (
        <EditWorkItemModal
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          spk={spk}
          workItem={editTarget}
          onUpdated={handleUpdatedFromModal}
        />
      )}

      {/* Delete Confirmation Modal for Work Item */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        className="max-w-[400px] p-5"
      >
        <div className="text-center">
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">Hapus Work Item</h4>
          <p className="mb-6 text-gray-600 dark:text-gray-300">Apakah Anda yakin ingin menghapus work item ini?</p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setDeleteTargetId(null)}>Batal</Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-error-500 hover:bg-error-600"
              onClick={() => {
                if (deleteTargetId) {
                  // Optimistic local update
                  setCurrentSpk(prev => prev ? ({
                    ...prev,
                    workItems: prev.workItems.filter(w => w.workItemId !== deleteTargetId)
                  }) : prev);
                  onRemoveWorkItem(deleteTargetId);
                }
                setDeleteTargetId(null);
              }}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
}; 