import { graphQLClient } from '@/lib/graphql';

export interface Location {
  type: string;
  coordinates: number[];
}

export interface Area {
  id: string;
  name: string;
  location?: Location;
}

export interface EquipmentContract {
  contractId: string;
  equipmentId: number;
  rentalRate: number;
  contract?: {
    id: string;
    contractNo: string;
    description: string;
    startDate?: string;
    endDate?: string;
    vendorName?: string;
  };
}

export type EquipmentServiceStatus = 'ACTIVE' | 'MAINTENANCE' | 'REPAIR' | 'INACTIVE';

export interface User {
  id: string;
  username: string;
  fullName: string;
}

export interface ServiceHistory {
  status: EquipmentServiceStatus;
  remarks?: string;
  updatedAt: string;
  updatedBy: User;
}

export interface AreaHistory {
  area: {
    id: string;
    name: string;
    location?: {
      type: string;
      coordinates: number[];
    };
  };
  remarks: string;
  updatedBy: {
    id: string;
    username: string;
    fullName: string;
  };
  updatedAt: string;
}

export interface Equipment {
  id: string;
  equipmentCode: string;
  plateOrSerialNo: string;
  equipmentType: string;
  defaultOperator?: string;
  area?: Area;
  year?: number;
  serviceStatus: EquipmentServiceStatus;
  contracts?: EquipmentContract[];
  description?: string;
  createdAt: number;
  updatedAt: number;
  serviceHistory: ServiceHistory[];
  areaHistory: AreaHistory[];
}

export interface UpdateEquipmentInput {
  equipmentCode?: string;
  plateOrSerialNo?: string;
  equipmentType?: string;
  defaultOperator?: string;
  area?: string; // area ID is optional for update
  year?: number;
  serviceStatus?: EquipmentServiceStatus;
  description?: string;
}

interface CreateEquipmentInput {
  equipmentCode: string;
  plateOrSerialNo: string;
  equipmentType: string;
  defaultOperator?: string;
  area: string; // area ID is required
  year?: number;
  serviceStatus: EquipmentServiceStatus;
  description?: string;
}

interface EquipmentResponse {
  equipments: Array<{
    id: string;
    equipmentCode: string;
    plateOrSerialNo: string;
    equipmentType: string;
    defaultOperator?: string;
    area?: {
      id: string;
      name: string;
      location?: {
        type: string;
        coordinates: number[];
      };
    };
    year?: number;
    serviceStatus: EquipmentServiceStatus;
    description?: string;
    createdAt: number;
    updatedAt: number;
  }>;
}

interface SingleEquipmentResponse {
  equipment: {
    id: string;
    equipmentCode: string;
    plateOrSerialNo: string;
    equipmentType: string;
    defaultOperator?: string;
    area?: {
      id: string;
      name: string;
      location?: {
        type: string;
        coordinates: number[];
      };
    };
    year?: number;
    serviceStatus: EquipmentServiceStatus;
    contracts?: EquipmentContract[];
    description?: string;
    createdAt: number;
    updatedAt: number;
  };
}

// GraphQL queries and mutations
const GET_ALL_EQUIPMENT = `
  query GetEquipments {
    equipments {
      id
      equipmentCode
      plateOrSerialNo
      equipmentType
      defaultOperator
      area {
        id
        name
        location {
          type
          coordinates
        }
      }
      year
      serviceStatus
      description
      createdAt
      updatedAt
    }
  }
`;

const GET_EQUIPMENT_BY_ID = `
  query GetEquipmentWithContracts($id: ID!) {
    equipment(id: $id) {
      id
      equipmentCode
      plateOrSerialNo
      equipmentType
      defaultOperator
      area {
        id
        name
        location {
          type
          coordinates
        }
      }
      year
      serviceStatus
      contracts {
        contractId
        equipmentId
        rentalRate
        contract {
          id
          contractNo
          description
          startDate
          endDate
          vendorName
        }
      }
      description
      createdAt
      updatedAt
    }
  }
`;

const GET_EQUIPMENT_BY_AREA = `
  query GetEquipmentsByArea($areaId: ID!) {
    equipmentsByArea(areaId: $areaId) {
      id
      equipmentCode
      plateOrSerialNo
      equipmentType
      defaultOperator
      area {
        id
        name
        location {
          type
          coordinates
        }
      }
      year
      serviceStatus
      description
    }
  }
`;

