import { graphQLClient, getUploadUrl } from '@/lib/graphql';

export interface Location {
  id: string;
  name: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

export interface WorkItem {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  subCategory: {
    id: string;
    name: string;
  };
  unit: {
    id: string;
    name: string;
  };
}

export interface SPKWorkItem {
  workItemId: string;
  boqVolume: {
    nr: number;
    r: number;
  };
  amount: number;
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
  description: string;
  workItem: WorkItem;
}

export interface SPK {
  id: string;
  spkNo: string;
  wapNo: string;
  title: string;
  projectName: string;
  date: number;
  contractor?: string;
  workDescription?: string;
  location?: Location;
  startDate?: number;
  endDate?: number;
  budget?: number;
  contractNo?: string;
  status: string;
  workItems: SPKWorkItem[];
  createdAt: number;
  updatedAt: number;
}

interface CreateSPKInput {
  spkNo: string;
  wapNo: string;
  title: string;
  projectName: string;
  date: string;
  contractor?: string;
  workDescription?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  contractNo?: string;
}

interface UpdateSPKInput {
  id: string;
  spkNo?: string;
  wapNo?: string;
  title?: string;
  projectName?: string;
  date?: string;
  contractor?: string;
  workDescription?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  contractNo?: string;
  status?: string;
}

interface DeleteSPKInput {
  id: string;
}

interface CreateSPKResponse {
  createSPK: SPK;
}

interface UpdateSPKResponse {
  updateSPK: SPK;
}

interface DeleteSPKResponse {
  deleteSPK: boolean;
}

interface SPKsResponse {
  spks: SPK[];
}

interface AddWorkItemInput {
  workItemId: string;
  boqVolume: {
    nr: number;
    r: number;
  };
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
  description: string;
}

interface AddWorkItemToSPKResponse {
  addWorkItemToSPK: SPK;
}

interface GetSPKsVariables {
  startDate?: string;
  endDate?: string;
}

interface ImportSPKResponse {
  success: boolean;
  message: string;
  data?: SPK[];
}

export interface SPKProgress {
  percentage: number;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  totalSales?: number;
}

export interface WorkItemProgress {
  completedVolume: {
    nr: number;
    r: number;
  };
  remainingVolume: {
    nr: number;
    r: number;
  };
  percentageComplete: number;
  spentAmount: number;
  remainingAmount: number;
}

export interface CostBreakdownItem {
  material?: string;
  quantity?: number;
  unit?: string;
  unitRate?: number;
  role?: string;
  numberOfWorkers?: number;
  workingHours?: number;
  hourlyRate?: number;
  equipment?: {
    id: string;
    equipmentCode: string;
    plateOrSerialNo: string;
    equipmentType: string;
    description: string;
  };
  rentalRatePerDay?: number;
  fuelUsed?: number;
  fuelPrice?: number;
  description?: string;
  cost: number;
}

export interface CostBreakdownCategory {
  totalCost: number;
  items: CostBreakdownItem[];
}

export interface CostBreakdown {
  totalCost: number;
  dailyActivities: {
    activityId: string;
    date: number;
    totalCost: number;
    materials: CostBreakdownCategory;
    manpower: CostBreakdownCategory;
    equipment: CostBreakdownCategory;
    otherCosts: CostBreakdownCategory;
  }[];
}

export interface DailyActivityWorkItem {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  unitId: string;
  category: {
    id: string;
    name: string;
    code: string;
  };
  subCategory: {
    id: string;
    name: string;
  };
  unit: {
    id: string;
    name: string;
    code: string;
  };
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
  dailyProgress: {
    nr: number;
    r: number;
  };
  progressAchieved: {
    nr: number;
    r: number;
  };
  actualQuantity: {
    nr: number;
    r: number;
  };
  dailyCost: {
    nr: number;
    r: number;
  };
  lastUpdatedAt: number;
}

export interface DailyActivity {
  id: string;
  date: number;
  location: string;
  weather: string;
  status: string;
  workStartTime: string;
  workEndTime: string;
  createdBy: string;
  closingRemarks: string;
  workItems: DailyActivityWorkItem[];
  costs: {
    materials: CostBreakdownCategory;
    manpower: CostBreakdownCategory;
    equipment: CostBreakdownCategory;
    otherCosts: CostBreakdownCategory;
  };
}

export interface SPKDetailWithProgress extends SPK {
  totalProgress: SPKProgress;
  workItems: (SPKWorkItem & {
    progress: WorkItemProgress;
  })[];
  dailyActivities: DailyActivity[];
  costBreakdown: CostBreakdown;
}

// Lightweight SPK list item for performant list/dropdown fetching
export interface SPKListItem {
  id: string;
  spkNo: string;
  projectName: string;
  title: string;
}

interface SPKListLiteResponse {
  spks: SPKListItem[];
}

const GET_SPKS = `
  query GetSPKs($startDate: String, $endDate: String) {
    spks(startDate: $startDate, endDate: $endDate) {
      id
      spkNo
      wapNo
      title
      projectName
      date
      contractor
      workDescription
      contractNo
      location {
        id
        name
        location {
          type
          coordinates
        }
      }
      startDate
      endDate
      budget
      status
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
          category {
            id
            name
          }
          subCategory {
            id
            name
          }
          unit {
            id
            name
          }
        }
      }
      createdAt
      updatedAt
    }
  }
`;

// Lightweight SPK list query: only essential fields
const GET_SPKS_LITE = `
  query GetSPKsLite($startDate: String, $endDate: String) {
    spks(startDate: $startDate, endDate: $endDate) {
      id
      spkNo
      projectName
      title
    }
  }
`;

const CREATE_SPK = `
  mutation CreateSPK($input: CreateSPKInput!) {
    createSPK(input: $input) {
      id
      spkNo
      wapNo
      title
      projectName
      date
      contractor
      workDescription
      location {
        id
        name
      }
      startDate
      endDate
      budget
      contractNo
      status
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_SPK = `
  mutation UpdateSPK($id: ID!, $input: UpdateSPKInput!) {
    updateSPK(id: $id, input: $input) {
      id
      spkNo
      wapNo
      title
      projectName
      date
      contractor
      workDescription
      location {
        id
        name
      }
      startDate
      endDate
      budget
      contractNo
      status
      createdAt
      updatedAt
    }
  }
`;

const DELETE_SPK = `
  mutation DeleteSPK($id: ID!) {
    deleteSPK(id: $id)
  }
`;

const ADD_WORK_ITEM_TO_SPK = `
  mutation AddWorkItemToSPK($spkId: ID!, $input: AddWorkItemInput!) {
    addWorkItemToSPK(spkId: $spkId, input: $input) {
      id
      spkNo
      status
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
          unit {
            id
            name
          }
        }
      }
    }
  }
