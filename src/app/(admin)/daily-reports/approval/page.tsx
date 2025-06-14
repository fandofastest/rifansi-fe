"use client";

import React from "react";
import { DailyReportApprovalTable } from "@/components/tables/DailyReportApprovalTable";

export default function DailyReportApprovalPage() {
  return (
    <div className="p-4 sm:p-6 xl:p-10">
      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">
              Approval Laporan Harian
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Setujui atau tolak laporan harian dari tim
            </p>
          </div>
        </div>
        <DailyReportApprovalTable />
      </div>
    </div>
  );
} 