const CREATE_EQUIPMENT = `
  mutation CreateEquipment(
    $equipmentCode: String!
    $plateOrSerialNo: String
    $equipmentType: String!
    $defaultOperator: String
    $area: ID!
    $year: Int
    $serviceStatus: String
    $description: String
  ) {
    createEquipment(
      equipmentCode: $equipmentCode
      plateOrSerialNo: $plateOrSerialNo
      equipmentType: $equipmentType
      defaultOperator: $defaultOperator
      area: $area
      year: $year
      serviceStatus: $serviceStatus
      description: $description
    ) {
      id
      equipmentCode
      plateOrSerialNo
      equipmentType
      defaultOperator
      area {
        id
        name
      }
      year
      serviceStatus
      description
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_EQUIPMENT = `
  mutation UpdateEquipment(
    $id: ID!
    $equipmentCode: String
    $plateOrSerialNo: String
    $equipmentType: String
    $defaultOperator: String
    $area: ID
    $year: Int
    $serviceStatus: String
    $description: String
  ) {
    updateEquipment(
      id: $id
      equipmentCode: $equipmentCode
      plateOrSerialNo: $plateOrSerialNo
      equipmentType: $equipmentType
      defaultOperator: $defaultOperator
      area: $area
      year: $year
      serviceStatus: $serviceStatus
      description: $description
    ) {
      id
      equipmentCode
      plateOrSerialNo
      equipmentType
      defaultOperator
      area {
        id
        name
      }
      year
      serviceStatus
      description
      updatedAt
    }
  }
`;

const DELETE_EQUIPMENT = `
  mutation DeleteEquipment($id: ID!) {
    deleteEquipment(id: $id)
  }
`;

const ADD_CONTRACT_TO_EQUIPMENT = `
  mutation AddContractToEquipment($equipmentId: ID!, $contract: EquipmentContractInput!) {
    addContractToEquipment(
      equipmentId: $equipmentId, 
      contract: $contract
    ) {
      id
      equipmentCode
      plateOrSerialNo
      contracts {
        contractId
        equipmentId
        rentalRate
      }
    }
  }
`;

const UPDATE_EQUIPMENT_CONTRACT = `
  mutation UpdateEquipmentContract($equipmentId: ID!, $contractId: ID!, $rentalRate: Float!) {
    updateEquipmentContract(
      equipmentId: $equipmentId,
      contractId: $contractId,
      rentalRate: $rentalRate
    ) {
      id
      equipmentCode
      contracts {
        contractId
        rentalRate
      }
    }
  }
`;

const REMOVE_CONTRACT_FROM_EQUIPMENT = `
  mutation RemoveContractFromEquipment($equipmentId: ID!, $contractId: ID!) {
    removeContractFromEquipment(
      equipmentId: $equipmentId,
      contractId: $contractId
    ) {
      id
      equipmentCode
      contracts {
        contractId
        rentalRate
      }
    }
  }
`;

const GET_EQUIPMENT_BY_CONTRACT = `
  query GetEquipmentByContract($contractId: ID!) {
    equipments {
      id
      equipmentCode
      plateOrSerialNo
      equipmentType
      contracts(contractId: $contractId) {
        contractId
        rentalRate
      }
    }
  }
`;

const GET_EQUIPMENT_AREA_HISTORY = `
  query GetEquipmentAreaHistory($equipmentId: ID!) {
    getEquipmentAreaHistory(equipmentId: $equipmentId) {
      area {
        id
        name
        location {
          type
          coordinates
        }
      }
      remarks
      updatedBy {
        id
        username
        fullName
      }
      updatedAt
    }
  }
`;

const GET_EQUIPMENT_SERVICE_HISTORY = `
  query GetEquipmentServiceHistory($equipmentId: ID!) {
    getEquipmentServiceHistory(equipmentId: $equipmentId) {
      status
      remarks
      updatedBy {
        username
        fullName
      }
      updatedAt
    }
  }
`;

const GET_AREAS = `
  query GetAreas {
    areas {
      id
      name
      location {
        type
        coordinates
      }
    }
  }
