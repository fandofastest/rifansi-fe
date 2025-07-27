"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getBorrowPits,
  deleteBorrowPit,
  BorrowPit,
} from "@/services/borrowPit";
import Button from "@/components/ui/button/Button";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";
import {
  AddBorrowPitModal,
  EditBorrowPitModal,
} from "@/components/borrowPits";
import { Modal } from "@/components/ui/modal";
import { formatDateIndonesia } from "@/utils/date";

export const BorrowPitTable: React.FC = () => {
  const { token } = useAuth();
  const [borrowPits, setBorrowPits] = useState<BorrowPit[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrowPitToDelete, setBorrowPitToDelete] = useState<BorrowPit | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBorrowPit, setSelectedBorrowPit] = useState<BorrowPit | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const fetchBorrowPits = async () => {
    try {
      if (!token) {
        setError("Authentication token is missing");
        return;
      }
      const data = await getBorrowPits(token);
      setBorrowPits(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch borrow pits"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowPits();
  }, [token]);

  const handleDelete = (id: string) => {
    const bp = borrowPits.find((b) => b.id === id) || null;
    setBorrowPitToDelete(bp);
  };

  const confirmDelete = async () => {
    if (!token || !borrowPitToDelete) return;
    try {
      const res = await deleteBorrowPit(borrowPitToDelete.id, token);
      if (res.success) {
        setBorrowPits(borrowPits.filter((b) => b.id !== borrowPitToDelete.id));
      } else {
        throw new Error(res.message || "Failed to delete");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBorrowPitToDelete(null);
    }
  };

  const handleEdit = async (bp: BorrowPit) => {
    try {
      // Log the borrow pit data to help debug
      console.log('Editing borrow pit:', bp);
      
      // For debugging - check what fields are available
      console.log('Fields available:', Object.keys(bp));
      console.log('Coordinates type:', typeof bp.coordinates);
      
      setSelectedBorrowPit(bp);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error('Error preparing edit modal:', err);
      setError('Failed to prepare edit form');
    }
  };

  if (!token) return <div>Please login to view borrow pits</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-error-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          Add Borrow Pit
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-start text-gray-500 dark:text-gray-400">
                    Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-start text-gray-500 dark:text-gray-400">
                    Location Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-start text-gray-500 dark:text-gray-400">
                    Coordinates
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-start text-gray-500 dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {borrowPits.map((bp) => (
                  <TableRow key={bp.id}>
                    <TableCell className="px-5 py-4 text-start">
                      <span className="block font-medium text-theme-sm text-gray-800 dark:text-white/90">
                        {bp.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-start text-gray-500 dark:text-gray-400">
                      {bp.locationName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm text-start text-gray-500 dark:text-gray-400">
                      {Array.isArray(bp.coordinates) 
                        ? `${bp.coordinates[0].toFixed(6)}, ${bp.coordinates[1].toFixed(6)}` 
                        : bp.coordinates}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(bp)}>
                          <PencilIcon className="fill-current" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(bp.id)}>
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
      <AddBorrowPitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchBorrowPits}
      />
      <EditBorrowPitModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchBorrowPits}
        borrowPit={selectedBorrowPit}
      />
      <Modal
        isOpen={!!borrowPitToDelete}
        onClose={() => setBorrowPitToDelete(null)}
        className="max-w-[400px] p-5"
      >
        <div className="text-center">
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Delete Borrow Pit
          </h4>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Are you sure you want to delete &quot;{borrowPitToDelete?.name}&quot;?
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setBorrowPitToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
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
