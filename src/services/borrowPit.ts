import { graphQLClient } from '@/lib/graphql';

export interface BorrowPit {
  id: string;
  name: string;
  locationName: string;
  coordinates: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateBorrowPitInput {
  name: string;
  locationName: string;
  longitude: number;
  latitude: number;
}

export interface UpdateBorrowPitInput {
  name?: string;
  locationName?: string;
  longitude?: number;
  latitude?: number;
}

// GraphQL Queries and Mutations
const CREATE_BORROW_PIT = `
  mutation CreateBorrowPit($name: String!, $locationName: String!, $longitude: Float!, $latitude: Float!) {
    createBorrowPit(input: {
      name: $name
      locationName: $locationName
      longitude: $longitude
      latitude: $latitude
    }) {
      id
      name
      locationName
      coordinates
      createdAt
      updatedAt
    }
  }
`;

const GET_ALL_BORROW_PITS = `
  query GetAllBorrowPits {
    borrowPits {
      id
      name
      locationName
      coordinates
      createdAt
      updatedAt
    }
  }
`;

const GET_BORROW_PIT_BY_ID = `
  query GetBorrowPitById($id: ID!) {
    borrowPit(id: $id) {
      id
      name
      locationName
      coordinates
      createdAt
      updatedAt
    }
  }
`;

const SEARCH_BORROW_PITS = `
  query SearchBorrowPits($name: String!) {
    searchBorrowPits(name: $name) {
      id
      name
      locationName
      coordinates
    }
  }
`;

const FIND_NEARBY_BORROW_PITS = `
  query FindNearbyBorrowPits($longitude: Float!, $latitude: Float!, $maxDistance: Int!) {
    borrowPitsNearPoint(
      longitude: $longitude
      latitude: $latitude
      maxDistance: $maxDistance
    ) {
      id
      name
      locationName
      coordinates
    }
  }
`;

const UPDATE_BORROW_PIT = `
  mutation UpdateBorrowPit($id: ID!, $name: String, $locationName: String, $longitude: Float, $latitude: Float) {
    updateBorrowPit(
      id: $id
      input: {
        name: $name
        locationName: $locationName
        longitude: $longitude
        latitude: $latitude
      }
    ) {
      id
      name
      locationName
      coordinates
      updatedAt
    }
  }
`;

const DELETE_BORROW_PIT = `
  mutation DeleteBorrowPit($id: ID!) {
    deleteBorrowPit(id: $id) {
      success
      message
    }
  }
`;

// Service Functions
export const createBorrowPit = async (
  input: CreateBorrowPitInput,
  token: string
): Promise<BorrowPit> => {
  try {
    const response = await graphQLClient.request<{ createBorrowPit: BorrowPit }>(
      CREATE_BORROW_PIT,
      { ...input },
      { Authorization: `Bearer ${token}` }
    );
    return response.createBorrowPit;
  } catch (error) {
    console.error('Error creating borrow pit:', error);
    throw error;
  }
};

export const getBorrowPits = async (token: string): Promise<BorrowPit[]> => {
  try {
    const response = await graphQLClient.request<{ borrowPits: BorrowPit[] }>(
      GET_ALL_BORROW_PITS,
      {},
      { Authorization: `Bearer ${token}` }
    );
    return response.borrowPits;
  } catch (error) {
    console.error('Error fetching borrow pits:', error);
    throw error;
  }
};

export const getBorrowPitById = async (id: string, token: string): Promise<BorrowPit> => {
  try {
    const response = await graphQLClient.request<{ borrowPit: BorrowPit }>(
      GET_BORROW_PIT_BY_ID,
      { id },
      { Authorization: `Bearer ${token}` }
    );
    return response.borrowPit;
  } catch (error) {
    console.error('Error fetching borrow pit by id:', error);
    throw error;
  }
};

export const searchBorrowPits = async (name: string, token: string): Promise<BorrowPit[]> => {
  try {
    const response = await graphQLClient.request<{ searchBorrowPits: BorrowPit[] }>(
      SEARCH_BORROW_PITS,
      { name },
      { Authorization: `Bearer ${token}` }
    );
    return response.searchBorrowPits;
  } catch (error) {
    console.error('Error searching borrow pits:', error);
    throw error;
  }
};

export const borrowPitsNearPoint = async (
  longitude: number,
  latitude: number,
  maxDistance: number,
  token: string
): Promise<BorrowPit[]> => {
  try {
    const response = await graphQLClient.request<{ borrowPitsNearPoint: BorrowPit[] }>(
      FIND_NEARBY_BORROW_PITS,
      { longitude, latitude, maxDistance },
      { Authorization: `Bearer ${token}` }
    );
    return response.borrowPitsNearPoint;
  } catch (error) {
    console.error('Error finding nearby borrow pits:', error);
    throw error;
  }
};

export const updateBorrowPit = async (
  id: string,
  input: UpdateBorrowPitInput,
  token: string
): Promise<BorrowPit> => {
  try {
    const response = await graphQLClient.request<{ updateBorrowPit: BorrowPit }>(
      UPDATE_BORROW_PIT,
      { id, ...input },
      { Authorization: `Bearer ${token}` }
    );
    return response.updateBorrowPit;
  } catch (error) {
    console.error('Error updating borrow pit:', error);
    throw error;
  }
};

export const deleteBorrowPit = async (id: string, token: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await graphQLClient.request<{ deleteBorrowPit: { success: boolean; message: string } }>(
      DELETE_BORROW_PIT,
      { id },
      { Authorization: `Bearer ${token}` }
    );
    return response.deleteBorrowPit;
  } catch (error) {
    console.error('Error deleting borrow pit:', error);
    throw error;
  }
};
