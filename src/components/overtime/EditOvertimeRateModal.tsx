"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/ui/input/Input";
import { useAuth } from "@/context/AuthContext";
import { getOvertimeRate, updateOvertimeRate } from "@/services/overtimeRate";
import { toast } from "react-hot-toast";

interface EditOvertimeRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  overtimeRateId: string;
}

export default function EditOvertimeRateModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  overtimeRateId
}: EditOvertimeRateModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: overtimeRateId,
    waktuKerja: 1,
    normal: 1.5,
    weekend: 2,
    libur: 2.5
  });
  const [isLoading, setIsLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (token) {
      fetchOvertimeRate();
    }
  }, [token]);

  const fetchOvertimeRate = async () => {
    setIsLoading(true);
    try {
      if (!token) {
        throw new Error("Token is missing");
      }
      const overtimeRate = await getOvertimeRate(overtimeRateId, token);
      setFormData({
        id: overtimeRateId,
        waktuKerja: overtimeRate.waktuKerja,
        normal: overtimeRate.normal,
        weekend: overtimeRate.weekend,
        libur: overtimeRate.libur
      });
    } catch (err) {
      console.error("Error fetching overtime rate:", err);
      setError("Gagal mengambil data tarif lembur");
      toast.error("Gagal mengambil data tarif lembur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "waktuKerja" ? parseInt(value) || 0 : parseFloat(value) || 0
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
      await updateOvertimeRate(formData, token);
      toast.success("Tarif lembur berhasil diperbarui");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error updating overtime rate:", err);
      setError("Gagal memperbarui tarif lembur");
      toast.error("Gagal memperbarui tarif lembur");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5">
        <div className="flex justify-center items-center h-40">
          <div className="loader text-gray-500 dark:text-gray-400">Memuat...</div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-5">
      <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
        Edit Tarif Lembur
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Waktu Kerja (Jam)
            </label>
            <Input
              type="number"
              name="waktuKerja"
              value={formData.waktuKerja}
              onChange={handleChange}
              required
              placeholder="Masukkan waktu kerja (jam)"
              min="1"
              step="1"
              className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Misalnya: 1 untuk jam pertama, 2 untuk jam kedua, dst.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tarif Normal (x)
            </label>
            <Input
              type="number"
              name="normal"
              value={formData.normal}
              onChange={handleChange}
              required
              placeholder="Masukkan tarif normal"
              min="0"
              step="0.1"
              className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Misal: 1.5 berarti 1.5 kali upah per jam
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tarif Akhir Pekan (x)
            </label>
            <Input
              type="number"
              name="weekend"
              value={formData.weekend}
              onChange={handleChange}
              required
              placeholder="Masukkan tarif akhir pekan"
              min="0"
              step="0.1"
              className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Misal: 2 berarti 2 kali upah per jam
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tarif Hari Libur (x)
            </label>
            <Input
              type="number"
              name="libur"
              value={formData.libur}
              onChange={handleChange}
              required
              placeholder="Masukkan tarif hari libur"
              min="0"
              step="0.1"
              className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Misal: 2.5 berarti 2.5 kali upah per jam
            </p>
          </div>
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button variant="primary" disabled={loading}>
            {loading ? "Menyimpan..." : "Perbarui Tarif Lembur"}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 