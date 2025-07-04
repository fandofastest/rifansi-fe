import { GraphQLClient } from 'graphql-request';

// Client-side dynamic API URL management
const FALLBACK_API_URL = 'http://localhost:3000/graphql';
const FALLBACK_UPLOAD_URL = 'http://localhost:3000/upload';

// Buat variabel untuk menyimpan token autentikasi
let authToken = '';

// Fungsi untuk mengecek apakah hostname adalah IP address
const isIpAddress = (host: string): boolean => {
  // Simple IP address check (IPv4)
  const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  // localhost juga dianggap sebagai IP address untuk tujuan ini
  return ipv4Regex.test(host) || host === 'localhost';
};

// Buat fungsi untuk mendapatkan URL API dinamis
export const getApiUrl = () => {
  // Prioritaskan nilai dari .env jika tersedia
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('getApiUrl: Menggunakan NEXT_PUBLIC_API_URL dari .env:', process.env.NEXT_PUBLIC_API_URL);
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Jika tidak ada di .env dan di browser, gunakan hostname dengan logic baru
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (isIpAddress(hostname)) {
      // Jika IP address, gunakan port 3000
      console.log('getApiUrl: Host is IP address, menggunakan port 3000');
      return `${protocol}//${hostname}:3000/graphql`;
    } else {
      // Jika domain name, tidak menggunakan port
      console.log('getApiUrl: Host is domain, tidak menggunakan port');
      return `${protocol}//${hostname}/graphql`;
    }
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
  
  // Jika tidak ada di .env dan di browser, gunakan hostname dengan logic baru
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (isIpAddress(hostname)) {
      // Jika IP address, gunakan port 3000
      console.log('getUploadUrl: Host is IP address, menggunakan port 3000');
      return `${protocol}//${hostname}:3000/upload`;
    } else {
      // Jika domain name, tidak menggunakan port
      console.log('getUploadUrl: Host is domain, tidak menggunakan port');
      return `${protocol}//${hostname}/upload`;
    }
  }
  
  // Fallback ke default
  return FALLBACK_UPLOAD_URL;
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