`;

const GET_SPK_BY_ID = `
  query GetSPKById($id: ID!) {
    spk(id: $id) {
      id
      spkNo
      wapNo
      title
      projectName
      date
      contractor
      workDescription
      location {
        id
        name
      }
      startDate
      endDate
      budget
      contractNo
      status
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
          category { id name }
          subCategory { id name }
          unit { id name }
        }
      }
    }
  }
`;

const UPDATE_SPK_WORK_ITEM = `
  mutation UpdateSPKWorkItem($spkId: ID!, $workItemId: ID!, $input: UpdateSPKWorkItemInput!) {
    updateSPKWorkItem(spkId: $spkId, workItemId: $workItemId, input: $input) {
      id
      spkNo
      wapNo
      title
      projectName
      status
    }
  }
`;

const REMOVE_WORK_ITEM_FROM_SPK = `
  mutation RemoveWorkItemFromSPK($spkId: ID!, $workItemId: ID!) {
    removeWorkItemFromSPK(spkId: $spkId, workItemId: $workItemId) {
      id
      spkNo
      status
      workItems {
        workItemId
        boqVolume { nr r }
        amount
        workItem { id name }
      }
    }
  }
`;

const UPDATE_SPK_STATUS = `
  mutation UpdateSpkStatus($id: ID!, $status: String!) {
    updateSpkStatus(id: $id, status: $status) {
      id
      spkNo
      status
      title
      projectName
      date
      contractor
      workDescription
      location {
        id
        name
      }
      startDate
      endDate
      budget
      contractNo
      createdAt
      updatedAt
    }
  }
