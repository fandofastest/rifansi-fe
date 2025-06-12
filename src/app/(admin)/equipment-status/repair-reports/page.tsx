"use client";

import React from "react";
import { RepairReportsTable } from "@/components/tables/RepairReportsTable";

export default function RepairReportsPage() {
  return (
    <div className="p-4 sm:p-6 xl:p-10">
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div className="flex justify-between items-center bg-white dark:bg-white/[0.03] p-6 rounded-lg shadow-sm dark:shadow-white/[0.05]">
          <div>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">
              Laporan Kerusakan Alat
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola laporan kerusakan dan perbaikan peralatan
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-white/[0.03] rounded-lg shadow-sm dark:shadow-white/[0.05]">
          <RepairReportsTable />
        </div>
      </div>
    </div>
  );
} 