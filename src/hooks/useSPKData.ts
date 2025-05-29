import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { SPK, getSPKs } from "@/services/spk";

export const useSPKData = () => {
  const { token } = useAuth();
  const [spks, setSPKs] = useState<SPK[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSPKs = async () => {
    try {
      if (!token) {
        setError("No authentication token available");
        return [];
      }
      setLoading(true);
      const data = await getSPKs(token);
      setSPKs(data);
      setError(null);
      return data;
    } catch (err: unknown) {
      console.error('Error fetching SPKs:', err);
      const errorResponse = err as { response?: { errors?: Array<{ message: string }> } };
      if (errorResponse.response?.errors) {
        setError(errorResponse.response.errors[0].message || "Failed to fetch SPKs");
      } else {
        setError("Failed to fetch SPKs. Please try again later.");
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSPKs();
  }, [token]);

  return {
    spks,
    loading,
    error,
    refetch: fetchSPKs
  };
};

export default useSPKData; 