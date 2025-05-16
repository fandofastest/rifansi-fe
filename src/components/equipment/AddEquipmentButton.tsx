import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons";
import { AddEquipmentModal } from "./AddEquipmentModal";

interface AddEquipmentButtonProps {
  onSuccess?: () => void;
}

export const AddEquipmentButton: React.FC<AddEquipmentButtonProps> = ({ onSuccess }) => {
  const [showModal, setShowModal] = useState(false);

  const handleSuccess = () => {
    setShowModal(false);
    if (onSuccess) onSuccess();
  };

  return (
    <>
      <Button
        variant="primary"
        startIcon={<PlusIcon className="fill-current" />}
        onClick={() => setShowModal(true)}
      >
        Add Equipment
      </Button>
      {showModal && (
        <AddEquipmentModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}; 