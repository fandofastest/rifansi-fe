"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { LaporanByArea } from "@/services/dailyActivity";

interface LaporanHarianDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: LaporanByArea | null;
}

export function LaporanHarianDetailModal({
  isOpen,
  onClose,
  report,
}: LaporanHarianDetailModalProps) {
  if (!report) return null;

  const formatDate = (dateString: string) => {
    try {
      const timestamp = parseInt(dateString);
      if (isNaN(timestamp)) return '-';
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '-';
      return format(date, "dd MMMM yyyy", { locale: id });
    } catch (error) {
      return '-';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Detail Laporan Harian</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Tanggal</p>
            <p className="font-medium">{formatDate(report.date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            {getStatusBadge(report.status)}
          </div>
          <div>
            <p className="text-sm text-gray-500">Pelapor</p>
            <p className="font-medium">{report.userDetail.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Area</p>
            <p className="font-medium">{report.area.name}</p>
          </div>
        </div>

        {/* Project Info */}
        <div className="space-y-4">
          <h4 className="font-semibold">Informasi Proyek</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nama Proyek</p>
              <p className="font-medium">{report.spkDetail.projectName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">No SPK</p>
              <p className="font-medium">{report.spkDetail.spkNo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Judul SPK</p>
              <p className="font-medium">{report.spkDetail.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(report.progressPercentage, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm">{report.progressPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Work Details */}
        <div className="space-y-4">
          <h4 className="font-semibold">Detail Pekerjaan</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Cuaca</p>
              <p className="font-medium">{report.weather}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jam Kerja</p>
              <p className="font-medium">{report.workStartTime} - {report.workEndTime}</p>
            </div>
          </div>
        </div>

        {/* Activity Details */}
        {report.activityDetails && report.activityDetails.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Detail Aktivitas</h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 dark:border-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Kerja</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NR</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">R</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {report.activityDetails.map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-4 py-2">{activity.workItem.name}</td>
                      <td className="px-4 py-2">{activity.actualQuantity.nr}</td>
                      <td className="px-4 py-2">{activity.actualQuantity.r}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Approval Info */}
        <div className="space-y-4">
          <h4 className="font-semibold">Status Persetujuan</h4>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{report.isApproved ? 'Sudah Disetujui' : 'Belum Disetujui'}</p>
              </div>
              {report.approvedBy && (
                <div>
                  <p className="text-sm text-gray-500">Disetujui Oleh</p>
                  <p className="font-medium">{report.approvedBy.fullName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
} 