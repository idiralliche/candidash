import axios, { AxiosRequestConfig } from 'axios';

// Base configuration for the API
export const AXIOS_INSTANCE = axios.create({
  baseURL: 'http://localhost:8000', // Backend URL from technical context
});

// Request interceptor to inject the JWT token
AXIOS_INSTANCE.interceptors.request.use((config) => {
  // Retrieve token from localStorage (key: 'token' as defined in UX strategy)
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Custom fetcher function required by Orval
// It handles the request execution and response data extraction
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = axios.CancelToken.source();

  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error - Adding cancel method to promise for Orval compatibility
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
