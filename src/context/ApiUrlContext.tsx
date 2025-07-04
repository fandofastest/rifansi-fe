"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";

interface ApiUrlContextType {
  apiUrl: string;
  uploadUrl: string;
  isLoading: boolean;
}

const defaultContext: ApiUrlContextType = {
  apiUrl: "",
  uploadUrl: "",
  isLoading: true,
};

const ApiUrlContext = createContext<ApiUrlContextType>(defaultContext);

export const useApiUrl = () => useContext(ApiUrlContext);

interface ApiUrlProviderProps {
  children: ReactNode;
}

export const ApiUrlProvider = ({ children }: ApiUrlProviderProps) => {
  const [apiUrl, setApiUrl] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const determineApiUrl = () => {
      // Log untuk debug
      console.log('Environment variables:', {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_UPLOAD_URL: process.env.NEXT_PUBLIC_UPLOAD_URL
      });

      // Ekstrak host dasar dari URL
      const getBaseUrlFromEnv = (url: string | undefined) => {
        if (!url) return '';
        try {
          // Remove any trailing paths to get just the base URL
          return url.replace(/\/(graphql|upload)$/, '');
        } catch (error) {
          console.error('Error extracting base URL:', error);
          return url;
        }
      };

      // Cek apakah hostname adalah IP address
      const isIpAddress = (host: string): boolean => {
        // Simple IP address check (IPv4)
        const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        // localhost juga dianggap sebagai IP address untuk tujuan ini
        return ipv4Regex.test(host) || host === 'localhost';
      };

      // Gunakan nilai dari .env jika tersedia
      const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (envApiUrl) {
        console.log('Menggunakan URL dari .env');
        // Extract base URL from API URL to ensure consistency
        const baseUrl = getBaseUrlFromEnv(envApiUrl);
        
        setApiUrl(`${baseUrl}/graphql`);
        setUploadUrl(`${baseUrl}/upload`);
        setIsLoading(false);
        return;
      }

      // Fallback: Tentukan URL berdasarkan jenis hostname
      console.log('Fallback: Menggunakan URL dari hostname');
      const host = window.location.hostname;
      const protocol = window.location.protocol;
      
      if (isIpAddress(host)) {
        // Jika IP address, gunakan port 3000
        console.log('Host is IP address, menggunakan port 3000');
        const baseUrl = `${protocol}//${host}:3000`;
        setApiUrl(`${baseUrl}/graphql`);
        setUploadUrl(`${baseUrl}/upload`);
      } else {
        // Jika domain name, tidak menggunakan port
        console.log('Host is domain, tidak menggunakan port');
        const baseUrl = `${protocol}//${host}`;
        setApiUrl(`${baseUrl}/graphql`);
        setUploadUrl(`${baseUrl}/upload`);
      }
      
      setIsLoading(false);
    };

    determineApiUrl();
  }, []);

  return (
    <ApiUrlContext.Provider value={{ apiUrl, uploadUrl, isLoading }}>
      {children}
    </ApiUrlContext.Provider>
  );
};
