"use client";

import React from "react";
import { AreaTable } from "@/components/tables/AreaTable";

export default function AreasPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Areas Management
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage and monitor all areas in the system
        </p>
      </div>
      <AreaTable />
    </div>
  );
} 