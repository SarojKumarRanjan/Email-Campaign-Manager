import axios, { AxiosRequestConfig } from 'axios';


const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        throw error;
    }
);

const getAxiosForUseFetch = async (url: string, params?: Record<string, any>, data?: any, headers?: Record<string, string>) => {
    return await api.get(url, { params, data, headers });
}

const postAxiosForUseFetch = async (url: string, data?: any, config?: AxiosRequestConfig) => {
    return await api.post(url, data, config);
}

const putAxiosForUseFetch = async (url: string, params?: Record<string, any>, data?: any, config?: AxiosRequestConfig) => {
    return await api.put(url, { params, data }, config);
}

const patchAxiosForUseFetch = async (url: string, params?: Record<string, any>, data?: any, config?: AxiosRequestConfig) => {
    return await api.patch(url, { params, data }, config);
}

const deleteAxiosForUseFetch = async (url: string, params?: Record<string, any>, data?: any, headers?: Record<string, string>) => {
    return await api.delete(url, { params, data, headers });
}

export {
    getAxiosForUseFetch,
    postAxiosForUseFetch,
    putAxiosForUseFetch,
    deleteAxiosForUseFetch,
}
