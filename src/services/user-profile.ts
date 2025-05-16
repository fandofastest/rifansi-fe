import { graphQLClient } from '@/lib/graphql';

interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role?: {
    id: string;
    roleCode: string;
    roleName: string;
  };
  updatedAt?: number;
}

interface UpdateProfileInput {
  fullName?: string;
  email?: string;
  phone?: string;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// GraphQL Mutations
const UPDATE_MY_PROFILE = `
  mutation UpdateMyProfile($fullName: String, $email: String, $phone: String) {
    updateMyProfile(
      fullName: $fullName
      email: $email
      phone: $phone
    ) {
      id
      username
      fullName
      email
      phone
      role {
        id
        roleCode
        roleName
      }
    }
  }
`;

const CHANGE_MY_PASSWORD = `
  mutation ChangeMyPassword($currentPassword: String!, $newPassword: String!) {
    changeMyPassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      success
      message
    }
  }
`;

/**
 * Update user profile information
 */
export const updateMyProfile = async (
  input: UpdateProfileInput,
  token: string
): Promise<UserProfile> => {
  try {
    const response = await graphQLClient.request<{ updateMyProfile: UserProfile }>(
      UPDATE_MY_PROFILE,
      input,
      { Authorization: `Bearer ${token}` }
    );
    return response.updateMyProfile;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Change user password
 */
export const changeMyPassword = async (
  input: ChangePasswordInput,
  token: string
): Promise<ChangePasswordResponse> => {
  try {
    const response = await graphQLClient.request<{ changeMyPassword: ChangePasswordResponse }>(
      CHANGE_MY_PASSWORD,
      input,
      { Authorization: `Bearer ${token}` }
    );
    return response.changeMyPassword;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}; 