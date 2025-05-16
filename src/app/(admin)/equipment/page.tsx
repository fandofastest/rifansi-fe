"use client";

import React, { useState } from "react";
import { EquipmentTable } from "@/components/tables/EquipmentTable";
import { AddEquipmentButton } from "@/components/equipment";

export default function EquipmentPage() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="p-4 sm:p-6 xl:p-10">
      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Equipment List
          </h2>
          <div className="flex gap-2">
            <AddEquipmentButton onSuccess={() => setReloadKey(k => k + 1)} />
          </div>
        </div>
        <EquipmentTable key={reloadKey} />
      </div>
    </div>
  );
} 