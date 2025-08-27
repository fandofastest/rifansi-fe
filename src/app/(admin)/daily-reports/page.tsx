"use client";

import React, { useEffect, useState } from "react";
import { DailyReportTable } from "@/components/tables/DailyReportTable";
import Select from "@/components/ui/select/Select";
import { useAuth } from "@/context/AuthContext";
import { getSPKListLite, getSPKDetailsWithProgress, SPKDetailWithProgress } from "@/services/spk";

export default function DailyReportsPage() {
  const { token } = useAuth();
  const [spkOptions, setSpkOptions] = useState<{ id: string; label: string }[]>([]);
  const [selectedSpkId, setSelectedSpkId] = useState<string>("");
  const [loadingSpk, setLoadingSpk] = useState<boolean>(false);
  const [spkDetails, setSpkDetails] = useState<SPKDetailWithProgress | null>(null);
  const [loadingSpkDetail, setLoadingSpkDetail] = useState<boolean>(false);

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

  // Load SPK details when a specific SPK is selected
  useEffect(() => {
    const loadSpkDetails = async () => {
      if (!token || !selectedSpkId) {
        setSpkDetails(null);
        return;
      }
      try {
        setLoadingSpkDetail(true);
        const details = await getSPKDetailsWithProgress(selectedSpkId, token);
        setSpkDetails(details);
      } catch (e) {
        console.error("Failed to load SPK details with progress", e);
        setSpkDetails(null);
      } finally {
        setLoadingSpkDetail(false);
      }
    };
    loadSpkDetails();
  }, [token, selectedSpkId]);

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
        </div>

        {/* SPK Budget summary when a specific SPK selected */}
        {selectedSpkId && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]"
            >
              <div className="shrink-0 h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-500/10">
                Rp
              </div>
              <div className="min-w-0">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Budget</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap truncate">
                  {loadingSpkDetail ? "Memuat..." : formatCurrencyFull(spkDetails?.totalProgress?.totalBudget ?? spkDetails?.budget ?? 0)}
                </div>
              </div>
            </div>
            <div
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]"
            >
              <div className="shrink-0 h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-500/10">
                Sisa
              </div>
              <div className="min-w-0">
                <div className="text-sm text-gray-500 dark:text-gray-400">Sisa Budget</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap truncate">
                  {loadingSpkDetail ? "Memuat..." : (() => {
                    const total = spkDetails?.totalProgress?.totalBudget ?? spkDetails?.budget ?? 0;
                    const spent = spkDetails?.totalProgress?.totalSpent ?? 0;
                    const remaining = spkDetails?.totalProgress?.remainingBudget ?? (total - spent);
                    return formatCurrencyFull(remaining);
                  })()}
                </div>
              </div>
            </div>
            <div
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]"
            >
              <div className="shrink-0 h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-500/10">
                Sales
              </div>
              <div className="min-w-0">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Sales</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap truncate">
                  {loadingSpkDetail ? "Memuat..." : (() => {
                    const total = spkDetails?.totalProgress?.totalBudget ?? spkDetails?.budget ?? 0;
                    const percentage = spkDetails?.totalProgress?.percentage ?? 0;
                    const apiSales = spkDetails?.totalProgress?.totalSales;
                    const computed = (percentage / 100) * total;
                    const value = typeof apiSales === 'number' ? apiSales : computed;
                    return formatCurrencyFull(value);
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
        <DailyReportTable spkId={selectedSpkId || undefined} />
      </div>
    </div>
  );
}