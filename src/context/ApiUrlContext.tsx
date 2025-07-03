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

      // Gunakan nilai dari .env jika tersedia
      const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
      const envUploadUrl = process.env.NEXT_PUBLIC_UPLOAD_URL;

      if (envApiUrl && envUploadUrl) {
        console.log('Menggunakan URL dari .env');
        setApiUrl(envApiUrl);
        setUploadUrl(envUploadUrl);
        setIsLoading(false);
        return;
      }

      // Fallback: Gunakan hostname window saat ini dengan port 3000
      console.log('Fallback: Menggunakan URL dari hostname');
      const host = window.location.hostname;
      const baseUrl = `http://${host}:3000`;
      
      setApiUrl(`${baseUrl}/graphql`);
      setUploadUrl(`${baseUrl}`);
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