`;

const GET_SPK_DETAILS_WITH_PROGRESS = `
  query GetSPKDetailsWithProgressBySpkId($spkId: ID!, $startDate: String, $endDate: String) {
    spkDetailsWithProgress(spkId: $spkId, startDate: $startDate, endDate: $endDate) {
      id
      spkNo
      wapNo
      title
      projectName
      date
      contractor
      workDescription
      location {
        id
        name
      }
      startDate
      endDate
      budget
      dailyActivities {
        id
        date
        location
        weather
        status
        workStartTime
        workEndTime
        createdBy
        closingRemarks
        workItems {
          id
          name
          description
          categoryId
          subCategoryId
          unitId
          category {
            id
            name
            code
          }
          subCategory {
            id
            name
          }
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
          boqVolume {
            nr
            r
          }
          dailyProgress {
            nr
            r
          }
          progressAchieved {
            nr
            r
          }
          actualQuantity {
            nr
            r
          }
          dailyCost {
            nr
            r
          }
          lastUpdatedAt
        }
        costs {
          materials {
            totalCost
            items {
              material
              quantity
              unit
              unitRate
              cost
            }
          }
          manpower {
            totalCost
            items {
              role
              numberOfWorkers
              workingHours
              hourlyRate
              cost
            }
          }
          equipment {
            totalCost
            items {
              equipment {
                id
                equipmentCode
                plateOrSerialNo
                equipmentType
                description
              }
              workingHours
              hourlyRate
              rentalRatePerDay
              fuelUsed
              fuelPrice
              cost
            }
          }
          otherCosts {
            totalCost
            items {
              description
              cost
            }
          }
        }
      }
      totalProgress {
        percentage
        totalBudget
        totalSpent
        remainingBudget
        totalSales
      }
      createdAt
      updatedAt
    }
  }
`;

// Lightweight: only fields needed to compute daily progress
const GET_SPK_DETAILS_PROGRESS_ONLY = `
  query GetSPKDetailsWithProgressBySpkId($spkId: ID!, $startDate: String, $endDate: String) {
    spkDetailsWithProgress(spkId: $spkId, startDate: $startDate, endDate: $endDate) {
      id
      dailyActivities {
        id
        date
        status
        workItems {
          id
          boqVolume { nr r }
          actualQuantity { nr r }
        }
      }
    }
  }
`;

// Lightweight: only fields needed to compute budget usage (equipment rental, fuel, manpower, materials, others)
const GET_SPK_DETAILS_BUDGET_ONLY = `
  query GetSPKDetailsWithProgressBySpkId($spkId: ID!, $startDate: String, $endDate: String) {
    spkDetailsWithProgress(spkId: $spkId, startDate: $startDate, endDate: $endDate) {
      id
      dailyActivities {
        id
        date
        status
        costs {
          equipment {
            items {
              workingHours
              rentalRatePerDay
              fuelUsed
              fuelPrice
            }
          }
          manpower { totalCost }
          materials { totalCost }
          otherCosts { totalCost }
        }
      }
    }
  }
`;

// Lightweight: cost breakdown per category per day (same selection as budget-only, reused for stacked bars)
const GET_SPK_DETAILS_COST_ONLY = `
  query GetSPKDetailsWithProgressBySpkId($spkId: ID!, $startDate: String, $endDate: String) {
    spkDetailsWithProgress(spkId: $spkId, startDate: $startDate, endDate: $endDate) {
      id
      dailyActivities {
        id
        date
        status
        costs {
          equipment {
            items {
              workingHours
              rentalRatePerDay
              fuelUsed
              fuelPrice
            }
          }
          manpower { totalCost }
          materials { totalCost }
          otherCosts { totalCost }
        }
      }
    }
  }
