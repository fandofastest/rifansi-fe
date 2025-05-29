"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAreas, deleteArea, Area } from "@/services/area";
import Button from "@/components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";
import { AddAreaModal, EditAreaModal } from "@/components/areas";
import { Modal } from "../ui/modal";
import { formatDateIndonesia } from "@/utils/date";

export const AreaTable: React.FC = () => {
  const { token } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAreas = async () => {
    try {
      if (!token) {
        setError("Authentication token is missing");
        return;
      }
      const response = await getAreas(token);
      setAreas(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch areas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, [token]);

  const handleDelete = async (areaId: string) => {
    if (!token) {
      setError("Authentication token is missing");
      return;
    }

    try {
      setAreaToDelete(areas.find(area => area.id === areaId) || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete area";
      setError(errorMessage);
      console.error('Error in handleDelete:', err);
    }
  };

  const handleEdit = (area: Area) => {
    setSelectedArea(area);
    setIsEditModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!token || !areaToDelete) return;
    
    try {
      const success = await deleteArea({ id: areaToDelete.id }, token);
      if (success) {
        setAreas(areas.filter(area => area.id !== areaToDelete.id));
        setAreaToDelete(null);
      } else {
        throw new Error("Failed to delete area");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete area";
      setError(errorMessage);
      console.error('Error in confirmDelete:', err);
    }
  };

  if (!token) {
    return <div>Please login to view areas</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-error-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Area
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Area Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Location
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Created At
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Updated At
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {areas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {area.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {`${area.location.coordinates[0]}, ${area.location.coordinates[1]}`}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatDateIndonesia(area.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatDateIndonesia(area.updatedAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(area)}
                        >
                          <PencilIcon className="fill-current" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(area.id)}
                        >
                          <TrashBinIcon className="fill-current" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <AddAreaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchAreas}
      />
      <EditAreaModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchAreas}
        area={selectedArea}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!areaToDelete}
        onClose={() => setAreaToDelete(null)}
        className="max-w-[400px] p-5"
      >
        <div className="text-center">
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Delete Area
          </h4>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Are you sure you want to delete area &quot;{areaToDelete?.name}&quot;? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAreaToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="bg-error-500 hover:bg-error-600"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}; 