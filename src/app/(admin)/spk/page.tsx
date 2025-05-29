"use client";

import React, { useState } from "react";
import SPKTable from "@/components/tables/SPKTable";
import { AddSPKButton } from "@/components/spk";
import { ImportSPKButton } from "@/components/spk/ImportSPKButton";

export default function SPKPage() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="p-4 sm:p-6 xl:p-10">
      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            SPK List
          </h2>
          <div className="flex gap-2">
            <AddSPKButton />
            <ImportSPKButton onSuccessReload={() => setReloadKey(k => k + 1)} />
          </div>
        </div>
        <SPKTable key={reloadKey} />
      </div>
    </div>
  );
} 