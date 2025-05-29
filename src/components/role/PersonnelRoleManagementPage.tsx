"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import PersonnelRoleTable from "@/components/tables/PersonnelRoleTable";
import AddPersonnelRoleModal from "@/components/role/AddPersonnelRoleModal";
import { PlusIcon } from "@/icons";
import Link from "next/link";

export default function PersonnelRoleManagementPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);

  const handleAddSuccess = () => {
    setRefreshTable(!refreshTable);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">Personnel Role Management</h4>
        <div className="flex gap-2">
          <Link href="/salary-components">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <span>Manajemen Komponen Gaji</span>
            </Button>
          </Link>
          <Link href="/overtime-rates">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <span>Manajemen Tarif Lembur</span>
            </Button>
          </Link>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Role</span>
          </Button>
        </div>
      </div>
      
      <PersonnelRoleTable refresh={refreshTable} />
      
      <AddPersonnelRoleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
} 