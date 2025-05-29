"use client";
import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";
import { getUnits, deleteUnit, Unit, updateUnit } from "@/services/unit";
import Input from "@/components/ui/input/Input";
import TextArea from "@/components/ui/textarea/TextArea";
// Placeholder modals, to be implemented
// import AddUnitModal from "@/components/unit/AddUnitModal";


function EditUnitModal({ isOpen, onClose, onSuccess, unit }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; unit: Unit | null }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: unit?.code || "",
    name: unit?.name || "",
    description: unit?.description || "",
  });

  useEffect(() => {
    if (unit) {
      setFormData({
        code: unit.code || "",
        name: unit.name || "",
        description: unit.description || "",
      });
    }
  }, [unit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !unit) {
      setError("No authentication token available");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateUnit({ id: unit.id, ...formData }, token);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to update unit");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5">
      <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">Edit Unit</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Code</label>
          <Input
            type="text"
            value={formData.code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, code: e.target.value })}
            required
            placeholder="Enter unit code"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter unit name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <TextArea
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter unit description"
            rows={3}
          />
        </div>
        {error && <div className="text-sm text-error-500 dark:text-error-400">{error}</div>}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" disabled={loading}>{loading ? "Saving..." : "Update"}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function UnitTable({ refresh }: { refresh?: boolean }) {
  const { token } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const [unitToEdit, setUnitToEdit] = useState<Unit | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUnits();
    }
  }, [token, refresh]);

  const fetchUnits = async () => {
    if (!token) return;
    try {
      const data = await getUnits(token);
      setUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (unit: Unit) => {
    setUnitToDelete(unit);
  };

  const handleEdit = (unit: Unit) => {
    setUnitToEdit(unit);
    setIsEditModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!token || !unitToDelete) return;
    try {
      await deleteUnit({ id: unitToDelete.id }, token);
      setUnits(units.filter(unit => unit.id !== unitToDelete.id));
      setUnitToDelete(null);
    } catch (error) {
      console.error('Error deleting unit:', error);
    }
  };

  if (!token) {
    return <div>Please login to view units</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Code</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Description</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {units.map((unit) => (
                <tr key={unit.id}>
                  <td className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{unit.code}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{unit.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{unit.description || '-'}</td>
                  <td className="px-4 py-3 text-start">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(unit)}>
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(unit)}>
                        <TrashBinIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Edit Unit Modal */}
      <EditUnitModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={fetchUnits} unit={unitToEdit} />
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!unitToDelete}
        onClose={() => setUnitToDelete(null)}
        className="max-w-[400px] p-5"
      >
        <div className="text-center">
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Delete Unit
          </h4>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Are you sure you want to delete unit &quot;{unitToDelete?.name}&quot;? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setUnitToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="bg-error-500 hover:bg-error-600"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 