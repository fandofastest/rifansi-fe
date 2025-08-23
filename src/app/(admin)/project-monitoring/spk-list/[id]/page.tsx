"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSPKDetailsWithProgress, SPKDetailWithProgress, DailyActivityWorkItem, CostBreakdownItem, DailyActivity } from "@/services/spk";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";
import { id } from "date-fns/locale";
import { useParams } from "next/navigation";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

// ...
// Types needed locally
type PeriodType = 'daily' | 'weekly' | 'monthly';

interface MatrixData {
  date: string;
  workItems: {
    total: number;
    completed: number;
    value: number;
    dailyProgress: { nr: number; r: number };
    dailyCost: { nr: number; r: number };
  };
  equipment: number;
  bbm: number;
  materials: number;
  manpower: number;
  other: number;
  total: number;
}

// Minimal tooltip component
function InfoTooltip({ text }: { text: string }) {
  return (
    <span
      className="ml-1 inline-flex items-center justify-center align-middle text-xs text-gray-400 dark:text-gray-500"
      title={text}
      aria-label={text}
    >
      ⓘ
    </span>
  );
}

// Minimal Work Item details modal to avoid runtime errors
function WorkItemDetailsModal({
  open,
  onClose,
  workItems,
  date,
}: {
  open: boolean;
  onClose: () => void;
  workItems: DailyActivityWorkItem[];
  date: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-[10vw]">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full p-6 relative max-h-[90vh] flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Detail Work Items ({date})</h3>
        <div className="overflow-y-auto flex-1 max-h-[60vh]">
          <table className="w-full text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg bg-gray-50 dark:bg-gray-800">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-2 text-left text-black dark:text-white">Nama Item</th>
                <th className="p-2 text-center text-black dark:text-white">NR</th>
                <th className="p-2 text-center text-black dark:text-white">R</th>
                <th className="p-2 text-center text-black dark:text-white">Biaya</th>
              </tr>
            </thead>
            <tbody>
              {workItems.map((wi, idx) => {
                const valNR = (wi.actualQuantity?.nr || 0) * (wi.rates?.nr?.rate || 0);
                const valR = (wi.actualQuantity?.r || 0) * (wi.rates?.r?.rate || 0);
                const cost = valNR + valR;
                return (
                  <tr key={idx} className="border-t border-gray-100 dark:border-white/[0.04]">
                    <td className="p-2 text-black dark:text-white">{String(((wi as any)?.name) ?? ((wi as any)?.itemName) ?? ((wi as any)?.id) ?? '-')}</td>
                    <td className="p-2 text-center text-black dark:text-white">{wi.actualQuantity?.nr || 0}</td>
                    <td className="p-2 text-center text-black dark:text-white">{wi.actualQuantity?.r || 0}</td>
                    <td className="p-2 text-center text-black dark:text-white">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(cost)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button onClick={onClose} className="mt-6 px-5 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow self-end">Tutup</button>
      </div>
    </div>
  );
}

// Komponen modal detail biaya kategori
function CostDetailsModal({ open, onClose, items, date, title }: { open: boolean; onClose: () => void; items: CostBreakdownItem[]; date: string; title: string }) {
  // Hapus accordion BBM untuk modal Equipment; tidak diperlukan lagi
  const [expandedEquipmentRows, setExpandedEquipmentRows] = useState<number[]>([]);
  if (!open) return null;

  // Tentukan field yang relevan untuk setiap kategori
  let fields: { key: keyof CostBreakdownItem; label: string; isObj?: boolean }[] = [];
  if (title === 'Equipment') {
    // Modal Equipment sekarang hanya menampilkan biaya rental
    fields = [
      { key: 'equipment', label: 'Equipment', isObj: true },
      { key: 'rentalRatePerDay', label: 'Rental Rate Per Day' },
    ];
  } else if (title === 'BBM') {
    // Modal BBM menampilkan equipment dan total biaya BBM (fuel)
    fields = [
      { key: 'equipment', label: 'Equipment', isObj: true },
      // Kolom detail fuel opsional; cukup tampilkan biaya di kolom Biaya
    ];
  } else if (title === 'Manpower') {
    fields = [
      { key: 'role', label: 'Role' },
      { key: 'numberOfWorkers', label: 'Jumlah Pekerja' },
      { key: 'workingHours', label: 'Jam Kerja' },
      { key: 'hourlyRate', label: 'Upah/Jam' },
    ];
  } else if (title === 'Other Costs') {
    fields = [{ key: 'description', label: 'Deskripsi' }];
  } else if (title === 'Materials') {
    fields = [
      { key: 'material', label: 'Material' },
      { key: 'quantity', label: 'Qty' },
      { key: 'unit', label: 'Unit' },
      { key: 'unitRate', label: 'Harga Satuan' },
    ];
  } else if (title === 'Work Items') {
    // Khusus Work Items, fields ditangani terpisah oleh parent; tetap sediakan agar tabel render
    fields = [];
  }

  // Subfield untuk object equipment
  const equipmentSubFields = [
    { key: 'equipmentCode', label: 'Code' },
    { key: 'plateOrSerialNo', label: 'No/Serial' },
    { key: 'equipmentType', label: 'Type' },
    { key: 'description', label: 'Deskripsi' },
  ];

  // Hitung total
  let totalWorkItems = 0;
  let totalCost = 0;
  if (title === 'Work Items') {
    totalWorkItems = (items as (CostBreakdownItem & { value?: number })[]).reduce(
      (acc, item) => acc + (typeof (item as any).value === 'number' ? (item as any).value : 0),
      0,
    );
    totalCost = 0; // dihitung dari kategori lain oleh parent, tampilkan 0 di sini
  } else if (title === 'Equipment') {
    // Total biaya Equipment hanya rental
    totalCost = items.reduce((acc, item) => acc + (item.rentalRatePerDay || 0), 0);
  } else if (title === 'BBM') {
    // Total biaya BBM (fuel) saja
    totalCost = items.reduce((acc, item) => acc + ((item.cost as number) || 0), 0);
  } else {
    totalCost = items.reduce((acc, item) => acc + (item.cost || 0), 0);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-[10vw]">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full p-6 relative max-h-[90vh] flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Detail {title} ({date})</h3>
        {items.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">Tidak ada data pada periode ini.</p>
        ) : (
          <>
            <div className="overflow-y-auto flex-1 max-h-[60vh]">
              <table className="w-full text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg bg-gray-50 dark:bg-gray-800">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    {(title === 'Equipment' || title === 'BBM')
                      ? (
                        <>
                          {equipmentSubFields.map(sub => (
                            <th key={sub.key} className="p-2 text-left text-black dark:text-white">{sub.label}</th>
                          ))}
                          {title === 'BBM' && (
                            <>
                              <th className="p-2 text-left text-black dark:text-white">BBM Terpakai (L)</th>
                              <th className="p-2 text-left text-black dark:text-white">Harga BBM</th>
                            </>
                          )}
                        </>
                      )
                      : fields.map(f => (
                          <th key={f.key as string} className="p-2 text-left text-black dark:text-white">{f.label}</th>
                        ))}
                    <th className="p-2 text-center text-black dark:text-white">Biaya</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const isEquipment = title === 'Equipment';
                    const isBBM = title === 'BBM';
                    const fuelUsed = (item.fuelUsed as unknown as number) || 0;
                    const fuelPrice = (item.fuelPrice as unknown as number) || 0;
                    const fuelTotal = fuelUsed * fuelPrice;
                    const isExpanded = expandedEquipmentRows.includes(idx);
                    const totalColumns = ((isEquipment || isBBM) ? equipmentSubFields.length + (isBBM ? 2 : 0) : fields.length) + 1;

                    return (
                      <React.Fragment key={idx}>
                        <tr className="border-t border-gray-100 dark:border-white/[0.04]">
                          {(isEquipment || isBBM)
                            ? (
                              <>
                                {equipmentSubFields.map(sub => (
                                  <td key={sub.key} className="p-2 text-black dark:text-white">
                                    {item.equipment && typeof item.equipment[sub.key as keyof typeof item.equipment] !== 'object'
                                      ? String(item.equipment[sub.key as keyof typeof item.equipment] ?? '')
                                      : ''}
                                  </td>
                                ))}
                                {isBBM && (
                                  <>
                                    <td className="p-2 text-black dark:text-white">{fuelUsed}</td>
                                    <td className="p-2 text-black dark:text-white">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(fuelPrice)}/liter</td>
                                  </>
                                )}
                              </>
                            )
                            : fields.map(f => (
                                <td key={f.key as string} className="p-2 text-black dark:text-white">{typeof item[f.key] !== 'object' ? String(item[f.key] ?? '') : ''}</td>
                              ))}
                          <td className="p-2 text-center text-black dark:text-white">
                            {isEquipment
                              ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(((item.rentalRatePerDay as number) || 0))
                              : isBBM
                                ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(((item.cost as number) || fuelTotal || 0))
                                : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format((item.cost as number) || 0)}
                          </td>
                        </tr>
                        {/* Tidak ada lagi accordion BBM di modal Equipment */}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Total di luar scroll */}
            <div className="mt-4 p-3 rounded bg-orange-50 dark:bg-orange-900/30 text-black dark:text-white text-sm">
              {title === 'Work Items' && (
                <div><span className="font-semibold">Total Work Items:</span> {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalWorkItems)}</div>
              )}
              <div><span className="font-semibold">Total Cost ({title}):</span> {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalCost)}</div>
            </div>
          </>
        )}
        <button onClick={onClose} className="mt-6 px-5 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow self-end">Tutup</button>
      </div>
    </div>
  );
}

