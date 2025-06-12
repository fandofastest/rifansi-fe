"use client";

import React from "react";
import { LaporanHarianTable } from "@/components/tables/LaporanHarianTable";

export default function LaporanHarianPage() {
  return (
    <div className="p-4 sm:p-6 xl:p-10">
      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Laporan Harian
          </h2>
        </div>
        <LaporanHarianTable />
      </div>
    </div>
  );
} 