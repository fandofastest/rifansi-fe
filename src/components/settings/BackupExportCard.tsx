"use client";
import React, { useState, useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { createBackup, getBackupHistory, deleteBackup, BackupHistoryResponse } from "@/services/backup";

type ExportType = "all" | "materials" | "spk" | "users";

interface BackupResponse extends BackupHistoryResponse {
  downloadUrl: string;
}

export default function BackupExportCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState<ExportType>("all");
  const [backupHistory, setBackupHistory] = useState<BackupResponse[]>([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const fetchBackupHistory = async () => {
    if (!token) return;
    setBackupLoading(true);
    try {
      const history = await getBackupHistory(token);
      setBackupHistory(history as BackupResponse[]);
    } catch (error: unknown) {
      console.error("Error fetching backup history:", error);
      toast.error("Gagal mengambil riwayat backup");
    } finally {
      setBackupLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupHistory();
  }, [token]);

  const handleExport = async () => {
    if (!token) {
      toast.error("Anda harus masuk untuk mengekspor data");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: exportType
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${exportType}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Data berhasil diekspor");
      closeModal();
    } catch (error: unknown) {
      console.error("Error exporting data:", error);
      toast.error("Gagal mengekspor data");
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    if (!token) {
      toast.error("Anda harus masuk untuk melakukan backup");
      return;
    }
    setLoading(true);
    try {
      const res = await createBackup(description, token);
      if (res.success) {
        toast.success(res.message || "Backup berhasil dibuat");
        fetchBackupHistory();
        setDescription("");
      } else {
        toast.error(res.message || "Backup gagal");
      }
    } catch (error: unknown) {
      console.error("Error creating backup:", error);
      toast.error("Gagal membuat backup");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (backupPath: string) => {
    if (!token) {
      toast.error("Anda harus masuk untuk menghapus backup");
      return;
    }
    setDeleteLoading(backupPath);
    try {
      const success = await deleteBackup(backupPath, token);
      if (success) {
        toast.success("Backup berhasil dihapus");
        fetchBackupHistory();
      } else {
        toast.error("Gagal menghapus backup");
      }
    } catch (error: unknown) {
      console.error("Error deleting backup:", error);
      toast.error("Gagal menghapus backup");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDownload = async (backupPath: string, downloadUrl: string) => {
    if (!token) {
      toast.error("Anda harus masuk untuk mengunduh backup");
      return;
    }
    setDownloadLoading(backupPath);
    try {
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backupPath.split('/').pop() || 'backup.gz';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Backup berhasil diunduh");
    } catch (error: unknown) {
      console.error("Error downloading backup:", error);
      toast.error("Gagal mengunduh backup");
    } finally {
      setDownloadLoading(null);
    }
  };

  const handleExportTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExportType(e.target.value as ExportType);
  };

  const formatDate = (timestamp: string | number) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "Tanggal tidak valid";
      }
      return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "Tanggal tidak valid";
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Backup & Export
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola backup data dan ekspor data sistem
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 12.75L3 6.75L4.5 5.25L9 9.75L13.5 5.25L15 6.75L9 12.75Z"
                fill="currentColor"
              />
            </svg>
            Export Data
          </button>
          <button
            onClick={handleBackup}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            disabled={loading}
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 6.75H12.75V3.75C12.75 3.3375 12.4125 3 12 3H6C5.5875 3 5.25 3.3375 5.25 3.75V6.75H3C2.5875 6.75 2.25 7.0875 2.25 7.5V15C2.25 15.4125 2.5875 15.75 3 15.75H15C15.4125 15.75 15.75 15.4125 15.75 15V7.5C15.75 7.0875 15.4125 6.75 15 6.75ZM6.75 4.5H11.25V6.75H6.75V4.5ZM14.25 14.25H3.75V8.25H14.25V14.25Z"
                fill="currentColor"
              />
            </svg>
            {loading ? "Membuat Backup..." : "Backup Data"}
          </button>
        </div>
      </div>
      {/* Riwayat Backup */}
      <div className="mt-8">
        <h5 className="font-semibold mb-4 text-gray-700 dark:text-gray-200">Riwayat Backup</h5>
        {backupLoading ? (
          <div className="text-gray-500 dark:text-gray-400">Memuat...</div>
        ) : backupHistory.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">Belum ada backup.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Path
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Koleksi
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {backupHistory.map((b, i) => (
                  <tr key={b.backupPath + i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(b.timestamp)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 break-all">
                      {b.backupPath}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {b.collections?.join(", ")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownload(b.backupPath, b.downloadUrl)}
                          disabled={downloadLoading === b.backupPath}
                          className="inline-flex items-center px-2 py-1 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-xs font-medium transition-colors"
                        >
                          {downloadLoading === b.backupPath ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-700 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Unduh...
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Unduh
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(b.backupPath)}
                          disabled={deleteLoading === b.backupPath}
                          className="inline-flex items-center px-2 py-1 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-medium transition-colors"
                        >
                          {deleteLoading === b.backupPath ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-red-700 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Hapus...
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Hapus
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-6">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
              Export Data
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Pilih jenis data yang ingin diekspor
            </p>
          </div>
          <div className="space-y-4 px-2">
            <div className="flex flex-col gap-2">
              {["all", "materials", "spk", "users"].map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="exportType"
                    value={type}
                    checked={exportType === type}
                    onChange={handleExportTypeChange}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {type === "all" && "Semua Data"}
                    {type === "materials" && "Data Material"}
                    {type === "spk" && "Data SPK"}
                    {type === "users" && "Data Pengguna"}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeModal} disabled={loading}>
              Batal
            </Button>
            <Button size="sm" onClick={handleExport} disabled={loading}>
              {loading ? "Mengekspor..." : "Export Data"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 