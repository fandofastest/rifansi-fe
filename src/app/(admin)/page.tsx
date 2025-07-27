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
          value={(() => {
            const totalItemWorks = dashboardData.spkPerformance?.reduce(
              (sum, spk) => sum + (spk.workItemsAmount || 0), 0
            ) || 0;
            const totalBudget = dashboardData.spkPerformance?.reduce(
              (sum, spk) => sum + (spk.budget || 0), 0
            ) || 0;
            return totalBudget > 0 ? (totalItemWorks / totalBudget) * 100 : 0;
          })()} 
          format="percent" 
        />
        <MetricCard 
          title="SPK Sudah Close" 
          value={dashboardData.spkPerformance?.filter(spk => spk.progressPercentage >= 100)?.length || 0} 
          format="number" 
        />
        <MetricCard 
          title="Total SPK Close" 
          value={dashboardData.spkPerformance
            ?.filter(spk => spk.progressPercentage >= 100)
            ?.reduce((sum, spk) => sum + (spk.budget || 0), 0) || 0} 
          format="currency" 
        />
      </div>

      {/* Middle section with charts */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Left column - Sales charts */}
        <div className="col-span-12 xl:col-span-7 space-y-4">

          
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold dark:text-white">Monthly Progress</h3>
            </CardHeader>
            <CardBody>
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-500">Progress chart is currently unavailable</p>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Right column - Bar charts */}
        <div className="col-span-12 xl:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold dark:text-white">Monthly Sales Distribution</h3>
            </CardHeader>
            <CardBody>
              <SalesBarChart monthlyTrend={dashboardData.monthlyTrend?.map(item => ({
                year: item.year,
                month: item.month,
                monthName: `${item.month}/${item.year}`,
                totalSales: item.totalSales,
                spkCount: item.spkCount
              })) || []} />
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">Cost Overview</h3>
              <SalesBarChart monthlyTrend={[
                ...dashboardData.monthlyCosts.map(item => ({
                  year: item.year,
                  month: item.month,
                  monthName: `${item.month}/${item.year}`,
                  totalSales: item.amount,
                  spkCount: 0,
                  category: 'Costs'
                }))
              ]} showPlan={false} />
            </CardBody>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">        
            <div className="lg:col-span-7 space-y-4">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold dark:text-white">Monthly Sales Progress</h3>
                </CardHeader>
                <CardBody>
                  <MonthlySalesProgress data={(dashboardData.monthlySales || dashboardData.monthlyCosts || []).map(item => ({
                    year: item.year,
                    month: item.month,
                    amount: item.amount,
                    monthName: `${item.month}/${item.year}`,
                    sales: item.amount,
                    cost: dashboardData.monthlyCosts.find(cost => cost.month === item.month && cost.year === item.year)?.amount || 0,
                    profit: item.amount - (dashboardData.monthlyCosts.find(cost => cost.month === item.month && cost.year === item.year)?.amount || 0),
                    profitMargin: 0,
                    spkCount: 0
                  }))} />
                </CardBody>
              </Card>
              
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
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold dark:text-white">Project Locations</h3>
                </CardHeader>
                <CardBody>
                  <div className="h-[400px] w-full">
                    <DynamicMap 
                      locations={[
                        ...dashboardData.spkPerformance
                          .filter(spk => spk.location && spk.location.latitude && spk.location.longitude)
                          .map(spk => ({
                            id: spk.spkId,
                            name: spk.title,
                            latitude: spk.location.latitude,
                            longitude: spk.location.longitude,
                            type: 'spk'
                          })),
                        ...dashboardData.borrowPitLocations
                          .filter(loc => loc.latitude && loc.longitude)
                          .map(loc => ({
                            id: loc.borrowPitId,
                            name: loc.locationName,
                            latitude: loc.latitude,
                            longitude: loc.longitude,
                            type: 'borrowPit'
                          }))
                      ]}
                    />
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Performance Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold dark:text-white">Equipment Performance</h3>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm dark:text-gray-200">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-4">Equipment</th>
                  <th className="text-center py-2 px-4">Working Hours</th>
                  <th className="text-center py-2 px-4">Maintenance Hours</th>
                  <th className="text-center py-2 px-4">Utilization Rate</th>
                </tr>
              </thead>
              <tbody>
                {(dashboardData.equipmentPerformance || []).map((equipment, index) => (
                  <tr key={equipment.equipmentId} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/20' : ''}>
                    <td className="py-2 px-4">{equipment.name}</td>
                    <td className="text-center py-2 px-4">{equipment.totalWorkingHours} hrs</td>
                    <td className="text-center py-2 px-4">{equipment.totalMaintenanceHours} hrs</td>
                    <td className="text-center py-2 px-4">
                      <div className="flex items-center justify-center">
                        <span className="mr-2">{(equipment.utilizationRate * 100).toFixed(1)}%</span>
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${equipment.utilizationRate > 0.7 ? 'bg-green-500' : equipment.utilizationRate > 0.4 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${equipment.utilizationRate * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

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
