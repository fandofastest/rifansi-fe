import { graphQLClient } from '@/lib/graphql';

export interface PersonnelRole {
  id: string;
  roleCode: string;
  roleName: string;
  description?: string;
}

interface GetPersonnelRolesResponse {
  personnelRoles: PersonnelRole[];
}

interface GetPersonnelRoleResponse {
  personnelRole: PersonnelRole;
}

interface CreatePersonnelRoleInput {
  roleCode: string;
  roleName: string;
  description?: string;
}

interface UpdatePersonnelRoleInput {
  id: string;
  roleCode?: string;
  roleName?: string;
  description?: string;
}

interface DeletePersonnelRoleInput {
  id: string;
}

interface CreatePersonnelRoleResponse {
  createPersonnelRole: PersonnelRole;
}

interface UpdatePersonnelRoleResponse {
  updatePersonnelRole: PersonnelRole;
}

interface DeletePersonnelRoleResponse {
  deletePersonnelRole: boolean;
}

interface AssignRoleToPersonnelResponse {
  assignRoleToPersonnel: {
    id: string;
    fullName: string;
    role: {
      id: string;
      roleName: string;
    };
  };
}

interface GetPersonnelByRoleResponse {
  personnelByRole: Array<{
    id: string;
    fullName: string;
    contactInfo: string;
    role: {
      id: string;
      roleName: string;
    };
  }>;
}

const GET_PERSONNEL_ROLES = `
  query GetAllPersonnelRoles {
    personnelRoles {
      id
      roleCode
      roleName
      description
    }
  }
`;

const GET_PERSONNEL_ROLE = `
  query GetPersonnelRole($id: ID!) {
    personnelRole(id: $id) {
      id
      roleCode
      roleName
      description
    }
  }
`;

const CREATE_PERSONNEL_ROLE = `
  mutation CreatePersonnelRole($roleCode: String!, $roleName: String!, $description: String) {
    createPersonnelRole(
      roleCode: $roleCode
      roleName: $roleName
      description: $description
    ) {
      id
      roleCode
      roleName
      description
    }
  }
`;

const UPDATE_PERSONNEL_ROLE = `
  mutation UpdatePersonnelRole($id: ID!, $roleCode: String, $roleName: String, $description: String) {
    updatePersonnelRole(
      id: $id
      roleCode: $roleCode
      roleName: $roleName
      description: $description
    ) {
      id
      roleCode
      roleName
      description
    }
  }
`;

const DELETE_PERSONNEL_ROLE = `
  mutation DeletePersonnelRole($id: ID!) {
    deletePersonnelRole(id: $id)
  }
`;

const ASSIGN_ROLE_TO_PERSONNEL = `
  mutation AssignRoleToPersonnel($personnelId: ID!, $roleId: ID!) {
    assignRoleToPersonnel(
      personnelId: $personnelId
      roleId: $roleId
    ) {
      id
      fullName
      role {
        id
        roleName
      }
    }
  }
`;

const GET_PERSONNEL_BY_ROLE = `
  query GetPersonnelByRole($roleId: ID!) {
    personnelByRole(roleId: $roleId) {
      id
      fullName
      contactInfo
      role {
        id
        roleName
      }
    }
  }
`;

export const getPersonnelRoles = async (token: string): Promise<PersonnelRole[]> => {
  try {
    const response = await graphQLClient.request<GetPersonnelRolesResponse>(GET_PERSONNEL_ROLES, {}, {
      Authorization: `Bearer ${token}`
    });
    return response.personnelRoles;
  } catch (error) {
    console.error('Error fetching personnel roles:', error);
    throw error;
  }
};

export const getPersonnelRole = async (id: string, token: string): Promise<PersonnelRole> => {
  try {
    const response = await graphQLClient.request<GetPersonnelRoleResponse>(GET_PERSONNEL_ROLE, { id }, {
      Authorization: `Bearer ${token}`
    });
    return response.personnelRole;
  } catch (error) {
    console.error('Error fetching personnel role:', error);
    throw error;
  }
};

export const createPersonnelRole = async (input: CreatePersonnelRoleInput, token: string): Promise<PersonnelRole> => {
  try {
    const response = await graphQLClient.request<CreatePersonnelRoleResponse>(CREATE_PERSONNEL_ROLE, input, {
      Authorization: `Bearer ${token}`
    });
    return response.createPersonnelRole;
  } catch (error) {
    console.error('Error creating personnel role:', error);
    throw error;
  }
};

export const updatePersonnelRole = async (input: UpdatePersonnelRoleInput, token: string): Promise<PersonnelRole> => {
  try {
    const response = await graphQLClient.request<UpdatePersonnelRoleResponse>(UPDATE_PERSONNEL_ROLE, input, {
      Authorization: `Bearer ${token}`
    });
    return response.updatePersonnelRole;
  } catch (error) {
    console.error('Error updating personnel role:', error);
    throw error;
  }
};

export const deletePersonnelRole = async (input: DeletePersonnelRoleInput, token: string): Promise<boolean> => {
  try {
    const response = await graphQLClient.request<DeletePersonnelRoleResponse>(DELETE_PERSONNEL_ROLE, input, {
      Authorization: `Bearer ${token}`
    });
    return response.deletePersonnelRole;
  } catch (error) {
    console.error('Error deleting personnel role:', error);
    throw error;
  }
};

export const assignRoleToPersonnel = async (personnelId: string, roleId: string, token: string) => {
  try {
    const response = await graphQLClient.request<AssignRoleToPersonnelResponse>(ASSIGN_ROLE_TO_PERSONNEL, 
      { personnelId, roleId }, 
      { Authorization: `Bearer ${token}` }
    );
    return response.assignRoleToPersonnel;
  } catch (error) {
    console.error('Error assigning role to personnel:', error);
    throw error;
  }
};

export const getPersonnelByRole = async (roleId: string, token: string) => {
  try {
    const response = await graphQLClient.request<GetPersonnelByRoleResponse>(GET_PERSONNEL_BY_ROLE, 
      { roleId }, 
      { Authorization: `Bearer ${token}` }
    );
    return response.personnelByRole;
  } catch (error) {
    console.error('Error getting personnel by role:', error);
    throw error;
  }
}; 