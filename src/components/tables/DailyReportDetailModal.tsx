import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
// import { EyeIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DailyActivity } from "@/services/dailyActivity";

interface DailyReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DailyActivity | null;
  onApprove?: (report: DailyActivity) => void;
  onReject?: (report: DailyActivity) => void;
}

export const DailyReportDetailModal: React.FC<DailyReportDetailModalProps> = ({
  isOpen,
  onClose,
  report,
  onApprove,
  onReject,
}) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  if (!report) return null;

  // Perhitungan total
  const totalAktivitas = report.activityDetails.length;
  const totalNilaiAktivitas = report.activityDetails.reduce((sum, detail) => {
    const workItem = detail.workItem as unknown as { rates?: { nr?: { rate: number }; r?: { rate: number } } };
    return sum + ((detail.actualQuantity.nr || 0) * (workItem.rates?.nr?.rate || 0) + (detail.actualQuantity.r || 0) * (workItem.rates?.r?.rate || 0));
  }, 0);
  const totalTenagaKerja = report.manpowerLogs.reduce((sum, log) => sum + (log.personCount * log.hourlyRate), 0);
  const totalMaterial = report.materialUsageLogs.reduce((sum, log) => sum + (log.quantity * log.unitRate), 0);
  const totalBiayaLain = report.otherCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const totalCostSelainAktivitas = totalTenagaKerja + totalMaterial + totalBiayaLain;
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
            <p className="text-sm text-gray-500 dark:text-gray-400">Lokasi</p>
            <p className="font-medium">{report.spkDetail.location.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Diajukan Oleh</p>
            <p className="font-medium">{report.userDetail.fullName}</p>
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

        {/* Accordion Section */}
        <div className="mt-4 rounded border border-gray-200 dark:border-white/10 divide-y divide-gray-200 dark:divide-white/10 bg-gray-50 dark:bg-gray-800">
          <AccordionSection id="aktivitas" title="Rincian Aktivitas">
            <div className="max-h-60 overflow-y-auto overflow-x-auto">
              <table className="w-full table-fixed min-w-[900px] text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-300 dark:border-white/20">
                    <th className="px-2 py-2 text-left w-48">Item</th>
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
                        <td className="px-2 py-2 text-left">{detail.workItem.name}</td>
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
                    <td colSpan={2 + (hasNR ? 1 : 0) + (hasR ? 1 : 0) + 1 + (hasNR ? 1 : 0) + (hasR ? 1 : 0)} className="px-2 py-2 font-semibold text-right">Total Nilai Aktivitas</td>
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
                        <th className="px-2 py-2 text-left w-24">Upah/Jam</th>
                        <th className="px-2 py-2 text-left w-24">Harga BBM</th>
                        <th className="px-2 py-2 text-left w-24">Subtotal</th>
                        <th className="px-2 py-2 text-left w-24">Rusak?</th>
                        <th className="px-2 py-2 text-left w-24">Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.equipmentLogs.map((log) => {
                        const subtotal = (log.workingHour * (log.hourlyRate || 0)) + (log.fuelIn * (log.fuelPrice || 0));
                        return (
                          <tr key={log.id} className="border-b border-gray-100 dark:border-white/10">
                            <td className="px-2 py-2">{log.equipment.equipmentCode}</td>
                            <td className="px-2 py-2">{log.equipment.equipmentType}</td>
                            <td className="px-2 py-2">{log.fuelIn}</td>
                            <td className="px-2 py-2">{log.fuelRemaining}</td>
                            <td className="px-2 py-2">{log.workingHour}</td>
                            <td className="px-2 py-2">{(log.hourlyRate || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
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
                          {report.equipmentLogs.reduce((sum, log) => sum + ((log.workingHour * (log.hourlyRate || 0)) + (log.fuelIn * (log.fuelPrice || 0))), 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
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
                          {report.manpowerLogs.reduce((sum, log) => sum + ((log.workingHours || 0) * (log.hourlyRate || 0) * (log.personCount || 0)), 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
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
                        <th className="px-2 py-2 text-left w-24">Jumlah</th>
                        <th className="px-2 py-2 text-left w-24">Deskripsi</th>
                        <th className="px-2 py-2 text-left w-24">No. Kwitansi</th>
                        <th className="px-2 py-2 text-left w-24">Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.otherCosts.map((cost) => (
                        <tr key={cost.id} className="border-b border-gray-100 dark:border-white/10">
                          <td className="px-2 py-2">{cost.costType}</td>
                          <td className="px-2 py-2">{cost.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                          <td className="px-2 py-2">{cost.description}</td>
                          <td className="px-2 py-2">{cost.receiptNumber}</td>
                          <td className="px-2 py-2">{cost.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300 dark:border-white/20">
                        <td colSpan={4} className="px-2 py-2 font-semibold text-right">Total Biaya Lainnya</td>
                        <td className="px-2 py-2 font-bold text-right">
                          {totalBiayaLain.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
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
  );
}; 