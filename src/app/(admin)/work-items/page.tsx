"use client";

import React, { useState } from "react";
import WorkItemTable from "@/components/tables/WorkItemTable";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import AddWorkItemModal from "@/components/work-items/AddWorkItemModal";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function WorkItemsPage() {
  const [showModal, setShowModal] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);

  const handleAddWorkItem = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setRefreshTable((prev) => !prev);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageBreadcrumb pageTitle="Work Items" />
        <Button variant="primary" onClick={handleAddWorkItem} className="flex items-center">
          <PlusIcon className="mr-2 h-4 w-4 self-center" /> Add Work Item
        </Button>
      </div>
      <div className="space-y-6">
        <ComponentCard title="Work Item List">
          <WorkItemTable refresh={refreshTable} />
        </ComponentCard>
      </div>
      {showModal && (
        <AddWorkItemModal isOpen={showModal} onClose={handleCloseModal} onSuccess={handleSuccess} />
      )}
    </div>
  );
} 