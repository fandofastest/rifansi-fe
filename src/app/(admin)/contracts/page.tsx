"use client";

import React from "react";
import { ModalProvider } from "@/context/ModalContext";
import { ContractTable } from "@/components/tables/ContractTable";



const ContractsPage = () => {
  return (
    <ModalProvider>
      <div className="page-content page-content-wrapper">
        <div className="page-header-container">
          <div className="page-header-wrapper">
            <div className="page-header-left-content">
              {/* Judul diputuskan hanya ada di dalam component tabel */}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 xl:gap-12">
          <div className="w-full">
            <div className="mb-6 lg:mb-8 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 rounded-lg border border-gray-100 bg-white dark:border-white/[0.05] dark:bg-white/[0.04]">
              <ContractTable />
            </div>
          </div>
        </div>
      </div>
    </ModalProvider>
  );
};

export default ContractsPage;