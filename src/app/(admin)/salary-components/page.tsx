import SalaryComponentManagementPage from "@/components/salary/SalaryComponentManagementPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Komponen Gaji | Rifansi",
  description: "Halaman manajemen komponen gaji",
};

export default function SalaryComponents() {
  return (
    <div className="dark:bg-gray-900 dark:text-bodydark">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Manajemen Komponen Gaji
        </h2>
      </div>

      <SalaryComponentManagementPage />
    </div>
  );
} 