import { graphQLClient } from "@/lib/graphql";

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
}

export interface Unit {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

export interface WorkItemRates {
  nr: {
    rate: number;
    description: string;
  };
  r: {
    rate: number;
    description: string;
  };
}

export interface WorkItem {
  id: string;
  name: string;
  category: Category;
  subCategory: SubCategory;
  unit: Unit;
  rates: WorkItemRates;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GetWorkItemsResponse {
  workItems: WorkItem[];
}

interface GetWorkItemResponse {
  workItem: WorkItem;
}

interface GetWorkItemsBySPKResponse {
  workItemsBySPK: WorkItem[];
}

interface CreateWorkItemInput {
  name: string;
  categoryId: string;
  subCategoryId: string;
  unitId: string;
  rates: WorkItemRates;
  description: string;
}

interface UpdateWorkItemInput {
  name?: string;
  categoryId?: string;
  subCategoryId?: string;
  unitId?: string;
  rates?: WorkItemRates;
  description?: string;
}

interface CreateWorkItemResponse {
  createWorkItem: {
    id: string;
    name: string;
    rates: WorkItemRates;
    unit: {
      id: string;
      name: string;
    };
  };
}

interface UpdateWorkItemResponse {
  updateWorkItem: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
      code?: string;
    };
    subCategory: {
      id: string;
      name: string;
    };
    unit: {
      id: string;
      name: string;
      code?: string;
    };
    rates: WorkItemRates;
    description: string;
  };
}

interface DeleteWorkItemResponse {
  deleteWorkItem: boolean;
}

const GET_WORK_ITEMS = `
  query {
    workItems {
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
      createdAt
      updatedAt
    }
  }
`;

const GET_WORK_ITEM = `
  query GetWorkItem($id: ID!) {
    workItem(id: $id) {
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
      createdAt
      updatedAt
    }
  }
`;

const GET_WORK_ITEMS_BY_SPK = `
  query GetWorkItemsBySPK($spkId: ID!) {
    workItemsBySPK(spkId: $spkId) {
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
      createdAt
      updatedAt
    }
  }
`;

const CREATE_WORK_ITEM = `
  mutation CreateWorkItem($input: CreateWorkItemInput!) {
    createWorkItem(input: $input) {
      id
      name
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
      unit {
        id
        name
      }
    }
  }
`;

const UPDATE_WORK_ITEM = `
  mutation UpdateWorkItem($id: ID!, $input: UpdateWorkItemInput!) {
    updateWorkItem(id: $id, input: $input) {
      id
      name
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
        nr { rate description }
        r { rate description }
      }
      description
    }
  }
`;

const DELETE_WORK_ITEM = `
  mutation DeleteWorkItem($id: ID!) {
    deleteWorkItem(id: $id)
  }
`;

export const getWorkItems = async (token: string): Promise<WorkItem[]> => {
  try {
    const response = await graphQLClient.request<GetWorkItemsResponse>(GET_WORK_ITEMS, {}, {
      Authorization: `Bearer ${token}`
    });
    return response.workItems;
  } catch (error) {
    console.error('Error fetching work items:', error);
    throw error;
  }
};

export const getWorkItem = async (id: string, token: string): Promise<WorkItem> => {
  try {
    const response = await graphQLClient.request<GetWorkItemResponse>(GET_WORK_ITEM, { id }, {
      Authorization: `Bearer ${token}`
    });
    return response.workItem;
  } catch (error) {
    console.error('Error fetching work item:', error);
    throw error;
  }
};

export const getWorkItemsBySPK = async (spkId: string, token: string): Promise<WorkItem[]> => {
  try {
    const response = await graphQLClient.request<GetWorkItemsBySPKResponse>(GET_WORK_ITEMS_BY_SPK, { spkId }, {
      Authorization: `Bearer ${token}`
    });
    return response.workItemsBySPK;
  } catch (error) {
    console.error('Error fetching work items by SPK:', error);
    throw error;
  }
};

export const createWorkItem = async (input: CreateWorkItemInput, token: string): Promise<WorkItem> => {
  try {
    const response = await graphQLClient.request<CreateWorkItemResponse>(CREATE_WORK_ITEM, { 
      input: {
        name: input.name,
        categoryId: input.categoryId,
        subCategoryId: input.subCategoryId,
        unitId: input.unitId,
        rates: {
          nr: {
            rate: input.rates.nr.rate,
            description: input.rates.nr.description
          },
          r: {
            rate: input.rates.r.rate,
            description: input.rates.r.description
          }
        },
        description: input.description
      }
    }, {
      Authorization: `Bearer ${token}`
    });
    return response.createWorkItem as WorkItem;
  } catch (error) {
    console.error('Error creating work item:', error);
    throw error;
  }
};

export const updateWorkItem = async (id: string, input: UpdateWorkItemInput, token: string): Promise<WorkItem> => {
  try {
    const response = await graphQLClient.request<UpdateWorkItemResponse>(UPDATE_WORK_ITEM, { 
      id,
      input: {
        ...(input.name && { name: input.name }),
        ...(input.categoryId && { categoryId: input.categoryId }),
        ...(input.subCategoryId && { subCategoryId: input.subCategoryId }),
        ...(input.unitId && { unitId: input.unitId }),
        ...(input.rates && {
          rates: {
            nr: {
              rate: input.rates.nr.rate,
              description: input.rates.nr.description
            },
            r: {
              rate: input.rates.r.rate,
              description: input.rates.r.description
            }
          }
        }),
        ...(input.description && { description: input.description })
      }
    }, {
      Authorization: `Bearer ${token}`
    });
    return response.updateWorkItem as WorkItem;
  } catch (error) {
    console.error('Error updating work item:', error);
    throw error;
  }
};

export const deleteWorkItem = async (id: string, token: string): Promise<boolean> => {
  try {
    const response = await graphQLClient.request<DeleteWorkItemResponse>(DELETE_WORK_ITEM, { id }, {
      Authorization: `Bearer ${token}`
    });
    return response.deleteWorkItem;
  } catch (error) {
    console.error('Error deleting work item:', error);
    throw error;
  }
}; 