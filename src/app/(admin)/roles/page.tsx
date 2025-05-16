import { Metadata } from "next";
import PersonnelRoleManagementPage from "@/components/role/PersonnelRoleManagementPage";

export const metadata: Metadata = {
  title: "Personnel Role Management",
  description: "Manage all personnel roles and hourly rates",
};

export default function RolesPage() {
  return (
    <div className="p-6">
      <PersonnelRoleManagementPage />
    </div>
  );
} 