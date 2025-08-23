"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { 
  DailyActivityListItem,
  getDailyActivityListRange, 
  approveDailyReport, 
  deleteDailyActivity 
} from "@/services/dailyActivity";
import { getAreas, Area } from "@/services/area";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { DailyReportDetailModal } from "@/components/tables/DailyReportDetailModal";
import { Modal } from "@/components/ui/modal";
import Select from "@/components/ui/select/Select";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

export function DailyReportTable() {
  const { token, user } = useAuth();
  const [reports, setReports] = useState<DailyActivityListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [reportToAction, setReportToAction] = useState<DailyActivityListItem | null>(null);
  const [remarks, setRemarks] = useState("");
  const [reportToDelete, setReportToDelete] = useState<DailyActivityListItem | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Area selection states
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [loadingAreas, setLoadingAreas] = useState(false);

  // Tambahkan rentang tanggal (default kosong = semua tanggal)
  const [dateRange, setDateRange] = useState<{startDate?: string; endDate?: string}>({});

  // Cek apakah user adalah admin atau superadmin
  const isAdmin = user?.role?.roleCode && (user?.role?.roleCode === "ADMIN" || user?.role?.roleCode === "SUPERADMIN");
  
  // Check if user can see all reports (PMT or SUPERADMIN)
  const canSeeAllReports = user?.role?.roleCode === "PMT" || user?.role?.roleCode === "SUPERADMIN";

  // Fetch areas for SUPERADMIN/PMT
  useEffect(() => {
    const fetchAreas = async () => {
      if (!token || !canSeeAllReports) return;
      
      try {
        setLoadingAreas(true);
        const data = await getAreas(token);
        setAreas(data);
        // Set default to user's area if they have one, otherwise "all"
        setSelectedAreaId(user?.area?.id || "");
      } catch (err) {
        console.error('Error fetching areas:', err);
      } finally {
        setLoadingAreas(false);
      }
    };

    fetchAreas();
  }, [token, canSeeAllReports, user?.area?.id]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!token || !user) return;
      
      try {
        let data: DailyActivityListItem[];
        
        if (canSeeAllReports) {
          // PMT and SUPERADMIN can choose area
          data = await getDailyActivityListRange(token, {
            areaId: selectedAreaId || undefined,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          });
        } else if (user.area?.id) {
          // Other users only see reports from their area
          data = await getDailyActivityListRange(token, {
            areaId: user.area.id,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          });
        } else {
          // User has no area assigned
          setError("Area pengguna tidak ditemukan");
          setLoading(false);
          return;
        }
        
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
  }, [token, user, canSeeAllReports, selectedAreaId, dateRange]);

  const handleApprove = async (report: DailyActivityListItem) => {
    setReportToAction(report);
    setIsApproveModalOpen(true);
  };

  const handleReject = async (report: DailyActivityListItem) => {
    setReportToAction(report);
    setIsRejectModalOpen(true);
  };

  const refreshData = async () => {
    if (!token || !user) return;
    
    try {
      let data: DailyActivityListItem[];
      
      if (canSeeAllReports) {
        // PMT and SUPERADMIN can choose area
        data = await getDailyActivityListRange(token, {
          areaId: selectedAreaId || undefined,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });
      } else if (user.area?.id) {
        data = await getDailyActivityListRange(token, {
          areaId: user.area.id,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });
      } else {
        return;
      }
      
      setReports(data);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  const confirmApprove = async () => {
    if (!token || !reportToAction) return;
    try {
      await approveDailyReport(reportToAction.id, "Approved", remarks, token);
      await refreshData();
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
      await refreshData();
      setIsRejectModalOpen(false);
      setReportToAction(null);
      setRemarks("");
    } catch (err) {
      console.error('Error rejecting report:', err);
      setError("Gagal menolak laporan");
    }
  };

  const handleViewDetail = (report: DailyActivityListItem) => {
    setSelectedActivityId(report.id);
  };

  const handleDelete = async (report: DailyActivityListItem) => {
    setReportToDelete(report);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!token || !reportToDelete) return;
    try {
      setLoadingDelete(true);
      const result = await deleteDailyActivity(reportToDelete.id, token);
      if (result.success) {
        // Refresh data setelah delete
        await refreshData();
        setIsDeleteModalOpen(false);
        setReportToDelete(null);
      } else {
        setError(result.message || "Gagal menghapus laporan");
      }
    } catch (err) {
      console.error('Error deleting report:', err);
      setError("Gagal menghapus laporan");
    } finally {
      setLoadingDelete(false);
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

  // Helper untuk handle date ISO string atau timestamp
  const getDateObj = (dateVal: string | number | undefined) => {
    if (!dateVal) return null;
    if (typeof dateVal === "number") return new Date(dateVal);
    if (/^\d+$/.test(dateVal)) return new Date(Number(dateVal));
    return new Date(dateVal);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-4 border-b border-gray-200 dark:border-white/[0.05]">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Daftar Laporan Harian
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {canSeeAllReports 
                  ? (selectedAreaId 
                      ? `Menampilkan laporan area: ${areas.find(a => a.id === selectedAreaId)?.name || 'Area dipilih'}`
                      : "Menampilkan semua laporan dari semua area"
                    )
                  : `Menampilkan laporan area: ${user?.area?.name || "Tidak ada area"}`
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Area Selector for SUPERADMIN/PMT */}
              {canSeeAllReports && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Filter Area:
                  </label>
                  <Select
                    value={selectedAreaId}
                    onChange={(e) => setSelectedAreaId(e.target.value)}
                    className="min-w-[200px]"
                    disabled={loadingAreas}
                  >
                    <option value="">Semua Area</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                {reports.length} Laporan
              </Badge>
            </div>
          </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1400px]">
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
                    Area
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Progress
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Budget
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
                          const dateObj = getDateObj(report.date);
                          if (!dateObj || isNaN(dateObj.getTime())) return "-";
                          return format(dateObj, "dd MMMM yyyy", { locale: id });
                        })()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {report.spkDetail?.projectName}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {report.userDetail?.fullName || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div>
                        <div className="font-medium">{report.area?.name || '-'}</div>
                        {/* Coordinates removed in lightweight list response */}
                        <div className="text-xs text-gray-400">-</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-start">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(report.progressPercentage || 0, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {(report.progressPercentage || 0).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(report.budgetUsage || 0, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {(report.budgetUsage || 0).toFixed(1)}%
                        </span>
                      </div>
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
        isOpen={!!selectedActivityId}
        onClose={() => setSelectedActivityId("")}
        activityId={selectedActivityId}
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
              disabled={loadingDelete}
            >
              {loadingDelete ? (
                <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Menghapus...</span>
              ) : (
                'Hapus'
              )}
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