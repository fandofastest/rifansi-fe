"use client";

import React, { useState, useEffect, useMemo } from "react";

import { useAuth } from "@/context/AuthContext";
import { getSPKListLite, getSPKDetailsWithProgress, SPKListItem, SPKDetailWithProgress } from "@/services/spk";

import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { id } from "date-fns/locale";
import dynamic from "next/dynamic";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const SummaryCards = React.memo(function SummaryCards({
  totalActivities,
  totalBudget,
  totalSpent,
  totalSales,
  avgProgress,
}: {
  totalActivities: number;
  totalBudget: number;
  totalSpent: number;
  totalSales: number;
  avgProgress: number;
}) {
  const [showBudgetDetail, setShowBudgetDetail] = useState(false);
  const [showCostDetail, setShowCostDetail] = useState(false);
  const [showSalesDetail, setShowSalesDetail] = useState(false);
  const [showProgressDetail, setShowProgressDetail] = useState(false);

  const truncate2 = (value: number) => Math.trunc(value * 100) / 100;
  const formatCurrencyFull = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  const formatShortIDR = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} M`;
    } else if (abs >= 1_000_000) {
      return `${(value / 1_000_000).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} jt`;
    }
    return value.toLocaleString('id-ID');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      <div className="bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Aktivitas</p>
            <p className="text-2xl font-bold text-black dark:text-white whitespace-nowrap truncate leading-tight">{totalActivities}</p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full shrink-0">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 leading-tight whitespace-nowrap truncate">
              {formatShortIDR(totalBudget)}
            </p>
            {showBudgetDetail && (
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{formatCurrencyFull(totalBudget)}</p>
            )}
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full shrink-0">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <button
            className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/10"
            onClick={() => setShowBudgetDetail((v) => !v)}
          >
            {showBudgetDetail ? 'Sembunyikan' : 'Detail'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 leading-tight whitespace-nowrap truncate">
              {formatShortIDR(totalSpent)}
            </p>
            {showCostDetail && (
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{formatCurrencyFull(totalSpent)}</p>
            )}
          </div>
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full shrink-0">
            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <button
            className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/10"
            onClick={() => setShowCostDetail((v) => !v)}
          >
            {showCostDetail ? 'Sembunyikan' : 'Detail'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sales</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 leading-tight whitespace-nowrap truncate">
              {formatShortIDR(totalSales)}
            </p>
            {showSalesDetail && (
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{formatCurrencyFull(totalSales)}</p>
            )}
          </div>
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full shrink-0">
            <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4l3 10 4-18 3 8h4" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <button
            className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/10"
            onClick={() => setShowSalesDetail((v) => !v)}
          >
            {showSalesDetail ? 'Sembunyikan' : 'Detail'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress Total</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 leading-tight whitespace-nowrap truncate">
              {truncate2(avgProgress).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
            </p>
            {showProgressDetail && (
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{`${avgProgress.toLocaleString('id-ID', { maximumFractionDigits: 6 })}%`}</p>
            )}
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full shrink-0">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <button
            className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/10"
            onClick={() => setShowProgressDetail((v) => !v)}
          >
            {showProgressDetail ? 'Sembunyikan' : 'Detail'}
          </button>
        </div>
      </div>
    </div>
  );
});

// Lightweight memoized Chart wrappers to avoid unnecessary re-renders
type ApexOptions = any;
type ApexSeries = any;

const ProgressChart = React.memo(function ProgressChart({ options, series }: { options: ApexOptions; series: ApexSeries }) {
  return (
    <ReactApexChart options={options} series={series} type="line" height={350} />
  );
});

const BudgetChart = React.memo(function BudgetChart({ options, series }: { options: ApexOptions; series: ApexSeries }) {
  return (
    <ReactApexChart options={options} series={series} type="bar" height={350} />
  );
});

const CostBreakdownChart = React.memo(function CostBreakdownChart({ options, series }: { options: ApexOptions; series: ApexSeries }) {
  return (
    <ReactApexChart options={options} series={series} type="area" height={350} />
  );
});

const SummaryTable = React.memo(function SummaryTable({ tableTotals }: { tableTotals: {
  totalEquipment: number; totalFuel: number; totalManpower: number; totalMaterial: number; totalOther: number; totalCost: number; rows: { name: string; value: number; color: string; }[];
} }) {
  return (
    <div className="bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
      <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Ringkasan Keuangan</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-white/[0.02]">
              <th className="border-b border-gray-200 dark:border-white/[0.05] p-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Kategori</th>
              <th className="border-b border-gray-200 dark:border-white/[0.05] p-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">Total Biaya</th>
              <th className="border-b border-gray-200 dark:border-white/[0.05] p-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">Persentase</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
            {tableTotals.rows.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="p-4 text-black dark:text-white">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    {item.name}
                  </div>
                </td>
                <td className="p-4 text-center text-black dark:text-white">
                  {new Intl.NumberFormat('id-ID', { 
                    style: 'currency', 
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(item.value)}
                </td>
                <td className="p-4 text-center text-black dark:text-white">
                  {tableTotals.totalCost > 0 ? ((item.value / tableTotals.totalCost) * 100).toFixed(1) : '0'}%
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 dark:bg-white/[0.02] font-semibold">
              <td className="p-4 text-black dark:text-white">Total</td>
              <td className="p-4 text-center text-black dark:text-white">
                {new Intl.NumberFormat('id-ID', { 
                  style: 'currency', 
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(tableTotals.totalCost)}
              </td>
              <td className="p-4 text-center text-black dark:text-white">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
});

interface ChartData {
  dates: string[];
  progressData: number[];
  budgetData: number[];
  equipmentData: number[];
  fuelData: number[];
  manpowerData: number[];
  materialData: number[];
  otherCostsData: number[];
}

// DatePicker Component
function DatePicker({ 
  value, 
  onChange, 
  placeholder 
}: { 
  value: string; 
  onChange: (date: string) => void; 
  placeholder: string; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(value ? new Date(value) : new Date()));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange(format(selectedDate, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onChange(format(today, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value ? format(new Date(value), 'dd MMM yyyy', { locale: id }) : ''}
        placeholder={placeholder}
        onClick={() => setIsOpen(!isOpen)}
        readOnly
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-black dark:text-white cursor-pointer w-full"
      />
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-semibold text-black dark:text-white">
              {format(currentMonth, 'MMMM yyyy', { locale: id })}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Today button */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={goToToday}
              className="w-full text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-1 rounded"
            >
              Hari Ini
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => day && handleDateSelect(day)}
                disabled={!day}
                className={`
                  p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700
                  ${!day ? 'invisible' : ''}
                  ${day && value && format(new Date(value), 'yyyy-MM-dd') === format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), 'yyyy-MM-dd')
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'text-black dark:text-white'
                  }
                  ${day && new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) < new Date(new Date().setHours(0, 0, 0, 0))
                    ? 'text-gray-400 dark:text-gray-500'
                    : ''
                  }
                `}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DailyReportSummaryPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spkList, setSPKList] = useState<SPKListItem[]>([]);
  const [selectedSPK, setSelectedSPK] = useState<string>('');
  const [spkDetails, setSPKDetails] = useState<SPKDetailWithProgress | null>(null);
  const [chartData, setChartData] = useState<ChartData>({
    dates: [],
    progressData: [],
    budgetData: [],
    equipmentData: [],
    fuelData: [],
    manpowerData: [],
    materialData: [],
    otherCostsData: [],
  });
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  // Fetch SPK list
  useEffect(() => {
    const fetchSPKList = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await getSPKListLite(token);
        console.log('SPK List (lite):', data);
        setSPKList(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching SPK list:', err);
        setError("Gagal mengambil daftar SPK");
      } finally {
        setLoading(false);
      }
    };

    fetchSPKList();
  }, [token]);

  // Fetch SPK details when selected or date range changes
  useEffect(() => {
    const fetchSPKDetails = async () => {
      if (!token || !selectedSPK) return;
      try {
        setLoading(true);
        const data = await getSPKDetailsWithProgress(
          selectedSPK,
          token,
          dateRange.startDate,
          dateRange.endDate
        );
        console.log('SPK Details (original):', data);
        
        // Filter hanya dailyActivities dengan status "Approved"
        const filteredData = {
          ...data,
          dailyActivities: data.dailyActivities.filter(activity => activity.status === 'Approved')
        };
        
        console.log('SPK Details (filtered - Approved only):', filteredData);
        setSPKDetails(filteredData);
        setError(null);
      } catch (err) {
        console.error('Error fetching SPK details:', err);
        setError("Gagal mengambil detail SPK");
      } finally {
        setLoading(false);
      }
    };

    fetchSPKDetails();
  }, [token, selectedSPK, dateRange.startDate, dateRange.endDate]);

  // Generate chart data from SPK details
  useEffect(() => {
    if (!spkDetails) return;

    console.log('SPK Details for chart:', spkDetails);
    
    // Generate chart data based on date range
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    const chartData: ChartData = {
      dates: dates.map(date => format(date, 'dd MMM', { locale: id })),
      progressData: [],
      budgetData: [],
      equipmentData: [],
      fuelData: [],
      manpowerData: [],
      materialData: [],
      otherCostsData: [],
    };

    dates.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      // Find activities for this date (compare ISO string date only)
      const activitiesForDate = (spkDetails.dailyActivities || []).filter(activity => {
        if (!activity.date) return false;
        // activity.date is ISO string, compare only yyyy-MM-dd
        const activityDateStr = format(new Date(activity.date), 'yyyy-MM-dd');
        return activityDateStr === dateStr;
      });

      // Progress percentage (average)
      const avgProgress = activitiesForDate.length > 0 
        ? activitiesForDate.reduce((sum, activity) => {
            // Calculate average progress from work items
            const workItemProgress = activity.workItems.reduce((itemSum, item) => {
              const totalVolume = (item.boqVolume?.nr || 0) + (item.boqVolume?.r || 0);
              const completedVolume = (item.actualQuantity?.nr || 0) + (item.actualQuantity?.r || 0);
              return itemSum + (totalVolume > 0 ? (completedVolume / totalVolume) * 100 : 0);
            }, 0);
            return sum + (activity.workItems.length > 0 ? (workItemProgress / activity.workItems.length) : 0);
          }, 0) / activitiesForDate.length
        : 0;
      chartData.progressData.push(avgProgress);

      // Budget usage (sum of equipment rental + fuel + manpower + materials + other)
      const totalBudget = activitiesForDate.reduce((sum, activity) => {
        const equipmentItems = activity.costs?.equipment?.items || [];
        // Equipment rental per day: flat 1 day if any workingHours > 0
        const equipmentRental = equipmentItems.reduce((s, it) => {
          const wh = (it as any)?.workingHours || 0;
          const ratePerDay = (it as any)?.rentalRatePerDay || 0;
          const days = wh > 0 ? 1 : 0;
          return s + days * ratePerDay;
        }, 0);
        // Fuel: fuelUsed * fuelPrice
        const fuel = equipmentItems.reduce((s, it) => {
          const used = it?.fuelUsed || 0;
          const price = it?.fuelPrice || 0;
          return s + used * price;
        }, 0);
        const manpower = activity.costs?.manpower?.totalCost || 0;
        const materials = activity.costs?.materials?.totalCost || 0;
        const other = activity.costs?.otherCosts?.totalCost || 0;
        return sum + equipmentRental + fuel + manpower + materials + other;
      }, 0);
      chartData.budgetData.push(totalBudget);

      // Equipment costs: workingHours * rentalRatePerDay (exclude fuel)
      const equipmentCosts = activitiesForDate.reduce((sum, activity) => {
        const items = activity.costs?.equipment?.items || [];
        const rental = items.reduce((s, it) => {
          const wh = (it as any)?.workingHours || 0;
          const ratePerDay = (it as any)?.rentalRatePerDay || 0;
          const days = wh > 0 ? 1 : 0;
          return s + days * ratePerDay;
        }, 0);
        return sum + rental;
      }, 0);
      chartData.equipmentData.push(equipmentCosts);

      // Fuel (BBM) costs
      const fuelCosts = activitiesForDate.reduce((sum, activity) => {
        return sum + (activity.costs?.equipment?.items || []).reduce((s, it) => {
          const used = it?.fuelUsed || 0;
          const price = it?.fuelPrice || 0;
          return s + used * price;
        }, 0);
      }, 0);
      chartData.fuelData.push(fuelCosts);

      // Manpower costs
      const manpowerCosts = activitiesForDate.reduce((sum, activity) => {
        return sum + (activity.costs?.manpower?.totalCost || 0);
      }, 0);
      chartData.manpowerData.push(manpowerCosts);

      // Material costs
      const materialCosts = activitiesForDate.reduce((sum, activity) => {
        return sum + (activity.costs?.materials?.totalCost || 0);
      }, 0);
      chartData.materialData.push(materialCosts);

      // Other costs
      const otherCosts = activitiesForDate.reduce((sum, activity) => {
        return sum + (activity.costs?.otherCosts?.totalCost || 0);
      }, 0);
      chartData.otherCostsData.push(otherCosts);
    });

    console.log('Generated Chart Data:', chartData);
    setChartData(chartData);
  }, [spkDetails, dateRange]);

  // Progress Chart Options (memoized)
  const progressChartOptions = useMemo(() => ({
    chart: {
      type: 'line' as const,
      height: 350,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
      redrawOnParentResize: false,
      redrawOnWindowResize: false,
      animations: { enabled: false },
    },
    colors: ['#10B981'],
    stroke: {
      curve: "smooth" as const,
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.3,
        opacityTo: 0.1,
      },
    },
    markers: {
      size: 5,
      colors: ['#10B981'],
      strokeColors: '#fff',
      strokeWidth: 2,
    },
    xaxis: {
      categories: chartData.dates,
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Progress (%)',
        style: {
          color: '#6B7280',
          fontSize: '14px',
        },
      },
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
        formatter: (value: number) => `${value.toFixed(1)}%`,
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value.toFixed(1)}%`,
      },
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 5,
    },
  }), [chartData.dates]);

  const progressSeries = useMemo(() => (
    [{ name: 'Progress (%)', data: chartData.progressData }]
  ), [chartData.progressData]);

  // Budget Chart Options (memoized)
  const budgetChartOptions = useMemo(() => ({
    chart: {
      type: 'bar' as const,
      height: 350,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
      redrawOnParentResize: false,
      redrawOnWindowResize: false,
      animations: { enabled: false },
    },
    colors: ['#3B82F6'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 5,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: chartData.dates,
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Budget (IDR)',
        style: {
          color: '#6B7280',
          fontSize: '14px',
        },
      },
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
        formatter: (value: number) => {
          if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
          } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
          }
          return value.toString();
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => 
          new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value),
      },
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 5,
    },
  }), [chartData.dates]);

  const budgetSeries = useMemo(() => (
    [{ name: 'Budget (IDR)', data: chartData.budgetData }]
  ), [chartData.budgetData]);

  // Helper: truncate to 2 decimals (no rounding)
  const truncate2 = (value: number) => Math.trunc(value * 100) / 100;

  // Toggle detail view for summary cards (avoid heavy hover handlers)
  const [showBudgetDetail, setShowBudgetDetail] = useState(false);
  const [showCostDetail, setShowCostDetail] = useState(false);
  const [showSalesDetail, setShowSalesDetail] = useState(false);
  const [showProgressDetail, setShowProgressDetail] = useState(false);

  // Cost Breakdown Chart Options (memoized)
  const costChartOptions = useMemo(() => ({
    chart: {
      type: 'area' as const,
      height: 350,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
      stacked: true,
      redrawOnParentResize: false,
      redrawOnWindowResize: false,
      animations: { enabled: false },
    },
    colors: ['#3B82F6', '#F97316', '#10B981', '#F59E0B', '#EF4444'],
    stroke: {
      curve: "smooth" as const,
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.6,
        opacityTo: 0.1,
      },
    },
    xaxis: {
      categories: chartData.dates,
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Cost (IDR)',
        style: {
          color: '#6B7280',
          fontSize: '14px',
        },
      },
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
        formatter: (value: number) => {
          if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
          } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
          }
          return value.toString();
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => 
          new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value),
      },
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'left' as const,
      fontSize: '14px',
      fontFamily: 'Outfit, sans-serif',
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 5,
    },
  }), [chartData.dates]);

  const costSeries = useMemo(() => ([
    { name: 'Equipment', data: chartData.equipmentData },
    { name: 'BBM', data: chartData.fuelData },
    { name: 'Manpower', data: chartData.manpowerData },
    { name: 'Material', data: chartData.materialData },
    { name: 'Lainnya', data: chartData.otherCostsData },
  ]), [
    chartData.equipmentData,
    chartData.fuelData,
    chartData.manpowerData,
    chartData.materialData,
    chartData.otherCostsData,
  ]);

  // Memoized totals for the summary table to avoid heavy recomputation on parent re-renders
  const tableTotals = useMemo(() => {
    const totalEquipment = chartData.equipmentData.reduce((sum, val) => sum + val, 0);
    const totalFuel = chartData.fuelData.reduce((sum, val) => sum + val, 0);
    const totalManpower = chartData.manpowerData.reduce((sum, val) => sum + val, 0);
    const totalMaterial = chartData.materialData.reduce((sum, val) => sum + val, 0);
    const totalOther = chartData.otherCostsData.reduce((sum, val) => sum + val, 0);
    const totalCost = totalEquipment + totalFuel + totalManpower + totalMaterial + totalOther;

    const rows = [
      { name: 'Equipment', value: totalEquipment, color: '#3B82F6' },
      { name: 'BBM', value: totalFuel, color: '#F97316' },
      { name: 'Manpower', value: totalManpower, color: '#10B981' },
      { name: 'Material', value: totalMaterial, color: '#F59E0B' },
      { name: 'Other Costs', value: totalOther, color: '#EF4444' },
    ];

    return { totalEquipment, totalFuel, totalManpower, totalMaterial, totalOther, totalCost, rows };
  }, [
    chartData.equipmentData,
    chartData.fuelData,
    chartData.manpowerData,
    chartData.materialData,
    chartData.otherCostsData,
  ]);

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: value,
    }));
  };

  const handleSPKChange = (spkId: string) => {
    setSelectedSPK(spkId);
  };

  // Calculate summary statistics
  const totalActivities = spkDetails?.dailyActivities?.length || 0;
  const totalBudget = spkDetails?.totalProgress?.totalBudget ?? spkDetails?.budget ?? 0;
  // Use computed total from per-day budget data to match equipment/BBM logic
  const totalSpent = chartData.budgetData.reduce((sum, val) => sum + val, 0);
  const avgProgress = spkDetails?.totalProgress?.percentage || 0;
  const totalSales = spkDetails?.totalProgress?.totalSales ?? (avgProgress / 100) * totalBudget;

  // Helpers: short currency and full currency (for tooltip)
  const formatCurrencyFull = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatShortIDR = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) {
      // Display billions as millions using comma separators, e.g., 2,115M for 2,115,036,830
      return `${(value / 1_000_000).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}M`;
    } else if (abs >= 1_000_000) {
      // Juta => jt, show 1 decimal and use comma as decimal separator (e.g., 25,7 jt)
      const millions = value / 1_000_000;
      const en = millions.toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
      // Convert decimal point to comma for readability per request
      const withCommaDecimal = en.replace('.', ',');
      return `${withCommaDecimal} jt`;
    }
    return value.toLocaleString('id-ID');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 sm:p-6 xl:p-10">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 xl:p-10">
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
          <div>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">
              Ringkasan Laporan SPK
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Analisis dan visualisasi data laporan SPK
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedSPK}
              onChange={(e) => handleSPKChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-black dark:text-white"
            >
              <option value="">Pilih SPK</option>
              {spkList.map((spk) => (
                <option key={spk.id} value={spk.id}>
                  {spk.spkNo} - {spk.projectName}
                </option>
              ))}
            </select>
            <DatePicker
              value={dateRange.startDate}
              onChange={(value) => handleDateRangeChange('start', value)}
              placeholder="Pilih tanggal mulai"
            />
            <span className="text-gray-500 dark:text-gray-400 self-center">s/d</span>
            <DatePicker
              value={dateRange.endDate}
              onChange={(value) => handleDateRangeChange('end', value)}
              placeholder="Pilih tanggal akhir"
            />
          </div>
        </div>

        {!selectedSPK && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200">Silakan pilih SPK terlebih dahulu untuk melihat ringkasan</p>
          </div>
        )}

        {selectedSPK && spkDetails && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Aktivitas</p>
                    <p className="text-2xl font-bold text-black dark:text-white whitespace-nowrap truncate leading-tight">{totalActivities}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full shrink-0">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 leading-tight whitespace-nowrap truncate">
                      {formatShortIDR(totalBudget)}
                    </p>
                    {showBudgetDetail && (
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{formatCurrencyFull(totalBudget)}</p>
                    )}
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full shrink-0">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/10"
                    onClick={() => setShowBudgetDetail((v) => !v)}
                  >
                    {showBudgetDetail ? 'Sembunyikan' : 'Detail'}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 leading-tight whitespace-nowrap truncate">
                      {formatShortIDR(totalSpent)}
                    </p>
                    {showCostDetail && (
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{formatCurrencyFull(totalSpent)}</p>
                    )}
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full shrink-0">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/10"
                    onClick={() => setShowCostDetail((v) => !v)}
                  >
                    {showCostDetail ? 'Sembunyikan' : 'Detail'}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sales</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 leading-tight whitespace-nowrap truncate">
                      {formatShortIDR(totalSales)}
                    </p>
                    {showSalesDetail && (
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{formatCurrencyFull(totalSales)}</p>
                    )}
                  </div>
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full shrink-0">
                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4l3 10 4-18 3 8h4" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/10"
                    onClick={() => setShowSalesDetail((v) => !v)}
                  >
                    {showSalesDetail ? 'Sembunyikan' : 'Detail'}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress Total</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 leading-tight whitespace-nowrap truncate">
                      {truncate2(avgProgress).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                    </p>
                    {showProgressDetail && (
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{`${avgProgress.toLocaleString('id-ID', { maximumFractionDigits: 6 })}%`}</p>
                    )}
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full shrink-0">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/10"
                    onClick={() => setShowProgressDetail((v) => !v)}
                  >
                    {showProgressDetail ? 'Sembunyikan' : 'Detail'}
                  </button>
                </div>
              </div>
            </div>

            {/* Tooltip removed; using click-to-toggle details */}

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6">
              {/* Progress Chart */}
              <div className="bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Progress Harian</h3>
                <ProgressChart options={progressChartOptions} series={progressSeries} />
              </div>

              {/* Budget Chart */}
              <div className="bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Penggunaan Budget</h3>
                <BudgetChart options={budgetChartOptions} series={budgetSeries} />
              </div>
            </div>

            {/* Cost Breakdown Chart */}
            <div className="bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Breakdown Biaya</h3>
              <CostBreakdownChart options={costChartOptions} series={costSeries} />
            </div>

            {/* Summary Table */}
            <SummaryTable tableTotals={tableTotals} />
          </>
        )}
      </div>
    </div>
  );
} 