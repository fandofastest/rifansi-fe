"use client";

import React, { useState, useEffect } from "react";
import { SPKTableReport } from "@/components/tables/SPKTableReport";
import { useAuth } from "@/context/AuthContext";
import { getSPKListLite, SPKWorkItem } from "@/services/spk";

import { AllItemsModal } from "@/components/spk/AllItemsModal";

export default function ProjectMonitoringSPKListPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemsModalOpen, setItemsModalOpen] = useState(false);
  const [items, setItems] = useState<SPKWorkItem[]>([]);

  useEffect(() => {
    const fetchSPKs = async () => {
      if (!token) return;
      try {
        setLoading(true);
        // Gunakan versi ringan untuk mengambil daftar SPK
        await getSPKListLite(token);
        // Data lite tidak memuat workItems; kosongkan atau isi saat tombol Items diaktifkan dengan fetch detail terpisah
        setItems([]);
        setError(null);
      } catch (err) {
        console.error('Error fetching SPKs:', err);
        setError("Gagal mengambil data SPK");
      } finally {
        setLoading(false);
      }
    };

    fetchSPKs();
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 sm:p-6 xl:p-10">
      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Daftar SPK
          </h2>
          {/* <button
            className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow"
            onClick={() => setItemsModalOpen(true)}
          >
            Items
          </button> */}
        </div>
        <SPKTableReport />
        <AllItemsModal 
          open={itemsModalOpen} 
          onClose={() => setItemsModalOpen(false)} 
          items={items} 
        />
      </div>
    </div>
  );
} 