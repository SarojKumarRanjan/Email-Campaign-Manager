import { buildUrl } from '@/lib/utils';
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import type { AxiosResponse, AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

type urlConfig = {
    template: string;
    variables: [string];
}

interface FetchConfig {
    url: urlConfig;
    params?: Record<string, any>;
    data?: any;
    headers?: Record<string, string>;
}

interface UseFetchOptions<TData = any, TError = any> extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
    key?: string[];
}

interface UseConfigurableMutationOptions<TData = any, TError = any, TVariables = any>
    extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> { }

/**
 * useFetch - Custom hook for GET requests using TanStack Query
 * 
 * @param axiosReqPromise - Axios instance method (e.g., axios.get)
 * @param key - Query key for caching
 * @param config - Object containing url, params, data, headers
 * @param options - Additional TanStack Query options
 * @returns All properties from useQuery
 * 
 * @example
 * const { data, isLoading, error, refetch } = useFetch(
 *   axios.get,
 *   ['users', userId],
 *   { url: '/api/users', params: { id: userId } }
 * );
 */
export function useFetch<TData = any, TError = any>(
    axiosReqPromise: (url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<TData>>,
    key: string[],
    config: FetchConfig,
    options?: UseFetchOptions<TData, TError>
) {
    const { url, params, data, headers, ...restConfig } = config;

    try {
        const queryResult = useQuery<TData, TError>({
            queryKey: [...key, params, data],
            queryFn: async () => {
                const axiosConfig: AxiosRequestConfig = {
                    params,
                    data,
                    headers,
                    ...restConfig,
                };

                const response = await axiosReqPromise(buildUrl(url.template, url.variables), axiosConfig);
                return response.data;
            },
            retry: 3,
            retryDelay: 1000,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
            ...options,
        });
        return queryResult;
    } catch (error) {
        //@ts-ignore
        toast.error(error.response?.data?.message || "Something went wrong");
        return error;
    }

}
/**
 * useConfigurableMutation - Custom hook for POST, PUT, DELETE, PATCH requests
 * 
 * @param axiosReqPromise - Axios instance method (e.g., axios.post, axios.put)
 * @param config - Base configuration (url can be overridden in mutate)
 * @param options - Additional TanStack Query mutation options
 * @returns All properties from useMutation including mutate, mutateAsync
 * 
 * @example
 * const { mutate, isLoading, error } = useConfigurableMutation(
 *   axios.post,
 *   { url: '/api/users' },
 *   {
 *     onSuccess: (data) => console.log('Success:', data),
 *     onError: (error) => console.error('Error:', error)
 *   }
 * );
 * 
 * // Usage
 * mutate({ 
 *   data: { name: 'John' }, 
 *   params: { notify: true } 
 * });
 */
export function useConfigurableMutation<
    TData = any,
    TError = any,
    TVariables extends Partial<FetchConfig> = Partial<FetchConfig>
>(
    axiosReqPromise: (url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<TData>>,
    baseConfig: FetchConfig,
    options?: UseConfigurableMutationOptions<TData, TError, TVariables> & {
        onSuccess?: (data: TData, variables: TVariables, context: any) => void;
        onError?: (error: TError, variables: TVariables, context: any) => void;
        onSettled?: (data: TData | undefined, variables: TVariables, context: any) => void;
    }
) {
    const {
        onSuccess,
        onError,
        onSettled,
        onMutate,
        ...restOptions
    } = options || {};

    const mutationResult = useMutation<TData, TError, TVariables>({
        mutationFn: async (variables: TVariables) => {
            const {
                url = baseConfig.url,
                params = baseConfig.params,
                data = baseConfig.data,
                headers = baseConfig.headers,
                ...restConfig
            } = { ...baseConfig, ...variables };

            const axiosConfig: AxiosRequestConfig = {
                params,
                headers,
                ...restConfig,
            };

            const response = await axiosReqPromise(buildUrl(url.template, url.variables), data, axiosConfig);
            return response.data;
        },
        ...restOptions,
        onSuccess: (data, variables, context) => {
            if (onSuccess) {
                onSuccess(data, variables, context);
            }
            //@ts-ignore
            toast.success(data?.message || "Success");
        },
        onError: (error, variables, context) => {
            if (onError) {
                onError(error, variables, context);
            }
            //@ts-ignore
            toast.error(error.response?.data?.message || "Something went wrong");
        },
        // onSettled: (data, variables, context) => {
        //   if (onSettled) {
        //     onSettled(data , variables, context);
        //   }
        // },
    });

    return mutationResult;
}
