import { graphQLClient } from "@/lib/graphql";

export interface Location {
  id: string;
  name: string;
}

export interface UserDetail {
  id: string;
  username: string;
  fullName: string;
}

export interface SPKDetail {
  id: string;
  spkNo: string;
  title: string;
  projectName: string;
  location: Location;
}

export interface WorkItem {
  id: string;
  name: string;
  unit: {
    name: string;
  };
}

export interface ActivityDetail {
  id: string;
  actualQuantity: {
    nr: number;
    r: number;
  };
  status: string;
  remarks: string;
  workItem: WorkItem;
}

export interface Equipment {
  id: string;
  equipmentCode: string;
  equipmentType: string;
}

export interface EquipmentLog {
  id: string;
  fuelIn: number;
  fuelRemaining: number;
  workingHour: number;
  hourlyRate: number;
  fuelPrice: number;
  isBrokenReported: boolean;
  remarks: string;
  equipment: Equipment;
}

export interface PersonnelRole {
  id: string;
  roleName: string;
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
}

export interface MaterialUsageLog {
  id: string;
  quantity: number;
  unitRate: number;
  remarks: string;
  material: Material;
}

export interface OtherCost {
  id: string;
  costType: string;
  amount: number;
  description: string;
  receiptNumber: string;
  remarks: string;
}

export interface DailyActivity {
  id: string;
  date: string;
  location: string;
  weather: string;
  status: string;
  workStartTime: string;
  workEndTime: string;
  startImages: string[];
  finishImages: string[];
  closingRemarks: string;
  progressPercentage: number;
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

interface GetDailyActivitiesResponse {
  dailyActivitiesWithDetailsByUser: DailyActivity[];
}

const GET_DAILY_ACTIVITIES = `
  query GetDailyActivitiesWithDetailsByUser($userId: ID!) {
    dailyActivitiesWithDetailsByUser(userId: $userId) {
      id
      date
      location
      weather
      status
      workStartTime
      workEndTime
      startImages
      finishImages
      closingRemarks
      progressPercentage
      activityDetails {
        id
        actualQuantity {
          nr
          r
        }
        status
        remarks
        workItem {
          id
          name
          unit {
            name
          }
        }
      }
      equipmentLogs {
        id
        fuelIn
        fuelRemaining
        workingHour
        isBrokenReported
        remarks
        equipment {
          id
          equipmentCode
          equipmentType
        }
      }
      manpowerLogs {
        id
        role
        personCount
        hourlyRate
        workingHours
        personnelRole {
          id
          roleName
        }
      }
      materialUsageLogs {
        id
        quantity
        unitRate
        remarks
        material {
          id
          name
        }
      }
      otherCosts {
        id
        costType
        amount
        description
        receiptNumber
        remarks
      }
      spkDetail {
        id
        spkNo
        title
        projectName
        location {
          id
          name
        }
      }
      userDetail {
        id
        username
        fullName
      }
      createdAt
      updatedAt
    }
  }
`;

export const getDailyActivitiesByUser = async (userId: string, token: string): Promise<DailyActivity[]> => {
  try {
    const response = await graphQLClient.request<GetDailyActivitiesResponse>(GET_DAILY_ACTIVITIES, { userId }, {
      Authorization: `Bearer ${token}`
    });
    return response.dailyActivitiesWithDetailsByUser;
  } catch (error) {
    console.error('Error fetching daily activities:', error);
    throw error;
  }
};

interface GetDailyActivitiesByApproverResponse {
  dailyActivitiesWithDetailsByApprover: DailyActivity[];
}

const GET_DAILY_ACTIVITIES_BY_APPROVER = `
  query GetDailyActivitiesWithDetailsByApprover($approverId: ID!) {
    dailyActivitiesWithDetailsByApprover(approverId: $approverId) {
      id
      date
      location
      weather
      status
      workStartTime
      workEndTime
      startImages
      finishImages
      closingRemarks
      progressPercentage
      activityDetails {
        id
        actualQuantity {
          nr
          r
        }
        status
        remarks
        workItem {
          id
          name
          unit {
            id
            name
            code
          }
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
        }
      }
      equipmentLogs {
        id
        fuelIn
        fuelRemaining
        workingHour
        hourlyRate
        fuelPrice
        isBrokenReported
        remarks
        equipment {
          id
          equipmentCode
          equipmentType
        }
      }
      manpowerLogs {
        id
        role
        personCount
        hourlyRate
        workingHours
        personnelRole {
          id
          roleName
        }
      }
      materialUsageLogs {
        id
        quantity
        unitRate
        remarks
        material {
          id
          name
        }
      }
      otherCosts {
        id
        costType
        amount
        description
        receiptNumber
        remarks
      }
      spkDetail {
        id
        spkNo
        title
        projectName
        location {
          id
          name
        }
      }
      userDetail {
        id
        username
        fullName
      }
      createdAt
      updatedAt
    }
  }
`;

export const getDailyActivitiesByApprover = async (approverId: string, token: string): Promise<DailyActivity[]> => {
  try {
    const response = await graphQLClient.request<GetDailyActivitiesByApproverResponse>(
      GET_DAILY_ACTIVITIES_BY_APPROVER, 
      { approverId }, 
      {
        Authorization: `Bearer ${token}`
      }
    );
    return response.dailyActivitiesWithDetailsByApprover;
  } catch (error) {
    console.error('Error fetching daily activities by approver:', error);
    throw error;
  }
};

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