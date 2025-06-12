"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { LaporanByArea, getLaporanByArea } from "@/services/dailyActivity";
import { EyeIcon } from "@heroicons/react/24/outline";
import { LaporanHarianDetailModal } from "./LaporanHarianDetailModal";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

export function LaporanHarianTable() {
  const { token, user } = useAuth();
  const [reports, setReports] = useState<LaporanByArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<LaporanByArea | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      if (!token || !user?.area?.id) {
        setError("Area pengguna tidak ditemukan");
        setLoading(false);
        return;
      }
      
      try {
        const data = await getLaporanByArea(user.area.id, token);
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
  }, [token, user?.area?.id]);

  const handleViewDetail = (report: LaporanByArea) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
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

  const getApprovalBadge = (isApproved: boolean, approvedBy: any) => {
    if (isApproved && approvedBy) {
      return (
        <Badge variant="success">
          Disetujui oleh {approvedBy.fullName}
        </Badge>
      );
    }
    return (
      <Badge variant="warning">
        Belum Disetujui
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
                    Pelapor
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Area
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Persetujuan
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Progress
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
                      <div>
                        <div className="font-medium">{report.spkDetail?.projectName}</div>
                        <div className="text-xs text-gray-400">{report.spkDetail?.spkNo}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {report.userDetail.fullName}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div>
                        <div className="font-medium">{report.area.name}</div>
                        <div className="text-xs text-gray-400">
                          {report.area.location.coordinates.join(', ')}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-start">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-4 py-3 text-start">
                      {getApprovalBadge(report.isApproved, report.approvedBy)}
                    </td>
                    <td className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(report.progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {report.progressPercentage}%
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
      <LaporanHarianDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
      />
    </>
  );
} 