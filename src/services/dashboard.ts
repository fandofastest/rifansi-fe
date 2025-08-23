import { graphQLClient } from "@/lib/graphql";

// Dashboard Summary interfaces
export interface MonthlyAmount {
  year: number;
  month: number;
  amount: number;
}

export interface MonthlySales extends MonthlyAmount {
  monthName?: string;
  sales?: number;
  cost?: number;
  costBreakdown?: {
    material: number;
    manpower: number;
    equipment: number;
    other: number;
  };
  profit?: number;
  profitMargin?: number;
  spkCount?: number;
}

export interface SPKProgress {
  spkId: string;
  spkTitle: string;
  spkBudget: number;
  activityCount: number;
}

export interface MonthlyCapaian {
  year: number;
  month: number;
  monthName: string;
  totalSPKActive: number;
  totalBudget: number;
  spkProgress: SPKProgress[];
}

export interface Location {
  locationId: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface WorkItem {
  workItemId: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  category: string;
  subCategory: string;
}

export interface CostBreakdownDetail {
  amount: number;
  percentage: number;
  count: number;
}

export interface TotalProgress {
  percentage: number;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetUtilizationPercentage: number;
  plannedVsActualCostRatio: number;
  totalPlannedCost: number;
  isOverBudget: boolean;
  costBreakdown: {
    materials: CostBreakdownDetail;
    manpower: CostBreakdownDetail;
    equipment: CostBreakdownDetail;
  };
}

export interface SPKPerformance {
  spkId: string;
  spkNo: string;
  title: string;
  projectName: string;
  budget: number;
  workItemsAmount: number;
  workItemsCount: number;
  date: number;
  location: Location;
  workItems: WorkItem[];
  completedAmount: number;
  progressPercentage: number;
  activityCount: number;
  totalProgress: TotalProgress;
}

export interface BorrowPitLocation {
  borrowPitId: string;
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
}

export interface CostBreakdownOtherItem {
  costType: string;
  total: number;
  count: number;
}

export interface CostBreakdown {
  totalMaterialCost: number;
  totalManpowerCost: number;
  totalEquipmentCost: number;
  totalCost?: number;
  equipmentFuelCost?: number;
  equipmentRentalCost?: number;
  otherBreakdown?: CostBreakdownOtherItem[];
  // Legacy fields
  material?: number;
  manpower?: number;
  equipment?: number;
  other?: number;
  total?: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  monthName: string;
  totalSales: number;
  spkCount: number;
  value?: number;
  category?: string;
}

export interface WorkItemsDistribution {
  categoryName: string;
  count: number;
}

export interface ActivityStatusDistribution {
  status: string;
  count: number;
}

export interface ProgressByMonth {
  year: number;
  month: number;
  percentage: number;
}

export interface EquipmentPerformance {
  equipmentId: string;
  name: string;
  totalWorkingHours: number;
  totalMaintenanceHours: number;
  utilizationRate: number;
}

export interface TotalSpkContract {
  percentage: number;
  totalBudgetSpk: number;
  totalBudgetContract: number;
}

export interface TotalSpkClose {
  totalSpk: number;
  totalBudgetSpk: number;
}

export interface DashboardSummary {
  totalSPK: number;
  totalWorkItems: number;
  totalReports: number;
  totalDailyActivities: number;
  totalRepairReports: number;
  totalSpkContract: TotalSpkContract;
  totalspkclose: TotalSpkClose;
  totalCosts: number;
  // New API structure
  monthlyCosts: MonthlyAmount[];
  monthlySales: MonthlySales[];
  progressByMonth: ProgressByMonth[];
  borrowPitLocations: BorrowPitLocation[];
  spkPerformance: SPKPerformance[];
  costBreakdown: CostBreakdown;
  equipmentPerformance: EquipmentPerformance[];
  // Legacy fields
  monthlyCapaian?: MonthlyCapaian[];
  contractProgressPercent?: number;
  monthlyTrend?: MonthlyTrend[];
  workItemsDistribution?: WorkItemsDistribution[];
  activityStatusDistribution?: ActivityStatusDistribution[];
}

interface DashboardSummaryResponse {
  dashboardSummary: DashboardSummary;
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const query = `
    query GetDashboardSummary {
      dashboardSummary {
        # Summary data
        totalSPK
        totalWorkItems
        totalReports
        totalDailyActivities
        totalRepairReports
        totalSpkContract {
            percentage
            totalBudgetSpk
            totalBudgetContract
        }
        totalspkclose {
            totalSpk
            totalBudgetSpk
        }
        # Sales Data
        totalSales
        monthlySales {
          month
          year
          amount
        }
        
        # Cost Data
        totalCosts
        monthlyCosts {
          month
          year
          amount
        }
        
        # Progress Data
        progressByMonth {
          month
          year
          percentage
        }
        
        # SPK Performance with detailed data and costs
        spkPerformance {
          spkId
          spkNo
          title
          projectName
          budget
          workItemsAmount
          workItemsCount
          date
          location {
            locationId
            name
            latitude
            longitude
          }
          workItems {
            workItemId
            name
            description
            quantity
            unit
            unitPrice
            amount
            category
            subCategory
          }
          completedAmount
          progressPercentage
          activityCount
          # New cost and budget fields
          totalProgress {
            percentage
            totalBudget
            totalSpent
            remainingBudget
            budgetUtilizationPercentage
            plannedVsActualCostRatio
            totalPlannedCost
            isOverBudget
            costBreakdown {
              materials {
                amount
                percentage
                count
              }
              manpower {
                amount
                percentage
                count
              }
              equipment {
                amount
                percentage
                count
              }
            }
          }
        }
        
        # Cost Breakdown
        costBreakdown {
          totalMaterialCost
          totalManpowerCost
          totalEquipmentCost
          totalCost
          equipmentFuelCost
          equipmentRentalCost
          otherBreakdown {
            costType
            total
            count
          }
        }
        
        # Equipment Performance
        equipmentPerformance {
          equipmentId
          name
          totalWorkingHours
          totalMaintenanceHours
          utilizationRate
        }
        
        # Borrow Pit Locations
        borrowPitLocations {
          borrowPitId
          name
          locationName
          latitude
          longitude
        }
      }
    }
  `;

  const response = await graphQLClient.request<DashboardSummaryResponse>(query);
  return response.dashboardSummary;
};