"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { useAuth } from "@/context/AuthContext";
import { updateSPKWorkItem, UpdateSPKWorkItemInput, SPK } from "@/services/spk";
import { toast } from "react-hot-toast";

interface EditWorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  spk: SPK;
  workItem: {
    workItemId: string;
    name?: string;
    unitName?: string;
    boqVolumeNR: number;
    boqVolumeR: number;
    rateNR: number;
    rateR: number;
    description: string;
  };
  onUpdated?: (updated: { workItemId: string; input: UpdateSPKWorkItemInput }) => void;
}

export const EditWorkItemModal: React.FC<EditWorkItemModalProps> = ({ isOpen, onClose, spk, workItem, onUpdated }) => {
  const { token } = useAuth();
  const [form, setForm] = useState({
    boqVolumeNR: workItem.boqVolumeNR,
    boqVolumeR: workItem.boqVolumeR,
    rateNR: workItem.rateNR,
    rateR: workItem.rateR,
    description: workItem.description || "",
  });
  const [saving, setSaving] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const input: UpdateSPKWorkItemInput = {
        boqVolume: { nr: form.boqVolumeNR, r: form.boqVolumeR },
        rates: {
          nr: { rate: form.rateNR, description: "" },
          r: { rate: form.rateR, description: "" },
        },
        description: form.description,
      };
      await updateSPKWorkItem(spk.id, workItem.workItemId, input, token);
      toast.success("Work item berhasil diupdate");
      onUpdated?.({ workItemId: workItem.workItemId, input });
      onClose();
    } catch (err) {
      console.error("Error updating work item:", err);
      toast.error("Gagal update work item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[520px] p-5">
      <div className="space-y-4">
        <div className="border-b pb-3">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">Edit Work Item</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{workItem.name} {workItem.unitName ? `(${workItem.unitName})` : ""}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm">Non-Remote Volume</label>
            <Input type="number" name="boqVolumeNR" defaultValue={form.boqVolumeNR} onChange={onChange} />
          </div>
          <div>
            <label className="block mb-1 text-sm">Remote Volume</label>
            <Input type="number" name="boqVolumeR" defaultValue={form.boqVolumeR} onChange={onChange} />
          </div>
          <div>
            <label className="block mb-1 text-sm">Non-Remote Rate (Rp)</label>
            <Input type="number" name="rateNR" defaultValue={form.rateNR} onChange={onChange} />
          </div>
          <div>
            <label className="block mb-1 text-sm">Remote Rate (Rp)</label>
            <Input type="number" name="rateR" defaultValue={form.rateR} onChange={onChange} />
          </div>
        </div>
        <div>
          <label className="block mb-1 text-sm">Deskripsi</label>
          <Input type="text" name="description" defaultValue={form.description} onChange={onChangeText} />
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
        </div>
      </div>
    </Modal>
  );
};
