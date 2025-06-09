import { graphQLClient } from '@/lib/graphql';

export interface FuelPrice {
  id: string;
  fuelType: string;
  pricePerLiter: number;
  effectiveDate: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Response Types ---
interface FuelPricesResponse {
  fuelPrices: FuelPrice[];
}
interface FuelPriceResponse {
  fuelPrice: FuelPrice;
}
interface CurrentFuelPriceResponse {
  currentFuelPrice: FuelPrice;
}
interface CreateFuelPriceResponse {
  createFuelPrice: FuelPrice;
}
interface UpdateFuelPriceResponse {
  updateFuelPrice: FuelPrice;
}
interface DeleteFuelPriceResponse {
  deleteFuelPrice: boolean;
}

// Get all fuel prices
export const getFuelPrices = async (token: string): Promise<FuelPrice[]> => {
  const query = `
    query {
      fuelPrices {
        id
        fuelType
        pricePerLiter
        effectiveDate
        description
        createdAt
        updatedAt
      }
    }
  `;
  const res = await graphQLClient.request<FuelPricesResponse>(query, undefined, { Authorization: `Bearer ${token}` });
  return res.fuelPrices;
};

// Get fuel price by ID
export const getFuelPrice = async (id: string, token: string): Promise<FuelPrice> => {
  const query = `
    query GetFuelPrice($id: ID!) {
      fuelPrice(id: $id) {
        id
        fuelType
        pricePerLiter
        effectiveDate
        description
        createdAt
        updatedAt
      }
    }
  `;
  const res = await graphQLClient.request<FuelPriceResponse>(query, { id }, { Authorization: `Bearer ${token}` });
  return res.fuelPrice;
};

// Get current fuel price by type
export const getCurrentFuelPrice = async (fuelType: string, token: string): Promise<FuelPrice> => {
  const query = `
    query GetCurrentFuelPrice($fuelType: String!) {
      currentFuelPrice(fuelType: $fuelType) {
        id
        fuelType
        pricePerLiter
        effectiveDate
        description
        createdAt
        updatedAt
      }
    }
  `;
  const res = await graphQLClient.request<CurrentFuelPriceResponse>(query, { fuelType }, { Authorization: `Bearer ${token}` });
  return res.currentFuelPrice;
};

// Create fuel price
export interface CreateFuelPriceInput {
  fuelType: string;
  pricePerLiter: number;
  effectiveDate: string;
  description?: string;
}

export const createFuelPrice = async (input: CreateFuelPriceInput, token: string): Promise<FuelPrice> => {
  const mutation = `
    mutation CreateFuelPrice($fuelType: String!, $pricePerLiter: Float!, $effectiveDate: String!, $description: String) {
      createFuelPrice(input: {
        fuelType: $fuelType
        pricePerLiter: $pricePerLiter
        effectiveDate: $effectiveDate
        description: $description
      }) {
        id
        fuelType
        pricePerLiter
        effectiveDate
        description
        createdAt
        updatedAt
      }
    }
  `;
  const res = await graphQLClient.request<CreateFuelPriceResponse>(mutation, input, { Authorization: `Bearer ${token}` });
  return res.createFuelPrice;
};

// Update fuel price
export interface UpdateFuelPriceInput {
  id: string;
  fuelType?: string;
  pricePerLiter?: number;
  effectiveDate?: string;
  description?: string;
}

export const updateFuelPrice = async (input: UpdateFuelPriceInput, token: string): Promise<FuelPrice> => {
  const mutation = `
    mutation UpdateFuelPrice($id: ID!, $fuelType: String, $pricePerLiter: Float, $effectiveDate: String, $description: String) {
      updateFuelPrice(
        id: $id
        fuelType: $fuelType
        pricePerLiter: $pricePerLiter
        effectiveDate: $effectiveDate
        description: $description
      ) {
        id
        fuelType
        pricePerLiter
        effectiveDate
        description
        createdAt
        updatedAt
      }
    }
  `;
  const res = await graphQLClient.request<UpdateFuelPriceResponse>(mutation, input, { Authorization: `Bearer ${token}` });
  return res.updateFuelPrice;
};

// Delete fuel price
export const deleteFuelPrice = async (id: string, token: string): Promise<boolean> => {
  const mutation = `
    mutation DeleteFuelPrice($id: ID!) {
      deleteFuelPrice(id: $id)
    }
  `;
  const res = await graphQLClient.request<DeleteFuelPriceResponse>(mutation, { id }, { Authorization: `Bearer ${token}` });
  return res.deleteFuelPrice;
}; 