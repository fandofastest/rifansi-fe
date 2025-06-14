"use client";

import React from "react";
import { DailyReportTable } from "@/components/tables/DailyReportTable";

export default function DailyReportsPage() {
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
        <DailyReportTable />
      </div>
    </div>
  );
} 