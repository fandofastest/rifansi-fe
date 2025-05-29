import React from "react";
import { SPK } from "@/services/spk";

interface SPKItemsModalProps {
  open: boolean;
  onClose: () => void;
  items: SPK["workItems"];
}

export const SPKItemsModal: React.FC<SPKItemsModalProps> = ({ open, onClose, items }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 relative max-h-[90vh] flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Daftar Items</h3>
        {(!items || items.length === 0) ? (
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
                </tr>
              </thead>
              <tbody>
                {items.map((wi, idx) => (
                  <tr key={wi.workItem?.id || idx} className="border-t border-gray-100 dark:border-white/[0.04]">
                    <td className="p-2 text-black dark:text-white">{wi.workItem?.name}</td>
                    <td className="p-2 text-black dark:text-white">{wi.workItem?.category?.name || '-'}</td>
                    <td className="p-2 text-black dark:text-white">{wi.workItem?.subCategory?.name || '-'}</td>
                    <td className="p-2 text-black dark:text-white">{wi.workItem?.unit?.name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button 
          onClick={onClose} 
          className="mt-6 px-5 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow self-end"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}; 