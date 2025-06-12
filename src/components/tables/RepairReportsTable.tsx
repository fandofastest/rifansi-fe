"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  RepairReport, 
  getPendingRepairReports, 
  reviewRepairReport, 
  ReviewRepairReportInput
} from "@/services/equipment";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { EyeIcon } from "@/icons";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "react-hot-toast";

interface GraphQLError {
  message: string;
  response?: {
    errors?: Array<{ message: string }>;
  };
}

export const RepairReportsTable: React.FC = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState<RepairReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<RepairReport | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [assignedTechnician, setAssignedTechnician] = useState("");
  const [estimatedCost, setEstimatedCost] = useState<number | "">("");
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");

  const fetchRepairReports = async () => {
    try {
      if (!token) {
        setError("No authentication token available");
        return;
      }
      setLoading(true);
      const data = await getPendingRepairReports(token);
      setReports(data);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching repair reports:', err);
      const graphQLError = err as GraphQLError;
      if (graphQLError.response?.errors) {
        setError(graphQLError.response.errors[0].message || "Failed to fetch repair reports");
      } else {
        setError("Failed to fetch repair reports. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairReports();
  }, [token]);

  const handleApprove = async () => {
    if (!selectedReport || !token) return;
    
    try {
      const input: ReviewRepairReportInput = {
        status: 'APPROVED',
        reviewNotes,
        assignedTechnician: assignedTechnician || undefined,
        estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
        priority
      };

      const response = await reviewRepairReport(selectedReport.id, input, token);
      
      // Show success message with equipment status update info
      toast.success(`Laporan berhasil disetujui. Status alat ${response.equipment.equipmentCode} diubah menjadi ${response.equipment.serviceStatus}`);
      await fetchRepairReports();
      closeModals();
    } catch (error) {
      console.error('Error approving report:', error);
      toast.error("Gagal menyetujui laporan");
    }
  };

  const handleReject = async () => {
    if (!selectedReport || !token) return;
    
    try {
      const input: ReviewRepairReportInput = {
        status: 'REJECTED',
        reviewNotes
      };

      await reviewRepairReport(selectedReport.id, input, token);
      toast.success("Laporan berhasil ditolak");
      await fetchRepairReports();
      closeModals();
    } catch (error) {
      console.error('Error rejecting report:', error);
      toast.error("Gagal menolak laporan");
    }
  };

  const closeModals = () => {
    setIsApproveModalOpen(false);
    setIsRejectModalOpen(false);
    setSelectedReport(null);
    setReviewNotes("");
    setAssignedTechnician("");
    setEstimatedCost("");
    setPriority("MEDIUM");
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(parseInt(timestamp));
      return format(date, "dd MMMM yyyy", { locale: id });
    } catch (error) {
      return '-';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      HIGH: { label: "Tinggi", class: "bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400" },
      MEDIUM: { label: "Sedang", class: "bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400" },
      LOW: { label: "Rendah", class: "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400" }
    };
    
    const priorityConfig = config[priority as keyof typeof config] || { label: priority, class: "bg-gray-100 text-gray-600" };
    
    return (
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityConfig.class}`}>
        {priorityConfig.label}
      </span>
    );
  };

  const getDamageLevelBadge = (level: string) => {
    const config = {
      BERAT: { label: "Berat", class: "bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400" },
      SEDANG: { label: "Sedang", class: "bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400" },
      RINGAN: { label: "Ringan", class: "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400" }
    };
    
    const levelConfig = config[level as keyof typeof config] || { label: level, class: "bg-gray-100 text-gray-600" };
    
    return (
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${levelConfig.class}`}>
        {levelConfig.label}
      </span>
    );
  };

  const getStatusBadge = (status?: string) => {
    if (!status) {
      return (
        <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400">
          Menunggu Review
        </span>
      );
    }

    const config = {
      APPROVED: { label: "Disetujui", class: "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400" },
      REJECTED: { label: "Ditolak", class: "bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400" },
      PENDING: { label: "Menunggu", class: "bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400" }
    };
    
    const statusConfig = config[status as keyof typeof config] || { label: status, class: "bg-gray-100 text-gray-600" };
    
    return (
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.class}`}>
        {statusConfig.label}
      </span>
    );
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-error-500">Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1200px]">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  No. Laporan
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Alat
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Pelapor
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Tingkat Kerusakan
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Prioritas
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Status
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Tanggal Laporan
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Lokasi
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {report.reportNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div>
                      <div className="font-medium">{report.equipment.equipmentCode}</div>
                      <div className="text-xs text-gray-400">
                        {report.equipment.equipmentType} - {report.equipment.plateOrSerialNo}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div>
                      <div className="font-medium">{report.reportedBy.fullName}</div>
                      <div className="text-xs text-gray-400">{report.reportedBy.role.roleName}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-start">
                    {getDamageLevelBadge(report.damageLevel)}
                  </td>
                  <td className="px-4 py-3 text-start">
                    {getPriorityBadge(report.priority)}
                  </td>
                  <td className="px-4 py-3 text-start">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {formatDate(report.reportDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {report.location?.name || 'Tidak ada lokasi'}
                  </td>
                  <td className="px-4 py-3 text-start">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedReport(report);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <EyeIcon className="fill-current" />
                      </Button>
                      {(!report.status || report.status === 'PENDING') && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-success-500 hover:text-success-600"
                            onClick={() => {
                              setSelectedReport(report);
                              setIsApproveModalOpen(true);
                            }}
                          >
                            Setuju
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-error-500 hover:text-error-600"
                            onClick={() => {
                              setSelectedReport(report);
                              setIsRejectModalOpen(true);
                            }}
                          >
                            Tolak
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedReport(null);
        }} 
        className="max-w-4xl p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
      >
        {selectedReport && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Detail Laporan Kerusakan</h3>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedReport(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">No. Laporan</p>
                <p className="font-medium">{selectedReport.reportNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tanggal Laporan</p>
                <p className="font-medium">{formatDate(selectedReport.reportDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pelapor</p>
                <p className="font-medium">{selectedReport.reportedBy.fullName}</p>
                <p className="text-xs text-gray-400">{selectedReport.reportedBy.role.roleName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lokasi</p>
                <p className="font-medium">{selectedReport.location?.name || 'Tidak ada lokasi'}</p>
              </div>
            </div>

            {/* Equipment Info */}
            <div className="space-y-4">
              <h4 className="font-semibold">Informasi Alat</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Kode Alat</p>
                  <p className="font-medium">{selectedReport.equipment.equipmentCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipe Alat</p>
                  <p className="font-medium">{selectedReport.equipment.equipmentType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plat/Serial No</p>
                  <p className="font-medium">{selectedReport.equipment.plateOrSerialNo}</p>
                </div>
              </div>
            </div>

            {/* Problem Details */}
            <div className="space-y-4">
              <h4 className="font-semibold">Detail Kerusakan</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tingkat Kerusakan</p>
                  {getDamageLevelBadge(selectedReport.damageLevel)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prioritas</p>
                  {getPriorityBadge(selectedReport.priority)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  {getStatusBadge(selectedReport.status)}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Deskripsi Masalah</p>
                <p className="font-medium mt-1">{selectedReport.problemDescription}</p>
              </div>
              
              {/* Cost Information */}
              {(selectedReport.estimatedCost || selectedReport.actualCost) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {selectedReport.estimatedCost && (
                    <div>
                      <p className="text-sm text-gray-500">Estimasi Biaya</p>
                      <p className="font-medium">Rp {selectedReport.estimatedCost.toLocaleString('id-ID')}</p>
                    </div>
                  )}
                  {selectedReport.actualCost && (
                    <div>
                      <p className="text-sm text-gray-500">Biaya Aktual</p>
                      <p className="font-medium">Rp {selectedReport.actualCost.toLocaleString('id-ID')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Images */}
            {selectedReport.reportImages && selectedReport.reportImages.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold">Foto Laporan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedReport.reportImages.map((image, index) => (
                    <div key={index} className="border rounded-lg p-2">
                      <img 
                        src={image} 
                        alt={`Foto laporan ${index + 1}`}
                        className="w-full h-48 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => window.open(image, '_blank')}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZvdG8gdGlkYWsgZGl0ZW11a2FuPC90ZXh0Pjwvc3ZnPg==";
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        Foto {index + 1} - Klik untuk memperbesar
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal 
        isOpen={isApproveModalOpen} 
        onClose={closeModals}
        className="max-w-2xl p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
      >
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Setujui Laporan Kerusakan</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Catatan Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                rows={3}
                placeholder="Masukkan catatan review..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teknisi/Bengkel yang Ditugaskan
              </label>
              <input
                type="text"
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                placeholder="Nama teknisi atau bengkel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estimasi Biaya Perbaikan
              </label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value ? Number(e.target.value) : "")}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                placeholder="Estimasi biaya dalam Rupiah"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioritas Perbaikan
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "HIGH" | "MEDIUM" | "LOW")}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="HIGH">Tinggi</option>
                <option value="MEDIUM">Sedang</option>
                <option value="LOW">Rendah</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={closeModals}
            >
              Batal
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleApprove}
              disabled={!reviewNotes.trim()}
            >
              Setujui Laporan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal 
        isOpen={isRejectModalOpen} 
        onClose={closeModals}
        className="max-w-md p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
      >
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Tolak Laporan Kerusakan</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alasan Penolakan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              rows={4}
              placeholder="Masukkan alasan penolakan..."
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={closeModals}
            >
              Batal
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="bg-error-500 hover:bg-error-600"
              onClick={handleReject}
              disabled={!reviewNotes.trim()}
            >
              Tolak Laporan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}; 