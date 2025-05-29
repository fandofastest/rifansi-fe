import { graphQLClient } from '@/lib/graphql';

export interface OvertimeRate {
  id: string;
  waktuKerja: number;
  normal: number;
  weekend: number;
  libur: number;
  createdAt: string;
  updatedAt: string;
}

interface GetOvertimeRatesResponse {
  overtimeRates: OvertimeRate[];
}

interface GetOvertimeRateResponse {
  overtimeRate: OvertimeRate;
}

interface GetOvertimeRateByWorkHourResponse {
  overtimeRateByWorkHour: OvertimeRate;
}

interface CreateOvertimeRateInput {
  waktuKerja: number;
  normal: number;
  weekend: number;
  libur: number;
}

interface UpdateOvertimeRateInput {
  id: string;
  waktuKerja?: number;
  normal?: number;
  weekend?: number;
  libur?: number;
}

interface CreateOvertimeRateResponse {
  createOvertimeRate: OvertimeRate;
}

interface UpdateOvertimeRateResponse {
  updateOvertimeRate: OvertimeRate;
}

interface DeleteOvertimeRateResponse {
  deleteOvertimeRate: boolean;
}

const GET_OVERTIME_RATES = `
  query GetOvertimeRates {
    overtimeRates {
      id
      waktuKerja
      normal
      weekend
      libur
      createdAt
      updatedAt
    }
  }
`;

const GET_OVERTIME_RATE = `
  query GetOvertimeRate($id: ID!) {
    overtimeRate(id: $id) {
      id
      waktuKerja
      normal
      weekend
      libur
      createdAt
      updatedAt
    }
  }
`;

const GET_OVERTIME_RATE_BY_WORK_HOUR = `
  query GetOvertimeRateByWorkHour($waktuKerja: Int!) {
    overtimeRateByWorkHour(waktuKerja: $waktuKerja) {
      id
      waktuKerja
      normal
      weekend
      libur
      createdAt
      updatedAt
    }
  }
`;

const CREATE_OVERTIME_RATE = `
  mutation CreateOvertimeRate(
    $waktuKerja: Int!,
    $normal: Float!,
    $weekend: Float!,
    $libur: Float!
  ) {
    createOvertimeRate(
      waktuKerja: $waktuKerja,
      normal: $normal,
      weekend: $weekend,
      libur: $libur
    ) {
      id
      waktuKerja
      normal
      weekend
      libur
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_OVERTIME_RATE = `
  mutation UpdateOvertimeRate(
    $id: ID!, 
    $waktuKerja: Int,
    $normal: Float,
    $weekend: Float,
    $libur: Float
  ) {
    updateOvertimeRate(
      id: $id,
      waktuKerja: $waktuKerja,
      normal: $normal,
      weekend: $weekend,
      libur: $libur
    ) {
      id
      waktuKerja
      normal
      weekend
      libur
      createdAt
      updatedAt
    }
  }
`;

const DELETE_OVERTIME_RATE = `
  mutation DeleteOvertimeRate($id: ID!) {
    deleteOvertimeRate(id: $id)
  }
`;

export const getOvertimeRates = async (token: string): Promise<OvertimeRate[]> => {
  try {
    const response = await graphQLClient.request<GetOvertimeRatesResponse>(
      GET_OVERTIME_RATES, 
      {}, 
      { Authorization: `Bearer ${token}` }
    );
    return response.overtimeRates;
  } catch (error) {
    console.error('Error fetching overtime rates:', error);
    throw error;
  }
};

export const getOvertimeRate = async (id: string, token: string): Promise<OvertimeRate> => {
  try {
    const response = await graphQLClient.request<GetOvertimeRateResponse>(
      GET_OVERTIME_RATE, 
      { id }, 
      { Authorization: `Bearer ${token}` }
    );
    return response.overtimeRate;
  } catch (error) {
    console.error('Error fetching overtime rate:', error);
    throw error;
  }
};

export const getOvertimeRateByWorkHour = async (waktuKerja: number, token: string): Promise<OvertimeRate | null> => {
  try {
    const response = await graphQLClient.request<GetOvertimeRateByWorkHourResponse>(
      GET_OVERTIME_RATE_BY_WORK_HOUR, 
      { waktuKerja }, 
      { Authorization: `Bearer ${token}` }
    );
    return response.overtimeRateByWorkHour;
  } catch (error) {
    console.error('Error fetching overtime rate by work hour:', error);
    return null;
  }
};

export const createOvertimeRate = async (input: CreateOvertimeRateInput, token: string): Promise<OvertimeRate> => {
  try {
    const response = await graphQLClient.request<CreateOvertimeRateResponse>(
      CREATE_OVERTIME_RATE, 
      input, 
      { Authorization: `Bearer ${token}` }
    );
    return response.createOvertimeRate;
  } catch (error) {
    console.error('Error creating overtime rate:', error);
    throw error;
  }
};

export const updateOvertimeRate = async (input: UpdateOvertimeRateInput, token: string): Promise<OvertimeRate> => {
  try {
    const response = await graphQLClient.request<UpdateOvertimeRateResponse>(
      UPDATE_OVERTIME_RATE, 
      input, 
      { Authorization: `Bearer ${token}` }
    );
    return response.updateOvertimeRate;
  } catch (error) {
    console.error('Error updating overtime rate:', error);
    throw error;
  }
};

export const deleteOvertimeRate = async (id: string, token: string): Promise<boolean> => {
  try {
    const response = await graphQLClient.request<DeleteOvertimeRateResponse>(
      DELETE_OVERTIME_RATE, 
      { id }, 
      { Authorization: `Bearer ${token}` }
    );
    return response.deleteOvertimeRate;
  } catch (error) {
    console.error('Error deleting overtime rate:', error);
    throw error;
  }
}; 