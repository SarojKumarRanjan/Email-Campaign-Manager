import axios from 'axios';


console.log(process.env.NEXT_PUBLIC_API_BASE_URL)
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

const getAxiosForUseFetch = (url: string, params?: Record<string, any>, data?: any, headers?: Record<string, string>) => {
    return api.get(url, { params, data, headers });
}

const postAxiosForUseFetch = (url: string, params?: Record<string, any>, data?: any, headers?: Record<string, string>) => {
    return api.post(url, { params, data, headers });
}

const putAxiosForUseFetch = (url: string, params?: Record<string, any>, data?: any, headers?: Record<string, string>) => {
    return api.put(url, { params, data, headers });
}

const deleteAxiosForUseFetch = (url: string, params?: Record<string, any>, data?: any, headers?: Record<string, string>) => {
    return api.delete(url, { params, data, headers });
}

export {
    getAxiosForUseFetch,
    postAxiosForUseFetch,
    putAxiosForUseFetch,
    deleteAxiosForUseFetch,
}
