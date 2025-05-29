import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import { AddEquipmentModal } from "./AddEquipmentModal";
import { Area } from "@/services/equipment";
import { useAuth } from "@/context/AuthContext";
import { graphQLClient } from "@/lib/graphql";

interface AddEquipmentButtonProps {
  onSuccess: () => void;
}

const GET_AREAS = `
  query GetAreas {
    areas {
      id
      name
      location {
        type
        coordinates
      }
    }
  }
`;

export const AddEquipmentButton: React.FC<AddEquipmentButtonProps> = ({ onSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const { token } = useAuth();

  const fetchAreas = async () => {
    try {
      if (!token) return;
      const response = await graphQLClient.request<{ areas: Area[] }>(
        GET_AREAS,
        {},
        { Authorization: `Bearer ${token}` }
      );
      setAreas(response.areas || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const handleOpenModal = () => {
    fetchAreas();
    setIsModalOpen(true);
  };

  return (
    <>
      <Button
        variant="primary"
        startIcon={<PlusIcon className="fill-current" />}
        onClick={handleOpenModal}
      >
        Add Equipment
      </Button>

      {isModalOpen && (
        <AddEquipmentModal
          areas={areas}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            onSuccess();
          }}
        />
      )}
    </>
  );
}; 