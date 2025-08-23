"use client";

import React, { useEffect, useState } from "react";
import { DailyReportTable } from "@/components/tables/DailyReportTable";
import Select from "@/components/ui/select/Select";
import { useAuth } from "@/context/AuthContext";
import { getSPKListLite } from "@/services/spk";

export default function DailyReportsPage() {
  const { token } = useAuth();
  const [spkOptions, setSpkOptions] = useState<{ id: string; label: string }[]>([]);
  const [selectedSpkId, setSelectedSpkId] = useState<string>("");
  const [loadingSpk, setLoadingSpk] = useState<boolean>(false);

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
        <DailyReportTable spkId={selectedSpkId || undefined} />
      </div>
    </div>
  );
}