`;

// Fungsi helper untuk menangani error area null
const handleEquipmentResponse = (data: EquipmentResponse | null): Equipment[] => {
  if (!data || !data.equipments) return [];
  
  return data.equipments.map((equipment) => ({
    ...equipment,
    area: equipment.area || { id: '', name: 'Unassigned' },
    serviceHistory: [],
    areaHistory: []
  }));
};

// Fungsi helper untuk menangani error area null untuk single equipment
const handleSingleEquipmentResponse = (data: SingleEquipmentResponse | null): Equipment => {
  if (!data || !data.equipment) {
    throw new Error('Equipment not found');
  }
  
  return {
    ...data.equipment,
    area: data.equipment.area || { id: '', name: 'Unassigned' },
    serviceHistory: [],
    areaHistory: []
  };
};

// Service functions
export const getEquipments = async (token: string): Promise<Equipment[]> => {
  try {
    const response = await graphQLClient.request<EquipmentResponse>(
      GET_ALL_EQUIPMENT,
      {},
      { Authorization: `Bearer ${token}` }
    );
    return handleEquipmentResponse(response);
  } catch (error) {
    console.error('Error fetching equipment list:', error);
    throw error;
  }
};

export const getEquipmentById = async (id: string, token: string): Promise<Equipment> => {
  try {
    const response = await graphQLClient.request<SingleEquipmentResponse>(
      GET_EQUIPMENT_BY_ID,
      { id },
      { Authorization: `Bearer ${token}` }
    );
    return handleSingleEquipmentResponse(response);
  } catch (error) {
    console.error('Error fetching equipment details:', error);
    throw error;
  }
};

export const getEquipmentsByArea = async (areaId: string, token: string): Promise<Equipment[]> => {
  try {
    const response = await graphQLClient.request<{ equipmentsByArea: Equipment[] }>(
      GET_EQUIPMENT_BY_AREA,
      { areaId },
      { Authorization: `Bearer ${token}` }
    );
    return response.equipmentsByArea;
  } catch (error) {
    console.error('Error fetching equipment by area:', error);
    throw error;
  }
};

export const createEquipment = async (
  input: CreateEquipmentInput,
  token: string
): Promise<Equipment> => {
  try {
    const response = await graphQLClient.request<{ createEquipment: Equipment }>(
      CREATE_EQUIPMENT,
      { 
        equipmentCode: input.equipmentCode,
        plateOrSerialNo: input.plateOrSerialNo,
        equipmentType: input.equipmentType,
        defaultOperator: input.defaultOperator,
        area: input.area,
        year: input.year,
        serviceStatus: input.serviceStatus,
        description: input.description
      },
      { Authorization: `Bearer ${token}` }
    );
    return response.createEquipment;
  } catch (error) {
    console.error('Error creating equipment:', error);
    throw error;
  }
};

export const updateEquipment = async (
  id: string,
  input: UpdateEquipmentInput,
  token: string
): Promise<Equipment> => {
  try {
    const response = await graphQLClient.request<{ updateEquipment: Equipment }>(
      UPDATE_EQUIPMENT,
      { 
        id,
        equipmentCode: input.equipmentCode,
        plateOrSerialNo: input.plateOrSerialNo,
        equipmentType: input.equipmentType,
        defaultOperator: input.defaultOperator,
        area: input.area,
        year: input.year,
        serviceStatus: input.serviceStatus,
        description: input.description
      },
      { Authorization: `Bearer ${token}` }
    );
    return response.updateEquipment;
  } catch (error) {
    console.error('Error updating equipment:', error);
    throw error;
  }
};

export const deleteEquipment = async (id: string, token: string): Promise<boolean> => {
  try {
    const response = await graphQLClient.request<{ deleteEquipment: boolean }>(
      DELETE_EQUIPMENT,
      { id },
      { Authorization: `Bearer ${token}` }
    );
    return response.deleteEquipment;
  } catch (error) {
    console.error('Error deleting equipment:', error);
    throw error;
  }
};

export const addContractToEquipment = async (
  equipmentId: string, 
  contract: { contractId: string; equipmentId: number; rentalRate: number },
  token: string
): Promise<Equipment> => {
  try {
    const response = await graphQLClient.request<{ addContractToEquipment: Equipment }>(
      ADD_CONTRACT_TO_EQUIPMENT,
      { equipmentId, contract },
      { Authorization: `Bearer ${token}` }
    );
    return response.addContractToEquipment;
  } catch (error) {
    console.error('Error adding contract to equipment:', error);
    throw error;
  }
};

export const updateEquipmentContract = async (
  equipmentId: string,
  contractId: string,
  rentalRate: number,
  token: string
): Promise<Equipment> => {
  try {
    const response = await graphQLClient.request<{ updateEquipmentContract: Equipment }>(
      UPDATE_EQUIPMENT_CONTRACT,
      { equipmentId, contractId, rentalRate },
      { Authorization: `Bearer ${token}` }
    );
    return response.updateEquipmentContract;
  } catch (error) {
    console.error('Error updating equipment contract:', error);
    throw error;
  }
};

export const removeContractFromEquipment = async (
  equipmentId: string,
  contractId: string,
  token: string
): Promise<Equipment> => {
  try {
    const response = await graphQLClient.request<{ removeContractFromEquipment: Equipment }>(
      REMOVE_CONTRACT_FROM_EQUIPMENT,
      { equipmentId, contractId },
      { Authorization: `Bearer ${token}` }
    );
    return response.removeContractFromEquipment;
  } catch (error) {
    console.error('Error removing contract from equipment:', error);
    throw error;
  }
};

export const getEquipmentsByContract = async (contractId: string, token: string): Promise<Equipment[]> => {
  try {
    const response = await graphQLClient.request<{ equipments: Equipment[] }>(
      GET_EQUIPMENT_BY_CONTRACT,
      { contractId },
      { Authorization: `Bearer ${token}` }
    );
    return response.equipments;
  } catch (error) {
    console.error('Error fetching equipment by contract:', error);
    throw error;
  }
};

interface UpdateEquipmentServiceStatusInput {
  equipmentId: string;
  serviceStatus: EquipmentServiceStatus;
  remarks?: string;
}

interface UpdateEquipmentAreaInput {
  equipmentId: string;
  areaId: string;
  remarks?: string;
}

interface UpdateEquipmentServiceStatusResponse {
  updateEquipmentServiceStatus: Equipment;
}

interface UpdateEquipmentAreaResponse {
  updateEquipmentArea: Equipment;
}

const UPDATE_EQUIPMENT_SERVICE_STATUS = `
  mutation UpdateEquipmentServiceStatus(
    $equipmentId: ID!
    $serviceStatus: EquipmentServiceStatus!
    $remarks: String
  ) {
    updateEquipmentServiceStatus(
      equipmentId: $equipmentId
      serviceStatus: $serviceStatus
      remarks: $remarks
    ) {
      id
      equipmentCode
      serviceStatus
      serviceHistory {
        status
        remarks
        updatedAt
        updatedBy {
          username
        }
      }
    }
  }
