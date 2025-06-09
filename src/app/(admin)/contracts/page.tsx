"use client";

import React from "react";
import { ModalProvider } from "@/context/ModalContext";
import { ContractTable } from "@/components/tables/ContractTable";
import { AddContractModal } from "@/components/contract/AddContractModal";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import { useModalContext } from "@/context/ModalContext";

const ContractsPage = () => {
  const { isOpen, openModal, closeModal } = useModalContext();

  const handleContractSuccess = () => {
    // Refresh the contract table data
    // You might want to implement a refetch function in ContractTable
    window.location.reload();
  };

  return (
    <ModalProvider>
      <div className="page-content page-content-wrapper">
        <div className="page-header-container">
          <div className="page-header-wrapper flex items-center justify-between">
            <div className="page-header-left-content">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Contracts</h1>
            </div>
            <div className="page-header-right-content">
              <Button
                size="sm"
                variant="primary"
                onClick={openModal}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Contract
              </Button>
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

        {isOpen && (
          <AddContractModal 
            onClose={closeModal} 
            onSuccess={handleContractSuccess}
          />
        )}
      </div>
    </ModalProvider>
  );
};

export default ContractsPage;