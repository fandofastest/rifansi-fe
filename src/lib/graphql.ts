import { GraphQLClient } from 'graphql-request';

// Client-side dynamic API URL management
const FALLBACK_API_URL = 'http://localhost:3000/graphql';

// Buat variabel untuk menyimpan token autentikasi
let authToken = '';

// Buat fungsi untuk mendapatkan URL API dinamis
export const getApiUrl = () => {
  // Prioritaskan nilai dari .env jika tersedia
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('getApiUrl: Menggunakan NEXT_PUBLIC_API_URL dari .env:', process.env.NEXT_PUBLIC_API_URL);
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Jika tidak ada di .env dan di browser, gunakan hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    console.log('getApiUrl: Menggunakan hostname:', hostname);
    return `http://${hostname}:3000/graphql`;
  }
  
  // Fallback ke default
  return FALLBACK_API_URL;
};

// Buat fungsi untuk mendapatkan URL upload dinamis
export const getUploadUrl = () => {
  // Prioritaskan nilai dari .env jika tersedia
  if (process.env.NEXT_PUBLIC_UPLOAD_URL) {
    console.log('getUploadUrl: Menggunakan NEXT_PUBLIC_UPLOAD_URL dari .env:', process.env.NEXT_PUBLIC_UPLOAD_URL);
    return process.env.NEXT_PUBLIC_UPLOAD_URL;
  }
  
  // Jika tidak ada di .env dan di browser, gunakan hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    console.log('getUploadUrl: Menggunakan hostname:', hostname);
    return `http://${hostname}:3000/`;
  }
  
  // Fallback ke default
  return 'http://localhost:3000/';
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