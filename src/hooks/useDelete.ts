import { useState } from 'react';
import axios from 'axios';

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface UseDeleteResult<T> {
  deleteData: T | null;
  message: string | null;
  loading: boolean;
  error: string | null;
  remove: (id: string | number) => Promise<boolean>;
}

export function useDelete<T = unknown>(url: string): UseDeleteResult<T> {
  const [deleteData, setDeleteData] = useState<T | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async (id: string | number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await axios.delete<ApiResponse<T>>(`${url}/${id}`);
      setDeleteData(res.data.data);
      setMessage(res.data.message);
      return true;
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Something went wrong'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteData, message, loading, error, remove };
}