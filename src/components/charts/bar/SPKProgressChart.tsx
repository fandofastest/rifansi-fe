"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface SPKData {
  spkId: string;
  spkNo: string;
  title: string;
  // New primary progress field from dashboard API
  progressPercentage?: number;
  totalProgress?: {
    // Legacy progress field kept for backward compatibility
    percentage: number;
    // Keep legacy fields optional for backward compatibility
    budgetUtilizationPercentage?: number;
    plannedVsActualCostRatio?: number;
  };
}

interface SPKProgressChartProps {
  data: SPKData[];
}

export default function SPKProgressChart({ data }: SPKProgressChartProps) {
  // Extract the relevant data from SPK performance data
  const categories = data.map(spk => spk.spkNo);
  const titles = data.map(spk => spk.title || ''); // Store titles for tooltips
  const percentages = data.map(spk =>
    // Prefer the new top-level progressPercentage from API
    spk.progressPercentage ??
    // Fallback to legacy nested fields for compatibility
    spk.totalProgress?.percentage ??
    spk.totalProgress?.plannedVsActualCostRatio ??
    spk.totalProgress?.budgetUtilizationPercentage ??
    0
  );
  
  // Use a single uniform color (blue) for all bars
  const colors = ['#3b82f6'];

  // Calculate dynamic height based on number of SPKs
  // Increased height to make bars taller
  const dynamicHeight = Math.min(Math.max(350, data.length * 35), 600);

  const options: ApexOptions = {
    colors: colors,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: dynamicHeight,
      toolbar: {
        show: false,
      },
      // Auto-adjust chart size to fit container
      redrawOnWindowResize: true,
      redrawOnParentResize: true,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: data.length > 10 ? "80%" : "70%", // Increased column width for taller appearance
        borderRadius: 3,
        borderRadiusApplication: "end",
        distributed: false, // Use single color for all bars
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: any) {
        const num = typeof val === 'number' ? val : parseFloat(val);
        if (isNaN(num)) return '0.00%';
        return num.toFixed(2) + "%";
      },
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ['#3b82f6'], // Blue text for both light and dark modes
      },
      offsetY: -25, // Position above the bar
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          fontSize: '10px',
        },
        // Show truncated SPK numbers on x-axis
        formatter: function(val: string, opts?: any) {
          // Show only the last 10 characters if truncated
          return val.length > 10 ? val.slice(-10) : val;
        },
        rotate: -45,
        rotateAlways: true,
        trim: true, // Enable trimming
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: true, // Enable tooltip to show full SPK number on hover
      },
    },
    yaxis: {
      title: {
        text: "Progress (%)",
        style: {
          fontSize: '12px',
        }
      },
      max: 100, // Set maximum to 100%
      forceNiceScale: true,
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number) => `${(Number.isFinite(val) ? val : 0).toFixed(2)}%`,
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
        const spk = data[dataPointIndex];
        return `
          <div class="p-2">
            <div class="font-medium">${spk.spkNo}</div>
            <div class="text-xs mt-1">${spk.title}</div>
            <div class="text-xs font-semibold mt-1">${Number(series[seriesIndex][dataPointIndex]).toFixed(2)}%</div>
          </div>
        `;
      }
    },
    legend: {
      show: false,
    },
    responsive: [{
      breakpoint: 1000,
      options: {
        plotOptions: {
          bar: {
            columnWidth: '90%'
          }
        }
      }
    }]
  };

  const series = [
    {
      name: "Progress",
      data: percentages,
    },
  ];

  return (
    <div className="w-full h-full">
      <div className="w-full">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={dynamicHeight}
        />
      </div>
    </div>
  );
}
