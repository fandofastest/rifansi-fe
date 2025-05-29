"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/ui/input/Input";
import { useAuth } from "@/context/AuthContext";
import { 
  getSalaryComponent, 
  updateSalaryComponent,
  getSalaryComponentDetails 
} from "@/services/salaryComponent";
import { toast } from "react-hot-toast";
import { SalaryComponentDetails } from "@/services/salaryComponent";

interface EditSalaryComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  salaryComponentId: string;
}

export default function EditSalaryComponentModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  salaryComponentId
}: EditSalaryComponentModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: salaryComponentId,
    gajiPokok: 0,
    tunjanganTetap: 0,
    tunjanganTidakTetap: 0,
    transport: 0,
    pulsa: 0
  });
  const [calculatedDetails, setCalculatedDetails] = useState<SalaryComponentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && salaryComponentId && token) {
      fetchSalaryComponent();
    }
  }, [isOpen, salaryComponentId, token]);

  const fetchSalaryComponent = async () => {
    setIsLoading(true);
    try {
      if (!token) {
        throw new Error("Token is missing");
      }
      const salaryComponent = await getSalaryComponent(salaryComponentId, token);
      setFormData({
        id: salaryComponentId,
        gajiPokok: salaryComponent.gajiPokok,
        tunjanganTetap: salaryComponent.tunjanganTetap,
        tunjanganTidakTetap: salaryComponent.tunjanganTidakTetap,
        transport: salaryComponent.transport,
        pulsa: salaryComponent.pulsa
      });

      // Fetch the calculated details
      const details = await getSalaryComponentDetails(salaryComponent.personnelRole.id, null, token);
      if (details) {
        setCalculatedDetails(details);
      }
    } catch (err) {
      console.error("Error fetching salary component:", err);
      setError("Gagal mengambil data komponen gaji");
      toast.error("Gagal mengambil data komponen gaji");
    } finally {
      setIsLoading(false);
    }
  };

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
      await updateSalaryComponent(formData, token);
      toast.success("Komponen gaji berhasil diperbarui");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error updating salary component:", err);
      setError("Gagal memperbarui komponen gaji");
      toast.error("Gagal memperbarui komponen gaji");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-5">
        <div className="flex justify-center items-center h-40">
          <div className="loader text-gray-500 dark:text-gray-400">Memuat...</div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-5">
      <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
        Edit Komponen Gaji
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
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

        {/* Menampilkan informasi hasil perhitungan yang didapat dari backend */}
        {calculatedDetails && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="mb-3 text-md font-medium text-gray-700 dark:text-white">
              Hasil Perhitungan (Otomatis dari server)
            </h5>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">BPJS KT:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{calculatedDetails.bpjsKT.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">BPJS JP:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{calculatedDetails.bpjsJP.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">BPJS Kesehatan:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{calculatedDetails.bpjsKES.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Uang Cuti:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{calculatedDetails.uangCuti.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">THR:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{calculatedDetails.thr.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Santunan:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{calculatedDetails.santunan.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Hari Per Bulan:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{calculatedDetails.hariPerBulan} hari</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Upah Lembur Harian:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{calculatedDetails.upahLemburHarian.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
              </div>
              <div className="flex justify-between col-span-2 border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sub Total Penghasilan Tetap:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{calculatedDetails.subTotalPenghasilanTetap.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Biaya MP Tetap Harian:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{calculatedDetails.biayaMPTetapHarian.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Biaya Manpower Harian:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{calculatedDetails.biayaManpowerHarian.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
              </div>
            </div>
          </div>
        )}

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button variant="primary" disabled={loading}>
            {loading ? "Menyimpan..." : "Perbarui Komponen Gaji"}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 