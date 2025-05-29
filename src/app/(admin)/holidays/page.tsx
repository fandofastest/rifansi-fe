"use client";
import React from "react";
import HolidayCalendar from "@/components/holiday/HolidayCalendar";

export default function HolidaysPage() {
  return (
    <div className="dark:bg-gray-900 dark:text-bodydark">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Manajemen Hari Libur
        </h2>
      </div>

      <HolidayCalendar />
    </div>
  );
} 