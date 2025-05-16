import { GraphQLClient } from 'graphql-request';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/graphql';

export const graphQLClient = new GraphQLClient(API_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string) => {
  graphQLClient.setHeader('Authorization', `Bearer ${token}`);
};

export const removeAuthToken = () => {
  graphQLClient.setHeader('Authorization', '');
}; 