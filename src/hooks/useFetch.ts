// import { useEffect, useState } from 'react';
// import axios from 'axios';

// interface ApiResponse<T> {
//   message: string;
//   data: T;
// }

// interface UseFetchResult<T> {
//   data: T | null;
//   message: string | null;
//   loading: boolean;
//   error: string | null;
//   refetch: () => void;
// }

// export function useFetch<T>(url: string): UseFetchResult<T> {
//   const [data, setData] = useState<T | null>(null);
//   const [message, setMessage] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [trigger, setTrigger] = useState(0);

//   useEffect(() => {
//     let alive = true;
//     setLoading(true);
//     setError(null);

//     axios
//       .get<ApiResponse<T>>(url)
//       .then((res) => {
//         if (!alive) return;
//         setData(res.data.data);
//         setMessage(res.data.message);
//       })
//       .catch((err) => {
//         if (!alive) return;
//         setError(
//           err.response?.data?.message || err.message || 'Something went wrong'
//         );
//       })
//       .finally(() => {
//         if (alive) setLoading(false);
//       });

//     return () => {
//       alive = false;
//     };
//   }, [url, trigger]);

//   const refetch = () => setTrigger((n) => n + 1);

//   return { data, message, loading, error, refetch };
// }

import { useEffect, useState } from "react";
import axios from "axios";

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface UseFetchResult<T> {
  data: T | null;
  message: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T>(
  url: string,
  enabled = true,
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let alive = true;

    setLoading(true);
    setError(null);

    axios
      .get<ApiResponse<T>>(url)
      .then((response) => {
        if (!alive) return;

        setData(response.data.data);
        setMessage(response.data.message);
      })
      .catch((err) => {
        if (!alive) return;

        setError(
          err.response?.data?.message ||
          err.message ||
          "Something went wrong",
        );
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, [url, trigger, enabled]);

  const refetch = () => {
    setTrigger((current) => current + 1);
  };

  return { data, message, loading, error, refetch };
}
