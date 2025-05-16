import { graphQLClient } from '@/lib/graphql';

export interface Location {
  id: string;
  name: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

export interface WorkItem {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  subCategory: {
    id: string;
    name: string;
  };
  unit: {
    id: string;
    name: string;
  };
}

export interface SPKWorkItem {
  workItemId: string;
  boqVolume: {
    nr: number;
    r: number;
  };
  amount: number;
  rates: {
    nr: {
      rate: number;
      description: string;
    };
    r: {
      rate: number;
      description: string;
    };
  };
  description: string;
  workItem: WorkItem;
}

export interface SPK {
  id: string;
  spkNo: string;
  wapNo: string;
  title: string;
  projectName: string;
  date: number;
  contractor?: string;
  workDescription?: string;
  location?: Location;
  startDate?: number;
  endDate?: number;
  budget?: number;
  workItems: SPKWorkItem[];
  createdAt: number;
  updatedAt: number;
}

interface CreateSPKInput {
  spkNo: string;
  wapNo: string;
  title: string;
  projectName: string;
  date: string;
  contractor?: string;
  workDescription?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

interface UpdateSPKInput {
  id: string;
  spkNo?: string;
  wapNo?: string;
  title?: string;
  projectName?: string;
  date?: string;
  contractor?: string;
  workDescription?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

interface DeleteSPKInput {
  id: string;
}

interface CreateSPKResponse {
  createSPK: SPK;
}

interface UpdateSPKResponse {
  updateSPK: SPK;
}

interface DeleteSPKResponse {
  deleteSPK: boolean;
}

interface SPKsResponse {
  spks: SPK[];
}

interface AddWorkItemInput {
  workItemId: string;
  boqVolume: {
    nr: number;
    r: number;
  };
  rates: {
    nr: {
      rate: number;
      description: string;
    };
    r: {
      rate: number;
      description: string;
    };
  };
  description: string;
}

interface AddWorkItemToSPKResponse {
  addWorkItemToSPK: SPK;
}

const GET_SPKS = `
  query GetSPKs($startDate: String, $endDate: String) {
    spks(startDate: $startDate, endDate: $endDate) {
      id
      spkNo
      wapNo
      title
      projectName
      date
      contractor
      workDescription
      location {
        id
        name
      }
      startDate
      endDate
      budget
      workItems {
        workItemId
        boqVolume {
          nr
          r
        }
        amount
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
        workItem {
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
        }
      }
      createdAt
      updatedAt
    }
  }
`;

const CREATE_SPK = `
  mutation CreateSPK($input: CreateSPKInput!) {
    createSPK(input: $input) {
      id
      spkNo
      wapNo
      title
      projectName
      date
      contractor
      workDescription
      location {
        id
        name
      }
      startDate
      endDate
      budget
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_SPK = `
  mutation UpdateSPK($input: UpdateSPKInput!) {
    updateSPK(input: $input) {
      id
      spkNo
      wapNo
      title
      projectName
      date
      contractor
      workDescription
      location {
        id
        name
      }
      startDate
      endDate
      budget
      createdAt
      updatedAt
    }
  }
`;

const DELETE_SPK = `
  mutation DeleteSPK($id: ID!) {
    deleteSPK(id: $id)
  }
`;

const ADD_WORK_ITEM_TO_SPK = `
  mutation AddWorkItemToSPK($spkId: ID!, $input: AddWorkItemInput!) {
    addWorkItemToSPK(spkId: $spkId, input: $input) {
      id
      spkNo
      workItems {
        workItemId
        boqVolume {
          nr
          r
        }
        amount
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
        workItem {
          id
          name
          unit {
            id
            name
          }
        }
      }
    }
  }
`;

const GET_SPK_BY_ID = `
  query GetSPKById($id: ID!) {
    spk(id: $id) {
      id
      spkNo
      wapNo
      title
      projectName
      date
      contractor
      workDescription
      location {
        id
        name
      }
      startDate
      endDate
      budget
      workItems {
        workItemId
        boqVolume {
          nr
          r
        }
        amount
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
        workItem {
          id
          name
          category { id name }
          subCategory { id name }
          unit { id name }
        }
      }
    }
  }
`;

const UPDATE_SPK_WORK_ITEM = `
  mutation UpdateSPKWorkItem($spkId: ID!, $workItemId: ID!, $input: UpdateSPKWorkItemInput!) {
    updateSPKWorkItem(spkId: $spkId, workItemId: $workItemId, input: $input) {
      id
      spkNo
      workItems {
        workItemId
        boqVolume { nr r }
        amount
        rates {
          nr { rate description }
          r { rate description }
        }
        description
        workItem { id name unit { id name } }
      }
    }
  }
`;

const REMOVE_WORK_ITEM_FROM_SPK = `
  mutation RemoveWorkItemFromSPK($spkId: ID!, $workItemId: ID!) {
    removeWorkItemFromSPK(spkId: $spkId, workItemId: $workItemId) {
      id
      spkNo
      workItems {
        workItemId
        boqVolume { nr r }
        amount
        workItem { id name }
      }
    }
  }
`;

export const getSPKs = async (
  token: string,
  startDate?: string,
  endDate?: string
): Promise<SPK[]> => {
  try {
    const variables: any = {};
    if (startDate) variables.startDate = startDate;
    if (endDate) variables.endDate = endDate;

    const response = await graphQLClient.request<SPKsResponse>(GET_SPKS, variables, {
      Authorization: `Bearer ${token}`
    });
    return response.spks;
  } catch (error) {
    console.error('Error fetching SPKs:', error);
    throw error;
  }
};

export const createSPK = async (input: CreateSPKInput, token: string): Promise<SPK> => {
  try {
    const response = await graphQLClient.request<CreateSPKResponse>(CREATE_SPK, { input }, {
      Authorization: `Bearer ${token}`
    });
    return response.createSPK;
  } catch (error) {
    console.error('Error creating SPK:', error);
    throw error;
  }
};

export const updateSPK = async (input: UpdateSPKInput, token: string): Promise<SPK> => {
  try {
    const response = await graphQLClient.request<UpdateSPKResponse>(UPDATE_SPK, { input }, {
      Authorization: `Bearer ${token}`
    });
    return response.updateSPK;
  } catch (error) {
    console.error('Error updating SPK:', error);
    throw error;
  }
};

export const deleteSPK = async (input: DeleteSPKInput, token: string): Promise<boolean> => {
  try {
    const response = await graphQLClient.request<DeleteSPKResponse>(DELETE_SPK, input, {
      Authorization: `Bearer ${token}`
    });
    return response.deleteSPK;
  } catch (error) {
    console.error('Error deleting SPK:', error);
    throw error;
  }
};

export const addWorkItemToSPK = async (
  spkId: string,
  input: AddWorkItemInput,
  token: string
): Promise<SPK> => {
  try {
    const response = await graphQLClient.request<AddWorkItemToSPKResponse>(ADD_WORK_ITEM_TO_SPK, { spkId, input }, {
      Authorization: `Bearer ${token}`
    });
    return response.addWorkItemToSPK;
  } catch (error) {
    console.error('Error adding work item to SPK:', error);
    throw error;
  }
};

export const getSPKById = async (id: string, token: string): Promise<SPK> => {
  try {
    const response = await graphQLClient.request<{ spk: SPK }>(GET_SPK_BY_ID, { id }, {
      Authorization: `Bearer ${token}`
    });
    return response.spk;
  } catch (error) {
    console.error('Error fetching SPK by id:', error);
    throw error;
  }
};

export const updateSPKWorkItem = async (
  spkId: string,
  workItemId: string,
  input: {
    boqVolume: { nr: number; r: number };
    rates: {
      nr: { rate: number; description: string };
      r: { rate: number; description: string };
    };
    description: string;
  },
  token: string
): Promise<SPK> => {
  try {
    const response = await graphQLClient.request<{ updateSPKWorkItem: SPK }>(
      UPDATE_SPK_WORK_ITEM,
      { spkId, workItemId, input },
      { Authorization: `Bearer ${token}` }
    );
    return response.updateSPKWorkItem;
  } catch (error) {
    console.error('Error updating SPK work item:', error);
    throw error;
  }
};

export const removeWorkItemFromSPK = async (
  spkId: string,
  workItemId: string,
  token: string
): Promise<SPK> => {
  try {
    const response = await graphQLClient.request<{ removeWorkItemFromSPK: SPK }>(
      REMOVE_WORK_ITEM_FROM_SPK,
      { spkId, workItemId },
      { Authorization: `Bearer ${token}` }
    );
    return response.removeWorkItemFromSPK;
  } catch (error) {
    console.error('Error removing work item from SPK:', error);
    throw error;
  }
};

export const importSPKFromExcel = async (
  file: File | Blob,
  token: string
): Promise<any> => {
  const formData = new FormData();
  formData.append('excelFile', file);

  const baseUrl = process.env.NEXT_PUBLIC_UPLOAD_URL || '';
  const url = baseUrl.replace(/\/$/, '') + '/api/import-spk';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to import SPK from Excel');
  }

  return response.json();
}; 