import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserTable from "@/components/tables/UserTable";
import AddUserButton from "@/components/users/AddUserButton";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Users | Rifansi",
  description: "Manage users in the Rifansi system",
};

export default function UsersPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <PageBreadcrumb pageTitle="Users" />
        <AddUserButton />
      </div>
      <div className="space-y-6">
        <ComponentCard title="User List">
          <UserTable />
        </ComponentCard>
      </div>
    </div>
  );
} 