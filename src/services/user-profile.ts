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
  updatedAt: string;
}

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user: UserProfile;
}

interface UpdateProfileInput {
  fullName?: string;
  email?: string;
  phone?: string;
}

interface UpdatePasswordResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    email: string;
  };
}

interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: Record<string, unknown>;
}

// GraphQL Queries
export const GET_ME = `
  query Me {
    me {
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
      updatedAt
    }
  }
`;

// GraphQL Mutations
export const UPDATE_MY_PROFILE = `
  mutation UpdateMyProfile($fullName: String, $email: String, $phone: String) {
    updateMyProfile(fullName: $fullName, email: $email, phone: $phone) {
      success
      message
      user {
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
        updatedAt
      }
    }
  }
`;

export const UPDATE_MY_PASSWORD = `
  mutation UpdatePassword($currentPassword: String!, $newPassword: String!) {
    updatePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      success
      message
      user {
        id
        username
        fullName
        email
      }
    }
  }
`;

export const UPDATE_MY_PHOTO = `
  mutation UpdateMyPhoto($photo: Upload!) {
    updateMyPhoto(photo: $photo) {
      success
      message
      user {
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
        updatedAt
      }
    }
  }
`;

/**
 * Get current user profile
 */
export const getMe = async (token: string): Promise<UserProfile> => {
  try {
    const response = await graphQLClient.request<{ me: UserProfile }>(GET_ME, {}, {
      Authorization: `Bearer ${token}`
    });
    return response.me;
  } catch (error: unknown) {
    const graphqlError = error as GraphQLError;
    console.error('Error fetching current user profile:', graphqlError.message);
    throw error;
  }
};

/**
 * Update user profile information
 */
export const updateMyProfile = async (
  input: UpdateProfileInput,
  token: string
): Promise<UpdateProfileResponse> => {
  try {
    const response = await graphQLClient.request<{ updateMyProfile: UpdateProfileResponse }>(
      UPDATE_MY_PROFILE,
      input,
      { Authorization: `Bearer ${token}` }
    );
    return response.updateMyProfile;
  } catch (error: unknown) {
    const graphqlError = error as GraphQLError;
    console.error('Error updating profile:', graphqlError.message);
    throw error;
  }
};

/**
 * Change user password
 */
export const changeMyPassword = async (
  data: { currentPassword: string; newPassword: string },
  token: string
): Promise<UpdatePasswordResponse> => {
  const response = await graphQLClient.request<{ updatePassword: UpdatePasswordResponse }>(
    UPDATE_MY_PASSWORD,
    data,
    { Authorization: `Bearer ${token}` }
  );
  return response.updatePassword;
}; 