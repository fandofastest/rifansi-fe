import { graphQLClient } from '@/lib/graphql';
import { Unit } from './unit';

export interface Material {
  id: string;
  name: string;
  unitId: string;
  unitRate: number;
  description?: string;
  unit?: Unit;
  createdAt?: number;
  updatedAt?: number;
}

interface CreateMaterialInput {
  name: string;
  unitId: string;
  unitRate: number;
  description?: string;
}

interface UpdateMaterialInput {
  name?: string;
  unitId?: string;
  unitRate?: number;
  description?: string;
}

// GraphQL Queries and Mutations
const CREATE_MATERIAL = `
  mutation CreateMaterial($name: String!, $unitId: ID!, $unitRate: Float!, $description: String) {
    createMaterial(
      name: $name
      unitId: $unitId
      unitRate: $unitRate
      description: $description
    ) {
      id
      name
      unitId
      unitRate
      description
      unit {
        id
        name
        code
      }
    }
  }
`;

const GET_ALL_MATERIALS = `
  query GetAllMaterials {
    materials {
      id
      name
      unitRate
      description
      unit {
        id
        name
        code
      }
    }
  }
`;

const GET_MATERIAL = `
  query GetMaterial($id: ID!) {
    material(id: $id) {
      id
      name
      unitId
      unitRate
      description
      unit {
        id
        name
        code
        description
      }
    }
  }
`;

const UPDATE_MATERIAL = `
  mutation UpdateMaterial($id: ID!, $name: String, $unitId: ID, $unitRate: Float, $description: String) {
    updateMaterial(
      id: $id
      name: $name
      unitId: $unitId
      unitRate: $unitRate
      description: $description
    ) {
      id
      name
      unitId
      unitRate
      description
      unit {
        id
        name
      }
    }
  }
`;

const DELETE_MATERIAL = `
  mutation DeleteMaterial($id: ID!) {
    deleteMaterial(id: $id)
  }
`;

// Service Functions
export const createMaterial = async (
  input: CreateMaterialInput,
  token: string
): Promise<Material> => {
  try {
    const response = await graphQLClient.request<{ createMaterial: Material }>(
      CREATE_MATERIAL,
      { 
        name: input.name,
        unitId: input.unitId,
        unitRate: input.unitRate,
        description: input.description
      },
      { Authorization: `Bearer ${token}` }
    );
    return response.createMaterial;
  } catch (error) {
    console.error('Error creating material:', error);
    throw error;
  }
};

export const getMaterials = async (token: string): Promise<Material[]> => {
  try {
    const response = await graphQLClient.request<{ materials: Material[] }>(
      GET_ALL_MATERIALS,
      {},
      { Authorization: `Bearer ${token}` }
    );
    return response.materials;
  } catch (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }
};

export const getMaterialById = async (id: string, token: string): Promise<Material> => {
  try {
    const response = await graphQLClient.request<{ material: Material }>(
      GET_MATERIAL,
      { id },
      { Authorization: `Bearer ${token}` }
    );
    return response.material;
  } catch (error) {
    console.error('Error fetching material details:', error);
    throw error;
  }
};

export const updateMaterial = async (
  id: string,
  input: UpdateMaterialInput,
  token: string
): Promise<Material> => {
  try {
    const response = await graphQLClient.request<{ updateMaterial: Material }>(
      UPDATE_MATERIAL,
      { 
        id,
        name: input.name,
        unitId: input.unitId,
        unitRate: input.unitRate,
        description: input.description
      },
      { Authorization: `Bearer ${token}` }
    );
    return response.updateMaterial;
  } catch (error) {
    console.error('Error updating material:', error);
    throw error;
  }
};

export const deleteMaterial = async (id: string, token: string): Promise<boolean> => {
  try {
    const response = await graphQLClient.request<{ deleteMaterial: boolean }>(
      DELETE_MATERIAL,
      { id },
      { Authorization: `Bearer ${token}` }
    );
    return response.deleteMaterial;
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
}; 