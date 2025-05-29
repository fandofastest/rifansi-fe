"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Equipment, 
  getEquipments, 
  Area, 
  updateEquipmentServiceStatus, 
  updateEquipmentArea,
  getEquipmentAreaHistory,
  getEquipmentServiceHistory,
  AreaHistory,
  ServiceHistory,
  getAreas
} from "@/services/equipment";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { PencilIcon, EyeIcon, LocationIcon, TruckIcon } from "@/icons";
import { toast } from "react-hot-toast";
import { EquipmentDetailModal } from "@/components/equipment/EquipmentDetailModal";

interface GraphQLError {
  message: string;
  response?: {
    errors?: Array<{ message: string }>;
  };
}

export const EquipmentStatusTable: React.FC = () => {
  const { token } = useAuth();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [equipmentToView, setEquipmentToView] = useState<Equipment | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Equipment['serviceStatus']>('ACTIVE');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [remarks, setRemarks] = useState('');
  const [areaHistory, setAreaHistory] = useState<AreaHistory[]>([]);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);

  const fetchAreas = async () => {
    try {
      if (!token) return;
      const data = await getAreas(token);
      setAreas(data);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchEquipments = async () => {
    try {
      if (!token) {
        setError("No authentication token available");
        return [];
      }
      setLoading(true);
      const data = await getEquipments(token);
      setEquipments(data);
      setError(null);
      return data;
    } catch (err: unknown) {
      console.error('Error fetching equipments:', err);
      const graphQLError = err as GraphQLError;
      if (graphQLError.response?.errors) {
        setError(graphQLError.response.errors[0].message || "Failed to fetch equipments");
      } else {
        setError("Failed to fetch equipments. Please try again later.");
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchAreaHistory = async (equipmentId: string) => {
    try {
      if (!token) return;
      const history = await getEquipmentAreaHistory(equipmentId, token);
      setAreaHistory(history);
    } catch (error) {
      console.error('Error fetching area history:', error);
    }
  };

  const fetchServiceHistory = async (equipmentId: string) => {
    try {
      if (!token) return;
      const history = await getEquipmentServiceHistory(equipmentId, token);
      setServiceHistory(history);
    } catch (error) {
      console.error('Error fetching service history:', error);
    }
  };

  useEffect(() => {
    fetchEquipments();
    fetchAreas();
  }, [token]);

  const handleStatusChange = async () => {
    if (!token || !selectedEquipment) return;
    try {
      await updateEquipmentServiceStatus({
        equipmentId: selectedEquipment.id,
        serviceStatus: selectedStatus,
        remarks
      }, token);
      await fetchEquipments();
      toast.success("Status berhasil diubah");
      setIsStatusModalOpen(false);
      setSelectedEquipment(null);
      setSelectedStatus('ACTIVE');
      setRemarks('');
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Gagal mengubah status");
    }
  };

  const handleAreaChange = async () => {
    if (!token || !selectedEquipment || !selectedArea) return;
    try {
      await updateEquipmentArea({
        equipmentId: selectedEquipment.id,
        areaId: selectedArea,
        remarks
      }, token);
      await fetchEquipments();
      toast.success("Lokasi berhasil diubah");
      setIsAreaModalOpen(false);
      setSelectedEquipment(null);
      setSelectedArea('');
      setRemarks('');
    } catch (err) {
      console.error("Failed to update area:", err);
      toast.error("Gagal mengubah lokasi");
    }
  };

  const handleViewHistory = async (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    await Promise.all([
      fetchAreaHistory(equipment.id),
      fetchServiceHistory(equipment.id)
    ]);
    setIsHistoryModalOpen(true);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-error-500">Error: {error}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Equipment Code
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Plate/Serial No
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Type
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Status
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Lokasi
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {equipments.map((equipment) => (
                <tr key={equipment.id}>
                  <td className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {equipment.equipmentCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {equipment.plateOrSerialNo}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {equipment.equipmentType}
                  </td>
                  <td className="px-4 py-3 text-start">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      equipment.serviceStatus.toUpperCase() === 'ACTIVE' 
                        ? 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400' 
                        : equipment.serviceStatus.toUpperCase() === 'MAINTENANCE'
                        ? 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400'
                        : equipment.serviceStatus.toUpperCase() === 'REPAIR'
                        ? 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {equipment.serviceStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {equipment.area?.name || 'Belum ditentukan'}
                  </td>
                  <td className="px-4 py-3 text-start">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEquipmentToView(equipment)}
                      >
                        <EyeIcon className="fill-current" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEquipment(equipment);
                          setSelectedStatus(equipment.serviceStatus);
                          setIsStatusModalOpen(true);
                        }}
                      >
                        <PencilIcon className="fill-current" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEquipment(equipment);
                          setSelectedArea(equipment.area?.id || '');
                          setIsAreaModalOpen(true);
                        }}
                      >
                        <TruckIcon className="fill-current" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewHistory(equipment)}
                      >
                        <LocationIcon className="fill-current" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Change Modal */}
      <Modal isOpen={isStatusModalOpen} onClose={() => {
        setIsStatusModalOpen(false);
        setSelectedEquipment(null);
        setSelectedStatus('ACTIVE');
        setRemarks('');
      }} className="max-w-[500px] p-5">
        <div>
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Ubah Status Alat
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as Equipment['serviceStatus'])}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="ACTIVE">Active</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="REPAIR">Repair</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Keterangan
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                rows={3}
                placeholder="Masukkan keterangan perubahan status..."
              />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsStatusModalOpen(false);
                setSelectedEquipment(null);
                setSelectedStatus('ACTIVE');
                setRemarks('');
              }}
            >
              Batal
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleStatusChange}
            >
              Simpan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Area Change Modal */}
      <Modal isOpen={isAreaModalOpen} onClose={() => {
        setIsAreaModalOpen(false);
        setSelectedEquipment(null);
        setSelectedArea('');
        setRemarks('');
      }} className="max-w-[500px] p-5">
        <div>
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Pindah Lokasi Alat
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lokasi Baru
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="">Pilih lokasi...</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Keterangan
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                rows={3}
                placeholder="Masukkan keterangan pemindahan lokasi..."
              />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAreaModalOpen(false);
                setSelectedEquipment(null);
                setSelectedArea('');
                setRemarks('');
              }}
            >
              Batal
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleAreaChange}
            >
              Simpan
            </Button>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal isOpen={isHistoryModalOpen} onClose={() => {
        setIsHistoryModalOpen(false);
        setSelectedEquipment(null);
        setAreaHistory([]);
        setServiceHistory([]);
      }} className="max-w-[800px] p-5">
        <div>
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Riwayat Perubahan
          </h4>
          <div className="space-y-6">
            {/* Service Status History */}
            <div>
              <h5 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Riwayat Status
              </h5>
              <div className="space-y-3">
                {serviceHistory.map((history, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          history.status.toUpperCase() === 'ACTIVE' 
                            ? 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400' 
                            : history.status.toUpperCase() === 'MAINTENANCE'
                            ? 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400'
                            : history.status.toUpperCase() === 'REPAIR'
                            ? 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {history.status}
                        </span>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {history.remarks}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {history.updatedBy.fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(Number(history.updatedAt)).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Area History */}
            <div>
              <h5 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Riwayat Lokasi
              </h5>
              <div className="space-y-3">
                {areaHistory.map((history, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          {history.area?.name || 'Lokasi tidak tersedia'}
                        </p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {history.remarks || '-'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {history.updatedBy?.fullName || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {history.updatedAt ? new Date(Number(history.updatedAt)).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      {equipmentToView && (
        <EquipmentDetailModal
          equipment={equipmentToView}
          onClose={() => setEquipmentToView(null)}
        />
      )}
    </div>
  );
}; 