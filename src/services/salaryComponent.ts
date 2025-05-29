import { graphQLClient } from '@/lib/graphql';

export interface SalaryComponent {
  id: string;
  gajiPokok: number;
  tunjanganTetap: number;
  tunjanganTidakTetap: number;
  transport: number;
  pulsa: number;
  personnelRole: {
    id: string;
    roleName: string;
    roleCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SalaryComponentDetails {
  // Input fields
  gajiPokok: number;
  tunjanganTetap: number;
  tunjanganTidakTetap: number;
  transport: number;
  pulsa: number;
  
  // Calculated fields
  bpjsKT: number;
  bpjsJP: number;
  bpjsKES: number;
  uangCuti: number;
  thr: number;
  santunan: number;
  hariPerBulan: number;
  subTotalPenghasilanTetap: number;
  biayaMPTetapHarian: number;
  upahLemburHarian: number;
  biayaManpowerHarian: number;
}

interface GetSalaryComponentsResponse {
  salaryComponents: SalaryComponent[];
}

interface GetSalaryComponentResponse {
  salaryComponent: SalaryComponent;
}

interface GetSalaryComponentByPersonnelRoleResponse {
  salaryComponentByPersonnelRole: SalaryComponent;
}

interface GetSalaryComponentDetailsResponse {
  getSalaryComponentDetails: SalaryComponentDetails;
}

interface CreateSalaryComponentInput {
  personnelRoleId: string;
  gajiPokok?: number;
  tunjanganTetap?: number;
  tunjanganTidakTetap?: number;
  transport?: number;
  pulsa?: number;
}

interface UpdateSalaryComponentInput {
  id: string;
  gajiPokok?: number;
  tunjanganTetap?: number;
  tunjanganTidakTetap?: number;
  transport?: number;
  pulsa?: number;
}

interface CreateSalaryComponentResponse {
  createSalaryComponent: SalaryComponent;
}

interface UpdateSalaryComponentResponse {
  updateSalaryComponent: SalaryComponent;
}

interface DeleteSalaryComponentResponse {
  deleteSalaryComponent: boolean;
}

const CREATE_SALARY_COMPONENT = `
  mutation CreateSalaryComponent(
    $personnelRoleId: ID!, 
    $gajiPokok: Float, 
    $tunjanganTetap: Float, 
    $tunjanganTidakTetap: Float, 
    $transport: Float, 
    $pulsa: Float
  ) {
    createSalaryComponent(
      personnelRoleId: $personnelRoleId, 
      gajiPokok: $gajiPokok, 
      tunjanganTetap: $tunjanganTetap, 
      tunjanganTidakTetap: $tunjanganTidakTetap, 
      transport: $transport, 
      pulsa: $pulsa
    ) {
      id
      gajiPokok
      tunjanganTetap
      tunjanganTidakTetap
      transport
      pulsa
      personnelRole {
        id
        roleName
        roleCode
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_SALARY_COMPONENTS = `
  query GetSalaryComponents {
    salaryComponents {
      id
      gajiPokok
      tunjanganTetap
      tunjanganTidakTetap
      transport
      pulsa
      personnelRole {
        id
        roleName
        roleCode
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_SALARY_COMPONENT = `
  query GetSalaryComponent($id: ID!) {
    salaryComponent(id: $id) {
      id
      gajiPokok
      tunjanganTetap
      tunjanganTidakTetap
      transport
      pulsa
      personnelRole {
        id
        roleName
        roleCode
      }
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_SALARY_COMPONENT = `
  mutation UpdateSalaryComponent(
    $id: ID!, 
    $gajiPokok: Float, 
    $tunjanganTetap: Float, 
    $tunjanganTidakTetap: Float, 
    $transport: Float, 
    $pulsa: Float
  ) {
    updateSalaryComponent(
      id: $id, 
      gajiPokok: $gajiPokok, 
      tunjanganTetap: $tunjanganTetap, 
      tunjanganTidakTetap: $tunjanganTidakTetap, 
      transport: $transport, 
      pulsa: $pulsa
    ) {
      id
      gajiPokok
      tunjanganTetap
      tunjanganTidakTetap
      transport
      pulsa
      personnelRole {
        id
        roleName
        roleCode
      }
      createdAt
      updatedAt
    }
  }
`;

const DELETE_SALARY_COMPONENT = `
  mutation DeleteSalaryComponent($id: ID!) {
    deleteSalaryComponent(id: $id)
  }
`;

const GET_SALARY_COMPONENT_BY_PERSONNEL_ROLE = `
  query GetSalaryComponentByPersonnelRole($personnelRoleId: ID!) {
    salaryComponentByPersonnelRole(personnelRoleId: $personnelRoleId) {
      id
      gajiPokok
      tunjanganTetap
      tunjanganTidakTetap
      transport
      pulsa
      personnelRole {
        id
        roleName
        roleCode
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_SALARY_COMPONENT_DETAILS = `
  query GetSalaryComponentDetails($personnelRoleId: ID!, $date: String) {
    getSalaryComponentDetails(personnelRoleId: $personnelRoleId, date: $date) {
      gajiPokok
      tunjanganTetap
      tunjanganTidakTetap
      transport
      pulsa
      bpjsKT
      bpjsJP
      bpjsKES
      uangCuti
      thr
      santunan
      hariPerBulan
      subTotalPenghasilanTetap
      biayaMPTetapHarian
      upahLemburHarian
      biayaManpowerHarian
    }
  }
`;

export const getSalaryComponents = async (token: string): Promise<SalaryComponent[]> => {
  try {
    const response = await graphQLClient.request<GetSalaryComponentsResponse>(GET_SALARY_COMPONENTS, {}, {
      Authorization: `Bearer ${token}`
    });
    return response.salaryComponents;
  } catch (error) {
    console.error('Error fetching salary components:', error);
    throw error;
  }
};

export const getSalaryComponent = async (id: string, token: string): Promise<SalaryComponent> => {
  try {
    const response = await graphQLClient.request<GetSalaryComponentResponse>(
      GET_SALARY_COMPONENT, 
      { id }, 
      { Authorization: `Bearer ${token}` }
    );
    return response.salaryComponent;
  } catch (error) {
    console.error('Error fetching salary component:', error);
    throw error;
  }
};

export const getSalaryComponentByPersonnelRole = async (personnelRoleId: string, token: string): Promise<SalaryComponent | null> => {
  try {
    const response = await graphQLClient.request<GetSalaryComponentByPersonnelRoleResponse>(
      GET_SALARY_COMPONENT_BY_PERSONNEL_ROLE, 
      { personnelRoleId }, 
      { Authorization: `Bearer ${token}` }
    );
    return response.salaryComponentByPersonnelRole;
  } catch (error) {
    console.error('Error fetching salary component by personnel role:', error);
    return null; // Return null if not found
  }
};

export const getSalaryComponentDetails = async (personnelRoleId: string, date: string | null, token: string): Promise<SalaryComponentDetails | null> => {
  try {
    const response = await graphQLClient.request<GetSalaryComponentDetailsResponse>(
      GET_SALARY_COMPONENT_DETAILS, 
      { personnelRoleId, date }, 
      { Authorization: `Bearer ${token}` }
    );
    return response.getSalaryComponentDetails;
  } catch (error) {
    console.error('Error fetching salary component details:', error);
    return null;
  }
};

export const createSalaryComponent = async (input: CreateSalaryComponentInput, token: string): Promise<SalaryComponent> => {
  try {
    const response = await graphQLClient.request<CreateSalaryComponentResponse>(
      CREATE_SALARY_COMPONENT, 
      input, 
      { Authorization: `Bearer ${token}` }
    );
    return response.createSalaryComponent;
  } catch (error) {
    console.error('Error creating salary component:', error);
    throw error;
  }
};

export const updateSalaryComponent = async (input: UpdateSalaryComponentInput, token: string): Promise<SalaryComponent> => {
  try {
    const response = await graphQLClient.request<UpdateSalaryComponentResponse>(
      UPDATE_SALARY_COMPONENT, 
      input, 
      { Authorization: `Bearer ${token}` }
    );
    return response.updateSalaryComponent;
  } catch (error) {
    console.error('Error updating salary component:', error);
    throw error;
  }
};

export const deleteSalaryComponent = async (id: string, token: string): Promise<boolean> => {
  try {
    const response = await graphQLClient.request<DeleteSalaryComponentResponse>(
      DELETE_SALARY_COMPONENT, 
      { id }, 
      { Authorization: `Bearer ${token}` }
    );
    return response.deleteSalaryComponent;
  } catch (error) {
    console.error('Error deleting salary component:', error);
    throw error;
  }
}; 