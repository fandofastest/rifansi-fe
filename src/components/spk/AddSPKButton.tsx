"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useModalContext } from "@/context/ModalContext";
import { createSPK } from "@/services/spk";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Area, getAreas } from "@/services/area";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

interface SPKFormData {
  spkNo: string;
  wapNo: string;
  title: string;
  projectName: string;
  date: string;
  contractor: string;
  workDescription: string;
  location: string;
  startDate: string;
  endDate: string;
  budget: number;
}

export const AddSPKButton: React.FC = () => {
  const { token } = useAuth();
  const { isOpen, openModal, closeModal } = useModalContext();
  const [areas, setAreas] = useState<Area[]>([]);
  const [startDatePicker, setStartDatePicker] = useState<Date | null>(null);
  const [endDatePicker, setEndDatePicker] = useState<Date | null>(null);
  const [formData, setFormData] = useState<SPKFormData>({
    spkNo: "",
    wapNo: "",
    title: "",
    projectName: "",
    date: format(new Date(), "yyyy-MM-dd"), // Format current date as yyyy-MM-dd
    contractor: "",
    workDescription: "",
    location: "",
    startDate: "",
    endDate: "",
    budget: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAreas = async () => {
      if (!token) return;
      try {
        const areasData = await getAreas(token);
        setAreas(areasData);
      } catch (err) {
        console.error('Error fetching areas:', err);
      }
    };
    fetchAreas();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' 
        ? (value ? Number(value) : 0) 
        : value || ''
    }));
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDatePicker(date);
    setFormData(prev => ({
      ...prev,
      startDate: date ? format(date, "yyyy-MM-dd") : ''
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDatePicker(date);
    setFormData(prev => ({
      ...prev,
      endDate: date ? format(date, "yyyy-MM-dd") : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.spkNo || !formData.wapNo || !formData.title || !formData.projectName) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (!token) {
        setError('Authentication token is missing');
        setLoading(false);
        return;
      }

      const input = {
        spkNo: formData.spkNo,
        wapNo: formData.wapNo,
        title: formData.title,
        projectName: formData.projectName,
        date: formData.date,
        contractor: formData.contractor || undefined,
        workDescription: formData.workDescription || undefined,
        location: formData.location || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        budget: formData.budget || undefined
      };

      await createSPK(input, token);
      closeModal();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create SPK');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={openModal}
      >
        Add SPK
      </Button>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="p-6">
          <h3 className="text-lg font-medium text-black dark:text-white mb-4">
            Add New SPK
          </h3>
          {error && (
            <div className="mb-4 text-error-500 dark:text-error-400">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  SPK No <span className="text-error-500">*</span>
                </label>
                <Input
                  type="text"
                  name="spkNo"
                  defaultValue={formData.spkNo}
                  onChange={handleChange}
                  placeholder="Enter SPK No"
                  required
                />
              </div>
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  WAP No <span className="text-error-500">*</span>
                </label>
                <Input
                  type="text"
                  name="wapNo"
                  defaultValue={formData.wapNo}
                  onChange={handleChange}
                  placeholder="Enter WAP No"
                  required
                />
              </div>
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Title <span className="text-error-500">*</span>
                </label>
                <Input
                  type="text"
                  name="title"
                  defaultValue={formData.title}
                  onChange={handleChange}
                  placeholder="Enter Title"
                  required
                />
              </div>
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Project Name <span className="text-error-500">*</span>
                </label>
                <Input
                  type="text"
                  name="projectName"
                  defaultValue={formData.projectName}
                  onChange={handleChange}
                  placeholder="Enter Project Name"
                  required
                />
              </div>
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Contractor
                </label>
                <Input
                  type="text"
                  name="contractor"
                  defaultValue={formData.contractor}
                  onChange={handleChange}
                  placeholder="Enter Contractor"
                />
              </div>
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Work Description
                </label>
                <Input
                  type="text"
                  name="workDescription"
                  defaultValue={formData.workDescription}
                  onChange={handleChange}
                  placeholder="Enter Work Description"
                />
              </div>
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Location
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                >
                  <option value="">Select Area</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Start Date
                </label>
                <DatePicker
                  selected={startDatePicker}
                  onChange={handleStartDateChange}
                  dateFormat="yyyy-MM-dd"
                  className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  placeholderText="Select start date"
                />
              </div>
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  End Date
                </label>
                <DatePicker
                  selected={endDatePicker}
                  onChange={handleEndDateChange}
                  dateFormat="yyyy-MM-dd"
                  className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  placeholderText="Select end date"
                  minDate={startDatePicker || undefined}
                />
              </div>
              <div>
                <label className="mb-2.5 block text-black dark:text-white">
                  Budget
                </label>
                <Input
                  type="number"
                  name="budget"
                  defaultValue={formData.budget}
                  onChange={handleChange}
                  placeholder="Enter Budget"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={closeModal}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create SPK"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}; 