import React, { useRef, useState } from "react";
import Button from "@/components/ui/button/Button";
import { importSPKFromExcel } from "@/services/spk";

interface ImportSPKModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: { message: string; file: string }) => void;
}

const ImportSPKModal: React.FC<ImportSPKModalProps> = ({ open, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // You may want to get the token from context or props
      const token = localStorage.getItem("token") || "";
      const result = await importSPKFromExcel(file, token);
      if (result.success) {
        onSuccess({ message: result.message, file: file.name });
      } else {
        setError(result.message || "Import failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Import SPK from Excel</h3>
        <label className="block mb-2 text-gray-700 dark:text-gray-200">Pilih file Excel (.xlsx, .xls)</label>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="mb-4 text-gray-800 dark:text-white dark:bg-gray-800"
          onChange={handleFileChange}
          disabled={loading}
        />
        {error && <div className="mb-2 text-error-500 text-sm dark:text-error-400">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <span className="text-gray-800 dark:text-white">Cancel</span>
          </Button>
          <Button variant="primary" onClick={handleImport} disabled={loading || !file}>
            <span className="text-white">{loading ? "Importing..." : "Import"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImportSPKModal; 