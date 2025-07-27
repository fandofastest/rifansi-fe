import { Metadata } from "next";
import { BorrowPitTable } from "@/components/tables/BorrowPitTable";

export const metadata: Metadata = {
  title: "Borrow Pits Management",
  description: "Manage all borrow pits in the system",
};

export default function BorrowPitsPage() {
  return (
    <div className="p-6">
      <BorrowPitTable />
    </div>
  );
}
