"use client";

import React, { useEffect, useState } from "react";

import { DailyReportTable } from "@/components/tables/DailyReportTable";
import Select from "@/components/ui/select/Select";
import { useAuth } from "@/context/AuthContext";
import { getSPKListLite } from "@/services/spk";
import { format, subDays } from "date-fns";
import { id } from "date-fns/locale";

export default function DailyReportsPage() {
  const { token } = useAuth();
  const [spkOptions, setSpkOptions] = useState<{ id: string; label: string }[]>([]);
  const [selectedSpkId, setSelectedSpkId] = useState<string>("");
  const [loadingSpk, setLoadingSpk] = useState<boolean>(false);
  const [totalActivities, setTotalActivities] = useState<number>(0);
  const [totalSales, setTotalSales] = useState<number>(0);

  // Date range state (default last 30 days)
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>(
    {
      startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
    }
  );

  // Inline DatePicker (same UX style as summary page)
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
    
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const handleDateSelect = (day: number) => {
      const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      onChange(format(selectedDate, 'yyyy-MM-dd'));
      setIsOpen(false);
    };

    const goToPreviousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const goToNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const goToToday = () => {
      const today = new Date();
      setCurrentMonth(today);
      onChange(format(today, 'yyyy-MM-dd'));
      setIsOpen(false);
    };

    return (
      <div className="relative min-w-[220px]">
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
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <button onClick={goToPreviousMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-semibold text-black dark:text-white">{format(currentMonth, 'MMMM yyyy', { locale: id })}</span>
              <button onClick={goToNextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <button onClick={goToToday} className="w-full text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-1 rounded">Hari Ini</button>
            </div>
            <div className="grid grid-cols-7 gap-1 p-2">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 p-2">
              {days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => day && handleDateSelect(day)}
                  disabled={!day}
                  className={`p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${!day ? 'invisible' : ''} ${day && value && format(new Date(value), 'yyyy-MM-dd') === format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), 'yyyy-MM-dd') ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-black dark:text-white'}`}
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

  // Helpers for IDR formatting
  const formatCurrencyFull = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatShortIDR = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 1 })} M`;
    } else if (abs >= 1_000_000) {
      return `${(value / 1_000_000).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 1 })} jt`;
    }
    return value.toLocaleString("id-ID");
  };

  useEffect(() => {
    const loadSpks = async () => {
      if (!token) return;
      try {
        setLoadingSpk(true);
        const spks = await getSPKListLite(token);
        const opts = spks.map((s) => ({ id: s.id, label: `${s.spkNo} - ${s.title}` }));
        setSpkOptions(opts);
      } catch (e) {
        console.error("Failed to load SPKs lite", e);
      } finally {
        setLoadingSpk(false);
      }
    };
    loadSpks();
  }, [token]);

  // Removed SPK details auto-fetch and summary cards for performance

  return (
    <div className="p-4 sm:p-6 xl:p-10">
      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">
              Daftar Laporan Harian
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Kelola dan lihat semua laporan harian
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="w-full sm:w-80">
            <label className="block mb-1 text-sm text-gray-600 dark:text-gray-300">Filter SPK</label>
            <Select
              value={selectedSpkId}
              onChange={(e) => setSelectedSpkId(e.target.value)}
              disabled={loadingSpk}
            >
              {loadingSpk ? (
                <option value="" disabled>Memuat SPK...</option>
              ) : (
                <>
                  <option value="">Semua SPK</option>
                  {spkOptions.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </>
              )}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <label className="block mb-1 text-sm text-gray-600 dark:text-gray-300">Tanggal Mulai</label>
              <DatePicker
                value={dateRange.startDate}
                onChange={(val) => setDateRange((prev) => ({ ...prev, startDate: val }))}
                placeholder="Pilih tanggal mulai"
              />
            </div>
            <span className="mt-6 text-gray-500 dark:text-gray-400">s/d</span>
            <div>
              <label className="block mb-1 text-sm text-gray-600 dark:text-gray-300">Tanggal Akhir</label>
              <DatePicker
                value={dateRange.endDate}
                onChange={(val) => setDateRange((prev) => ({ ...prev, endDate: val }))}
                placeholder="Pilih tanggal akhir"
              />
            </div>
          </div>
          {/* Totals aligned with date pickers (compact badges) */}
          <div className="mt-2 sm:mt-6 flex gap-3 items-end">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-gray-800 dark:bg-white/[0.03] dark:border-white/[0.06] dark:text-gray-100">
              <span className="text-xs text-gray-600 dark:text-gray-300">Total Aktivitas</span>
              <span className="text-base font-semibold">{totalActivities}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 border border-gray-200 text-gray-800 dark:bg-white/[0.03] dark:border-white/[0.06] dark:text-gray-100">
              <span className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">Total Nilai Aktivitas</span>
              <span className="text-base font-semibold whitespace-nowrap">{formatCurrencyFull(totalSales)}</span>
            </div>
          </div>
        </div>

        {/* Summary cards removed */}
        <DailyReportTable 
          spkId={selectedSpkId || undefined}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onTotalsChange={({ totalActivities, totalSales }) => { setTotalActivities(totalActivities); setTotalSales(totalSales); }}
        />
      </div>
    </div>
  );
}