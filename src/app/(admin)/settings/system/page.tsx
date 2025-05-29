import BackupExportCard from '@/components/settings/BackupExportCard';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Backup & Export | Rifansi - Material Management System',
  description: 'Kelola backup, export data, dan log history sistem.',
};

export default function SystemSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Pengaturan Sistem</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">Kelola backup, export data, dan log aktivitas sistem Anda.</p>
      <BackupExportCard />
    </div>
  );
} 