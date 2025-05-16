"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { getWorkItems, deleteWorkItem } from "@/services/workItem";
import type { WorkItem } from "@/services/workItem";
import Button from "../ui/button/Button";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import EditWorkItemModal from "@/components/work-items/EditWorkItemModal";
import { Modal } from "../ui/modal";

interface WorkItemTableProps {
  refresh?: boolean;
}

export default function WorkItemTable({ refresh }: WorkItemTableProps) {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [workItemToDelete, setWorkItemToDelete] = useState<WorkItem | null>(null);
  const [workItemToEdit, setWorkItemToEdit] = useState<WorkItem | null>(null);
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchWorkItems();
    }
  }, [token, refresh]);

  const fetchWorkItems = async () => {
    if (!token) return;
    try {
      const data = await getWorkItems(token);
      setWorkItems(data);
    } catch (error) {
      console.error('Error fetching work items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workItem: WorkItem) => {
    setWorkItemToDelete(workItem);
  };

  const handleEdit = (workItem: WorkItem) => {
    setWorkItemToEdit(workItem);
  };

  const confirmDelete = async () => {
    if (!token || !workItemToDelete) return;
    try {
      await deleteWorkItem(workItemToDelete.id, token);
      setWorkItems(workItems.filter(item => item.id !== workItemToDelete.id));
      setWorkItemToDelete(null);
    } catch (error) {
      console.error('Error deleting work item:', error);
    }
  };

  if (!token) {
    return <div>Please login to view work items</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
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
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Category
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Sub Category
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Unit
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Non-Remote Rate
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Remote Rate
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Description
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
              {workItems.map((workItem) => (
                <TableRow key={workItem.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {workItem.name}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {workItem.category?.name || '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {workItem.subCategory?.name || '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {workItem.unit?.name || '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div>
                      <div className="font-medium">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(workItem.rates.nr.rate)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {workItem.rates.nr.description || '-'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div>
                      <div className="font-medium">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(workItem.rates.r.rate)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {workItem.rates.r.description || '-'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {workItem.description || '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(workItem)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(workItem)}
                      >
                        <TrashBinIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!workItemToDelete}
        onClose={() => setWorkItemToDelete(null)}
        className="max-w-[400px] p-5"
      >
        <div className="text-center">
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Delete Work Item
          </h4>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Are you sure you want to delete work item "{workItemToDelete?.name}"? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setWorkItemToDelete(null)}
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

      {/* Edit Work Item Modal */}
      <EditWorkItemModal
        isOpen={!!workItemToEdit}
        onClose={() => setWorkItemToEdit(null)}
        onSuccess={fetchWorkItems}
        workItem={workItemToEdit}
      />
    </div>
  );
} 