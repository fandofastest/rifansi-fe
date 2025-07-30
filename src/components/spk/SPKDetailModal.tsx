import React from "react";
import { Modal } from "@/components/ui/modal";
import { SPK } from "@/services/spk";
import { formatDateIndonesia } from "@/utils/date";

interface SPKDetailModalProps {
  spk: SPK;
  onClose: () => void;
  onEdit?: () => void;
}

const formatCurrency = (amount?: number) => {
  if (!amount) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const SPKDetailModal: React.FC<SPKDetailModalProps> = ({ spk, onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-2xl m-4 dark:text-white/90">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Detail SPK</h2>
          {/* <div className="flex gap-2"> */}
            {/* <Button size="sm" variant="primary" onClick={onEdit} className="dark:text-white/90">Edit</Button> */}
            {/* <Button size="sm" variant="outline" onClick={onClose} className="dark:text-white/90">Tutup</Button> */}
          {/* </div> */}
        </div>

        {/* General Info */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white/90 mb-2">Informasi Umum</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-300">SPK No</span>
              <span className="block font-medium text-gray-900 dark:text-white/90 break-words">{spk.spkNo}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-300">Contract No</span>
              <span className="block font-medium text-gray-900 dark:text-white/90 break-words">{spk.contractNo || '-'}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-300">WAP No</span>
              <span className="block font-medium text-gray-900 dark:text-white/90 break-words">{spk.wapNo}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-300">Judul</span>
              <span className="block font-medium text-gray-900 dark:text-white/90 break-words">{spk.title}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-300">Nama Proyek</span>
              <span className="block font-medium text-gray-900 dark:text-white/90 break-words">{spk.projectName}</span>
            </div>
            <div className="md:col-span-2">
              <span className="block text-xs text-gray-500 dark:text-gray-300">Deskripsi Pekerjaan</span>
              <span className="block font-medium text-gray-900 dark:text-white/90 break-words">{spk.workDescription || '-'}</span>
            </div>
          </div>
        </section>

        {/* Location & Contractor */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white/90 mb-2">Lokasi & Kontraktor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-300">Kontraktor</span>
              <span className="block font-medium text-gray-900 dark:text-white/90 break-words">{spk.contractor || '-'}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-300">Lokasi</span>
              <span className="block font-medium text-gray-900 dark:text-white/90 break-words">{spk.location?.name || '-'}</span>
              {spk.location?.location?.coordinates && (
                <span className="block text-xs text-gray-500 dark:text-gray-300">
                  Koordinat: {spk.location.location.coordinates.join(', ')}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Dates & Budget */}
        <section className="mb-2">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white/90 mb-2">Tanggal & Anggaran</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-300">Tanggal Mulai</span>
              <span className="block font-medium text-gray-900 dark:text-white/90">
                {spk.startDate ? formatDateIndonesia(Number(spk.startDate)) : '-'}
              </span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 dark:text-gray-300">Tanggal Selesai</span>
              <span className="block font-medium text-gray-900 dark:text-white/90">
                {spk.endDate ? formatDateIndonesia(Number(spk.endDate)) : '-'}
              </span>
            </div>
            <div className="md:col-span-2">
              <span className="block text-xs text-gray-500 dark:text-gray-300">Anggaran</span>
              <span className="block font-medium text-gray-900 dark:text-white/90">{formatCurrency(spk.budget)}</span>
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}; 