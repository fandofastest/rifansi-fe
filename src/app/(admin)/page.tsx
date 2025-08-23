"use client";

import React, { useEffect, useState } from "react";
import { getDashboardSummary, DashboardSummary } from "@/services/dashboard";
import { formatCurrency, getMonthName } from "@/utils/format";
import { Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';
import { Card, CardBody, CardHeader } from "@/components/ui/card";

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
        console.log('Dashboard data:', data);
        console.log('Monthly costs:', data.monthlyCosts);
        // Log the type and exact values for debugging
        if (data.monthlyCosts && data.monthlyCosts.length > 0) {
          data.monthlyCosts.forEach((item: any) => {
            console.log(`Month: ${item.month} (${typeof item.month}), Value: ${item.amount}`);
          });
        }
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
          value={dashboardData.totalSPK || 0} 
          format="number" 
        />
        <MetricCard 
          title="Total Budget SPK" 
          value={dashboardData.spkPerformance?.reduce((sum: number, spk: any) => sum + (spk.budget || 0), 0)} 
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
            <CardBody >
              <div className="h-full">
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
                    // Only include months with values > 0
                    (dashboardData.monthlySales || []).filter((item: any) => item.amount > 0).map((item: any) => {
                      const monthNum = Number(item.month);
                      return {
                        year: item.year,
                        month: monthNum,
                        // Explicitly set monthName with year that won't be overridden
                        monthName: `${getMonthName(monthNum)}\n${item.year}`,
                        totalSales: item.amount || 0,
                        category: 'Sales',
                        spkCount: 0
                      };
                    })
                    .sort((a, b) => {
                      // Sort by year first, then by month
                      if (a.year !== b.year) return a.year - b.year;
                      return a.month - b.month;
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
                      // Create array with all 12 months and sort them explicitly
                       // Only include months with values > 0
                       (dashboardData.monthlyCosts || []).filter((item: any) => item.amount > 0).map((item: any) => {
                          const monthNum = Number(item.month);
                          return {
                            year: item.year,
                            month: monthNum,
                            // Explicitly set monthName with year that won't be overridden
                            monthName: `${getMonthName(monthNum)}\n${item.year}`,
                            totalSales: item.amount || 0,
                            category: 'Costs',
                            spkCount: 0
                          };
                        })
                        .sort((a, b) => {
                          // Sort by year first, then by month
                          if (a.year !== b.year) return a.year - b.year;
                          return a.month - b.month;
                        })
                    } 
                    showPlan={false} 
                  />
                </div>
              </CardBody>
            </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 md:gap-6">        
            <div className="lg:col-span-12 space-y-4">
              {/* Monthly Sales Progress card removed */}
              
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold dark:text-white">Cost Breakdown</h3>
                </CardHeader>
                <CardBody>
                  {(() => {
                    const total = dashboardData.totalCosts || 0;
                    const material = dashboardData.costBreakdown?.totalMaterialCost || 0;
                    const manpower = dashboardData.costBreakdown?.totalManpowerCost || 0;
                    const equipment = (dashboardData.costBreakdown?.equipmentRentalCost ?? dashboardData.costBreakdown?.totalEquipmentCost) || 0;
                    const bbm = dashboardData.costBreakdown?.equipmentFuelCost || 0;
                    const other = (dashboardData.costBreakdown?.otherBreakdown || []).reduce((sum, ob) => sum + (ob.total || 0), 0);
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 dark:text-gray-200">
                        <div className="text-center">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Materials</h4>
                          <p className="text-xl font-bold">{formatCurrency(material)}</p>
                          <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${calculateCostPercentage(material, total)}%` }}></div>
                          </div>
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Manpower</h4>
                          <p className="text-xl font-bold">{formatCurrency(manpower)}</p>
                          <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: `${calculateCostPercentage(manpower, total)}%` }}></div>
                          </div>
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Equipment</h4>
                          <p className="text-xl font-bold">{formatCurrency(equipment)}</p>
                          <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${calculateCostPercentage(equipment, total)}%` }}></div>
                          </div>
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">BBM</h4>
                          <p className="text-xl font-bold">{formatCurrency(bbm)}</p>
                          <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${calculateCostPercentage(bbm, total)}%` }}></div>
                          </div>
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Other</h4>
                          <p className="text-xl font-bold">{formatCurrency(other)}</p>
                          <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${calculateCostPercentage(other, total)}%` }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
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


