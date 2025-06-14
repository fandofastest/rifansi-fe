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
import { getUsers, deleteUser } from "@/services/user";
import type { User } from "@/services/user";
import Button from "../ui/button/Button";
import { PencilIcon, TrashBinIcon, LocationIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";
import AddUserModal from "@/components/users/AddUserModal";
import EditUserModal from "@/components/users/EditUserModal";
import SelectAreaModal from "@/components/users/SelectAreaModal";
import { Modal } from "../ui/modal";
import { useModalContext } from "@/context/ModalContext";
import Input from "../ui/input/Input";
import { getAreas } from "@/services/area";
import type { Area } from "@/services/area";
import Select from "../ui/select/Select";

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToUpdateArea, setUserToUpdateArea] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const { token } = useAuth();
  const { isOpen, closeModal } = useModalContext();

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchAreas();
    }
  }, [token]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users, selectedAreaId]);

  const fetchAreas = async () => {
    if (!token) return;
    try {
      const data = await getAreas(token);
      setAreas(data);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const data = await getUsers(token);
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.fullName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role?.roleName.toLowerCase().includes(searchLower) ||
        user.area?.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by selected area
    if (selectedAreaId) {
      filtered = filtered.filter(user => user.area?.id === selectedAreaId);
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = async (user: User) => {
    setUserToDelete(user);
  };

  const handleEdit = (user: User) => {
    setUserToEdit(user);
  };

  const handleUpdateArea = (user: User) => {
    setUserToUpdateArea(user);
  };

  const confirmDelete = async () => {
    if (!token || !userToDelete) return;
    try {
      await deleteUser({ id: userToDelete.id }, token);
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (!token) {
    return <div>Please login to view users</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 border-b border-gray-200 dark:border-white/[0.05]">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full md:w-auto flex gap-4">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Select
              value={selectedAreaId}
              onChange={(e) => setSelectedAreaId(e.target.value)}
              className="w-[200px]"
            >
              <option value="">All Areas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex gap-4 items-center">
            <AddUserModal isOpen={isOpen} onClose={closeModal} onSuccess={fetchUsers} />
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Username
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Full Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Role
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Area
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Phone
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
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {user.username}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.fullName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        !user.role ? "info" :
                        user?.role?.roleCode === "ADMIN" || user?.role?.roleCode === "SUPERADMIN"
                          ? "success"
                          : user?.role?.roleCode === "MANAGER" || user?.role?.roleCode === "SUPERVISOR"
                          ? "warning"
                          : "info"
                      }
                    >
                      {user?.role ? user?.role?.roleName : "No Role"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.area ? (
                      <Badge size="sm" color="info">
                        {user.area.name}
                      </Badge>
                    ) : (
                      "No Area"
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.phone}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateArea(user)}
                      >
                        <LocationIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(user)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(user)}
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
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        className="max-w-[400px] p-5"
      >
        <div className="text-center">
          <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            Delete User
          </h4>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Are you sure you want to delete user &quot;{userToDelete?.username}&quot;? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setUserToDelete(null)}
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

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={!!userToEdit}
        onClose={() => setUserToEdit(null)}
        onSuccess={fetchUsers}
        user={userToEdit}
      />

      {/* Select Area Modal */}
      <SelectAreaModal
        isOpen={!!userToUpdateArea}
        onClose={() => setUserToUpdateArea(null)}
        onSuccess={fetchUsers}
        userId={userToUpdateArea?.id || ''}
        currentAreaId={userToUpdateArea?.area?.id}
      />
    </div>
  );
} 