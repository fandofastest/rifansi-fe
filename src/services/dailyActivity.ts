import { graphQLClient } from "@/lib/graphql";

export interface Location {
  type: string;
  coordinates: number[];
}

export interface Area {
  id: string;
  name: string;
  location: Location;
}

export interface Role {
  id: string;
  roleCode: string;
  roleName: string;
  description: string;
}

export interface UserDetail {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  area: Area;
  lastLogin: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface SubCategory {
  id: string;
  name: string;
}

export interface WorkItemDetail {
  id: string;
  name: string;
  description: string;
  unit: Unit;
  category: Category;
  subCategory: SubCategory;
}

export interface SPKWorkItem {
  workItemId: string;
  boqVolume: {
    nr: number;
    r: number;
  };
  amount: number;
  rates: Rates;
  description: string;
  workItem: WorkItemDetail;
}

export interface SPKLocation {
  id: string;
  name: string;
}

export interface SPKDetail {
  id: string;
  spkNo: string;
  wapNo: string;
  title: string;
  projectName: string;
  contractor: string;
  budget: number;
  startDate: string;
  endDate: string;
  workDescription: string;
  date: string;
  location: SPKLocation;
  workItems: SPKWorkItem[];
}

export interface Unit {
  id: string;
  name: string;
  code: string;
}

export interface Rates {
  nr: {
    rate: number;
    description: string;
  };
  r: {
    rate: number;
    description: string;
  };
}

export interface WorkItem {
  id: string;
  name: string;
  description: string;
  unit: Unit;
  rates: Rates;
  category: Category;
  subCategory: SubCategory;
}

export interface ActivityDetail {
  id: string;
  actualQuantity: {
    nr: number;
    r: number;
  };
  status: string;
  remarks: string;
  rates: {
    nr: {
      rate: number;
      description: string;
    };
    r: {
      rate: number;
      description: string;
    };
  };
  boqVolume: {
    nr: number;
    r: number;
  };
  workItem: WorkItem;
}

export interface Equipment {
  id: string;
  equipmentCode: string;
  equipmentType: string;
  plateOrSerialNo: string;
  defaultOperator: string;
  year: number;
  serviceStatus: string;
}

export interface EquipmentLog {
  id: string;
  equipment: Equipment;
  fuelIn: number;
  fuelRemaining: number;
  workingHour: number;
  rentalRatePerDay: number;
  fuelPrice: number;
  isBrokenReported: boolean;
  remarks: string;
}

export interface PersonnelRole {
  id: string;
  roleCode: string;
  roleName: string;
  description: string;
  isPersonel: boolean;
}

export interface ManpowerLog {
  id: string;
  role: string;
  personCount: number;
  hourlyRate: number;
  workingHours: number;
  personnelRole: PersonnelRole;
}

export interface Material {
  id: string;
  name: string;
  description: string;
  unitRate: number;
  unit: Unit;
}

export interface MaterialUsageLog {
  id: string;
  material: Material;
  quantity: number;
  unitRate: number;
  remarks: string;
}

export interface OtherCost {
  id: string;
  costType: string;
  description: string;
  amount: number;
  remarks: string;
}

export interface DailyActivity {
  id: string;
  date: string;
  area: Area;
  weather: string | null;
  status: string;
  workStartTime: string;
  workEndTime: string;
  startImages: string[];
  finishImages: string[];
  closingRemarks: string;
  isApproved: boolean;
  approvedBy: {
    id: string;
    username: string;
    fullName: string;
    email: string;
  } | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  progressPercentage: number;
  budgetUsage: number;
  activityDetails: ActivityDetail[];
  equipmentLogs: EquipmentLog[];
  manpowerLogs: ManpowerLog[];
  materialUsageLogs: MaterialUsageLog[];
  otherCosts: OtherCost[];
  spkDetail: SPKDetail;
  userDetail: UserDetail;
  createdAt: string;
  updatedAt: string;
}

// Get Daily Activity with Details (All data)
interface GetDailyActivityWithDetailsResponse {
  getDailyActivityWithDetails: DailyActivity[];
}

const GET_DAILY_ACTIVITY_WITH_DETAILS = `
  query GetDailyActivityWithDetails(
      $areaId: ID
      $userId: ID
      $activityId: ID
      $startDate: String
      $endDate: String
    ) {
      getDailyActivityWithDetails(
        areaId: $areaId
        userId: $userId
        activityId: $activityId
        startDate: $startDate
        endDate: $endDate
        
        
      ) {
        id
        date
        area {
          id
          name
          location {
            type
            coordinates
          }
        }
        weather
        status
        workStartTime
        workEndTime
        startImages
        finishImages
        closingRemarks
        isApproved
        progressPercentage
        approvedBy {
          id
          username
          fullName
          email
        }
        approvedAt
        rejectionReason
        progressPercentage
        budgetUsage
        activityDetails {
          id
          actualQuantity {
            nr
            r
          }
          status
          remarks
          rates {
            nr {
              rate
              description
            }
            r {
              rate
              description
            }
          }
          boqVolume {
            nr
            r
          }
          workItem {
            id
            name
            description
            unit {
              id
              name
              code
            }
            category {
              id
              name
            }
            subCategory {
              id
              name
            }
          }
        }
        equipmentLogs {
          id
          equipment {
            id
            equipmentCode
            equipmentType
            plateOrSerialNo
            defaultOperator
            year
            serviceStatus
          }
          fuelIn
          fuelRemaining
          workingHour
          hourlyRate
          rentalRatePerDay
          fuelPrice
          isBrokenReported
          remarks
        }
        manpowerLogs {
          id
          role
          personCount
          hourlyRate
          workingHours
          personnelRole {
            id
            roleCode
            roleName
            description
            isPersonel
          }
        }
        materialUsageLogs {
          id
          material {
            id
            name
            description
            unitRate
            unit {
              id
              name
              code
            }
          }
          quantity
          unitRate
          remarks
        }
        otherCosts {
          id
          costType
          description
          amount
          remarks
        }
        spkDetail {
          id
          spkNo
          wapNo
          title
          projectName
          contractor
          budget
          startDate
          endDate
          workDescription
          date
          location {
            id
            name
          }
          workItems {
            workItemId
            boqVolume {
              nr
              r
            }
            amount
            rates {
              nr {
                rate
                description
              }
              r {
                rate
                description
              }
            }
            description
            workItem {
              id
              name
              description
              unit {
                id
                name
                code
              }
              category {
                id
                name
              }
              subCategory {
                id
                name
              }
            }
          }
        }
        userDetail {
          id
          username
          fullName
          email
          phone
          role {
            id
            roleCode
            roleName
            description
          }
          area {
            id
            name
            location {
              type
              coordinates
            }
          }
          lastLogin
        }
        createdAt
        updatedAt
      }
    }
`;

export const getDailyActivityWithDetails = async (
  token: string,
  variables?: {
    areaId?: string;
    userId?: string;
    activityId?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<DailyActivity[]> => {
  try {
    const response = await graphQLClient.request<GetDailyActivityWithDetailsResponse>(
      GET_DAILY_ACTIVITY_WITH_DETAILS,
      variables || {},
      {
        Authorization: `Bearer ${token}`
      }
    );
    return response.getDailyActivityWithDetails;
  } catch (error) {
    console.error('Error fetching daily activity with details:', error);
    throw error;
  }
};

// Get Daily Activity by Area (now uses the main query with areaId parameter)
export const getDailyActivityByArea = async (areaId: string, token: string): Promise<DailyActivity[]> => {
  try {
    return await getDailyActivityWithDetails(token, { areaId });
  } catch (error) {
    console.error('Error fetching daily activity by area:', error);
    throw error;
  }
};

// Get Daily Activity by User (now uses the main query with userId parameter)
export const getDailyActivityByUser = async (userId: string, token: string): Promise<DailyActivity[]> => {
  try {
    return await getDailyActivityWithDetails(token, { userId });
  } catch (error) {
    console.error('Error fetching daily activity by user:', error);
    throw error;
  }
};

// Get Daily Activity by Date Range (now uses the main query with date range parameters)
export const getDailyActivityByDateRange = async (
  startDate: string,
  endDate: string,
  token: string
): Promise<DailyActivity[]> => {
  try {
    return await getDailyActivityWithDetails(token, { startDate, endDate });
  } catch (error) {
    console.error('Error fetching daily activity by date range:', error);
    throw error;
  }
};

// Approve Daily Report (keeping this as it might still be needed)
interface ApprovalHistory {
  status: string;
  remarks: string;
  updatedBy: {
    id: string;
    fullName: string;
  };
  updatedAt: string;
}

interface ApproveDailyReportResponse {
  approveDailyReport: {
    id: string;
    date: string;
    weather: string;
    status: string;
    workStartTime: string;
    workEndTime: string;
    startImages: string[];
    finishImages: string[];
    closingRemarks: string;
    isApproved: boolean;
    approvedBy: {
      id: string;
      fullName: string;
    };
    approvedAt: string;
    rejectionReason: string;
    approvalHistory: ApprovalHistory[];
    lastUpdatedBy: {
      id: string;
      fullName: string;
    };
    lastUpdatedAt: string;
  };
}

const APPROVE_DAILY_REPORT = `
  mutation ApproveDailyReport($id: ID!, $status: String!, $remarks: String) {
    approveDailyReport(id: $id, status: $status, remarks: $remarks) {
      id
      date
      weather
      status
      workStartTime
      workEndTime
      startImages
      finishImages
      closingRemarks
      isApproved
      approvedBy {
        id
        fullName
      }
      approvedAt
      rejectionReason
      approvalHistory {
        status
        remarks
        updatedBy {
          id
          fullName
        }
        updatedAt
      }
      lastUpdatedBy {
        id
        fullName
      }
      lastUpdatedAt
    }
  }
`;

export const approveDailyReport = async (
  id: string,
  status: string,
  remarks: string,
  token: string
): Promise<ApproveDailyReportResponse['approveDailyReport']> => {
  try {
    const response = await graphQLClient.request<ApproveDailyReportResponse>(
      APPROVE_DAILY_REPORT,
      { id, status, remarks },
      {
        Authorization: `Bearer ${token}`
      }
    );
    return response.approveDailyReport;
  } catch (error) {
    console.error('Error approving daily report:', error);
    throw error;
  }
};

// Delete Daily Activity (keeping this as it might still be needed)
interface DeleteDailyActivityResponse {
  deleteDailyActivityById: {
    success: boolean;
    message: string;
  };
}

const DELETE_DAILY_ACTIVITY = `
  mutation DeleteDailyActivityById($id: ID!) {
    deleteDailyActivityById(id: $id) {
      success
      message
    }
  }
`;

export const deleteDailyActivity = async (id: string, token: string): Promise<DeleteDailyActivityResponse['deleteDailyActivityById']> => {
  try {
    const response = await graphQLClient.request<DeleteDailyActivityResponse>(
      DELETE_DAILY_ACTIVITY,
      { id },
      {
        Authorization: `Bearer ${token}`
      }
    );
    return response.deleteDailyActivityById;
  } catch (error) {
    console.error('Error deleting daily activity:', error);
    throw error;
  }
};

// Fungsi baru: getDailyActivityWithDetailsRange
const GET_DAILY_ACTIVITY_WITH_DETAILS_RANGE = `
  query GetDailyActivityWithDetails(
      $areaId: ID
      $userId: ID
      $activityId: ID
      $startDate: String
      $endDate: String
    ) {
      getDailyActivityWithDetails(
        areaId: $areaId
        userId: $userId
        activityId: $activityId
        startDate: $startDate
        endDate: $endDate
      ) {
        id
        date
        area {
          id
          name
          location {
            type
            coordinates
          }
        }
        weather
        status
        workStartTime
        workEndTime
        startImages
        finishImages
        closingRemarks
        isApproved
        progressPercentage
        approvedBy {
          id
          username
          fullName
          email
        }
        approvedAt
        rejectionReason
        progressPercentage
        budgetUsage
        activityDetails {
          id
          actualQuantity {
            nr
            r
          }
          status
          remarks
          rates {
            nr {
              rate
              description
            }
            r {
              rate
              description
            }
          }
          boqVolume {
            nr
            r
          }
          workItem {
            id
            name
            description
            unit {
              id
              name
              code
            }
            category {
              id
              name
            }
            subCategory {
              id
              name
            }
          }
        }
        equipmentLogs {
          id
          equipment {
            id
            equipmentCode
            equipmentType
            plateOrSerialNo
            defaultOperator
            year
            serviceStatus
          }
          fuelIn
          fuelRemaining
          workingHour
          hourlyRate
          rentalRatePerDay
          fuelPrice
          isBrokenReported
          remarks
        }
        manpowerLogs {
          id
          role
          personCount
          hourlyRate
          workingHours
          personnelRole {
            id
            roleCode
            roleName
            description
            isPersonel
          }
        }
        materialUsageLogs {
          id
          material {
            id
            name
            description
            unitRate
            unit {
              id
              name
              code
            }
          }
          quantity
          unitRate
          remarks
        }
        otherCosts {
          id
          costType
          description
          amount
          remarks
        }
        spkDetail {
          id
          spkNo
          wapNo
          title
          projectName
          contractor
          budget
          startDate
          endDate
          workDescription
          date
          location {
            id
            name
          }
          workItems {
            workItemId
            boqVolume {
              nr
              r
            }
            amount
            rates {
              nr {
                rate
                description
              }
              r {
                rate
                description
              }
            }
            description
            workItem {
              id
              name
              description
              unit {
                id
                name
                code
              }
              category {
                id
                name
              }
              subCategory {
                id
                name
              }
            }
          }
        }
        userDetail {
          id
          username
          fullName
          email
          phone
          role {
            id
            roleCode
            roleName
            description
          }
          area {
            id
            name
            location {
              type
              coordinates
            }
          }
          lastLogin
        }
        createdAt
        updatedAt
      }
    }
`;

export const getDailyActivityWithDetailsRange = async (
  token: string,
  params: {
    startDate?: string;
    endDate?: string;
    areaId?: string;
    userId?: string;
    activityId?: string;
  }
): Promise<DailyActivity[]> => {
  try {
    const response = await graphQLClient.request<{ getDailyActivityWithDetails: DailyActivity[] }>(
      GET_DAILY_ACTIVITY_WITH_DETAILS_RANGE,
      params,
      { Authorization: `Bearer ${token}` }
    );
    return response.getDailyActivityWithDetails;
  } catch (error) {
    console.error('Error fetching daily activities with range:', error);
    throw error;
  }
};

// Lightweight Daily Activity list (no activityDetails, equipment/manpower/material logs, otherCosts, or spkDetail.workItems)
interface GetDailyActivityListRangeResponse {
  getDailyActivityWithDetails: DailyActivityListItem[];
}

export interface DailyActivityListItem {
  id: string;
  date: string;
  area: {
    id: string;
    name: string;
  };
  weather: string | null;
  status: string;
  workStartTime: string;
  workEndTime: string;
  startImages: string[];
  finishImages: string[];
  closingRemarks: string;
  isApproved: boolean;
  approvedBy: {
    id: string;
    username: string;
    fullName: string;
    email: string;
  } | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  progressPercentage: number;
  budgetUsage: number;
  activityDetails?: {
    actualQuantity: {
      nr: number;
      r: number;
    };
    rates: {
      nr: { rate: number };
      r: { rate: number };
    };
  }[];
  spkDetail: {
    id: string;
    spkNo: string;
    wapNo: string;
    title: string;
    projectName: string;
    contractor: string;
    budget: number;
    startDate: string;
    endDate: string;
    workDescription: string;
    date: string;
    location: {
      id: string;
      name: string;
    };
  };
  userDetail: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

const GET_DAILY_ACTIVITY_LIST_RANGE = `
  query GetDailyActivityListRange(
    $areaId: ID
    $userId: ID
    $activityId: ID
    $spkId: ID
    $startDate: String
    $endDate: String
  ) {
    getDailyActivityWithDetails(
      areaId: $areaId
      userId: $userId
      activityId: $activityId
      spkId: $spkId
      startDate: $startDate
      endDate: $endDate
    ) {
      id
      date
      area {
        id
        name
      }
      weather
      status
      workStartTime
      workEndTime
      startImages
      finishImages
      closingRemarks
      isApproved
      approvedBy {
        id
        username
        fullName
        email
      }
      approvedAt
      rejectionReason
      progressPercentage
      budgetUsage
      activityDetails {
        actualQuantity { nr r }
        rates { nr { rate } r { rate } }
      }
      spkDetail {
        id
        spkNo
        wapNo
        title
        projectName
        contractor
        budget
        startDate
        endDate
        workDescription
        date
        location {
          id
          name
        }
      }
      userDetail {
        id
        username
        fullName
        email
        phone
      }
      createdAt
      updatedAt
    }
  }
`;

export const getDailyActivityListRange = async (
  token: string,
  params: {
    startDate?: string;
    endDate?: string;
    areaId?: string;
    userId?: string;
    activityId?: string;
    spkId?: string;
  }
): Promise<DailyActivityListItem[]> => {
  try {
    const response = await graphQLClient.request<GetDailyActivityListRangeResponse>(
      GET_DAILY_ACTIVITY_LIST_RANGE,
      params,
      { Authorization: `Bearer ${token}` }
    );
    return response.getDailyActivityWithDetails;
  } catch (error) {
    console.error('Error fetching lightweight daily activities with range:', error);
    throw error;
  }
};

