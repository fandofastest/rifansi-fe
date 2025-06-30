"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { getDashboardSummary, WorkItemsDistribution } from "@/services/dashboard";
import { useAuth } from "@/context/AuthContext";

export default function DemographicCard() {
  const { token } = useAuth();
  const [workItemsDistribution, setWorkItemsDistribution] = useState<WorkItemsDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const data = await getDashboardSummary();
        setWorkItemsDistribution(data.workItemsDistribution);
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // Calculate total count for percentage calculation
  const totalCount = workItemsDistribution.reduce((sum, item) => sum + item.count, 0);

  // Get top 3 categories
  const topCategories = workItemsDistribution
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Work Items Distribution
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Distribution of work items by category
          </p>
        </div>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[212px] my-6">
          <div className="text-gray-500">Loading work items distribution...</div>
        </div>
      ) : (
        <div className="space-y-5 mt-6">
          {topCategories.length > 0 ? (
            topCategories.map((category, index) => {
              const percentage = totalCount > 0 ? (category.count / totalCount) * 100 : 0;
              const colors = ["#465FFF", "#9CB9FF", "#FF6B6B"];
              
              return (
                <div key={category.categoryName} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="items-center w-full rounded-full max-w-8">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: colors[index] || "#465FFF" }}
                      >
                        {category.categoryName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                        {category.categoryName}
                      </p>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {category.count} Work Items
                      </span>
                    </div>
                  </div>

                  <div className="flex w-full max-w-[140px] items-center gap-3">
                    <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                      <div 
                        className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm text-xs font-medium text-white"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: colors[index] || "#465FFF"
                        }}
                      ></div>
                    </div>
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 py-8">
              No work items data available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
