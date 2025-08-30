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
  totalProgress?: {
    // Use percentage as the primary field for charting progress
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
    // Prefer new percentage, fallback to prior fields if necessary
    spk.totalProgress?.percentage ??
    spk.totalProgress?.plannedVsActualCostRatio ??
    spk.totalProgress?.budgetUtilizationPercentage ??
    0
  );
  
  // Create colors array based on percentage values
  const colors = percentages.map(percentage => 
    percentage > 90 ? '#ef4444' :  // Red for high (> 90%)
    percentage > 70 ? '#f59e0b' :  // Amber for medium (70-90%)
    '#3b82f6'                      // Lighter blue for normal (< 70%) for better contrast with labels
  );

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
        distributed: true, // For using different colors per bar
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: any) {
        return val + "%";
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
        formatter: (val: number) => `${val.toFixed(1)}%`,
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
        const spk = data[dataPointIndex];
        return `
          <div class="p-2">
            <div class="font-medium">${spk.spkNo}</div>
            <div class="text-xs mt-1">${spk.title}</div>
            <div class="text-xs font-semibold mt-1">${series[seriesIndex][dataPointIndex]}%</div>
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
      <div className="flex justify-end mb-2 text-xs">
        <div className="flex items-center mr-4">
          <span className="inline-block w-3 h-3 bg-[#465fff] mr-1"></span>
          <span>Normal (&lt;70%)</span>
        </div>
        <div className="flex items-center mr-4">
          <span className="inline-block w-3 h-3 bg-[#f59e0b] mr-1"></span>
          <span>Medium (70-90%)</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-[#ef4444] mr-1"></span>
          <span>High (&gt;90%)</span>
        </div>
      </div>
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