export default function SPKDetailPage() {
  const { token } = useAuth();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spkData, setSPKData] = useState<SPKDetailWithProgress | null>(null);
  const [periodType, setPeriodType] = useState<PeriodType>('daily');
  const [matrixData, setMatrixData] = useState<MatrixData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalWorkItems, setModalWorkItems] = useState<DailyActivityWorkItem[]>([]);
  const [modalDate, setModalDate] = useState("");
  const [modalCostOpen, setModalCostOpen] = useState(false);
  const [modalCostItems, setModalCostItems] = useState<CostBreakdownItem[]>([]);
  const [modalCostDate, setModalCostDate] = useState("");
  const [modalCostTitle, setModalCostTitle] = useState("");
  // Tambahkan state untuk accordion deskripsi
  const [descOpen, setDescOpen] = useState(false);

  useEffect(() => {
    const fetchSPKDetails = async () => {
      if (!token || !params.id) return;
      try {
        setLoading(true);
        const data = await getSPKDetailsWithProgress(params.id as string, token);
        setSPKData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching SPK details:', err);
        setError("Gagal mengambil detail SPK");
      } finally {
        setLoading(false);
      }
    };

    fetchSPKDetails();
  }, [token, params.id]);

  useEffect(() => {
    if (!spkData) return;

    const generateMatrixData = () => {
      const startDate = new Date(spkData.startDate || 0);
      const endDate = new Date(spkData.endDate || 0);
      let dates: Date[] = [];

      if (periodType === 'daily') {
        dates = eachDayOfInterval({ start: startDate, end: endDate });
      } else if (periodType === 'weekly') {
        dates = eachWeekOfInterval({ start: startDate, end: endDate });
      } else {
        dates = eachMonthOfInterval({ start: startDate, end: endDate });
      }

      const matrix = dates.map(date => {
        const dateStr = periodType === 'daily' 
          ? format(date, 'dd MMM yyyy', { locale: id })
          : periodType === 'weekly'
            ? `${format(startOfWeek(date, { locale: id }), 'dd MMM', { locale: id })} - ${format(endOfWeek(date, { locale: id }), 'dd MMM yyyy', { locale: id })}`
            : format(date, 'MMMM yyyy', { locale: id });

        const activities = (spkData.dailyActivities || []).filter(activity => {
          const activityDate = new Date(activity.date);
          if (periodType === 'daily') {
            return format(activityDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
          } else if (periodType === 'weekly') {
            return activityDate >= startOfWeek(date, { locale: id }) && 
                   activityDate <= endOfWeek(date, { locale: id });
          } else {
            return activityDate >= startOfMonth(date) && 
                   activityDate <= endOfMonth(date);
          }
        });

        // Ambil semua work item harian (dari seluruh aktivitas di hari/periode itu)
        const allWorkItems = activities.flatMap(a => a.workItems || []);
        // Filter hanya item dengan actual NR/R ≠ 0
        const filtered = allWorkItems.filter(item => (item.actualQuantity?.nr || 0) !== 0 || (item.actualQuantity?.r || 0) !== 0);
        const biayaWorkItems = filtered.reduce((acc, item) => {
          if (item.actualQuantity?.r && item.actualQuantity.r !== 0) {
            return acc + item.actualQuantity.r * (item.rates?.r?.rate || 0);
          } else if (item.actualQuantity?.nr && item.actualQuantity.nr !== 0) {
            return acc + item.actualQuantity.nr * (item.rates?.nr?.rate || 0);
          }
          return acc;
        }, 0);

        // Hitung daily progress dan cost
        const dailyProgress = activities.reduce((acc, activity) => {
          return activity.workItems.reduce((itemAcc, item) => {
            return {
              nr: itemAcc.nr + (item.dailyProgress?.nr || 0),
              r: itemAcc.r + (item.dailyProgress?.r || 0)
            };
          }, acc);
        }, { nr: 0, r: 0 });

        const dailyCost = activities.reduce((acc, activity) => {
          return activity.workItems.reduce((itemAcc, item) => {
            return {
              nr: itemAcc.nr + (item.dailyCost?.nr || 0),
              r: itemAcc.r + (item.dailyCost?.r || 0)
            };
          }, acc);
        }, { nr: 0, r: 0 });

        // Pisahkan biaya Equipment Rental dan BBM
        const equipmentRental = activities.reduce((acc, activity) => {
          const equipmentItems = activity.costs?.equipment?.items || [];
          const rental = equipmentItems.reduce((itemAcc, item) => {
            return itemAcc + (item.rentalRatePerDay || 0);
          }, 0);
          return acc + rental;
        }, 0);

        const bbm = activities.reduce((acc, activity) => {
          const equipmentItems = activity.costs?.equipment?.items || [];
          const fuel = equipmentItems.reduce((itemAcc, item) => {
            // gunakan item.cost jika tersedia sebagai total BBM; fallback ke fuelUsed * fuelPrice
            const fuelUsed = (item.fuelUsed as number) || 0;
            const fuelPrice = (item.fuelPrice as number) || 0;
            const fuelTotal = (item.cost as number) ?? (fuelUsed * fuelPrice);
            return itemAcc + (fuelTotal || 0);
          }, 0);
          return acc + fuel;
        }, 0);

        const manpower = activities.reduce((acc, activity) => 
          acc + (activity.costs?.manpower?.totalCost || 0), 0);
        
        const materials = activities.reduce((acc, activity) =>
          acc + (activity.costs?.materials?.totalCost || 0), 0);

        const other = activities.reduce((acc, activity) => 
          acc + (activity.costs?.otherCosts?.totalCost || 0), 0);

        const total = equipmentRental + bbm + manpower + materials + other;

        return {
          date: dateStr,
          workItems: {
            total: allWorkItems.length,
            completed: filtered.length,
            value: biayaWorkItems,
            dailyProgress,
            dailyCost
          },
          equipment: equipmentRental,
          bbm,
          manpower,
          materials,
          other,
          total
        };
      }).filter(data => 
        data.workItems.completed > 0 || 
        data.equipment > 0 || 
        data.bbm > 0 ||
        data.materials > 0 ||
        data.manpower > 0 || 
        data.other > 0
      );

      setMatrixData(matrix);
    };

    generateMatrixData();
  }, [spkData, periodType]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );
  if (error) return <div>Error: {error}</div>;
  if (!spkData) return <div>Data tidak ditemukan</div>;

  return (
    <div className="p-4 sm:p-6 xl:p-10">
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div className="flex justify-between items-center bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
          <div>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">
              Detail SPK - {spkData.spkNo}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {spkData.projectName}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriodType('daily')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                periodType === 'daily'
                  ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600'
                  : 'bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.1]'
              }`}
            >
              Harian
            </button>
            <button
              onClick={() => setPeriodType('weekly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                periodType === 'weekly'
                  ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600'
                  : 'bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.1]'
              }`}
            >
              Mingguan
            </button>
            <button
              onClick={() => setPeriodType('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                periodType === 'monthly'
                  ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600'
                  : 'bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.1]'
              }`}
            >
              Bulanan
            </button>
          </div>
        </div>
        {/* Accordion Deskripsi SPK */}
        <div className="bg-white dark:bg-white/[0.03] rounded-lg shadow-sm dark:shadow-white/[0.05]">
          <button
            className="w-full flex justify-between items-center px-6 py-4 text-left text-black dark:text-white font-semibold text-base focus:outline-none hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
            onClick={() => setDescOpen(v => !v)}
            aria-expanded={descOpen}
          >
            <span>Deskripsi SPK</span>
            <span className={`transform transition-transform ${descOpen ? 'rotate-90' : ''}`}>▶</span>
          </button>
          {descOpen && (
            <div className="px-6 pb-4 pt-2 text-sm text-gray-700 dark:text-gray-200 border-t border-gray-100 dark:border-white/[0.08] animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <div><span className="font-semibold">No SPK:</span> {spkData.spkNo}</div>
                <div><span className="font-semibold">No WAP:</span> {spkData.wapNo}</div>
                <div><span className="font-semibold">Judul:</span> {spkData.title}</div>
                <div><span className="font-semibold">Nama Proyek:</span> {spkData.projectName}</div>
                <div><span className="font-semibold">Kontraktor:</span> {spkData.contractor}</div>
                <div><span className="font-semibold">Area:</span> {spkData.location?.name || '-'}</div>
                <div><span className="font-semibold">Tanggal Mulai:</span> {spkData.startDate ? new Date(spkData.startDate).toLocaleDateString('id-ID') : '-'}</div>
                <div><span className="font-semibold">Tanggal Selesai:</span> {spkData.endDate ? new Date(spkData.endDate).toLocaleDateString('id-ID') : '-'}</div>
                <div><span className="font-semibold">Budget:</span> {spkData.budget?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || '-'}</div>
              </div>
              {spkData.workDescription && (
                <div className="mt-4"><span className="font-semibold">Deskripsi Pekerjaan:</span> {spkData.workDescription}</div>
              )}
            </div>
          )}
        </div>
        {/* Matrix Table */}
        <div className="bg-white dark:bg-white/[0.03] rounded-lg shadow-lg dark:shadow-white/[0.05] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/[0.02]">
                  <th className="border-b border-gray-200 dark:border-white/[0.05] p-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Kategori</th>
                  {matrixData.map((data, index) => (
                    <th key={index} className="border-b border-gray-200 dark:border-white/[0.05] p-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                      {data.date}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-black dark:text-white">Work Items</td>
                  {matrixData.map((data, index) => {
                    // Total Target Biaya Harian = total budget SPK / total hari kerja
                    const totalHariKerja = (spkData.startDate && spkData.endDate)
                      ? Math.max(1, Math.ceil((new Date(spkData.endDate).getTime() - new Date(spkData.startDate).getTime()) / (1000 * 60 * 60 * 24)))
                      : 1;
                    const totalTargetBiayaHarian = spkData.budget && totalHariKerja > 0 ? spkData.budget / totalHariKerja : 0;
                    // Total biaya work items hari ini
                    const biayaWorkItems = data.workItems.value;
                    // Persentase capaian hari ini (progress capaian) = total biaya / total target biaya harian * 100
                    const persentaseCapaian = totalTargetBiayaHarian > 0 ? (biayaWorkItems / totalTargetBiayaHarian) * 100 : 0;
                    return (
                      <td key={index} className="p-4 text-center text-black dark:text-white">
                        <div className="space-y-1">
                          <p className="font-medium">{data.workItems.completed} / {data.workItems.total}
                            <InfoTooltip text={"Jumlah work item yang memiliki progress aktual hari ini / total work item yang terdaftar pada hari ini."} />
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Target Biaya Hari Ini: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalTargetBiayaHarian)}
                            <InfoTooltip text={"Target biaya hari ini adalah jumlah seluruh (target harian NR * rate NR + target harian R * rate R) dari semua work item pada hari/periode ini."} />
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Biaya Work Items: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(biayaWorkItems)}
                            <InfoTooltip text={"Total biaya work items yang dikerjakan pada hari ini."} />
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Progress Capaian: {persentaseCapaian.toFixed(2)}%
                            <InfoTooltip text={"Persentase capaian hari ini = (Biaya Work Items / Total Target Biaya Harian) x 100%"} />
                          </p>
                          <button
                            className="mt-2 px-3 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow"
                            onClick={() => {
                              setModalOpen(true);
                              setModalWorkItems((spkData.dailyActivities || []).filter(activity => {
                                const activityDate = new Date(activity.date);
                                if (periodType === 'daily') {
                                  return format(activityDate, 'dd MMM yyyy', { locale: id }) === data.date;
                                } else if (periodType === 'weekly') {
                                  return (
                                    format(startOfWeek(activityDate, { locale: id }), 'dd MMM', { locale: id }) + ' - ' + format(endOfWeek(activityDate, { locale: id }), 'dd MMM yyyy', { locale: id })
                                  ) === data.date;
                                } else {
                                  return format(activityDate, 'MMMM yyyy', { locale: id }) === data.date;
                                }
                              }).flatMap(a => a.workItems || []));
                              setModalDate(data.date);
                            }}
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-black dark:text-white">Equipment</td>
                  {matrixData.map((data, index) => (
                    <td key={index} className="p-4 text-center text-black dark:text-white">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.equipment)}
                      <button
                        className="ml-2 px-2 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow"
                        onClick={() => {
                          // Ambil semua items equipment dari dailyActivities pada hari/periode ini
                          const activities = (spkData.dailyActivities || []).filter(activity => {
                            const activityDate = new Date(activity.date);
                            if (periodType === 'daily') {
                              return format(activityDate, 'dd MMM yyyy', { locale: id }) === data.date;
                            } else if (periodType === 'weekly') {
                              return (
                                format(startOfWeek(activityDate, { locale: id }), 'dd MMM', { locale: id }) + ' - ' + format(endOfWeek(activityDate, { locale: id }), 'dd MMM yyyy', { locale: id })
                              ) === data.date;
                            } else {
                              return format(activityDate, 'MMMM yyyy', { locale: id }) === data.date;
                            }
                          });
                          const items = activities.flatMap(a => a.costs?.equipment?.items || []);
                          setModalCostOpen(true);
                          setModalCostItems(items);
                          setModalCostDate(data.date);
                          setModalCostTitle('Equipment');
                        }}
                      >
                        Details
                      </button>
                    </td>
                  ))}
                </tr>
                {/* BBM row under Equipment */}
                <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-black dark:text-white">BBM</td>
                  {matrixData.map((data, index) => (
                    <td key={index} className="p-4 text-center text-black dark:text-white">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.bbm)}
                      <button
                        className="ml-2 px-2 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow"
                        onClick={() => {
                          const activities = (spkData.dailyActivities || []).filter(activity => {
                            const activityDate = new Date(activity.date);
                            if (periodType === 'daily') {
                              return format(activityDate, 'dd MMM yyyy', { locale: id }) === data.date;
                            } else if (periodType === 'weekly') {
                              return (
                                format(startOfWeek(activityDate, { locale: id }), 'dd MMM', { locale: id }) + ' - ' + format(endOfWeek(activityDate, { locale: id }), 'dd MMM yyyy', { locale: id })
                              ) === data.date;
                            } else {
                              return format(activityDate, 'MMMM yyyy', { locale: id }) === data.date;
                            }
                          });
                          const items = activities.flatMap(a => a.costs?.equipment?.items || []);
                          setModalCostOpen(true);
                          setModalCostItems(items);
                          setModalCostDate(data.date);
                          setModalCostTitle('BBM');
                        }}
                      >
                        Details
                      </button>
                    </td>
                  ))}
                </tr>
                {/* Materials row */}
                <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-black dark:text-white">Materials</td>
                  {matrixData.map((data, index) => (
                    <td key={index} className="p-4 text-center text-black dark:text-white">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.materials)}
                      <button
                        className="ml-2 px-2 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow"
                        onClick={() => {
                          const activities = (spkData.dailyActivities || []).filter(activity => {
                            const activityDate = new Date(activity.date);
                            if (periodType === 'daily') {
                              return format(activityDate, 'dd MMM yyyy', { locale: id }) === data.date;
                            } else if (periodType === 'weekly') {
                              return (
                                format(startOfWeek(activityDate, { locale: id }), 'dd MMM', { locale: id }) + ' - ' + format(endOfWeek(activityDate, { locale: id }), 'dd MMM yyyy', { locale: id })
                              ) === data.date;
                            } else {
                              return format(activityDate, 'MMMM yyyy', { locale: id }) === data.date;
                            }
                          });
                          const items = activities.flatMap(a => a.costs?.materials?.items || []);
                          setModalCostOpen(true);
                          setModalCostItems(items);
                          setModalCostDate(data.date);
                          setModalCostTitle('Materials');
                        }}
                      >
                        Details
                      </button>
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-black dark:text-white">Manpower</td>
                  {matrixData.map((data, index) => (
                    <td key={index} className="p-4 text-center text-black dark:text-white">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.manpower)}
                      <button
                        className="ml-2 px-2 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow"
                        onClick={() => {
                          const activities = (spkData.dailyActivities || []).filter(activity => {
                            const activityDate = new Date(activity.date);
                            if (periodType === 'daily') {
                              return format(activityDate, 'dd MMM yyyy', { locale: id }) === data.date;
                            } else if (periodType === 'weekly') {
                              return (
                                format(startOfWeek(activityDate, { locale: id }), 'dd MMM', { locale: id }) + ' - ' + format(endOfWeek(activityDate, { locale: id }), 'dd MMM yyyy', { locale: id })
                              ) === data.date;
                            } else {
                              return format(activityDate, 'MMMM yyyy', { locale: id }) === data.date;
                            }
                          });
                          const items = activities.flatMap(a => a.costs?.manpower?.items || []);
                          setModalCostOpen(true);
                          setModalCostItems(items);
                          setModalCostDate(data.date);
                          setModalCostTitle('Manpower');
                        }}
                      >
                        Details
                      </button>
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-black dark:text-white">Other Costs</td>
                  {matrixData.map((data, index) => (
                    <td key={index} className="p-4 text-center text-black dark:text-white">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.other)}
                      <button
                        className="ml-2 px-2 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow"
                        onClick={() => {
                          const activities = (spkData.dailyActivities || []).filter(activity => {
                            const activityDate = new Date(activity.date);
                            if (periodType === 'daily') {
                              return format(activityDate, 'dd MMM yyyy', { locale: id }) === data.date;
                            } else if (periodType === 'weekly') {
                              return (
                                format(startOfWeek(activityDate, { locale: id }), 'dd MMM', { locale: id }) + ' - ' + format(endOfWeek(activityDate, { locale: id }), 'dd MMM yyyy', { locale: id })
                              ) === data.date;
                            } else {
                              return format(activityDate, 'MMMM yyyy', { locale: id }) === data.date;
                            }
                          });
                          const items = activities.flatMap(a => a.costs?.otherCosts?.items || []);
                          setModalCostOpen(true);
                          setModalCostItems(items);
                          setModalCostDate(data.date);
                          setModalCostTitle('Other Costs');
                        }}
                      >
                        Details
                      </button>
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors">
                  <td className="p-4 font-medium text-black dark:text-white">Total Work Items</td>
                  {matrixData.map((data, index) => (
                    <td key={index} className="p-4 text-center font-medium text-black dark:text-white">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.workItems.value)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors">
                  <td className="p-4 font-medium text-black dark:text-white">Total Cost (Equipment, BBM, Manpower, Other)</td>
                  {matrixData.map((data, index) => (
                    <td key={index} className="p-4 text-center font-medium text-black dark:text-white">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.total)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-orange-50 dark:bg-orange-500/[0.1] hover:bg-orange-100 dark:hover:bg-orange-500/[0.15] transition-colors">
                  <td className="p-4 font-medium text-black dark:text-white">Laba/Rugi</td>
                  {matrixData.map((data, index) => {
                    const profit = data.workItems.value - data.total;
                    return (
                      <td key={index} className={`p-4 text-center font-medium ${
                        profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(profit)}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <WorkItemDetailsModal open={modalOpen} onClose={() => setModalOpen(false)} workItems={modalWorkItems} date={modalDate} />
        <CostDetailsModal open={modalCostOpen} onClose={() => setModalCostOpen(false)} items={modalCostItems} date={modalCostDate} title={modalCostTitle} />
      </div>
    </div>
  );
}