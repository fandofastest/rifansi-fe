"use client";
import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "@/context/AuthContext";
import { changeMyPassword } from "@/services/user";
import { toast } from "react-hot-toast";

export default function PasswordChangeCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!token) {
      toast.error("You must be logged in to change your password");
      return;
    }

    setLoading(true);
    try {
      const response = await changeMyPassword(
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        token
      );
      
      if (response.success) {
        toast.success(response.message || "Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        closeModal();
      } else {
        toast.error(response.message || "Failed to change password");
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.response?.errors?.[0]?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Password Settings
          </h4>

          <div>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              Secure your account with a strong password. We recommend using a mix of letters, numbers, and special characters.
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              Last changed: <span className="text-gray-500 dark:text-gray-400">3 months ago</span>
            </p>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Change Password
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-6">
          <div className="pr-14">
            <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
              Change Password
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Update your password to keep your account secure.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="space-y-4">
              <div>
                <Label>Current Password</Label>
                <Input
                  type="password"
                  name="currentPassword"
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  error={!!errors.currentPassword}
                  hint={errors.currentPassword}
                />
              </div>

              <div>
                <Label>New Password</Label>
                <Input
                  type="password"
                  name="newPassword"
                  onChange={handleChange}
                  placeholder="Enter new password"
                  error={!!errors.newPassword}
                  hint={errors.newPassword}
                />
              </div>

              <div>
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  error={!!errors.confirmPassword}
                  hint={errors.confirmPassword}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} disabled={loading}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
} 