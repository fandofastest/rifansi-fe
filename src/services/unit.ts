import { graphQLClient } from '@/lib/graphql';

export interface Unit {
  id: string;
  code: string;
  name: string;
  description?: string;
}

interface GetUnitsResponse {
  units: Unit[];
}

interface GetUnitResponse {
  unit: Unit;
}

interface CreateUnitInput {
  code: string;
  name: string;
  description?: string;
}

interface UpdateUnitInput {
  id: string;
  code?: string;
  name?: string;
  description?: string;
}

interface DeleteUnitInput {
  id: string;
}

interface CreateUnitResponse {
  createUnit: Unit;
}

interface UpdateUnitResponse {
  updateUnit: Unit;
}

interface DeleteUnitResponse {
  deleteUnit: boolean;
}

const GET_UNITS = `
  query GetUnits {
    units {
      id
      code
      name
      description
    }
  }
`;

const GET_UNIT = `
  query GetUnit($id: ID!) {
    unit(id: $id) {
      id
      code
      name
      description
    }
  }
`;

const CREATE_UNIT = `
  mutation CreateUnit($code: String!, $name: String!, $description: String) {
    createUnit(code: $code, name: $name, description: $description) {
      id
      code
      name
      description
    }
  }
`;

const UPDATE_UNIT = `
  mutation UpdateUnit($id: ID!, $code: String, $name: String, $description: String) {
    updateUnit(id: $id, code: $code, name: $name, description: $description) {
      id
      code
      name
      description
    }
  }
`;

const DELETE_UNIT = `
  mutation DeleteUnit($id: ID!) {
    deleteUnit(id: $id)
  }
`;

export const getUnits = async (token: string): Promise<Unit[]> => {
  try {
    const response = await graphQLClient.request<GetUnitsResponse>(GET_UNITS, {}, {
      Authorization: `Bearer ${token}`
    });
    return response.units;
  } catch (error) {
    console.error('Error fetching units:', error);
    throw error;
  }
};

export const getUnit = async (id: string, token: string): Promise<Unit> => {
  try {
    const response = await graphQLClient.request<GetUnitResponse>(GET_UNIT, { id }, {
      Authorization: `Bearer ${token}`
    });
    return response.unit;
  } catch (error) {
    console.error('Error fetching unit:', error);
    throw error;
  }
};

export const createUnit = async (input: CreateUnitInput, token: string): Promise<Unit> => {
  try {
    const response = await graphQLClient.request<CreateUnitResponse>(CREATE_UNIT, input, {
      Authorization: `Bearer ${token}`
    });
    return response.createUnit;
  } catch (error) {
    console.error('Error creating unit:', error);
    throw error;
  }
};

export const updateUnit = async (input: UpdateUnitInput, token: string): Promise<Unit> => {
  try {
    const response = await graphQLClient.request<UpdateUnitResponse>(UPDATE_UNIT, input, {
      Authorization: `Bearer ${token}`
    });
    return response.updateUnit;
  } catch (error) {
    console.error('Error updating unit:', error);
    throw error;
  }
};

export const deleteUnit = async (input: DeleteUnitInput, token: string): Promise<boolean> => {
  try {
    const response = await graphQLClient.request<DeleteUnitResponse>(DELETE_UNIT, input, {
      Authorization: `Bearer ${token}`
    });
    return response.deleteUnit;
  } catch (error) {
    console.error('Error deleting unit:', error);
    throw error;
  }
}; 