`;

const UPDATE_EQUIPMENT_AREA = `
  mutation UpdateEquipmentArea($equipmentId: ID!, $areaId: ID!, $remarks: String) {
    updateEquipmentArea(
      equipmentId: $equipmentId,
      areaId: $areaId,
      remarks: $remarks
    ) {
      id
      equipmentCode
      area {
        id
        name
      }
      areaHistory {
        areaId
        remarks
        updatedAt
        updatedBy {
          username
        }
      }
    }
  }
`;

export const updateEquipmentServiceStatus = async (
  input: UpdateEquipmentServiceStatusInput,
  token: string
): Promise<Equipment> => {
  try {
    const response = await graphQLClient.request<UpdateEquipmentServiceStatusResponse>(
      UPDATE_EQUIPMENT_SERVICE_STATUS,
      input,
      { Authorization: `Bearer ${token}` }
    );
    return response.updateEquipmentServiceStatus;
  } catch (error) {
    console.error('Error updating equipment service status:', error);
    throw error;
  }
};

export const updateEquipmentArea = async (
  input: UpdateEquipmentAreaInput,
  token: string
): Promise<Equipment> => {
  try {
    const response = await graphQLClient.request<UpdateEquipmentAreaResponse>(
      UPDATE_EQUIPMENT_AREA,
      input,
      { Authorization: `Bearer ${token}` }
    );
    return response.updateEquipmentArea;
  } catch (error) {
    console.error('Error updating equipment area:', error);
    throw error;
  }
};

export const getEquipmentAreaHistory = async (equipmentId: string, token: string): Promise<AreaHistory[]> => {
  try {
    const response = await graphQLClient.request<{ getEquipmentAreaHistory: AreaHistory[] }>(
      GET_EQUIPMENT_AREA_HISTORY,
      { equipmentId },
      { Authorization: `Bearer ${token}` }
    );
    return response.getEquipmentAreaHistory;
  } catch (error) {
    console.error('Error fetching area history:', error);
    throw error;
  }
};

export const getEquipmentServiceHistory = async (equipmentId: string, token: string): Promise<ServiceHistory[]> => {
  try {
    const response = await graphQLClient.request<{ getEquipmentServiceHistory: ServiceHistory[] }>(
      GET_EQUIPMENT_SERVICE_HISTORY,
      { equipmentId },
      { Authorization: `Bearer ${token}` }
    );
    return response.getEquipmentServiceHistory;
  } catch (error) {
    console.error('Error fetching service history:', error);
    throw error;
  }
};

export const getAreas = async (token: string): Promise<Area[]> => {
  try {
    const response = await graphQLClient.request<{ areas: Area[] }>(
      GET_AREAS,
      {},
      { Authorization: `Bearer ${token}` }
    );
    return response.areas || [];
  } catch (error) {
    console.error('Error fetching areas:', error);
    throw error;
  }
};

// Interface for repair reports
export interface RepairReport {
  id: string;
  reportNumber: string;
  reportDate: string;
  equipment: {
    equipmentCode: string;
    equipmentType: string;
    plateOrSerialNo: string;
  };
  reportedBy: {
    fullName: string;
    role: {
      roleName: string;
    };
  };
  location?: {
    name: string;
  } | null;
  problemDescription: string;
  damageLevel: string;
  priority: string;
  status: string;
  estimatedCost?: number | null;
  actualCost?: number | null;
  createdAt: string;
  reportImages?: string[];
}

// Query for all repair reports
const GET_PENDING_REPAIR_REPORTS = `
  query GetAllReportsSimple {
    equipmentRepairReports {
      id
      reportNumber
      reportDate
      equipment {
        equipmentCode
        equipmentType
        plateOrSerialNo
      }
      reportedBy {
        fullName
        role {
          roleName
        }
      }
      location {
        name
      }
      problemDescription
      damageLevel
      priority
      status
      estimatedCost
      actualCost
      createdAt
      reportImages
    }
  }
