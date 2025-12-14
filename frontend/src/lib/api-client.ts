import axios, { AxiosRequestConfig } from 'axios';

// Base configuration for the API
export const AXIOS_INSTANCE = axios.create({
  baseURL: '', // Set dynamically via Vite proxy
});

// Request interceptor to inject the JWT token
AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    if (config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return config;
});

// Response interceptor to handle 401 Unauthorized errors globally
AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // Check if the error response is 401 Unauthorized and the request is not for the login endpoint
    if (error.response && error.response.status === 401 && !originalRequest.url?.includes('/auth/login')) {
      // If the token is invalid, we clean up and redirect
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
