import { graphQLClient, setAuthToken, removeAuthToken } from '@/lib/graphql';
import { LoginInput, LoginResponse, User } from '@/types/user';

const LOGIN_MUTATION = `
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        fullName
        role {
          id
          roleCode
          roleName
          description
          salaryComponent {
            gajiPokok
            tunjanganTetap
            tunjanganTidakTetap
            transport
            biayaTetapHarian
            upahLemburHarian
          }
        }
        email
        phone
        isActive
        lastLogin
      }
    }
  }
`;

const GET_CURRENT_USER = `
  query GetCurrentUser {
    me {
      id
      username
      fullName
      role {
        id
        roleCode
        roleName
        description
        salaryComponent {
          gajiPokok
          tunjanganTetap
          tunjanganTidakTetap
          transport
          biayaTetapHarian
          upahLemburHarian
        }
      }
      email
      phone
      isActive
      lastLogin
    }
  }
`;

export const login = async (input: LoginInput): Promise<LoginResponse> => {
  try {
    const response = await graphQLClient.request<{ login: LoginResponse }>(
      LOGIN_MUTATION,
      input
    );
    
    const { token, user } = response.login;
    
    // Store token in localStorage
    localStorage.setItem('authToken', token);
    
    // Set token in GraphQL client
    setAuthToken(token);
    
    return { token, user };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  // Remove token from localStorage
  localStorage.removeItem('authToken');
  
  // Remove token from GraphQL client
  removeAuthToken();
};

export const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

export const getCurrentUser = async (token: string): Promise<User> => {
  try {
    const response = await graphQLClient.request<{ me: User }>(
      GET_CURRENT_USER,
      {},
      {
        Authorization: `Bearer ${token}`
      }
    );
    return response.me;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
}; 