import { graphQLClient } from "@/lib/graphql";

// Dashboard Summary interfaces
export interface MonthlySales {
  year: number;
  month: number;
  monthName: string;
  sales: number;
  cost: number;
  costBreakdown: {
    material: number;
    manpower: number;
    equipment: number;
    other: number;
  };
  profit: number;
  profitMargin: number;
  spkCount: number;
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

export interface SPKPerformance {
  spkId: string;
  spkNo: string;
  title: string;
  projectName: string;
  budget: number;
  workItemsAmount: number;
  workItemsCount: number;
  date: number;
}

export interface CostBreakdown {
  material: number;
  manpower: number;
  equipment: number;
  other: number;
  total: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  monthName: string;
  totalSales: number;
  spkCount: number;
}

export interface WorkItemsDistribution {
  categoryName: string;
  count: number;
}

export interface ActivityStatusDistribution {
  status: string;
  count: number;
}

export interface DashboardSummary {
  totalSPK: number;
  totalWorkItems: number;
  totalReports: number;
  totalDailyActivities: number;
  totalRepairReports: number;
  monthlySales: MonthlySales[];
  monthlyCapaian: MonthlyCapaian[];
  spkPerformance: SPKPerformance[];
  costBreakdown: CostBreakdown;
  monthlyTrend: MonthlyTrend[];
  workItemsDistribution: WorkItemsDistribution[];
  activityStatusDistribution: ActivityStatusDistribution[];
}

interface DashboardSummaryResponse {
  dashboardSummary: DashboardSummary;
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const query = `
    query DashboardSummary {
      dashboardSummary {
        totalSPK
        totalWorkItems
        totalReports
        totalDailyActivities
        totalRepairReports
        monthlySales {
          year
          month
          monthName
          sales
          cost
          costBreakdown {
            material
            manpower
            equipment
            other
          }
          profit
          profitMargin
          spkCount
        }
        monthlyCapaian {
          year
          month
          monthName
          totalSPKActive
          totalBudget
          spkProgress {
            spkId
            spkTitle
            spkBudget
            activityCount
          }
        }
        spkPerformance {
          spkId
          spkNo
          title
          projectName
          budget
          workItemsAmount
          workItemsCount
          date
        }
        costBreakdown {
          material
          manpower
          equipment
          other
          total
        }
        monthlyTrend {
          year
          month
          monthName
          totalSales
          spkCount
        }
        workItemsDistribution {
          categoryName
          count
        }
        activityStatusDistribution {
          status
          count
        }
      }
    }
  `;

  const response = await graphQLClient.request<DashboardSummaryResponse>(query);
  return response.dashboardSummary;
}; 