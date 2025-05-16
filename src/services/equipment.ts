import { graphQLClient } from '@/lib/graphql';

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

export interface Equipment {
  id: string;
  equipmentCode: string;
  plateOrSerialNo: string;
  equipmentType: string;
  defaultOperator?: string;
  area?: string;
  fuelType?: string;
  year?: number;
  serviceStatus: 'OPERATIONAL' | 'MAINTENANCE' | 'INACTIVE';
  contracts?: EquipmentContract[];
  description?: string;
  createdAt: number;
  updatedAt: number;
}

interface CreateEquipmentInput {
  equipmentCode: string;
  plateOrSerialNo: string;
  equipmentType: string;
  defaultOperator?: string;
  area?: string;
  fuelType?: string;
  year?: number;
  serviceStatus: 'OPERATIONAL' | 'MAINTENANCE' | 'INACTIVE';
  contracts?: EquipmentContract[];
  description?: string;
}

interface UpdateEquipmentInput {
  equipmentCode?: string;
  plateOrSerialNo?: string;
  equipmentType?: string;
  defaultOperator?: string;
  area?: string;
  fuelType?: string;
  year?: number;
  serviceStatus?: 'OPERATIONAL' | 'MAINTENANCE' | 'INACTIVE';
  contracts?: EquipmentContract[];
  description?: string;
}

// GraphQL queries and mutations
const GET_ALL_EQUIPMENT = `
  query GetAllEquipment {
    equipments {
      id
      equipmentCode
      plateOrSerialNo
      equipmentType
      serviceStatus
      contracts {
        contractId
        rentalRate
      }
      createdAt
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
      area
      fuelType
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

const GET_EQUIPMENT_BY_STATUS = `
  query GetEquipmentByStatus($status: String!) {
    equipmentsByStatus(status: $status) {
      id
      equipmentCode
      plateOrSerialNo
      equipmentType
      serviceStatus
      contracts {
        contractId
        rentalRate
      }
    }
  }
`;

const CREATE_EQUIPMENT = `
  mutation CreateEquipment($input: EquipmentInput!) {
    createEquipment(
      equipmentCode: $input.equipmentCode
      plateOrSerialNo: $input.plateOrSerialNo
      equipmentType: $input.equipmentType
      defaultOperator: $input.defaultOperator
      area: $input.area
      fuelType: $input.fuelType
      year: $input.year
      serviceStatus: $input.serviceStatus
      contracts: $input.contracts
      description: $input.description
    ) {
      id
      equipmentCode
      plateOrSerialNo
      equipmentType
      defaultOperator
      area
      fuelType
      year
      serviceStatus
      description
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_EQUIPMENT = `
  mutation UpdateEquipment($id: ID!, $input: EquipmentUpdateInput!) {
    updateEquipment(
      id: $id
      equipmentCode: $input.equipmentCode
      plateOrSerialNo: $input.plateOrSerialNo
      equipmentType: $input.equipmentType
      defaultOperator: $input.defaultOperator
      area: $input.area
      fuelType: $input.fuelType
      year: $input.year
      serviceStatus: $input.serviceStatus
      description: $input.description
    ) {
      id
      equipmentCode
      plateOrSerialNo
      equipmentType
      defaultOperator
      area
      fuelType
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

// Add new GraphQL mutations for contract management in equipment
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

// Add query to get equipment by contract
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

// Service functions
export const getEquipments = async (token: string): Promise<Equipment[]> => {
  try {
    const response = await graphQLClient.request<{ equipments: Equipment[] }>(
      GET_ALL_EQUIPMENT,
      {},
      { Authorization: `Bearer ${token}` }
    );
    return response.equipments;
  } catch (error) {
    console.error('Error fetching equipment list:', error);
    throw error;
  }
};

export const getEquipmentById = async (id: string, token: string): Promise<Equipment> => {
  try {
    const response = await graphQLClient.request<{ equipment: Equipment }>(
      GET_EQUIPMENT_BY_ID,
      { id },
      { Authorization: `Bearer ${token}` }
    );
    return response.equipment;
  } catch (error) {
    console.error('Error fetching equipment details:', error);
    throw error;
  }
};

export const getEquipmentsByStatus = async (status: string, token: string): Promise<Equipment[]> => {
  try {
    const response = await graphQLClient.request<{ equipmentsByStatus: Equipment[] }>(
      GET_EQUIPMENT_BY_STATUS,
      { status },
      { Authorization: `Bearer ${token}` }
    );
    return response.equipmentsByStatus;
  } catch (error) {
    console.error('Error fetching equipment by status:', error);
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
      { input },
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
      { id, input },
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