`;

export interface UpdateSPKWorkItemInput {
  boqVolume: {
    nr: number;
    r: number;
  };
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
  description?: string;
}

export const getSPKs = async (
  token: string,
  startDate?: string,
  endDate?: string
): Promise<SPK[]> => {
  try {
    const variables: GetSPKsVariables = {};
    if (startDate) variables.startDate = startDate;
    if (endDate) variables.endDate = endDate;

    const response = await graphQLClient.request<SPKsResponse>(GET_SPKS, variables, {
      Authorization: `Bearer ${token}`
    });
    return response.spks;
  } catch (error) {
    console.error('Error fetching SPKs:', error);
    throw error;
  }
};

// Lightweight SPK list service for summary page dropdowns
export const getSPKListLite = async (
  token: string,
  startDate?: string,
  endDate?: string
): Promise<SPKListItem[]> => {
  try {
    const variables: GetSPKsVariables = {};
    if (startDate) variables.startDate = startDate;
    if (endDate) variables.endDate = endDate;

    const response = await graphQLClient.request<SPKListLiteResponse>(GET_SPKS_LITE, variables, {
      Authorization: `Bearer ${token}`,
    });
    return response.spks;
  } catch (error) {
    console.error('Error fetching lightweight SPK list:', error);
    throw error;
  }
};

export const createSPK = async (input: CreateSPKInput, token: string): Promise<SPK> => {
  try {
    const response = await graphQLClient.request<CreateSPKResponse>(CREATE_SPK, { input }, {
      Authorization: `Bearer ${token}`
    });
    return response.createSPK;
  } catch (error) {
    console.error('Error creating SPK:', error);
    throw error;
  }
};

export const updateSPK = async (input: UpdateSPKInput, token: string): Promise<SPK> => {
  try {
    const { id, ...inputWithoutId } = input;
    const response = await graphQLClient.request<UpdateSPKResponse>(UPDATE_SPK, { id, input: inputWithoutId }, {
      Authorization: `Bearer ${token}`
    });
    return response.updateSPK;
  } catch (error) {
    console.error('Error updating SPK:', error);
    throw error;
  }
};

export const deleteSPK = async (input: DeleteSPKInput, token: string): Promise<boolean> => {
  try {
    const response = await graphQLClient.request<DeleteSPKResponse>(DELETE_SPK, input, {
      Authorization: `Bearer ${token}`
    });
    return response.deleteSPK;
  } catch (error) {
    console.error('Error deleting SPK:', error);
    throw error;
  }
};

export const addWorkItemToSPK = async (
  spkId: string,
  input: AddWorkItemInput,
  token: string
): Promise<SPK> => {
  try {
    const response = await graphQLClient.request<AddWorkItemToSPKResponse>(ADD_WORK_ITEM_TO_SPK, { spkId, input }, {
      Authorization: `Bearer ${token}`
    });
    return response.addWorkItemToSPK;
  } catch (error) {
    console.error('Error adding work item to SPK:', error);
    throw error;
  }
};

export const getSPKById = async (id: string, token: string): Promise<SPK> => {
  try {
    const response = await graphQLClient.request<{ spk: SPK }>(GET_SPK_BY_ID, { id }, {
      Authorization: `Bearer ${token}`
    });
    return response.spk;
  } catch (error) {
    console.error('Error fetching SPK by id:', error);
    throw error;
  }
};

export const updateSPKWorkItem = async (
  spkId: string,
  workItemId: string,
  input: UpdateSPKWorkItemInput,
  token: string
): Promise<SPK> => {
  try {
    const response = await graphQLClient.request<{ updateSPKWorkItem: SPK }>(
      UPDATE_SPK_WORK_ITEM,
      { spkId, workItemId, input },
      { Authorization: `Bearer ${token}` }
    );
    return response.updateSPKWorkItem;
  } catch (error) {
    console.error('Error updating SPK work item:', error);
    throw error;
  }
};

export const removeWorkItemFromSPK = async (
  spkId: string,
  workItemId: string,
  token: string
): Promise<SPK> => {
  try {
    const response = await graphQLClient.request<{ removeWorkItemFromSPK: SPK }>(
      REMOVE_WORK_ITEM_FROM_SPK,
      { spkId, workItemId },
      { Authorization: `Bearer ${token}` }
    );
    return response.removeWorkItemFromSPK;
  } catch (error) {
    console.error('Error removing work item from SPK:', error);
    throw error;
  }
};

export const importSPKFromExcel = async (
  file: File | Blob,
  token: string
): Promise<ImportSPKResponse> => {
  const formData = new FormData();
  formData.append('excelFile', file);

  // Gunakan fungsi getUploadUrl untuk mendapatkan URL dinamis
  const baseUrl = getUploadUrl();
  const url = baseUrl.replace(/\/$/, '') + '/import-auto';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to import SPK from Excel');
  }

  return response.json();
};

export const updateSpkStatus = async (
  id: string,
  status: string,
  token: string
): Promise<SPK> => {
  try {
    const response = await graphQLClient.request<{ updateSpkStatus: SPK }>(
      UPDATE_SPK_STATUS,
      { id, status },
      { Authorization: `Bearer ${token}` }
    );
    return response.updateSpkStatus;
  } catch (error) {
    console.error('Error updating SPK status:', error);
    throw error;
  }
};

export const getSPKDetailsWithProgress = async (
  spkId: string,
  token: string,
  startDate?: string,
  endDate?: string
): Promise<SPKDetailWithProgress> => {
  try {
    const variables: { spkId: string; startDate?: string; endDate?: string } = { spkId };
    if (startDate) variables.startDate = startDate;
    if (endDate) variables.endDate = endDate;

      const response = await graphQLClient.request<{ spkDetailsWithProgress: SPKDetailWithProgress }>(
        GET_SPK_DETAILS_WITH_PROGRESS,
        variables,
        { Authorization: `Bearer ${token}` }
      );
      return response.spkDetailsWithProgress;
    } catch (error) {
      console.error('Error fetching SPK details with progress:', error);
      throw error;
    }
  }; 

// Lightweight fetchers for charts (progress-only, budget-only, cost-only)
export const getSPKDetailsProgressOnly = async (
  spkId: string,
  token: string,
  startDate?: string,
  endDate?: string
) => {
  const variables: { spkId: string; startDate?: string; endDate?: string } = { spkId };
  if (startDate) variables.startDate = startDate;
  if (endDate) variables.endDate = endDate;
  const response = await graphQLClient.request<{ spkDetailsWithProgress: any }>(
    GET_SPK_DETAILS_PROGRESS_ONLY,
    variables,
    { Authorization: `Bearer ${token}` }
  );
  return response.spkDetailsWithProgress;
};

export const getSPKDetailsBudgetOnly = async (
  spkId: string,
  token: string,
  startDate?: string,
  endDate?: string
) => {
  const variables: { spkId: string; startDate?: string; endDate?: string } = { spkId };
  if (startDate) variables.startDate = startDate;
  if (endDate) variables.endDate = endDate;
  const response = await graphQLClient.request<{ spkDetailsWithProgress: any }>(
    GET_SPK_DETAILS_BUDGET_ONLY,
    variables,
    { Authorization: `Bearer ${token}` }
  );
  return response.spkDetailsWithProgress;
};

export const getSPKDetailsCostOnly = async (
  spkId: string,
  token: string,
  startDate?: string,
  endDate?: string
) => {
  const variables: { spkId: string; startDate?: string; endDate?: string } = { spkId };
  if (startDate) variables.startDate = startDate;
  if (endDate) variables.endDate = endDate;
  const response = await graphQLClient.request<{ spkDetailsWithProgress: any }>(
    GET_SPK_DETAILS_COST_ONLY,
    variables,
    { Authorization: `Bearer ${token}` }
  );
  return response.spkDetailsWithProgress;
};