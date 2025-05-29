import OvertimeRateManagementPage from "@/components/overtime/OvertimeRateManagementPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Tarif Lembur | Rifansi",
  description: "Halaman manajemen tarif lembur",
};

export default function OvertimeRates() {
  return (
    <div className="dark:bg-gray-900 dark:text-bodydark">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Manajemen Tarif Lembur
        </h2>
      </div>

      <OvertimeRateManagementPage />
    </div>
  );
} 