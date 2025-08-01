import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { createEquipment, EquipmentServiceStatus, Area } from "@/services/equipment";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

interface AddEquipmentModalProps {
  areas: Area[];
  onClose: () => void;
  onSuccess: () => void;
}

type FormData = {
  equipmentCode: string;
  plateOrSerialNo: string;
  equipmentType: string;
  defaultOperator: string;
  area: string;
  year: string;
  serviceStatus: EquipmentServiceStatus;
  description: string;
};

export const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({
  areas,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    equipmentCode: "",
    plateOrSerialNo: "",
    equipmentType: "",
    defaultOperator: "",
    area: "",
    year: new Date().getFullYear().toString(),
    serviceStatus: "ACTIVE",
    description: "",
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

    if (!formData.area) {
      toast.error("Area is required");
      return;
    }

    setLoading(true);
    try {
      await createEquipment(
        {
          ...formData,
          year: formData.year ? parseInt(formData.year, 10) : undefined,
          area: formData.area // make sure area is always included
        },
        token
      );
      toast.success("Equipment added successfully");
      onSuccess();
    } catch (error) {
      console.error("Error adding equipment:", error);
      toast.error("Failed to add equipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-[600px] p-5">
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
            Add New Equipment
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2.5 block text-gray-800 dark:text-white/90">
                Equipment Code <span className="text-error-500">*</span>
              </label>
              <Input
                type="text"
                name="equipmentCode"
                defaultValue={formData.equipmentCode}
                onChange={handleChange}
                placeholder="e.g. EQ-001"
                required
              />
            </div>
            <div>
              <label className="mb-2.5 block text-gray-800 dark:text-white/90">
                Plate/Serial No <span className="text-error-500">*</span>
              </label>
              <Input
                type="text"
                name="plateOrSerialNo"
                defaultValue={formData.plateOrSerialNo}
                onChange={handleChange}
                placeholder="e.g. B1234XYZ"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2.5 block text-gray-800 dark:text-white/90">
              Equipment Type <span className="text-error-500">*</span>
            </label>
            <select
              name="equipmentType"
              value={formData.equipmentType}
              onChange={handleChange}
              className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              required
            >
              <option value="">Select Type</option>
              <option value="EXCAVATOR">Excavator</option>
              <option value="BULLDOZER">Bulldozer</option>
              <option value="CRANE">Crane</option>
              <option value="TRUCK">Truck</option>
              <option value="LOADER">Loader</option>
              <option value="MOTOR_GRADER">Motor Grader</option>
              <option value="PRIME_MOVER">Prime Mover</option>
              <option value="PAD_FOOT_COMPACTOR">Pad Foot Compactor</option>
              <option value="SMOOTH_DRUM_COMPACTOR">Smooth Drum Compactor</option>
              <option value="HI_BOY_LOW_BOY">Hi Boy / Low Boy</option>
              <option value="FOCO_TRUCK_8_TON">Foco Truck 8 Ton</option>
              <option value="WATER_TRUCK">Water Truck</option>
              <option value="FUEL_TRUCK">Fuel Truck</option>
              <option value="MICRO_BUS_16">Micro Bus 16 seat (Elf)</option>
              <option value="WELDING_MACHINE">Welding Machine</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2.5 block text-gray-800 dark:text-white/90">
                Area <span className="text-error-500">*</span>
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                required
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
              <label className="mb-2.5 block text-gray-800 dark:text-white/90">
                Year
              </label>
              <Input
                type="number"
                name="year"
                defaultValue={formData.year}
                onChange={handleChange}
                placeholder="e.g. 2023"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2.5 block text-gray-800 dark:text-white/90">
                Default Operator
              </label>
              <Input
                type="text"
                name="defaultOperator"
                defaultValue={formData.defaultOperator}
                onChange={handleChange}
                placeholder="Operator Name"
              />
            </div>
          </div>

          <div>
            <label className="mb-2.5 block text-gray-800 dark:text-white/90">
              Service Status <span className="text-error-500">*</span>
            </label>
            <select
              name="serviceStatus"
              value={formData.serviceStatus}
              onChange={handleChange}
              className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              required
            >
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="REPAIR">Repair</option>
              <option value="INACTIVE">Inactive</option>
            </select>
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
              {loading ? "Adding..." : "Add Equipment"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}; 