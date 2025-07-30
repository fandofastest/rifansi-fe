"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { SPK, updateSPK } from "@/services/spk";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Area, getAreas } from "@/services/area";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, isValid, parseISO } from "date-fns";

interface EditSPKModalProps {
  spk: SPK;
  onClose: () => void;
  onSuccess: () => void;
}

interface EditSPKFormData {
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
  contractNo: string;
}

export const EditSPKModal: React.FC<EditSPKModalProps> = ({
  spk,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  
  // Initialize dates from SPK data with validation
  const parseDate = (dateStr: string | number | null | undefined): Date | null => {
    if (!dateStr) return null;
    try {
      // Handle Unix timestamp (milliseconds) directly
      if (typeof dateStr === 'number') {
        const date = new Date(dateStr);
        return isValid(date) ? date : null;
      } else if (typeof dateStr === 'string') {
        const date = parseISO(dateStr);
        return isValid(date) ? date : null;
      }
      return null;
    } catch (error) {
      console.error('Date parsing error:', error, dateStr);
      return null;
    }
  };

  // Ensure we have valid dates from SPK data
  const initialStartDate = parseDate(spk.startDate);
  const initialEndDate = parseDate(spk.endDate);
  
  const [formData, setFormData] = useState<EditSPKFormData>({
    spkNo: spk.spkNo,
    wapNo: spk.wapNo,
    title: spk.title,
    projectName: spk.projectName,
    date: format(new Date(), "yyyy-MM-dd"),
    contractor: spk.contractor || "",
    workDescription: spk.workDescription || "",
    location: typeof spk.location === 'string' ? spk.location : "",
    startDate: initialStartDate ? format(initialStartDate, "yyyy-MM-dd") : "",
    endDate: initialEndDate ? format(initialEndDate, "yyyy-MM-dd") : "",
    budget: spk.budget || 0,
    contractNo: spk.contractNo || "",
  });
  
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDatePicker, setStartDatePicker] = useState<Date | null>(initialStartDate);
  const [endDatePicker, setEndDatePicker] = useState<Date | null>(initialEndDate);

  // Debug to check values
  useEffect(() => {
    console.log('SPK dates:', { 
      rawStartDate: spk.startDate, 
      rawEndDate: spk.endDate,
      parsedStartDate: initialStartDate, 
      parsedEndDate: initialEndDate,
      startDatePicker, 
      endDatePicker 
    });
    
    // Ensure endDatePicker is set if initialEndDate exists
    if (initialEndDate && !endDatePicker) {
      setEndDatePicker(initialEndDate);
      setFormData(prev => ({
        ...prev,
        endDate: format(initialEndDate, "yyyy-MM-dd")
      }));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const areasData = await getAreas(token);
        setAreas(areasData);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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
      if (!token) {
        setError('Authentication token is missing');
        setLoading(false);
        return;
      }

      const input = {
        id: spk.id,
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
        budget: formData.budget || undefined,
        contractNo: formData.contractNo || undefined
      };

      await updateSPK(input, token);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to update SPK");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-[700px] m-4">
      <div className="p-6">
        <h3 className="text-lg font-medium text-black dark:text-white mb-4">
          Edit SPK
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
                placeholder="Enter title"
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
                placeholder="Enter project name"
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
                placeholder="Enter contractor"
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
                placeholder="Enter work description"
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
                value={formData.endDate || ''}
              />
            </div>
            <div>
              <label className="mb-2.5 block text-black dark:text-white">
                Contract No
              </label>
              <Input
                type="text"
                name="contractNo"
                defaultValue={formData.contractNo}
                onChange={handleChange}
                placeholder="Enter contract number"
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
                placeholder="Enter budget"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}; 