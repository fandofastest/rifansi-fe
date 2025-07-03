import { GraphQLClient } from 'graphql-request';

// Client-side dynamic API URL management
const FALLBACK_API_URL = 'http://localhost:3000/graphql';

// Buat variabel untuk menyimpan token autentikasi
let authToken = '';

// Buat fungsi untuk mendapatkan URL API dinamis
export const getApiUrl = () => {
  // Jika di browser, coba dapatkan dari hostname saat ini
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return `http://${hostname}:3000/graphql`;
  }
  
  // Fallback ke env atau default
  return process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_URL;
};

// Buat fungsi untuk mendapatkan URL upload dinamis
export const getUploadUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return `http://${hostname}:3000/`;
  }
  
  return process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:3000/';
};

// Buat GraphQL client yang selalu menggunakan URL terbaru
export const graphQLClient = new GraphQLClient(getApiUrl(), {
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