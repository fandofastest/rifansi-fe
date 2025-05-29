import { graphQLClient } from '@/lib/graphql';

export interface User {
  id: string;
  fullName: string;
}

export interface ApproverSetting {
  id: string;
  userId: User;
  approverId: User;
}

export interface Approval {
  id: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  isApproved: boolean;
  approvedBy: User;
  remarks?: string;
}

interface CreateApproverSettingInput {
  userId: string;
  approverId: string;
}

interface UpdateApproverSettingInput {
  id: string;
  userId: string;
  approverId: string;
}

interface UpdateApprovalInput {
  id: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
}

interface CreateApproverSettingResponse {
  createApproverSetting: ApproverSetting;
}

interface UpdateApproverSettingResponse {
  updateApproverSetting: ApproverSetting;
}

interface UpdateApprovalResponse {
  updateApproval: Approval;
}

interface ApproverRole {
  id: string;
  roleCode: string;
  roleName: string;
}

interface GetApproverByUserResponse {
  getApproverByUser: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    role: ApproverRole;
  };
}

const CREATE_APPROVER_SETTING = `
  mutation CreateApproverSetting($userId: ID!, $approverId: ID!) {
    createApproverSetting(input: {
      userId: $userId,
      approverId: $approverId
    }) {
      id
      userId {
        id
        fullName
      }
      approverId {
        id
        fullName
      }
    }
  }
`;

const UPDATE_APPROVER_SETTING = `
  mutation UpdateApproverSetting($id: ID!, $userId: ID!, $approverId: ID!) {
    updateApproverSetting(input: {
      id: $id,
      userId: $userId,
      approverId: $approverId
    }) {
      id
      userId {
        fullName
      }
      approverId {
        fullName
      }
    }
  }
`;

const UPDATE_APPROVAL = `
  mutation UpdateApproval($id: ID!, $status: String!, $remarks: String) {
    updateApproval(
      id: $id,
      status: $status,
      remarks: $remarks
    ) {
      id
      status
      isApproved
      approvedBy {
        fullName
      }
    }
  }
`;

const GET_APPROVER_BY_USER = `
  mutation GetApproverByUser($userId: ID!) {
    getApproverByUser(userId: $userId) {
      id
      username
      fullName
      email
      role {
        id
        roleCode
        roleName
      }
    }
  }
`;

export const createApproverSetting = async (
  input: CreateApproverSettingInput,
  token: string
): Promise<ApproverSetting> => {
  try {
    const response = await graphQLClient.request<CreateApproverSettingResponse>(
      CREATE_APPROVER_SETTING,
      input,
      { Authorization: `Bearer ${token}` }
    );
    return response.createApproverSetting;
  } catch (error) {
    console.error('Error creating approver setting:', error);
    throw error;
  }
};

export const updateApproverSetting = async (
  input: UpdateApproverSettingInput,
  token: string
): Promise<ApproverSetting> => {
  try {
    const response = await graphQLClient.request<UpdateApproverSettingResponse>(
      UPDATE_APPROVER_SETTING,
      input,
      { Authorization: `Bearer ${token}` }
    );
    return response.updateApproverSetting;
  } catch (error) {
    console.error('Error updating approver setting:', error);
    throw error;
  }
};

export const updateApproval = async (
  input: UpdateApprovalInput,
  token: string
): Promise<Approval> => {
  try {
    const response = await graphQLClient.request<UpdateApprovalResponse>(
      UPDATE_APPROVAL,
      input,
      { Authorization: `Bearer ${token}` }
    );
    return response.updateApproval;
  } catch (error) {
    console.error('Error updating approval:', error);
    throw error;
  }
};

export const getApproverByUser = async (
  userId: string,
  token: string
): Promise<GetApproverByUserResponse['getApproverByUser'] | null> => {
  try {
    const response = await graphQLClient.request<GetApproverByUserResponse>(
      GET_APPROVER_BY_USER,
      { userId },
      { Authorization: `Bearer ${token}` }
    );
    return response.getApproverByUser;
  } catch (error) {
    console.error('Error fetching approver by user:', error);
    return null;
  }
}; 