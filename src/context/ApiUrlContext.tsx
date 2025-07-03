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
      // Jika ada .env, gunakan itu terlebih dahulu
      if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_UPLOAD_URL) {
        setApiUrl(process.env.NEXT_PUBLIC_API_URL);
        setUploadUrl(process.env.NEXT_PUBLIC_UPLOAD_URL);
        setIsLoading(false);
        return;
      }

      // Gunakan hostname window saat ini dan tambahkan port 3000
      const host = window.location.hostname;
      const baseUrl = `http://${host}:3000`;
      
      // Set API URL dan Upload URL berdasarkan baseUrl
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
