import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { SPK } from "@/services/spk";

interface WorkItemListModalProps {
  isOpen: boolean;
  onClose: () => void;
  spk: SPK | null;
  onAddWorkItem: () => void;
  onRemoveWorkItem: (workItemId: string) => void;
}

export const WorkItemListModal: React.FC<WorkItemListModalProps> = ({
  isOpen,
  onClose,
  spk,
  onAddWorkItem,
  onRemoveWorkItem,
}) => {
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
            spk.workItems.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg border-gray-200 dark:border-white/[0.1] bg-white dark:bg-gray-900">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-white/90">{item.workItem?.name}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                  </div>
                  <div className="text-right text-gray-800 dark:text-white/90">
                    <p>Volume: Non-Remote: {item.boqVolume?.nr ?? 0} {item.workItem.unit.name}, Remote: {item.boqVolume?.r ?? 0} {item.workItem.unit.name}</p>
                    <p>Non-Remote Rate: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.rates.nr.rate)}</p>
                    <p>Remote Rate: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.rates.r.rate)}</p>
                    <p>Amount: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.amount)}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-error-500 border-error-500 hover:bg-error-50 dark:hover:bg-error-900/20"
                      onClick={() => onRemoveWorkItem(item.workItemId)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))
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