import { graphQLClient } from '@/lib/graphql';

export interface Location {
  type: string;
  coordinates: [number, number];
}

export interface Area {
  id: string;
  name: string;
  location: Location;
  createdAt: string;
  updatedAt: string;
}

interface GetAreasResponse {
  areas: Area[];
}

interface GetAreaResponse {
  area: Area;
}

interface GetAreasNearbyResponse {
  areasNearby: Area[];
}

interface CreateAreaInput {
  name: string;
  latitude: number;
  longitude: number;
}

interface UpdateAreaInput {
  id: string;
  name?: string;
  latitude?: number;
  longitude?: number;
}

interface DeleteAreaInput {
  id: string;
}

interface CreateAreaResponse {
    createArea: Area;
}

interface UpdateAreaResponse {
  data: {
    updateArea: Area;
  };
}

interface DeleteAreaResponse {
  deleteArea: boolean;
}

const GET_AREAS = `
  query GetAreas {
    areas {
      id
      name
      location {
        type
        coordinates
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_AREA = `
  query GetArea($id: ID!) {
    area(id: $id) {
      id
      name
      location {
        type
        coordinates
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_AREAS_NEARBY = `
  query GetAreasNearby($latitude: Float!, $longitude: Float!, $maxDistance: Float!) {
    areasNearby(latitude: $latitude, longitude: $longitude, maxDistance: $maxDistance) {
      id
      name
      location {
        type
        coordinates
      }
      createdAt
      updatedAt
    }
  }
`;

const CREATE_AREA = `
  mutation CreateArea($name: String!, $latitude: Float!, $longitude: Float!) {
    createArea(name: $name, latitude: $latitude, longitude: $longitude) {
      id
      name
      location {
        type
        coordinates
      }
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_AREA = `
  mutation UpdateArea($id: ID!, $name: String, $latitude: Float, $longitude: Float) {
    updateArea(id: $id, name: $name, latitude: $latitude, longitude: $longitude) {
      id
      name
      location {
        type
        coordinates
      }
      createdAt
      updatedAt
    }
  }
`;

const DELETE_AREA = `
  mutation DeleteArea($id: ID!) {
    deleteArea(id: $id)
  }
`;

export const getAreas = async (token: string): Promise<Area[]> => {
  try {
    const response = await graphQLClient.request<GetAreasResponse>(GET_AREAS, {}, {
      Authorization: `Bearer ${token}`
    });
    return response.areas;
  } catch (error) {
    console.error('Error fetching areas:', error);
    throw error;
  }
};

export const getArea = async (id: string, token: string): Promise<Area> => {
  try {
    const response = await graphQLClient.request<GetAreaResponse>(GET_AREA, { id }, {
      Authorization: `Bearer ${token}`
    });
    return response.area;
  } catch (error) {
    console.error('Error fetching area:', error);
    throw error;
  }
};

export const getAreasNearby = async (
  latitude: number,
  longitude: number,
  maxDistance: number,
  token: string
): Promise<Area[]> => {
  try {
    const response = await graphQLClient.request<GetAreasNearbyResponse>(
      GET_AREAS_NEARBY,
      { latitude, longitude, maxDistance },
      {
        Authorization: `Bearer ${token}`
      }
    );
    return response.areasNearby;
  } catch (error) {
    console.error('Error fetching nearby areas:', error);
    throw error;
  }
};

export const createArea = async (input: CreateAreaInput, token: string): Promise<Area> => {
  try {
    const response = await graphQLClient.request<CreateAreaResponse>(CREATE_AREA, input, {
      Authorization: `Bearer ${token}`
    });
    return response.createArea;
  } catch (error) {
    console.error('Error creating area:', error);
    throw error;
  }
};

export const updateArea = async (input: UpdateAreaInput, token: string): Promise<Area> => {
  try {
    const response = await graphQLClient.request<UpdateAreaResponse>(UPDATE_AREA, input, {
      Authorization: `Bearer ${token}`
    });
    return response.data.updateArea;
  } catch (error) {
    console.error('Error updating area:', error);
    throw error;
  }
};

export const deleteArea = async (input: DeleteAreaInput, token: string): Promise<boolean> => {
  try {
    const response = await graphQLClient.request<DeleteAreaResponse>(DELETE_AREA, input, {
      Authorization: `Bearer ${token}`
    });
    return response.deleteArea;
  } catch (error) {
    console.error('Error deleting area:', error);
    throw error;
  }
}; 