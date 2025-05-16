"use client";

import React, { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { WorkItem } from "@/services/workItem";

interface AddWorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (workItem: {
    workItemId: string;
    quantityNr: number;
    quantityR: number;
    amount: number;
    rates: {
      nr: {
        rate: number;
        description: string;
      };
      r: {
        rate: number;
        description: string;
      };
    };
    description: string;
  }) => void;
  workItems: WorkItem[];
  spk: {
    spkNo: string;
    wapNo: string;
    title: string;
    projectName: string;
  };
}

interface WorkItemFormData {
  workItemId: string;
  quantityNr: number;
  quantityR: number;
  rates: {
    nr: {
      rate: number;
      description: string;
    };
    r: {
      rate: number;
      description: string;
    };
  };
  description: string;
}

export const AddWorkItemModal: React.FC<AddWorkItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  workItems,
  spk,
}) => {
  const [formData, setFormData] = useState<WorkItemFormData>({
    workItemId: "",
    quantityNr: 0,
    quantityR: 0,
    rates: {
      nr: {
        rate: 0,
        description: "Non-Remote Rate"
      },
      r: {
        rate: 0,
        description: "Remote Rate"
      }
    },
    description: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter work items based on search query
  const filteredWorkItems = useMemo(() => {
    return workItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subCategory.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workItems, searchQuery]);

  // Update rates when workItemId changes
  React.useEffect(() => {
    const selectedWorkItem = workItems.find(item => item.id === formData.workItemId);
    if (selectedWorkItem) {
      setFormData(prev => ({
        ...prev,
        rates: {
          nr: {
            rate: selectedWorkItem.rates.nr.rate,
            description: "Non-Remote Rate"
          },
          r: {
            rate: selectedWorkItem.rates.r.rate,
            description: "Remote Rate"
          }
        }
      }));
    }
  }, [formData.workItemId, workItems]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantityNr' || name === 'quantityR' ? (value ? Number(value) : 0) : value,
    }));
  };

  const handleWorkItemSelect = (workItemId: string) => {
    setFormData(prev => ({ ...prev, workItemId }));
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedWorkItem = workItems.find(item => item.id === formData.workItemId);
    if (!selectedWorkItem) return;

    // Calculate amounts for both remote and non-remote
    const nrAmount = formData.quantityNr * formData.rates.nr.rate;
    const rAmount = formData.quantityR * formData.rates.r.rate;

    // Use the larger amount
    const amount = Math.max(nrAmount, rAmount);

    onSuccess({
      workItemId: formData.workItemId,
      quantityNr: formData.quantityNr,
      quantityR: formData.quantityR,
      amount,
      rates: formData.rates,
      description: formData.description,
    });
  };

  const selectedWorkItem = workItems.find(item => item.id === formData.workItemId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] p-5">
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-2">
            Add Work Item
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-300">SPK No</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{spk.spkNo}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">WAP No</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{spk.wapNo}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">Title</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{spk.title}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">Project Name</p>
              <p className="font-medium text-gray-800 dark:text-white/90">{spk.projectName}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="mb-2.5 block text-gray-800 dark:text-white/90">
              Work Item <span className="text-error-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                name="search"
                defaultValue={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder="Search work items..."
                className="pr-10"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700">
                {filteredWorkItems.length > 0 ? (
                  filteredWorkItems.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => handleWorkItemSelect(item.id)}
                    >
                      <div className="font-medium text-gray-800 dark:text-white/90">{item.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.category.name} &gt; {item.subCategory.name}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                    No work items found
                  </div>
                )}
              </div>
            )}
            
            {selectedWorkItem && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="font-medium text-gray-800 dark:text-white/90">{selectedWorkItem.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedWorkItem.category.name} &gt; {selectedWorkItem.subCategory.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Unit: {selectedWorkItem.unit.name}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2.5 block text-gray-800 dark:text-white/90">
                Non-Remote Quantity <span className="text-error-500">*</span>
              </label>
              <Input
                type="number"
                name="quantityNr"
                defaultValue={formData.quantityNr}
                onChange={handleChange}
                placeholder="Enter Non-Remote Quantity"
                required
              />
              <div className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                <span>Rate: </span>
                <span className="font-medium">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(formData.rates.nr.rate)}</span>
                {formData.quantityNr > 0 && formData.rates.nr.rate > 0 && (
                  <div>
                    Total: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(formData.quantityNr * formData.rates.nr.rate)}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="mb-2.5 block text-gray-800 dark:text-white/90">
                Remote Quantity <span className="text-error-500">*</span>
              </label>
              <Input
                type="number"
                name="quantityR"
                defaultValue={formData.quantityR}
                onChange={handleChange}
                placeholder="Enter Remote Quantity"
                required
              />
              <div className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                <span>Rate: </span>
                <span className="font-medium">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(formData.rates.r.rate)}</span>
                {formData.quantityR > 0 && formData.rates.r.rate > 0 && (
                  <div>
                    Total: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(formData.quantityR * formData.rates.r.rate)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2.5 block text-gray-800 dark:text-white/90">
              Description
            </label>
            <Input
              type="text"
              name="description"
              defaultValue={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
            >
              Add Work Item
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}; 