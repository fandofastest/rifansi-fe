"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPersonnelRole } from "@/services/personnelRole";
import { PersonnelRole } from "@/services/personnelRole";
import EditPersonnelRoleModal from "@/components/role/EditPersonnelRoleModal";
import toast from "react-hot-toast";

export default function EditRolePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [role, setRole] = useState<PersonnelRole | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const fetchRoleData = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getPersonnelRole(id, token);
      setRole(data);
    } catch (error) {
      console.error("Error fetching role:", error);
      toast.error("Failed to fetch role data");
    }
  }, [token, id]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    if (token) {
      fetchRoleData();
    }
  }, [token, isAuthenticated, id, router, fetchRoleData]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    router.push("/roles");
  };

  const handleSuccess = () => {
    toast.success("Role updated successfully");
    router.push("/roles");
  };

  return (
    <div className="p-4 sm:p-6 xl:p-10">
      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Edit Role
          </h2>
        </div>
        {role && (
          <EditPersonnelRoleModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSuccess={handleSuccess}
            roleId={id}
          />
        )}
      </div>
    </div>
  );
} 