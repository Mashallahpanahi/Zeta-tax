import { useState } from "react";
import axios from "axios";

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface UseUpdateResult<TResponse> {
  updateData: TResponse | null;
  message: string | null;
  loading: boolean;
  error: string | null;
  update: (id: string | number, payload: unknown) => Promise<boolean>;
}

export function useUpdate<TResponse = unknown>(
  url: string,
): UseUpdateResult<TResponse> {
  const [updateData, setUpdateData] = useState<TResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (
    id: string | number,
    payload: unknown,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await axios.patch<ApiResponse<TResponse>>(
        `${url}/${id}`,
        payload,
      );
      setUpdateData(res.data.data);
      setMessage(res.data.message);
      return true;
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateData, message, loading, error, update };
}
