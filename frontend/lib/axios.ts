import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import API_PATH from './apiPath';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Check if the error is 401 Unauthorized or has the specific message
        const isUnauthorized = error.response?.status === 401 || 
                             (error.response?.data as any)?.message === "Unauthorized: No token provided";

        // Avoid infinite loop by checking if it's already a retry or a refresh token request itself
        if (isUnauthorized && originalRequest && !originalRequest._retry && originalRequest.url !== API_PATH.AUTH.REFRESH_TOKEN) {
            originalRequest._retry = true;
            try {
                // Attempt to refresh the token
                await api.post(API_PATH.AUTH.REFRESH_TOKEN);
                
                // If refresh is successful, retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, propagate the error (could handle logout here)
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);


const getAxiosForUseFetch = async (url: string, config?: AxiosRequestConfig) => {
    return await api.get(url, config);
}

const postAxiosForUseFetch = async (url: string, config?: AxiosRequestConfig) => {
    return await api.post(url, config);
}

const putAxiosForUseFetch = async (url: string, config?: AxiosRequestConfig) => {
    return await api.put(url, config);
}

const patchAxiosForUseFetch = async (url: string, config?: AxiosRequestConfig) => {
    return await api.patch(url, config);
}

const deleteAxiosForUseFetch = async (url: string, config?: AxiosRequestConfig) => {
    return await api.delete(url, config);
}

export {
    getAxiosForUseFetch,
    postAxiosForUseFetch,
    putAxiosForUseFetch,
    deleteAxiosForUseFetch,
    patchAxiosForUseFetch
}
