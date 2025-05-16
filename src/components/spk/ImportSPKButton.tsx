import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import { importSPKFromExcel } from "@/services/spk";
import ImportSPKModal from "./ImportSPKModal";

interface ImportSPKButtonProps {
  onSuccessReload?: () => void;
}

export const ImportSPKButton: React.FC<ImportSPKButtonProps> = ({ onSuccessReload }) => {
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState<null | { message: string; file: string }>(null);

  const handleImportSuccess = (data: { message: string; file: string }) => {
    setSuccess(data);
    setShowModal(false);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
    if (onSuccessReload) onSuccessReload();
  };

  return (
    <>
      <Button variant="outline" onClick={() => setShowModal(true)}>
        Import SPK
      </Button>
      <ImportSPKModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleImportSuccess}
      />
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Import Success</h3>
            <p className="mb-2 text-gray-700 dark:text-gray-200">{success.message}</p>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">File: {success.file}</p>
            <Button variant="primary" onClick={handleCloseSuccess} className="w-full">OK</Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportSPKButton; 