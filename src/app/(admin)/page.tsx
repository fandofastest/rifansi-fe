"use client";

import React, { useEffect, useState } from "react";
import { getDashboardSummary, DashboardSummary } from "@/services/dashboard";
import { Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";

// Helper function to calculate cost percentages
function calculateCostPercentage(cost: number, total: number): number {
  if (!cost || !total || total === 0) return 0;
  return (cost / total) * 100;
}

// Utility component for metric cards
interface MetricCardProps {
  title: string;
  value: number;
  format: 'number' | 'currency' | 'percent';
}

function MetricCard({ title, value, format }: MetricCardProps) {
  let formattedValue = value.toString();
  
  if (format === 'currency') {
    formattedValue = formatCurrency(value);
  } else if (format === 'percent') {
    formattedValue = `${value.toFixed(2)}%`;
  } else if (format === 'number' && value > 999) {
    formattedValue = value.toLocaleString();
  }
  
  return (
    <Card>
      <CardBody className="text-center py-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
        <p className="text-2xl font-bold dark:text-white">{formattedValue}</p>
      </CardBody>
    </Card>
  );
}

// Dynamically import map components to avoid SSR issues with Leaflet
const DynamicMap = dynamic(() => import('@/components/dashboard/DashboardMap'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
});

const SalesChart = dynamic(() => import('@/components/dashboard/SalesChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
});

const SalesBarChart = dynamic(() => import('@/components/dashboard/SalesBarChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
});

const MonthlySalesProgress = dynamic(() => import('@/components/dashboard/MonthlySalesProgress'), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-gray-100 animate-pulse rounded-lg"></div>
});

const SPKProgressChart = dynamic(() => import('@/components/charts/bar/SPKProgressChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
});

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getDashboardSummary();
        setDashboardData(data);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (error || !dashboardData) {
    return <div className="text-error-500 p-4">Error loading dashboard data</div>;
  }

  return (
    <div className="space-y-6 dark:text-gray-200">
      {/* SPK metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard 
          title="Jumlah SPK" 
          value={dashboardData.spkPerformance?.length || 0} 
          format="number" 
        />
        <MetricCard 
          title="Total Budget SPK" 
          value={dashboardData.spkPerformance?.reduce((sum, spk) => sum + (spk.budget || 0), 0)} 
          format="currency" 
        />
        <MetricCard 
          title="% SPK Terhadap Kontrak" 
          value={dashboardData.totalSpkContract?.percentage || 0} 
          format="percent" 
        />
        <MetricCard 
          title="SPK Sudah Close" 
          value={dashboardData.totalspkclose?.totalSpk || 0} 
          format="number" 
        />
        <MetricCard 
          title="Total SPK Close" 
          value={dashboardData.totalspkclose?.totalBudgetSpk || 0} 
          format="currency" 
        />
      </div>

      {/* Middle section with charts */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Left column - Sales charts */}
        <div className="col-span-12 xl:col-span-12 space-y-4">

          
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold dark:text-white">SPK Progress</h3>
            </CardHeader>
            <CardBody>
              <div className="h-[400px] overflow-x-auto">
                {dashboardData?.spkPerformance && dashboardData.spkPerformance.length > 0 ? (
                  <SPKProgressChart data={dashboardData.spkPerformance} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No SPK progress data available</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Charts row */}
        <div className="col-span-12 xl:col-span-12">
          {/* Add hidden style to hide legends */}
          <style jsx global>{`
            .dashboard-chart .flex.justify-center.mt-4.space-x-4 {
              display: none !important;
            }
          `}</style>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Sales Chart */}
            <Card className="w-full">
              <CardHeader>
                <h3 className="text-lg font-semibold dark:text-white">Monthly Sales</h3>
              </CardHeader>
              <CardBody>
                <div className="dashboard-chart">
                  <SalesBarChart 
                    monthlyTrend={
                    // Create array with all 12 months
                    Array.from({length: 12}, (_, i) => i + 1).map(month => {
                      // Find data for this month if it exists
                      const monthData = dashboardData.monthlyCosts?.find(item => item.month === month);
                      // Use current year or first year from data
                      const year = monthData?.year || (dashboardData.monthlyCosts?.[0]?.year || new Date().getFullYear());
                      
                      return {
                        year,
                        month,
                        monthName: `${month}/${year}`,
                        totalSales: monthData?.amount || 0,
                        spkCount: 0
                      };
                    })
                  } />
                </div>
              </CardBody>
            </Card>
            
            {/* Cost Overview Chart */}
            <Card className="w-full">
              <CardHeader>
                <h3 className="text-lg font-semibold dark:text-white">Cost Overview</h3>
              </CardHeader>
              <CardBody>
                <div className="dashboard-chart">
                  <SalesBarChart 
                    monthlyTrend={
                      // Create array with all 12 months
                      Array.from({length: 12}, (_, i) => i + 1).map(month => {
                        // Find data for this month if it exists
                        const monthData = dashboardData.monthlyCosts?.find(item => item.month === month);
                        // Use current year or first year from data
                        const year = monthData?.year || (dashboardData.monthlyCosts?.[0]?.year || new Date().getFullYear());
                        
                        return {
                          year,
                          month,
                          monthName: `${month}/${year}`,
                          totalSales: monthData?.amount || 0,
                          spkCount: 0,
                          category: 'Costs'
                        };
                      })
                    } 
                    showPlan={false} 
                  />
                </div>
              </CardBody>
            </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 md:gap-6">        
            <div className="lg:col-span-7 space-y-4">
              {/* Monthly Sales Progress card removed */}
              
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold dark:text-white">Cost Breakdown</h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-3 gap-4 dark:text-gray-200">
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Materials</h4>
                      <p className="text-xl font-bold">{formatCurrency(dashboardData.costBreakdown?.totalMaterialCost || 0)}</p>
                      <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full" 
                          style={{ width: `${calculateCostPercentage(dashboardData.costBreakdown?.totalMaterialCost, dashboardData.totalCosts)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Manpower</h4>
                      <p className="text-xl font-bold">{formatCurrency(dashboardData.costBreakdown?.totalManpowerCost || 0)}</p>
                      <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-full rounded-full" 
                          style={{ width: `${calculateCostPercentage(dashboardData.costBreakdown?.totalManpowerCost, dashboardData.totalCosts)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Equipment</h4>
                      <p className="text-xl font-bold">{formatCurrency(dashboardData.costBreakdown?.totalEquipmentCost || 0)}</p>
                      <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full" 
                          style={{ width: `${calculateCostPercentage(dashboardData.costBreakdown?.totalEquipmentCost, dashboardData.totalCosts)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
            
            <div className="lg:col-span-5 space-y-4">
              {/* Project Locations card removed */}
            </div>
          </div>
        </div>
      </div>



      {/* Bottom row - Maps */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">Lokasi SPK</h3>
            <DynamicMap 
              locations={(dashboardData.spkPerformance || []).map(spk => ({
                id: spk.spkId,
                name: spk.title,
                latitude: spk.location?.latitude || 0,
                longitude: spk.location?.longitude || 0,
                type: 'spk'
              }))}
            />
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">Lokasi Borrow Pit</h3>
            <DynamicMap 
              locations={(dashboardData.borrowPitLocations || []).map(bp => ({
                id: bp.borrowPitId,
                name: bp.name,
                latitude: bp.latitude || 0,
                longitude: bp.longitude || 0,
                type: 'borrowPit'
              }))}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}


