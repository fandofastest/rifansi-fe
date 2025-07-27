"use client";

import React from 'react';
import { MonthlySales } from '@/services/dashboard';
import { formatCurrency } from '@/utils/format';

interface SalesChartProps {
  monthlySales: MonthlySales[];
  showPlan?: boolean;
}

export default function SalesChart({ monthlySales, showPlan = false }: SalesChartProps) {
  // Sort monthly sales data by year and month
  const sortedData = [...monthlySales].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  // Maximum value for chart scaling
  // Use a safe default if data is empty or all values are zero
  const maxValue = sortedData.length > 0 ? Math.max(
    1, // Ensure maxValue is never zero to avoid division by zero
    ...sortedData.map(item => {
      // Use amount as primary value, fallback to sales if available
      const salesValue = item.amount !== undefined ? item.amount : (item.sales || 0);
      const costValue = item.cost || 0;
      return Math.max(salesValue, costValue);
    }),
    ...sortedData.map(item => {
      // Calculate plan value (20% higher) if needed
      const salesValue = item.amount !== undefined ? item.amount : (item.sales || 0);
      return showPlan ? salesValue * 1.2 : 0;
    })
  ) : 1000; // Default value if no data is available

  // Chart dimensions
  const chartHeight = 300;
  const chartWidth = '100%';
  const barWidth = 40;
  const barGap = 20;
  const totalBars = sortedData.length;
  const chartWidthValue = totalBars * (barWidth + barGap);

  // Scale value to chart height with safety checks
  const scaleValue = (value: number) => {
    // Ensure the value is a valid number and not NaN or infinite
    const safeValue = typeof value === 'number' && !isNaN(value) && isFinite(value) ? value : 0;
    // Ensure maxValue is never zero to prevent division by zero
    return maxValue > 0 ? (safeValue / maxValue) * (chartHeight - 40) : 0;
  };

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ height: chartHeight + 50, width: Math.max(chartWidthValue, 300) + 'px', minWidth: '100%' }}>
        {/* Chart Axis and Grid */}
        <div className="relative h-full">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-30 flex flex-col justify-between text-xs text-gray-500">
            <div>IDR {formatCurrency(maxValue).replace('Rp', '')}</div>
            <div>IDR {formatCurrency(maxValue * 0.75).replace('Rp', '')}</div>
            <div>IDR {formatCurrency(maxValue * 0.5).replace('Rp', '')}</div>
            <div>IDR {formatCurrency(maxValue * 0.25).replace('Rp', '')}</div>
            <div>IDR 0</div>
          </div>
          
          {/* Chart content */}
          <div className="ml-16 h-full relative flex items-end">
            {/* Horizontal grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-gray-200 h-1/4"></div>
              <div className="border-b border-gray-200 h-1/4"></div>
              <div className="border-b border-gray-200 h-1/4"></div>
              <div className="border-b border-gray-200 h-1/4"></div>
            </div>
            
            {/* Bar chart */}
            <div className="flex items-end space-x-5 pb-10">
              {sortedData.map((item, index) => (
                <div key={`${item.year}-${item.month}`} className="flex flex-col items-center">
                  {/* Sales bar */}
                  <div className="relative" style={{ height: scaleValue(item.amount !== undefined ? item.amount : (item.sales || 0)), width: barWidth }}>
                    <div className="absolute bottom-0 w-full bg-primary h-full"></div>
                    {showPlan && (
                      <div 
                        className="absolute w-full border-t-2 border-dashed border-yellow-500"
                        style={{ bottom: scaleValue((item.amount !== undefined ? item.amount : (item.sales || 0)) * 1.2), height: 0 }}
                      ></div>
                    )}
                  </div>
                  
                  {/* Cost bar (positioned next to sales bar) */}
                  <div className="relative" style={{ height: scaleValue(item.cost || 0), width: barWidth, marginLeft: -barWidth }}>
                    <div className="absolute bottom-0 w-full bg-error-500 opacity-70 h-full"></div>
                  </div>
                  
                  {/* X-axis label */}
                  <div className="text-xs mt-2 text-gray-500">
                    {item.monthName || `${item.month}/${item.year}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center mt-4 space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary mr-2"></div>
          <span className="text-xs">Sales</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-error-500 opacity-70 mr-2"></div>
          <span className="text-xs">Cost</span>
        </div>
        {showPlan && (
          <div className="flex items-center">
            <div className="w-6 h-0 border-t-2 border-dashed border-yellow-500 mr-2"></div>
            <span className="text-xs">Plan Target</span>
          </div>
        )}
      </div>
    </div>
  );
}
