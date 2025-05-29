"use client";

import React from "react";
import { DailyReportTable } from "@/components/tables/DailyReportTable";

export default function DailyReportApprovalPage() {
  return (
    <div className="p-4 sm:p-6 xl:p-10">
      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Persetujuan Laporan Harian
          </h2>
        </div>
        <DailyReportTable />
      </div>
    </div>
  );
} 