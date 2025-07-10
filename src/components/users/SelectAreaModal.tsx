"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { getAreas, Area } from "@/services/area";
import { updateUserArea, getUser } from "@/services/user";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface SelectAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  currentAreaId?: string;
}

export default function SelectAreaModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  currentAreaId
}: SelectAreaModalProps) {
  const { token } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>(currentAreaId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetUser, setTargetUser] = useState<any>(null);

  // Fetch the target user's details
  useEffect(() => {
    const fetchUser = async () => {
      if (!token || !userId) return;
      try {
        const userData = await getUser(userId, token);
        console.log('Target user being edited:', userData);
        console.log('Target user role:', userData.role);
        console.log('Target user role code:', userData?.role?.roleCode);
        setTargetUser(userData);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
    
    if (isOpen) {
      fetchUser();
    }
  }, [userId, token, isOpen]);

  useEffect(() => {
    const fetchAreas = async () => {
      if (!token) return;
      try {
        const areasData = await getAreas(token);
        console.log('Areas data from API:', areasData);
        setAreas(areasData);
      } catch (error) {
        console.error('Error fetching areas:', error);
        setError('Failed to load areas');
      }
    };

    if (isOpen) {
      fetchAreas();
    }
  }, [isOpen, token]);

  useEffect(() => {
    setSelectedArea(currentAreaId || '');
  }, [currentAreaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      await updateUserArea(userId, selectedArea, token);
      toast.success('Area updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating area:', error);
      setError('Failed to update area');
      toast.error('Failed to update area');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[500px] p-5 lg:p-6"
    >
      <form onSubmit={handleSubmit}>
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          Select Area
        </h4>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="mb-6">
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/[0.05] dark:bg-gray-800 dark:text-white/90"
          >
            <option value="">Select Area</option>
            {areas
              .filter(area => {
                // Filter out AllArea for PMCOW users
                console.log('Checking area:', area.name, 'Target user role code:', targetUser?.role?.roleCode);
                
                // For PMCOW users, filter out any area with AllArea in the name
                if (targetUser?.role?.roleCode === "PMCOW" || targetUser?.role?.roleCode === "pmcow") {
                  if (area.name === "AllArea") {
                    console.log('Filtering out area:', area.name);
                    return false;
                  }
                }
                return true;
              })
              .map(area => (
                <option 
                  key={area.id} 
                  value={area.id}
                  className="dark:bg-gray-800 dark:text-white/90"
                >
                  {area.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            disabled={loading || !selectedArea}
          >
            {loading ? 'Updating...' : 'Update Area'}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 