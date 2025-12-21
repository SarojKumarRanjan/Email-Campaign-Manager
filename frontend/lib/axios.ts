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
