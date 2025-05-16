"use client";
import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { PencilIcon, TrashBinIcon, PlusIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";
import { getMaterials, deleteMaterial, Material, updateMaterial } from "@/services/material";
import Input from "@/components/ui/input/Input";
import TextArea from "@/components/ui/textarea/TextArea";
import { getUnits, Unit } from "@/services/unit";
import AddMaterialModal from "@/components/material/AddMaterialModal";
import MaterialDetailModal from "@/components/material/MaterialDetailModal";

function EditMaterialModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  material 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
  material: Material | null 
}) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    unitId: "",
    unitRate: 0,
    description: "",
  });

  // Set form data when material changes
  useEffect(() => {
    if (material && material.unit) {
      // Extract unitId from unit object since direct unitId is causing issues
      setFormData({
        name: material.name || "",
        unitId: material.unit.id || "",
        unitRate: material.unitRate || 0,
        description: material.description || "",
      });
      console.log("Setting material data with unit:", material.unit.id);
    } else if (material) {
      setFormData({
        name: material.name || "",
        unitId: "", // unitId might be problematic from API
        unitRate: material.unitRate || 0,
        description: material.description || "",
      });
    }
  }, [material]);

  useEffect(() => {
    const fetchUnits = async () => {
      if (token) {
        try {
          const units = await getUnits(token);
          setUnits(units);
        } catch (error) {
          console.error('Error fetching units:', error);
        }
      }
    };
    fetchUnits();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !material) {
      setError("No authentication token available");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateMaterial(material.id, formData, token);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to update material");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5">
      <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">Edit Material</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter material name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
          <select
            value={formData.unitId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, unitId: e.target.value })}
            required
            className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500"
          >
            <option value="">Select a unit</option>
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.code})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Unit Rate</label>
          <Input
            type="number"
            value={formData.unitRate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, unitRate: parseFloat(e.target.value) })}
            required
            placeholder="Enter unit rate"
            step="0.01"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <TextArea
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter material description"
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

export default function MaterialTable({ refresh }: { refresh?: boolean }) {
  const { token } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);
  const [materialToView, setMaterialToView] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (token) {
      fetchMaterials();
    }
  }, [token, refresh]);

  const fetchMaterials = async () => {
    if (!token) return;
    try {
      const data = await getMaterials(token);
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (material: Material) => {
    setMaterialToDelete(material);
  };

  const handleEdit = (material: Material) => {
    setMaterialToEdit(material);
    setIsEditModalOpen(true);
  };

  const handleView = (materialId: string) => {
    setMaterialToView(materialId);
    setIsDetailModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!token || !materialToDelete) return;
    try {
      await deleteMaterial(materialToDelete.id, token);
      setMaterials(materials.filter(material => material.id !== materialToDelete.id));
      setMaterialToDelete(null);
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  if (!token) {
    return <div>Please login to view materials</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex justify-between items-center">
        <div>
          <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">Materials</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{materials.length} materials found</p>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Unit</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Unit Rate</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Description</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {materials.map((material) => (
                <tr key={material.id}>
                  <td className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{material.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {material.unit ? `${material.unit.name} (${material.unit.code})` : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {material.unitRate.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {material.description || '-'}
                  </td>
                  <td className="px-4 py-3 text-start">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(material)}>
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(material)}>
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
      {/* Edit Material Modal */}
      <EditMaterialModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSuccess={fetchMaterials} 
        material={materialToEdit} 
      />
      {/* Add Material Modal */}
      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchMaterials}
      />
      {/* Material Detail Modal */}
      <MaterialDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setMaterialToView(null);
        }}
        materialId={materialToView}
      />
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!materialToDelete}
        onClose={() => setMaterialToDelete(null)}
        className="max-w-[400px] p-5"
      >
        <div className="text-center">
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Delete Material
          </h4>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Are you sure you want to delete material "{materialToDelete?.name}"? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMaterialToDelete(null)}
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