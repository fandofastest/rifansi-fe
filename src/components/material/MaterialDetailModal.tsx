"use client";
import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/context/AuthContext";
import { getMaterialById, Material } from "@/services/material";

interface MaterialDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialId: string | null;
}

export default function MaterialDetailModal({ 
  isOpen, 
  onClose, 
  materialId 
}: MaterialDetailModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [material, setMaterial] = useState<Material | null>(null);

  useEffect(() => {
    const fetchMaterialDetails = async () => {
      if (!token || !materialId || !isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const materialData = await getMaterialById(materialId, token);
        setMaterial(materialData);
      } catch (err) {
        console.error('Error fetching material details:', err);
        setError('Failed to load material details');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialDetails();
  }, [materialId, token, isOpen]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5">
      <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">Material Details</h4>
      
      {loading && (
        <div className="py-8 text-center">
          <p>Loading material details...</p>
        </div>
      )}
      
      {error && (
        <div className="py-4 text-center">
          <p className="text-error-500 dark:text-error-400">{error}</p>
          <Button className="mt-4" variant="outline" onClick={onClose}>Close</Button>
        </div>
      )}
      
      {!loading && !error && material && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-4 dark:border-white/[0.1]">
            <div className="col-span-1 text-sm font-medium text-gray-500 dark:text-gray-400">Name</div>
            <div className="col-span-2 text-sm text-gray-800 dark:text-white/90">{material.name}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-4 dark:border-white/[0.1]">
            <div className="col-span-1 text-sm font-medium text-gray-500 dark:text-gray-400">Unit</div>
            <div className="col-span-2 text-sm text-gray-800 dark:text-white/90">
              {material.unit ? `${material.unit.name} (${material.unit.code})` : '-'}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-4 dark:border-white/[0.1]">
            <div className="col-span-1 text-sm font-medium text-gray-500 dark:text-gray-400">Unit Rate</div>
            <div className="col-span-2 text-sm text-gray-800 dark:text-white/90">{material.unitRate.toFixed(2)}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-4 dark:border-white/[0.1]">
            <div className="col-span-1 text-sm font-medium text-gray-500 dark:text-gray-400">Description</div>
            <div className="col-span-2 text-sm text-gray-800 dark:text-white/90">{material.description || '-'}</div>
          </div>

          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      )}
    </Modal>
  );
} 