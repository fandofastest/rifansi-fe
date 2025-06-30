"use client";
import React, { useEffect, useState } from "react";
// import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { getDashboardSummary, CostBreakdown } from "@/services/dashboard";
import { useAuth } from "@/context/AuthContext";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function StatisticsChart() {
  const { token } = useAuth();
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const data = await getDashboardSummary();
        setCostBreakdown(data.costBreakdown);
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Bar chart options
  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 310,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    colors: ["#465FFF", "#9CB9FF", "#FF6B6B", "#4ECDC4"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 6,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `Rp ${val.toLocaleString()}`,
      style: { fontSize: "12px", fontFamily: "Outfit, sans-serif" },
    },
    xaxis: {
      categories: ["Material", "Manpower", "Equipment", "Other"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "13px", colors: ["#6B7280"] } },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
        formatter: (val: number) => `Rp ${val.toLocaleString()}`,
      },
      title: { text: "", style: { fontSize: "0px" } },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `Rp ${val.toLocaleString()}`,
      },
    },
    grid: {
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    legend: { show: false },
  };

  // Prepare data for bar chart
  const series = [
    {
      name: "Cost",
      data: costBreakdown
        ? [
            costBreakdown.material,
            costBreakdown.manpower,
            costBreakdown.equipment,
            costBreakdown.other,
          ]
        : [0, 0, 0, 0],
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Cost Breakdown
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Distribution of costs by category
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[310px]">
          <div className="text-gray-500">Loading cost breakdown...</div>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[400px] xl:min-w-full">
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={310}
            />
          </div>
        </div>
      )}

      {/* Cost breakdown summary */}
      {costBreakdown && (
        <div className="grid grid-cols-2 gap-4 mt-6 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Material</div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Rp {costBreakdown.material.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Manpower</div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Rp {costBreakdown.manpower.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Equipment</div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Rp {costBreakdown.equipment.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Other</div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Rp {costBreakdown.other.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
