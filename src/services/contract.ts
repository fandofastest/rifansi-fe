import { graphQLClient } from '@/lib/graphql';

export interface Contract {
  id: string;
  contractNo: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  vendorName?: string;
  totalBudget?: number;
  createdAt: number;
  updatedAt: number;
}

interface CreateContractInput {
  contractNo: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  vendorName?: string;
  totalBudget?: number;
}

interface UpdateContractInput {
  contractNo?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  vendorName?: string;
  totalBudget?: number;
}

// GraphQL Queries and Mutations
const CREATE_CONTRACT = `
  mutation CreateContract($contractNo: String!, $description: String, $startDate: String, $endDate: String, $vendorName: String, $totalBudget: Float) {
    createContract(
      contractNo: $contractNo
      description: $description
      startDate: $startDate
      endDate: $endDate
      vendorName: $vendorName
      totalBudget: $totalBudget
    ) {
      id
      contractNo
      description
      startDate
      endDate
      vendorName
      totalBudget
      createdAt
      updatedAt
    }
  }
`;

const GET_ALL_CONTRACTS = `
  query GetAllContracts {
    contracts {
      id
      contractNo
      description
      startDate
      endDate
      vendorName
      totalBudget
      createdAt
      updatedAt
    }
  }
`;

const GET_CONTRACT = `
  query GetContract($id: ID!) {
    contract(id: $id) {
      id
      contractNo
      description
      startDate
      endDate
      vendorName
      totalBudget
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_CONTRACT = `
  mutation UpdateContract($id: ID!, $contractNo: String, $description: String, $startDate: String, $endDate: String, $vendorName: String, $totalBudget: Float) {
    updateContract(
      id: $id
      contractNo: $contractNo
      description: $description
      startDate: $startDate
      endDate: $endDate
      vendorName: $vendorName
      totalBudget: $totalBudget
    ) {
      id
      contractNo
      description
      startDate
      endDate
      vendorName
      totalBudget
      updatedAt
    }
  }
`;

const DELETE_CONTRACT = `
  mutation DeleteContract($id: ID!) {
    deleteContract(id: $id)
  }
`;

// Service Functions
export const createContract = async (
  input: CreateContractInput,
  token: string
): Promise<Contract> => {
  try {
    const response = await graphQLClient.request<{ createContract: Contract }>(
      CREATE_CONTRACT,
      { 
        contractNo: input.contractNo,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        vendorName: input.vendorName,
        totalBudget: input.totalBudget
      },
      { Authorization: `Bearer ${token}` }
    );
    return response.createContract;
  } catch (error) {
    console.error('Error creating contract:', error);
    throw error;
  }
};

export const getContracts = async (token: string): Promise<Contract[]> => {
  try {
    const response = await graphQLClient.request<{ contracts: Contract[] }>(
      GET_ALL_CONTRACTS,
      {},
      { Authorization: `Bearer ${token}` }
    );
    return response.contracts;
  } catch (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }
};

export const getContractById = async (id: string, token: string): Promise<Contract> => {
  try {
    const response = await graphQLClient.request<{ contract: Contract }>(
      GET_CONTRACT,
      { id },
      { Authorization: `Bearer ${token}` }
    );
    return response.contract;
  } catch (error) {
    console.error('Error fetching contract:', error);
    throw error;
  }
};

export const updateContract = async (
  id: string,
  input: UpdateContractInput,
  token: string
): Promise<Contract> => {
  try {
    const response = await graphQLClient.request<{ updateContract: Contract }>(
      UPDATE_CONTRACT,
      { 
        id,
        contractNo: input.contractNo,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        vendorName: input.vendorName,
        totalBudget: input.totalBudget
      },
      { Authorization: `Bearer ${token}` }
    );
    return response.updateContract;
  } catch (error) {
    console.error('Error updating contract:', error);
    throw error;
  }
};

export const deleteContract = async (id: string, token: string): Promise<boolean> => {
  try {
    const response = await graphQLClient.request<{ deleteContract: boolean }>(
      DELETE_CONTRACT,
      { id },
      { Authorization: `Bearer ${token}` }
    );
    return response.deleteContract;
  } catch (error) {
    console.error('Error deleting contract:', error);
    throw error;
  }
}; 