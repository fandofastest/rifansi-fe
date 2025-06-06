"use client";
import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "@/context/AuthContext";
import { changeMyPassword } from "@/services/user-profile";
import { toast } from "react-hot-toast";

interface GraphQLError {
  response?: {
    errors?: Array<{
      message: string;
    }>;
  };
}

export default function PasswordChangeCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Anda harus masuk untuk mengubah kata sandi");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Kata sandi baru dan konfirmasi tidak cocok");
      return;
    }

    setLoading(true);
    try {
      await changeMyPassword(
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        token
      );
      
      toast.success("Kata sandi berhasil diubah");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      closeModal();
    } catch (error: unknown) {
      const graphqlError = error as GraphQLError;
      console.error("Error changing password:", graphqlError);
      toast.error(graphqlError.response?.errors?.[0]?.message || "Gagal mengubah kata sandi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Keamanan
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ubah kata sandi Anda untuk menjaga keamanan akun
          </p>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Ubah Kata Sandi
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-6">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
              Ubah Kata Sandi
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Masukkan kata sandi lama dan kata sandi baru Anda.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="space-y-4 px-2">
              <div>
                <Label>Kata Sandi Saat Ini</Label>
                <Input 
                  type="password" 
                  name="currentPassword"
                  defaultValue={formData.currentPassword}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Kata Sandi Baru</Label>
                <Input 
                  type="password" 
                  name="newPassword"
                  defaultValue={formData.newPassword}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Konfirmasi Kata Sandi Baru</Label>
                <Input 
                  type="password" 
                  name="confirmPassword"
                  defaultValue={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} disabled={loading}>
                Batal
              </Button>
              <Button size="sm" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
} 