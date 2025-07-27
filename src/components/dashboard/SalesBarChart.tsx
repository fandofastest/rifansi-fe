"use client";

import React from 'react';
import { MonthlyTrend } from '@/services/dashboard';
import { formatCurrency, getMonthName } from '@/utils/format';

interface SalesBarChartProps {
  monthlyTrend: MonthlyTrend[];
  showPlan?: boolean;
}

export default function SalesBarChart({ monthlyTrend, showPlan = false }: SalesBarChartProps) {
  // Sort monthly trend data by year and month
  const sortedData = [...monthlyTrend].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  }).map(item => ({
    ...item,
    monthName: getMonthName(item.month)
  }));

  // Maximum value for chart scaling
  // Use a safe default if data is empty or values are invalid
  const maxValue = sortedData.length > 0 ? Math.max(
    1, // Ensure maxValue is never zero to avoid division by zero
    ...sortedData.map(item => Math.max(
      item.totalSales || 0, // Use 0 if totalSales is undefined
      showPlan ? ((item.totalSales || 0) * 1.2) : 0 // For demo purposes, plan is 20% higher than actual
    ))
  ) : 1000; // Default value if no data is available

  // Chart dimensions
  const chartHeight = 250;
  const barWidth = 25;
  const barGap = 15;

  // Scale value to chart height with safety checks
  const scaleValue = (value: number | undefined) => {
    // Handle undefined, null or NaN values
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return (safeValue / maxValue) * (chartHeight - 40);
  };

  return (
    <div className="w-full overflow-x-auto dark:text-gray-200">
      <div style={{ height: chartHeight + 50 }}>
        {/* Chart Axis and Grid */}
        <div className="relative h-full">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-30 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
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
            <div className="flex items-end space-x-3 pb-10">
              {sortedData.map((item) => (
                <div key={`${item.year}-${item.month}-${item.category || 'default'}`} className="flex flex-col items-center">
                  <div className="relative" style={{ height: scaleValue(item.totalSales), width: barWidth }}>
                    <div 
                      className="absolute bottom-0 w-full h-full rounded-t-sm"
                      style={{ 
                        backgroundColor: item.category === 'Costs' ? '#F44336' : 
                                      item.category === 'Income' ? '#4CAF50' : 
                                      '#2196F3' // Default to blue for Sales or unspecified
                      }}
                    ></div>
                    
                    {showPlan && (
                      <div 
                        className="absolute w-full border-t-2 border-dashed border-yellow-500"
                        style={{ bottom: scaleValue(item.totalSales * 1.2), height: 0 }}
                      ></div>
                    )}
                    
                    {/* Value label */}
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400">
                      {item.totalSales ? formatCurrency(item.totalSales).replace('Rp', '') : '0'}
                    </div>
                  </div>
                  
                  {/* X-axis label */}
                  <div className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                    {item.monthName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center mt-4 space-x-4 dark:text-gray-300">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2196F3' }}></div>
          <span className="text-xs ml-1">Revenue</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4CAF50' }}></div>
          <span className="text-xs ml-1">Income</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F44336' }}></div>
          <span className="text-xs ml-1">Expense</span>
        </div>
        {showPlan && (
          <div className="flex items-center">
            <div className="w-6 h-0 border-t-2 border-dashed border-yellow-500"></div>
            <span className="text-xs ml-1">Plan Target</span>
          </div>
        )}
      </div>
    </div>
  );
}
