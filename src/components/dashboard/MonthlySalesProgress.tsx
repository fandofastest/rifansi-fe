"use client";

import React from 'react';
import { MonthlySales } from '@/services/dashboard';
import { formatCurrency, getMonthName } from '@/utils/format';

interface MonthlySalesProgressProps {
  data: MonthlySales[];
}

export default function MonthlySalesProgress({ data }: MonthlySalesProgressProps) {
  // Sort monthly data by year and month
  const sortedData = [...data].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  }).map(item => {
    // Calculate target and achieved values from sales and cost
    const target = item.sales;
    const achieved = item.sales - item.cost;
    // Calculate progress percentage
    const progressPercentage = target > 0 ? (achieved / target) * 100 : 0;
    
    return {
      ...item,
      target,
      achieved,
      progressPercentage
    };
  });

  return (
    <div className="space-y-6 dark:text-gray-200">
      {sortedData.map((monthData) => (
        <div key={`${monthData.year}-${monthData.month}`} className="space-y-2">
          <div className="flex justify-between dark:text-white">
            <h4 className="font-medium">{monthData.monthName} {monthData.year}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{monthData.progressPercentage.toFixed(2)}%</p>
          </div>
          
          <div className="relative pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-primary">
                  Target: {formatCurrency(monthData.target)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-primary">
                  Achieved: {formatCurrency(monthData.achieved)}
                </span>
              </div>
            </div>
            
            <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
              <div 
                style={{ width: `${Math.min(100, monthData.progressPercentage)}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  monthData.progressPercentage >= 100 ? 'bg-success-500' : 
                  monthData.progressPercentage >= 75 ? 'bg-primary' : 
                  monthData.progressPercentage >= 50 ? 'bg-warning-500' : 
                  'bg-error-500'
                }`}
              ></div>
            </div>
          </div>
        </div>
      ))}
      
      {sortedData.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No monthly progress data available</div>
      )}
    </div>
  );
}
