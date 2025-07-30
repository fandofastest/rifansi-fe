import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import DatePicker from "@/components/form/date-picker";
import Button from "@/components/ui/button/Button";
import { createContract } from "@/services/contract";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

interface AddContractModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = {
  contractNo: string;
  description: string;
  startDate: string;
  endDate: string;
  vendorName: string;
  totalBudget: string;
};

export const AddContractModal: React.FC<AddContractModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    contractNo: "",
    description: "",
    startDate: "",
    endDate: "",
    vendorName: "",
    totalBudget: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("No authentication token available");
      return;
    }

    if (!formData.contractNo) {
      toast.error("Contract number is required");
      return;
    }

    // Format data before submission
    const submissionData = {
      ...formData,
      // If there's a date, convert it to timestamp format if needed
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      // Convert totalBudget from string to number
      totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : undefined,
    };

    setLoading(true);
    try {
      await createContract(submissionData, token);
      toast.success("Contract added successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding contract:", error);
      toast.error("Failed to add contract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-[600px] p-5">
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
            Add New Contract
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2.5 block text-gray-800 dark:text-white/90">
              Contract No <span className="text-error-500">*</span>
            </label>
            <Input
              type="text"
              name="contractNo"
              defaultValue={formData.contractNo}
              onChange={handleChange}
              placeholder="e.g. CONTRACT-2023-001"
              required
            />
          </div>

          <div>
            <label className="mb-2.5 block text-gray-800 dark:text-white/90">
              Vendor Name
            </label>
            <Input
              type="text"
              name="vendorName"
              defaultValue={formData.vendorName}
              onChange={handleChange}
              placeholder="e.g. PT Supplier Alat Berat"
            />
          </div>

          <div>
            <label className="mb-2.5 block text-gray-800 dark:text-white/90">
              Total Budget
            </label>
            <Input
              type="number"
              name="totalBudget"
              defaultValue={formData.totalBudget}
              onChange={handleChange}
              placeholder="e.g. 1000000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2.5 block text-gray-800 dark:text-white/90">
                Start Date
              </label>
              <DatePicker
                id="startDate"
                name="startDate"
                placeholder="Select start date"
                value={formData.startDate}
                onChange={(dates) => {
                  if (dates.length > 0) {
                    const formattedDate = dates[0] instanceof Date 
                      ? dates[0].toISOString().split('T')[0]
                      : String(dates[0]);
                    setFormData(prev => ({
                      ...prev,
                      startDate: formattedDate
                    }));
                  }
                }}
              />
            </div>
            <div>
              <label className="mb-2.5 block text-gray-800 dark:text-white/90">
                End Date
              </label>
              <DatePicker
                id="endDate"
                name="endDate"
                placeholder="Select end date"
                value={formData.endDate}
                onChange={(dates) => {
                  if (dates.length > 0) {
                    const formattedDate = dates[0] instanceof Date 
                      ? dates[0].toISOString().split('T')[0]
                      : String(dates[0]);
                    setFormData(prev => ({
                      ...prev,
                      endDate: formattedDate
                    }));
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="mb-2.5 block text-gray-800 dark:text-white/90">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              className="h-24 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <button
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-gray-300 disabled:text-gray-500"
              type="submit"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Contract"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}; 