`;

export const getPendingRepairReports = async (token: string): Promise<RepairReport[]> => {
  try {
    const response = await graphQLClient.request<{ equipmentRepairReports: RepairReport[] }>(
      GET_PENDING_REPAIR_REPORTS,
      {},
      { Authorization: `Bearer ${token}` }
    );
    return response.equipmentRepairReports;
  } catch (error) {
    console.error('Error fetching repair reports:', error);
    throw error;
  }
};

// Interface for review repair report
export interface ReviewRepairReportInput {
  status: 'APPROVED' | 'REJECTED';
  reviewNotes: string;
  assignedTechnician?: string;
  estimatedCost?: number;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ReviewRepairReportResponse {
  id: string;
  reportNumber: string;
  status: string;
  equipment: {
    id: string;
    equipmentCode: string;
    equipmentType: string;
    serviceStatus: string;
  };
  reportedBy: {
    fullName: string;
  };
  reviewedBy: {
    id: string;
    fullName: string;
    role: {
      roleName: string;
    };
  };
  reviewDate: string;
  reviewNotes: string;
  assignedTechnician?: string;
  estimatedCost?: number;
  priority: string;
  statusHistory: {
    status: string;
    changedBy: {
      fullName: string;
    };
    changedAt: string;
    notes: string;
  }[];
  updatedAt: string;
}

// Mutation for reviewing repair report
const REVIEW_REPAIR_REPORT = `
  mutation ApproveRepairReport($id: ID!, $input: ReviewEquipmentRepairReportInput!) {
    reviewEquipmentRepairReport(id: $id, input: $input) {
      id
      reportNumber
      status
      equipment {
        id
        equipmentCode
        equipmentType
        serviceStatus
      }
      reportedBy {
        fullName
      }
      reviewedBy {
        id
        fullName
        role {
          roleName
        }
      }
      reviewDate
      reviewNotes
      assignedTechnician
      estimatedCost
      priority
      statusHistory {
        status
        changedBy {
          fullName
        }
        changedAt
        notes
      }
      updatedAt
    }
  }
`;

export const reviewRepairReport = async (
  id: string,
  input: ReviewRepairReportInput,
  token: string
): Promise<ReviewRepairReportResponse> => {
  try {
    const response = await graphQLClient.request<{ reviewEquipmentRepairReport: ReviewRepairReportResponse }>(
      REVIEW_REPAIR_REPORT,
      { id, input },
      { Authorization: `Bearer ${token}` }
    );
    return response.reviewEquipmentRepairReport;
  } catch (error) {
    console.error('Error reviewing repair report:', error);
    throw error;
  }
};