"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/ui/input/Input";
import { useAuth } from "@/context/AuthContext";
import { createSalaryComponent } from "@/services/salaryComponent";
import { toast } from "react-hot-toast";

interface AddSalaryComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  personnelRoleId: string;
}

export default function AddSalaryComponentModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  personnelRoleId
}: AddSalaryComponentModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    personnelRoleId: personnelRoleId,
    gajiPokok: 0,
    tunjanganTetap: 0,
    tunjanganTidakTetap: 0,
    transport: 0,
    pulsa: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value) || 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Authentication token is missing");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createSalaryComponent(formData, token);
      toast.success("Komponen gaji berhasil dibuat");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating salary component:", err);
      setError("Gagal membuat komponen gaji");
      toast.error("Gagal membuat komponen gaji");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-5">
      <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
        Tambah Komponen Gaji
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Gaji Pokok (Rp)
            </label>
            <Input
              type="number"
              name="gajiPokok"
              value={formData.gajiPokok}
              onChange={handleChange}
              required
              placeholder="Masukkan gaji pokok"
              min="0"
              step="1000"
              className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tunjangan Tetap (Rp)
            </label>
            <Input
              type="number"
              name="tunjanganTetap"
              value={formData.tunjanganTetap}
              onChange={handleChange}
              placeholder="Masukkan tunjangan tetap"
              min="0"
              step="1000"
              className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tunjangan Tidak Tetap (Rp)
            </label>
            <Input
              type="number"
              name="tunjanganTidakTetap"
              value={formData.tunjanganTidakTetap}
              onChange={handleChange}
              placeholder="Masukkan tunjangan tidak tetap"
              min="0"
              step="1000"
              className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Transport (Rp)
            </label>
            <Input
              type="number"
              name="transport"
              value={formData.transport}
              onChange={handleChange}
              placeholder="Masukkan biaya transport"
              min="0"
              step="1000"
              className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Pulsa (Rp)
            </label>
            <Input
              type="number"
              name="pulsa"
              value={formData.pulsa}
              onChange={handleChange}
              placeholder="Masukkan biaya pulsa"
              min="0"
              step="1000"
              className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Komponen gaji lainnya seperti BPJS, Uang Cuti, THR, dan sebagainya akan dihitung secara otomatis oleh sistem.
          </p>
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button variant="primary" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Komponen Gaji"}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 