import axios, { AxiosRequestConfig } from 'axios';

// Base configuration for the API
export const AXIOS_INSTANCE = axios.create({
  baseURL: '', // Set dynamically via Vite proxy
});

// Request interceptor to inject the JWT token
AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

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
