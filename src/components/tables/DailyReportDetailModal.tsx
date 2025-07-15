import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
// import { EyeIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DailyActivity, getDailyActivityWithDetails } from "@/services/dailyActivity";
import { useAuth } from "@/context/AuthContext";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface DailyReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  onApprove?: (report: DailyActivity) => void;
  onReject?: (report: DailyActivity) => void;
}

export const DailyReportDetailModal: React.FC<DailyReportDetailModalProps> = ({
  isOpen,
  onClose,
  activityId,
  onApprove,
  onReject,
}) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DailyActivity | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!isOpen || !activityId || !token) {
      setReport(null);
      return;
    }
    setLoading(true);
    getDailyActivityWithDetails(token, { activityId })
      .then((data) => setReport(data[0] || null))
      .finally(() => setLoading(false));
  }, [isOpen, activityId, token]);

  if (!isOpen) return null;
  if (loading) return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl p-5 bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    </Modal>
  );
  if (!report) return null;

  const allImages = [...(report.startImages || []), ...(report.finishImages || [])];

  const handleImageClick = (image: string, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(allImages[newIndex]);
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < allImages.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(allImages[newIndex]);
    }
  };

  // Perhitungan total
  const totalAktivitas = report.activityDetails.length;
  const totalNilaiAktivitas = report.activityDetails.reduce((sum, detail) => {
    // Access rates directly from the activityDetail as per the updated structure
    return sum + ((detail.actualQuantity.nr || 0) * (detail.rates?.nr?.rate || 0) + (detail.actualQuantity.r || 0) * (detail.rates?.r?.rate || 0));
  }, 0);
  
  // Hitung equipment cost
  const totalEquipment = report.equipmentLogs.reduce((sum, log) => 
    sum + ((log.rentalRatePerDay || 0) + (log.fuelIn * (log.fuelPrice || 0))), 0
  );
  
  // Hitung manpower cost (personCount * hourlyRate * workingHours)
  const totalTenagaKerja = report.manpowerLogs.reduce((sum, log) => 
    sum + ((log.personCount || 0) * (log.hourlyRate || 0) * (log.workingHours || 0)), 0
  );
  
  // Hitung material cost
  const totalMaterial = report.materialUsageLogs.reduce((sum, log) => 
    sum + (log.quantity * log.unitRate), 0
  );
  
  // Hitung other costs
  const totalBiayaLain = report.otherCosts.reduce((sum, cost) => 
    sum + cost.amount, 0
  );
  
  // Total semua biaya selain aktivitas (equipment + manpower + material + other)
  const totalCostSelainAktivitas = totalEquipment + totalTenagaKerja + totalMaterial + totalBiayaLain;
  
  // Laba/Rugi
  const labaRugi = totalNilaiAktivitas - totalCostSelainAktivitas;

  // Cek apakah ada NR atau R di seluruh aktivitas
  const hasNR = report.activityDetails.some(detail => (detail.actualQuantity.nr || 0) > 0);
  const hasR = report.activityDetails.some(detail => (detail.actualQuantity.r || 0) > 0);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: string }> = {
      Submitted: { label: "Menunggu", variant: "warning" },
      Approved: { label: "Disetujui", variant: "success" },
      Rejected: { label: "Ditolak", variant: "destructive" },
    };
    const config = statusConfig[status] || { label: status, variant: "default" };
    return (
      <span
        className={
          config.variant === "warning"
            ? "inline-block rounded px-2 py-1 text-xs font-semibold bg-yellow-400 text-white"
            : config.variant === "success"
            ? "inline-block rounded px-2 py-1 text-xs font-semibold bg-green-500 text-white"
            : config.variant === "destructive"
            ? "inline-block rounded px-2 py-1 text-xs font-semibold bg-red-500 text-white"
            : "inline-block rounded px-2 py-1 text-xs font-semibold bg-gray-300 text-gray-800"
        }
      >
        {config.label}
      </span>
    );
  };

  const AccordionSection = ({
    title,
    children,
    id,
  }: { title: string; children: React.ReactNode; id: string }) => (
    <div className="border-b border-gray-200 dark:border-white/10">
      <button
        className="w-full flex justify-between items-center py-3 text-left font-medium text-gray-700 dark:text-gray-200 focus:outline-none"
        onClick={() => setOpenAccordion(openAccordion === id ? null : id)}
      >
        <span>{title}</span>
        <span>{openAccordion === id ? "▲" : "▼"}</span>
      </button>
      {openAccordion === id && <div className="pb-4">{children}</div>}
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="max-w-5xl p-5 bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
      >
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-800 dark:text-white">
            Detail Laporan Harian
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal</p>
              <p className="font-medium">{format(new Date(parseInt(report.date)), "dd MMMM yyyy", { locale: id })}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              {getStatusBadge(report.status)}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Proyek</p>
              <p className="font-medium">{report.spkDetail.projectName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Area</p>
              <p className="font-medium">{report.area?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Diajukan Oleh</p>
              <p className="font-medium">{report.userDetail.fullName}</p>
            </div>
          </div>

          {/* Rejection Reason Section */}
          {report.status === "Rejected" && report.rejectionReason && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                    <span className="text-red-600 dark:text-red-400 text-sm font-semibold">!</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">Alasan Penolakan</h5>
                  <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
                    {report.rejectionReason}
                  </p>
                  {report.approvedBy && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                      Ditolak oleh: {report.approvedBy.fullName} pada {report.approvedAt ? format(new Date(parseInt(report.approvedAt)), "dd MMMM yyyy HH:mm", { locale: id }) : '-'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Approval Info Section */}
          {report.status === "Approved" && report.approvedBy && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 text-sm font-semibold">✓</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">Laporan Disetujui</h5>
                  <p className="text-green-600 dark:text-green-400 text-xs">
                    Disetujui oleh: {report.approvedBy.fullName} pada {report.approvedAt ? format(new Date(parseInt(report.approvedAt)), "dd MMMM yyyy HH:mm", { locale: id }) : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress & Budget Section */}
          <div className="mt-4 grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Progress Pekerjaan</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(report.progressPercentage || 0, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {(report.progressPercentage || 0).toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Penggunaan Budget</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(report.budgetUsage || 0, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {(report.budgetUsage || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="mt-4">
            <h5 className="mb-2 font-medium">Dokumentasi</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Foto Awal Pekerjaan</p>
                <div className="space-y-2">
                  {report.startImages && report.startImages.length > 0 ? (
                    report.startImages.map((image, index) => (
                      <div 
                        key={index} 
                        className="relative aspect-video cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleImageClick(image, index)}
                      >
                        <img
                          src={image}
                          alt={`Foto awal pekerjaan ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Tidak ada foto</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Foto Akhir Pekerjaan</p>
                <div className="space-y-2">
                  {report.finishImages && report.finishImages.length > 0 ? (
                    report.finishImages.map((image, index) => (
                      <div 
                        key={index} 
                        className="relative aspect-video cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleImageClick(image, report.startImages?.length ? report.startImages.length + index : index)}
                      >
                        <img
                          src={image}
                          alt={`Foto akhir pekerjaan ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Tidak ada foto</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ringkasan */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Aktivitas</p>
              <p className="font-semibold">{totalAktivitas}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Nilai Aktivitas</p>
              <p className="font-semibold">{totalNilaiAktivitas.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Biaya</p>
              <p className="font-semibold">{totalCostSelainAktivitas.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Laba/Rugi</p>
              <p className="font-semibold">
                {labaRugi.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })} ({labaRugi >= 0 ? 'Laba' : 'Rugi'})
              </p>
            </div>
          </div>

          {/* Breakdown Biaya Detail */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="mb-3 font-medium text-gray-800 dark:text-gray-200">Breakdown Biaya</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Equipment</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {totalEquipment.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tenaga Kerja</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {totalTenagaKerja.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Material</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {totalMaterial.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Biaya Lainnya</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {totalBiayaLain.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <p className="font-medium text-gray-800 dark:text-gray-200">Total Semua Biaya:</p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">
                  {totalCostSelainAktivitas.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </p>
              </div>
            </div>
          </div>

          {/* Budget Detail */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h5 className="mb-3 font-medium text-blue-800 dark:text-blue-200">Detail Budget Proyek</h5>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Budget</p>
                <p className="font-semibold text-blue-800 dark:text-blue-200">
                  {report.spkDetail.budget.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Budget Terpakai</p>
                <p className="font-semibold text-blue-800 dark:text-blue-200">
                  {((report.spkDetail.budget * (report.budgetUsage || 0)) / 100).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Sisa Budget</p>
                <p className="font-semibold text-blue-800 dark:text-blue-200">
                  {(report.spkDetail.budget - ((report.spkDetail.budget * (report.budgetUsage || 0)) / 100)).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </p>
              </div>
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="mt-4 space-y-2">
            <AccordionSection id="aktivitas" title="Rincian Aktivitas">
              <div className="max-h-60 overflow-y-auto overflow-x-auto">
                <table className="w-full table-fixed min-w-[900px] text-xs">
                  <thead>
                    <tr className="border-b-2 border-gray-300 dark:border-white/20">
                      <th className="px-2 py-2 text-left w-48">Item</th>
                      <th className="px-2 py-2 text-left w-32">Kategori</th>
                      <th className="px-2 py-2 text-left w-24">Status</th>
                      {hasNR && <th className="px-2 py-2 text-right w-20">Jumlah NR</th>}
                      {hasR && <th className="px-2 py-2 text-right w-20">Jumlah R</th>}
                      <th className="px-2 py-2 text-left w-24">Satuan</th>
                      {hasNR && <th className="px-2 py-2 text-right w-28">Nilai NR</th>}
                      {hasR && <th className="px-2 py-2 text-right w-28">Nilai R</th>}
                      <th className="px-2 py-2 text-right w-32">Total Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.activityDetails.map((detail) => {
                      const workItem = detail.workItem as unknown as { rates?: { nr?: { rate: number }; r?: { rate: number } } };
                      const nilaiNR = (detail.actualQuantity.nr || 0) * (workItem.rates?.nr?.rate || 0);
                      const nilaiR = (detail.actualQuantity.r || 0) * (workItem.rates?.r?.rate || 0);
                      const totalNilai = nilaiNR + nilaiR;
                      return (
                        <tr key={detail.id} className="border-b border-gray-100 dark:border-white/10">
                          <td className="px-2 py-2 text-left">
                            <div>
                              <div className="font-medium">{detail.workItem.name}</div>
                              {detail.workItem.description && (
                                <div className="text-xs text-gray-500 mt-1">{detail.workItem.description}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-2 text-left">
                            <div className="text-xs">
                              <div>{detail.workItem.category?.name || '-'}</div>
                              <div className="text-gray-500">{detail.workItem.subCategory?.name || '-'}</div>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-left">{detail.status}</td>
                          {hasNR && <td className="px-2 py-2 text-right">{detail.actualQuantity.nr}</td>}
                          {hasR && <td className="px-2 py-2 text-right">{detail.actualQuantity.r}</td>}
                          <td className="px-2 py-2 text-left">{detail.workItem.unit?.name || '-'}</td>
                          {hasNR && <td className="px-2 py-2 text-right">{nilaiNR.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>}
                          {hasR && <td className="px-2 py-2 text-right">{nilaiR.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>}
                          <td className="px-2 py-2 text-right">{totalNilai.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 dark:border-white/20">
                      <td colSpan={3 + (hasNR ? 1 : 0) + (hasR ? 1 : 0) + 1 + (hasNR ? 1 : 0) + (hasR ? 1 : 0)} className="px-2 py-2 font-semibold text-right">Total Nilai Aktivitas</td>
                      <td className="px-2 py-2 font-bold text-right">
                        {totalNilaiAktivitas.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </AccordionSection>
            <AccordionSection id="biaya" title="Rincian Biaya">
              {/* Gabungkan semua biaya selain aktivitas di sini */}
              {/* Equipment Logs */}
              {report.equipmentLogs && report.equipmentLogs.length > 0 && (
                <div className="mt-4">
                  <h5 className="mb-2 font-medium">Log Peralatan</h5>
                  <div className="max-h-60 overflow-y-auto overflow-x-auto">
                    <table className="w-full table-fixed min-w-[900px] text-xs">
                      <thead>
                        <tr className="border-b-2 border-gray-300 dark:border-white/20">
                          <th className="px-2 py-2 text-left w-48">Kode</th>
                          <th className="px-2 py-2 text-left w-24">Tipe</th>
                          <th className="px-2 py-2 text-left w-24">BBM Masuk</th>
                          <th className="px-2 py-2 text-left w-24">BBM Sisa</th>
                          <th className="px-2 py-2 text-left w-24">Jam Kerja</th>
                          <th className="px-2 py-2 text-left w-24">Tarif/Hari</th>
                          <th className="px-2 py-2 text-left w-24">Harga BBM</th>
                          <th className="px-2 py-2 text-left w-24">Subtotal</th>
                          <th className="px-2 py-2 text-left w-24">Rusak?</th>
                          <th className="px-2 py-2 text-left w-24">Catatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.equipmentLogs.map((log) => {
                          const subtotal = (log.rentalRatePerDay || 0) + (log.fuelIn * (log.fuelPrice || 0));
                          return (
                            <tr key={log.id} className="border-b border-gray-100 dark:border-white/10">
                              <td className="px-2 py-2">{log.equipment.equipmentCode}</td>
                              <td className="px-2 py-2">{log.equipment.equipmentType}</td>
                              <td className="px-2 py-2">{log.fuelIn}</td>
                              <td className="px-2 py-2">{log.fuelRemaining}</td>
                              <td className="px-2 py-2">{log.workingHour}</td>
                              <td className="px-2 py-2">{(log.rentalRatePerDay || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                              <td className="px-2 py-2">{(log.fuelPrice || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                              <td className="px-2 py-2">{subtotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                              <td className="px-2 py-2">{log.isBrokenReported ? 'Ya' : 'Tidak'}</td>
                              <td className="px-2 py-2">{log.remarks || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-300 dark:border-white/20">
                          <td colSpan={7} className="px-2 py-2 font-semibold text-right">Total Equipment</td>
                          <td className="px-2 py-2 font-bold text-right">
                            {totalEquipment.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
              {/* Manpower Logs */}
              {report.manpowerLogs && report.manpowerLogs.length > 0 && (
                <div className="mt-4">
                  <h5 className="mb-2 font-medium">Log Tenaga Kerja</h5>
                  <div className="max-h-60 overflow-y-auto overflow-x-auto">
                    <table className="w-full table-fixed min-w-[900px] text-xs">
                      <thead>
                        <tr className="border-b-2 border-gray-300 dark:border-white/20">
                          <th className="px-2 py-2 text-left w-48">Nama Peran</th>
                          <th className="px-2 py-2 text-left w-24">Jumlah Orang</th>
                          <th className="px-2 py-2 text-left w-24">Jam Kerja</th>
                          <th className="px-2 py-2 text-left w-24">Upah/Jam</th>
                          <th className="px-2 py-2 text-left w-24">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.manpowerLogs.map((log) => {
                          const subtotal = (log.workingHours || 0) * (log.hourlyRate || 0) * (log.personCount || 0);
                          return (
                            <tr key={log.id} className="border-b border-gray-100 dark:border-white/10">
                              <td className="px-2 py-2">{log.personnelRole?.roleName || '-'}</td>
                              <td className="px-2 py-2">{log.personCount}</td>
                              <td className="px-2 py-2">{log.workingHours || 0}</td>
                              <td className="px-2 py-2">{(log.hourlyRate || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                              <td className="px-2 py-2">{subtotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-300 dark:border-white/20">
                          <td colSpan={4} className="px-2 py-2 font-semibold text-right">Total Tenaga Kerja</td>
                          <td className="px-2 py-2 font-bold text-right">
                            {totalTenagaKerja.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
              {/* Material Usage Logs */}
              {report.materialUsageLogs && report.materialUsageLogs.length > 0 && (
                <div className="mt-4">
                  <h5 className="mb-2 font-medium">Log Penggunaan Material</h5>
                  <div className="max-h-60 overflow-y-auto overflow-x-auto">
                    <table className="w-full table-fixed min-w-[900px] text-xs">
                      <thead>
                        <tr className="border-b-2 border-gray-300 dark:border-white/20">
                          <th className="px-2 py-2 text-left w-48">Material</th>
                          <th className="px-2 py-2 text-left w-24">Jumlah</th>
                          <th className="px-2 py-2 text-left w-24">Harga Satuan</th>
                          <th className="px-2 py-2 text-left w-24">Subtotal</th>
                          <th className="px-2 py-2 text-left w-24">Catatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.materialUsageLogs.map((log) => (
                          <tr key={log.id} className="border-b border-gray-100 dark:border-white/10">
                            <td className="px-2 py-2">{log.material.name}</td>
                            <td className="px-2 py-2">{log.quantity}</td>
                            <td className="px-2 py-2">{log.unitRate.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                            <td className="px-2 py-2">{(log.quantity * log.unitRate).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                            <td className="px-2 py-2">{log.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-300 dark:border-white/20">
                          <td colSpan={4} className="px-2 py-2 font-semibold text-right">Total Material</td>
                          <td className="px-2 py-2 font-bold text-right">
                            {totalMaterial.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
              {/* Other Costs */}
              {report.otherCosts && report.otherCosts.length > 0 && (
                <div className="mt-4">
                  <h5 className="mb-2 font-medium">Rincian Biaya Lainnya</h5>
                  <div className="max-h-60 overflow-y-auto overflow-x-auto">
                    <table className="w-full table-fixed min-w-[900px] text-xs">
                      <thead>
                        <tr className="border-b-2 border-gray-300 dark:border-white/20">
                          <th className="px-2 py-2 text-left w-48">Tipe Biaya</th>
                          <th className="px-2 py-2 text-left w-32">Deskripsi</th>
                          <th className="px-2 py-2 text-left w-24">Jumlah</th>
                          <th className="px-2 py-2 text-left w-24">Catatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.otherCosts.map((cost) => (
                          <tr key={cost.id} className="border-b border-gray-100 dark:border-white/10">
                            <td className="px-2 py-2">{cost.costType}</td>
                            <td className="px-2 py-2">{cost.description}</td>
                            <td className="px-2 py-2">{cost.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                            <td className="px-2 py-2">{cost.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-300 dark:border-white/20">
                          <td colSpan={3} className="px-2 py-2 font-semibold text-right">Total Biaya Lainnya</td>
                          <td className="px-2 py-2 font-bold text-right">
                            {totalBiayaLain.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
              {/* Grand Total All Costs */}
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-gray-900 dark:text-white text-lg">TOTAL SEMUA BIAYA</h5>
                  <p className="font-bold text-xl text-gray-900 dark:text-white">
                    {totalCostSelainAktivitas.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                  </p>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Equipment + Tenaga Kerja + Material + Biaya Lainnya
                </div>
              </div>
            </AccordionSection>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            {report.status === "Submitted" && onApprove && onReject && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApprove(report)}
                >
                  Setujui
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-error-500 hover:bg-error-600"
                  onClick={() => onReject(report)}
                >
                  Tolak
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => {
          setSelectedImage(null);
          setCurrentImageIndex(0);
        }}
        className="max-w-7xl p-0 bg-black/90"
      >
        <div className="relative w-full h-full min-h-[80vh] flex items-center justify-center">
          <div className="relative bg-white p-4 rounded-lg shadow-2xl">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-[70vh] object-contain"
              />
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setCurrentImageIndex(0);
                }}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  disabled={currentImageIndex === 0}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors ${
                    currentImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronLeftIcon className="w-8 h-8" />
                </button>
                <button
                  onClick={handleNextImage}
                  disabled={currentImageIndex === allImages.length - 1}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors ${
                    currentImageIndex === allImages.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronRightIcon className="w-8 h-8" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}; 