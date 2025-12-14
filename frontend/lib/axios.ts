import axios from 'axios';

interface FetchConfig {
    url: string;
    params?: Record<string, any>;
    data?: any;
    headers?: Record<string, string>;
}

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

const getAxiosForUseFetch = ({ url, params, data, headers }: FetchConfig) => {
    return api.get(url, { params, data, headers });
}

const postAxiosForUseFetch = ({ url, params, data, headers }: FetchConfig) => {
    return api.post(url, { params, data, headers });
}

const putAxiosForUseFetch = ({ url, params, data, headers }: FetchConfig) => {
    return api.put(url, { params, data, headers });
}

const deleteAxiosForUseFetch = ({ url, params, data, headers }: FetchConfig) => {
    return api.delete(url, { params, data, headers });
}

export {
    getAxiosForUseFetch,
    postAxiosForUseFetch,
    putAxiosForUseFetch,
    deleteAxiosForUseFetch,
}
