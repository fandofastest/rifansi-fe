"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { SalaryComponent, getSalaryComponentByPersonnelRole, getSalaryComponentDetails, SalaryComponentDetails as SalaryComponentDetailsType } from "@/services/salaryComponent";
import { useAuth } from "@/context/AuthContext";
import EditSalaryComponentModal from "./EditSalaryComponentModal";
import { formatRupiah } from "@/utils/helpers";

interface SalaryComponentDetailsProps {
  personnelRoleId: string;
  onAddSalary: () => void;
  onRefresh: () => void;
}

export default function SalaryComponentDetails({
  personnelRoleId,
  onAddSalary,
  onRefresh
}: SalaryComponentDetailsProps) {
  const { token } = useAuth();
  const [salaryComponent, setSalaryComponent] = useState<SalaryComponent | null>(null);
  const [calculatedDetails, setCalculatedDetails] = useState<SalaryComponentDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (personnelRoleId && token) {
      fetchSalaryComponentData();
    }
  }, [personnelRoleId, token]);

  const fetchSalaryComponentData = async () => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error("Token is missing");
      }
      const data = await getSalaryComponentByPersonnelRole(personnelRoleId, token);
      setSalaryComponent(data);

      // Fetch calculated details
      if (data) {
        const details = await getSalaryComponentDetails(personnelRoleId, null, token);
        setCalculatedDetails(details);
      }
    } catch (error) {
      console.error("Error fetching salary component:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    fetchSalaryComponentData();
    onRefresh();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="loader text-gray-500 dark:text-gray-400">Memuat...</div>
      </div>
    );
  }

  if (!salaryComponent) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-4">
        <p className="text-gray-600 dark:text-gray-400">
          Komponen gaji belum diatur untuk peran ini
        </p>
        <Button variant="primary" onClick={onAddSalary}>
          Tambah Komponen Gaji
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
        Detail Komponen Gaji
      </h4>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Input values section */}
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <h5 className="mb-4 text-md font-medium text-gray-800 dark:text-white/90">Nilai Input</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 dark:text-gray-400">Gaji Pokok</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(salaryComponent.gajiPokok)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tunjangan Tetap</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(salaryComponent.tunjanganTetap)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tunjangan Tidak Tetap</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(salaryComponent.tunjanganTidakTetap)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 dark:text-gray-400">Transport</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(salaryComponent.transport)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pulsa</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(salaryComponent.pulsa)}</span>
            </div>
          </div>
        </div>

        {/* Calculated values section */}
        {calculatedDetails && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
            <h5 className="mb-4 text-md font-medium text-gray-800 dark:text-white/90">Nilai Kalkulasi (Otomatis)</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 dark:text-gray-400">BPJS Ketenagakerjaan</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(calculatedDetails.bpjsKT)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 dark:text-gray-400">BPJS JP</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(calculatedDetails.bpjsJP)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 dark:text-gray-400">BPJS Kesehatan</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(calculatedDetails.bpjsKES)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 dark:text-gray-400">Uang Cuti</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(calculatedDetails.uangCuti)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 dark:text-gray-400">THR</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(calculatedDetails.thr)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 dark:text-gray-400">Santunan</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(calculatedDetails.santunan)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 dark:text-gray-400">Hari Per Bulan</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{calculatedDetails.hariPerBulan} hari</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 dark:text-gray-400">Upah Lembur Harian</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatRupiah(calculatedDetails.upahLemburHarian)}</span>
              </div>
            </div>

            {/* Summary section */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h6 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">Ringkasan Biaya</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sub Total Penghasilan Tetap</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{formatRupiah(calculatedDetails.subTotalPenghasilanTetap)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Biaya MP Tetap Harian</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{formatRupiah(calculatedDetails.biayaMPTetapHarian)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Biaya Manpower Harian</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{formatRupiah(calculatedDetails.biayaManpowerHarian)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setEditModalOpen(true)}>
          Edit Komponen Gaji
        </Button>
      </div>

      {editModalOpen && (
        <EditSalaryComponentModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          salaryComponentId={salaryComponent.id}
        />
      )}
    </div>
  );
} 