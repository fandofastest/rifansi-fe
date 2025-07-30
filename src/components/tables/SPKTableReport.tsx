"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSPKData } from "@/hooks/useSPKData";
import { SPK } from "@/services/spk";

export const SPKTableReport: React.FC = () => {
  const router = useRouter();
  const { spks, loading, error } = useSPKData();
  const [itemsModalOpen, setItemsModalOpen] = useState(false);
  const [itemsModalData, setItemsModalData] = useState<SPK["workItems"]>([]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  SPK No
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Contract No
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  WAP No
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Title
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Project Name
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Contractor
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Area
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Budget
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Items
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {spks.map((spk: SPK) => (
                <tr key={spk.id}>
                  <td className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {spk.spkNo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {spk.contractNo || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {spk.wapNo}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {spk.title}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {spk.projectName}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {spk.contractor}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {spk.location?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {spk.budget?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || '-'}
                  </td>
                  <td className="px-4 py-3 text-start">
                    <button
                      onClick={() => {
                        setItemsModalData(spk.workItems);
                        setItemsModalOpen(true);
                      }}
                      className="px-3 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow"
                    >
                      Items
                    </button>
                  </td>
                  <td className="px-4 py-3 text-start">
                    <button
                      onClick={() => router.push(`/project-monitoring/spk-list/${spk.id}`)}
                      className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" style={{ display: itemsModalOpen ? 'flex' : 'none' }}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full p-6 relative max-h-[90vh] flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Daftar Items</h3>
          {(!itemsModalData || itemsModalData.length === 0) ? (
            <p className="text-gray-600 dark:text-gray-300">Tidak ada item.</p>
          ) : (
            <div className="overflow-y-auto flex-1 max-h-[60vh]">
              <table className="w-full text-sm border border-gray-200 dark:border-white/[0.08] rounded-lg bg-white dark:bg-gray-800">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="p-2 text-left text-black dark:text-white">Nama Item</th>
                    <th className="p-2 text-left text-black dark:text-white">Kategori</th>
                    <th className="p-2 text-left text-black dark:text-white">Sub Kategori</th>
                    <th className="p-2 text-left text-black dark:text-white">Unit</th>
                    <th className="p-2 text-left text-black dark:text-white">BOQ</th>
                    <th className="p-2 text-left text-black dark:text-white">Volume</th>
                    <th className="p-2 text-left text-black dark:text-white">Harga Satuan</th>
                    <th className="p-2 text-left text-black dark:text-white">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsModalData.map((wi, idx) => {
                    // Tentukan apakah menggunakan NR atau R berdasarkan volume
                    const hasNR = wi.boqVolume?.nr && wi.boqVolume.nr > 0;
                    const hasR = wi.boqVolume?.r && wi.boqVolume.r > 0;
                    
                    // Jika tidak ada volume, skip item ini
                    if (!hasNR && !hasR) return null;

                    // BOQ tampilkan hanya yang tidak 0
                    let boqDisplay = '';
                    if (hasNR && hasR) {
                      boqDisplay = `${wi.boqVolume.nr.toLocaleString('id-ID')} (NR), ${wi.boqVolume.r.toLocaleString('id-ID')} (R)`;
                    } else if (hasNR) {
                      boqDisplay = `${wi.boqVolume.nr.toLocaleString('id-ID')} (NR)`;
                    } else if (hasR) {
                      boqDisplay = `${wi.boqVolume.r.toLocaleString('id-ID')} (R)`;
                    }

                    return (
                      <tr key={wi.workItem?.id || idx} className="border-t border-gray-100 dark:border-white/[0.04]">
                        <td className="p-2 text-black dark:text-white">{wi.workItem?.name}</td>
                        <td className="p-2 text-black dark:text-white">{wi.workItem?.category?.name || '-'}</td>
                        <td className="p-2 text-black dark:text-white">{wi.workItem?.subCategory?.name || '-'}</td>
                        <td className="p-2 text-black dark:text-white">{wi.workItem?.unit?.name || '-'}</td>
                        <td className="p-2 text-black dark:text-white">{boqDisplay}</td>
                        <td className="p-2 text-black dark:text-white">
                          {hasNR ? (
                            <span>{wi.boqVolume.nr.toLocaleString('id-ID')} (NR)</span>
                          ) : hasR ? (
                            <span>{wi.boqVolume.r.toLocaleString('id-ID')} (R)</span>
                          ) : '-'}
                        </td>
                        <td className="p-2 text-black dark:text-white">
                          {hasNR ? (
                            <span>{wi.rates?.nr?.rate?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })} (NR)</span>
                          ) : hasR ? (
                            <span>{wi.rates?.r?.rate?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })} (R)</span>
                          ) : '-'}
                        </td>
                        <td className="p-2 text-black dark:text-white">
                          {wi.amount?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <button 
            onClick={() => setItemsModalOpen(false)} 
            className="mt-6 px-5 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow self-end"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}; 