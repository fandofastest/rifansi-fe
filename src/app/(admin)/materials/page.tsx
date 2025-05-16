import { Metadata } from "next";
import MaterialManagementPage from "@/components/material/MaterialManagementPage";

export const metadata: Metadata = {
  title: "Material Management",
  description: "Manage all materials and their pricing",
};

export default function MaterialsPage() {
  return (
    <div className="p-6">
      <MaterialManagementPage />
    </div>
  );
} 