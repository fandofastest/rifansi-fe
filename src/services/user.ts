import { graphQLClient } from '@/lib/graphql';

interface Location {
  type: string;
  coordinates: number[];
}

export interface Area {
  id: string;
  name: string;
  location: Location;
}

interface Role {
  id: string;
  roleCode: string;
  roleName: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role?: Role | null;
  area?: Area | null;
  email: string;
  phone?: string;
  isActive: boolean;
}

interface RegisterInput {
  username: string;
  password: string;
  fullName: string;
  role: string;
  area?: string;
  email: string;
  phone?: string;
}

interface UpdateUserInput {
  id: string;
  username?: string;
  password?: string;
  fullName?: string;
  email?: string;
  role?: string;
  area?: string;
  phone?: string;
}

interface DeleteUserInput {
  id: string;
}

interface RegisterResponse {
  register: {
    token: string;
    user: User;
  };
}

interface UpdateUserResponse {
  updateUser: User;
}

interface DeleteUserResponse {
  deleteUser: boolean;
}

interface UsersResponse {
  users: User[];
}

interface UserResponse {
  user: User;
}

interface MeResponse {
  me: User;
}

const GET_USERS = `
  query GetAllUsers {
    users {
      id
      username
      fullName
      role {
        id
        roleCode
        roleName
      }
      area {
        id
        name
        location {
          type
          coordinates
        }
      }
      email
      phone
      isActive
    }
  }
`;

const GET_USER = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      username
      fullName
      role {
        id
        roleCode
        roleName
      }
      area {
        id
        name
        location {
          type
          coordinates
        }
      }
      email
      phone
      isActive
    }
  }
`;

const GET_ME = `
  query Me {
    me {
      id
      username
      fullName
      role {
        id
        roleCode
        roleName
      }
      area {
        id
        name
        location {
          type
          coordinates
        }
      }
      email
      phone
      isActive
    }
  }
`;

const REGISTER_USER = `
  mutation RegisterUser($username: String!, $password: String!, $fullName: String!, $role: String!, $area: String, $email: String!, $phone: String) {
    register(
      username: $username
      password: $password
      fullName: $fullName
      role: $role
      area: $area
      email: $email
      phone: $phone
    ) {
      token
      user {
        id
        username
        fullName
        role {
          id
          roleCode
          roleName
        }
        area {
          id
          name
          location {
            type
            coordinates
          }
        }
        email
        phone
        isActive
      }
    }
  }
`;

const UPDATE_USER = `
  mutation UpdateUser($id: ID!, $username: String, $password: String, $fullName: String, $role: String, $area: String, $email: String, $phone: String) {
    updateUser(
      id: $id
      username: $username
      password: $password
      fullName: $fullName
      role: $role
      area: $area
      email: $email
      phone: $phone
    ) {
      id
      username
      fullName
      role {
        id
        roleCode
        roleName
      }
      area {
        id
        name
        location {
          type
          coordinates
        }
      }
      email
      phone
      isActive
    }
  }
`;

const DELETE_USER = `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

const UPDATE_USER_AREA = `
  mutation UpdateUserArea($userId: ID!, $areaId: ID!) {
    updateUserArea(userId: $userId, areaId: $areaId) {
      id
      username
      fullName
      area {
        id
        name
        location {
          type
          coordinates
        }
      }
    }
  }
`;

interface UpdateUserAreaResponse {
  updateUserArea: User;
}

export const getUsers = async (token: string): Promise<User[]> => {
  try {
    const response = await graphQLClient.request<UsersResponse>(GET_USERS, {}, {
      Authorization: `Bearer ${token}`
    });
    return response.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUser = async (id: string, token: string): Promise<User> => {
  try {
    const response = await graphQLClient.request<UserResponse>(GET_USER, { id }, {
      Authorization: `Bearer ${token}`
    });
    return response.user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getMe = async (token: string): Promise<User> => {
  try {
    const response = await graphQLClient.request<MeResponse>(GET_ME, {}, {
      Authorization: `Bearer ${token}`
    });
    return response.me;
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    throw error;
  }
};

export const registerUser = async (input: RegisterInput, token: string): Promise<{ token: string; user: User }> => {
  try {
    const response = await graphQLClient.request<RegisterResponse>(REGISTER_USER, input, {
      Authorization: `Bearer ${token}`
    });
    return {
      token: response.register.token,
      user: response.register.user
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const updateUser = async (input: UpdateUserInput, token: string): Promise<User> => {
  try {
    const response = await graphQLClient.request<UpdateUserResponse>(UPDATE_USER, input, {
      Authorization: `Bearer ${token}`
    });
    return response.updateUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (input: DeleteUserInput, token: string): Promise<boolean> => {
  try {
    const response = await graphQLClient.request<DeleteUserResponse>(DELETE_USER, input, {
      Authorization: `Bearer ${token}`
    });
    return response.deleteUser;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const updateUserArea = async (userId: string, areaId: string, token: string): Promise<User> => {
  try {
    const response = await graphQLClient.request<UpdateUserAreaResponse>(
      UPDATE_USER_AREA,
      { userId, areaId },
      { Authorization: `Bearer ${token}` }
    );
    return response.updateUserArea;
  } catch (error) {
    console.error('Error updating user area:', error);
    throw error;
  }
};

export interface Supervisor {
  id: string;
  fullName: string;
  role: string;
}

interface GetSupervisorsResponse {
  users: {
    id: string;
    fullName: string;
    role?: {
      roleCode: string;
    };
  }[];
}

const GET_SUPERVISORS = `
  query GetSupervisors {
    users {
      id
      fullName
      role {
        roleCode
      }
    }
  }
`;

export const getSupervisors = async (token: string): Promise<Supervisor[]> => {
  try {
    const response = await graphQLClient.request<GetSupervisorsResponse>(
      GET_SUPERVISORS,
      {},
      { Authorization: `Bearer ${token}` }
    );
    return response.users
      .filter(user => user.role?.roleCode === 'SUPERVISOR')
      .map(user => ({
        id: user.id,
        fullName: user.fullName,
        role: user.role?.roleCode || ''
      }));
  } catch (error) {
    console.error('Error fetching supervisors:', error);
    throw error;
  }
}; 