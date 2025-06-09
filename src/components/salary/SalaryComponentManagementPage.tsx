"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSalaryComponents, deleteSalaryComponent, getSalaryComponentDetails, SalaryComponentDetails } from "@/services/salaryComponent";
import { getPersonnelRoles } from "@/services/personnelRole";
import { SalaryComponent } from "@/services/salaryComponent";
import { PersonnelRole } from "@/services/personnelRole";
import AddSalaryComponentModal from "./AddSalaryComponentModal";
import EditSalaryComponentModal from "./EditSalaryComponentModal";
import { formatRupiah } from "@/utils/helpers";
import toast from "react-hot-toast";

export default function SalaryComponentManagementPage() {
  const { token } = useAuth();
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>([]);
  const [salaryDetailsMap, setSalaryDetailsMap] = useState<Record<string, SalaryComponentDetails>>({});
  const [personnelRoles, setPersonnelRoles] = useState<PersonnelRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedSalaryComponentId, setSelectedSalaryComponentId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error("Token not found");
      }
      const [componentsData, rolesData] = await Promise.all([
        getSalaryComponents(token),
        getPersonnelRoles(token)
      ]);
      
      // Filter out any invalid data
      const validComponents = componentsData.filter(comp => comp && comp.personnelRole);
      const validRoles = rolesData.filter(role => role && role.id);
      
      setSalaryComponents(validComponents);
      setPersonnelRoles(validRoles);

      // Fetch salary details for each component
      const detailsMap: Record<string, SalaryComponentDetails> = {};
      for (const component of validComponents) {
        if (component?.personnelRole?.id) {
          const details = await getSalaryComponentDetails(component.personnelRole.id, null, token);
          if (details) {
            detailsMap[component.id] = details;
          }
        }
      }
      setSalaryDetailsMap(detailsMap);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id: string) => {
    if (!token) return;
    if (window.confirm("Apakah Anda yakin ingin menghapus komponen gaji ini?")) {
      try {
        await deleteSalaryComponent(id, token);
        toast.success("Komponen gaji berhasil dihapus");
        fetchData();
      } catch (error) {
        console.error("Error deleting salary component:", error);
        toast.error("Gagal menghapus komponen gaji");
      }
    }
  };

  const handleAddSuccess = () => {
    setAddModalOpen(false);
    fetchData();
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    fetchData();
  };

  const handleAddNew = (roleId: string) => {
    setSelectedRoleId(roleId);
    setAddModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedSalaryComponentId(id);
    setEditModalOpen(true);
  };

  const getAvailableRoles = () => {
    // Filter out roles that already have salary components and ensure no null values
    const assignedRoleIds = salaryComponents
      .filter(comp => comp?.personnelRole)
      .map(comp => comp.personnelRole.id);
    
    return personnelRoles
      .filter(role => role && role.id && !assignedRoleIds.includes(role.id));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900">
        <div className="loader text-gray-500 dark:text-gray-400">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-gray-700 dark:bg-gray-900 sm:px-7.5 xl:pb-1">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Manajemen Komponen Gaji
        </h4>
        <div className="relative">
          <select
            className="relative z-20 w-full appearance-none rounded border border-stroke bg-white py-3 px-5 outline-none transition focus:border-primary active:border-primary text-black dark:text-white dark:border-gray-700 dark:bg-gray-900"
            onChange={(e) => {
              if (e.target.value) {
                handleAddNew(e.target.value);
              }
            }}
            value=""
          >
            <option value="" className="text-black dark:text-white dark:bg-gray-900">
              Tambah Komponen Gaji Baru
            </option>
            {getAvailableRoles().map((role) => (
              role && role.id ? (
                <option key={role.id} value={role.id} className="text-black dark:text-white dark:bg-gray-900">
                  {role.roleName} ({role.roleCode})
                </option>
              ) : null
            ))}
          </select>
          <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-600 dark:text-gray-400"
            >
              <g opacity="0.8">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                  fill="currentColor"
                ></path>
              </g>
            </svg>
          </span>
        </div>
      </div>

      {salaryComponents.length === 0 ? (
        <div className="flex justify-center items-center h-40 bg-white dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">
            Belum ada komponen gaji. Silakan tambahkan komponen gaji melalui dropdown di atas.
          </p>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto dark:bg-gray-900">
          <table className="w-full table-auto border-collapse bg-white dark:bg-gray-900 dark:text-bodydark">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                  Peran
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Gaji Pokok
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Tunjangan Tetap
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Tunjangan Tidak Tetap
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Total Gaji Bulanan
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Biaya Tetap Harian
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="dark:bg-gray-900">
              {salaryComponents
                .filter(component => component && component.personnelRole)
                .map((component) => {
                  const details = component.id ? salaryDetailsMap[component.id] : undefined;
                  return (
                    <tr key={component.id} className="border-b border-[#eee] dark:border-gray-700 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-gray-700 xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {component.personnelRole?.roleName || 'N/A'}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {component.personnelRole?.roleCode || 'N/A'}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-gray-700">
                        <p className="text-black dark:text-white">
                          {formatRupiah(component.gajiPokok)}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-gray-700">
                        <p className="text-black dark:text-white">
                          {formatRupiah(component.tunjanganTetap)}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-gray-700">
                        <p className="text-black dark:text-white">
                          {formatRupiah(component.tunjanganTidakTetap)}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-gray-700">
                        <p className="text-black dark:text-white font-medium">
                          {details ? formatRupiah(details.subTotalPenghasilanTetap) : "-"}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-gray-700">
                        <p className="text-black dark:text-white">
                          {details ? formatRupiah(details.biayaMPTetapHarian) : "-"}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-gray-700">
                        <div className="flex items-center space-x-3.5">
                          <button
                            className="hover:text-primary text-gray-500 dark:text-gray-300 dark:hover:text-primary"
                            onClick={() => handleEdit(component.id)}
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
                                d="M15.55 2.97499C15.55 2.77499 15.475 2.57499 15.325 2.42499C15.025 2.12499 14.725 1.82499 14.45 1.52499C14.175 1.24999 13.925 0.974987 13.65 0.724987C13.525 0.574987 13.375 0.474987 13.175 0.474987C12.95 0.474987 12.75 0.574987 12.625 0.724987L10.425 2.92499H2.675C1.85 2.92499 1.175 3.59999 1.175 4.42499V14.575C1.175 15.4 1.85 16.075 2.675 16.075H12.825C13.65 16.075 14.325 15.4 14.325 14.575V6.82499L15.35 5.79999C15.475 5.67499 15.55 5.47499 15.55 5.27499V2.97499ZM13.225 14.575H2.675V4.42499H9.55L6.4 7.57499C6.275 7.69999 6.175 7.87499 6.175 8.07499V10.475C6.175 10.85 6.475 11.15 6.85 11.15H9.25C9.425 11.15 9.625 11.075 9.75 10.925C10.85 9.82499 11.95 8.72499 13.225 7.44999V14.575ZM7.675 9.67499V8.44999L12.025 4.09999L13.25 5.32499L8.9 9.67499H7.675Z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                          <button
                            className="hover:text-red-600 text-gray-500 dark:text-gray-300 dark:hover:text-red-500"
                            onClick={() => handleDelete(component.id)}
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
                                d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                                fill="currentColor"
                              />
                              <path
                                d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                                fill="currentColor"
                              />
                              <path
                                d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                                fill="currentColor"
                              />
                              <path
                                d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {addModalOpen && selectedRoleId && (
        <AddSalaryComponentModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSuccess={handleAddSuccess}
          personnelRoleId={selectedRoleId}
        />
      )}

      {editModalOpen && selectedSalaryComponentId && (
        <EditSalaryComponentModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          salaryComponentId={selectedSalaryComponentId}
        />
      )}
    </div>
  );
} 