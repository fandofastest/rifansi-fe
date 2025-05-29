"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { DailyActivity, getDailyActivitiesByApprover, approveDailyReport, deleteDailyActivity } from "@/services/dailyActivity";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { DailyReportDetailModal } from "@/components/tables/DailyReportDetailModal";
import { Modal } from "@/components/ui/modal";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

export function DailyReportTable() {
  const { token, user } = useAuth();
  const [reports, setReports] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<DailyActivity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [reportToAction, setReportToAction] = useState<DailyActivity | null>(null);
  const [remarks, setRemarks] = useState("");
  const [reportToDelete, setReportToDelete] = useState<DailyActivity | null>(null);

  // Cek apakah user adalah admin atau superadmin
  const isAdmin = user?.role?.roleCode && (user.role.roleCode === "ADMIN" || user.role.roleCode === "SUPERADMIN");

  useEffect(() => {
    const fetchReports = async () => {
      if (!token || !user?.id) return;
      try {
        const data = await getDailyActivitiesByApprover(user.id, token);
        setReports(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError("Gagal mengambil data laporan");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token, user?.id]);

  const handleApprove = async (report: DailyActivity) => {
    setReportToAction(report);
    setIsApproveModalOpen(true);
  };

  const handleReject = async (report: DailyActivity) => {
    setReportToAction(report);
    setIsRejectModalOpen(true);
  };

  const confirmApprove = async () => {
    if (!token || !reportToAction) return;
    try {
      await approveDailyReport(reportToAction.id, "Approved", remarks, token);
      const data = await getDailyActivitiesByApprover(user?.id || "", token);
      setReports(data);
      setIsApproveModalOpen(false);
      setReportToAction(null);
      setRemarks("");
    } catch (err) {
      console.error('Error approving report:', err);
      setError("Gagal menyetujui laporan");
    }
  };

  const confirmReject = async () => {
    if (!token || !reportToAction) return;
    try {
      await approveDailyReport(reportToAction.id, "Rejected", remarks, token);
      const data = await getDailyActivitiesByApprover(user?.id || "", token);
      setReports(data);
      setIsRejectModalOpen(false);
      setReportToAction(null);
      setRemarks("");
    } catch (err) {
      console.error('Error rejecting report:', err);
      setError("Gagal menolak laporan");
    }
  };

  const handleViewDetail = (report: DailyActivity) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (report: DailyActivity) => {
    setReportToDelete(report);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!token || !reportToDelete) return;
    try {
      const result = await deleteDailyActivity(reportToDelete.id, token);
      if (result.success) {
        // Refresh data setelah delete
        const data = await getDailyActivitiesByApprover(user?.id || "", token);
        setReports(data);
        setIsDeleteModalOpen(false);
        setReportToDelete(null);
      } else {
        setError(result.message || "Gagal menghapus laporan");
      }
    } catch (err) {
      console.error('Error deleting report:', err);
      setError("Gagal menghapus laporan");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
      Submitted: { label: "Menunggu", variant: "warning" },
      Approved: { label: "Disetujui", variant: "success" },
      Rejected: { label: "Ditolak", variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "default" };
    return (
      <Badge variant={config.variant} className={status === "Rejected" ? "bg-error-500 text-white" : ""}>
        {config.label}
      </Badge>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Tanggal
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Nama Proyek
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Diajukan Oleh
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Lokasi
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Status
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
                        {(() => {
                          try {
                            if (!report.date) return '-';
                            // Convert timestamp to date
                            const timestamp = parseInt(report.date);
                            if (isNaN(timestamp)) return '-';
                            const date = new Date(timestamp);
                            if (isNaN(date.getTime())) return '-';
                            return format(date, "dd MMMM yyyy", { locale: id });
                          } catch (error) {
                            console.error('Error formatting date:', report.date, error);
                            return '-';
                          }
                        })()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {report.spkDetail.projectName}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {report.userDetail.fullName}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {report.spkDetail.location.name}
                    </td>
                    <td className="px-4 py-3 text-start">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetail(report)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        {report.status === "Submitted" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(report)}
                            >
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              className="bg-error-500 hover:bg-error-600"
                              onClick={() => handleReject(report)}
                            >
                              Tolak
                            </Button>
                          </>
                        )}
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-error-500 hover:text-error-600"
                            onClick={() => handleDelete(report)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <DailyReportDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setReportToDelete(null);
        }}
        className="max-w-md p-5 bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
      >
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-800 dark:text-white">
            Konfirmasi Hapus
          </h4>
          <p className="text-gray-600 dark:text-gray-300">
            Apakah Anda yakin ingin menghapus laporan harian ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setReportToDelete(null);
              }}
            >
              Batal
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="bg-error-500 hover:bg-error-600"
              onClick={confirmDelete}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setReportToAction(null);
          setRemarks("");
        }}
        className="max-w-md p-5 bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
      >
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-800 dark:text-white">
            Konfirmasi Persetujuan
          </h4>
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              Apakah Anda yakin ingin menyetujui laporan harian ini?
            </p>
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Tambahkan catatan (opsional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsApproveModalOpen(false);
                setReportToAction(null);
                setRemarks("");
              }}
            >
              Batal
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={confirmApprove}
            >
              Setujui
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setReportToAction(null);
          setRemarks("");
        }}
        className="max-w-md p-5 bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
      >
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-800 dark:text-white">
            Konfirmasi Penolakan
          </h4>
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              Apakah Anda yakin ingin menolak laporan harian ini?
            </p>
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Tambahkan alasan penolakan"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsRejectModalOpen(false);
                setReportToAction(null);
                setRemarks("");
              }}
            >
              Batal
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="bg-error-500 hover:bg-error-600"
              onClick={confirmReject}
              disabled={!remarks.trim()}
            >
              Tolak
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
} 