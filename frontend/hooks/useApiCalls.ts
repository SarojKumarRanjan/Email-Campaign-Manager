import { buildUrl } from '@/lib/utils';
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import type { AxiosResponse, AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

type urlConfig = {
    template: string;
    variables?: [string];
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
        return {
            ...queryResult,
            //@ts-ignore
            data: queryResult?.data?.data,


        };
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
export function useConfigurableMutation<TData = any,
    TError = any,
    TVariables extends FetchConfig = FetchConfig
>(
    axiosReqPromise: (url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<TData>>,
    queryKey: string[],
    options?: {
        onSuccess?: (data: TData, variables: TVariables, context: any) => void;
        onError?: (error: TError, variables: TVariables, context: any) => void;
        onMutate?: (variables: TVariables) => Promise<any> | any;
        onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, context: any) => void;
    } & Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn' | 'onSuccess' | 'onError' | 'onMutate' | 'onSettled'>
) {
    const {
        onSuccess,
        onError,
        onSettled,
        onMutate,
        ...restOptions
    } = options || {};

    const queryClient = useQueryClient();

    const mutationResult = useMutation<TData, TError, TVariables>({
        mutationFn: async (variables: TVariables) => {
            const {
                url,
                params,
                data,
                headers,
                ...restConfig
            } = variables;

            const axiosConfig: AxiosRequestConfig = {
                params,
                headers,
                ...restConfig,
            };

            const response = await axiosReqPromise(
                buildUrl(url.template, url.variables),
                data,
                axiosConfig
            );
            return response?.data;
        },
        ...restOptions,

        onMutate: onMutate ? async (variables) => {

            const controller = new AbortController();
            const signal = controller.signal;

            return { variables, context: { signal } }

        } : undefined,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey })
            //@ts-ignore
            if (data?.data) {
                //@ts-ignore
                data = data?.data
            }
            onSuccess?.(data, variables, context);
            //@ts-ignore
            toast.success(data?.message || "Success");
        },
        onError: (error, variables, context) => {
            onError?.(error, variables, context);
            //@ts-ignore
            toast.error(error.response?.data?.message || "Something went wrong");
        },
        onSettled: onSettled ? (data, error, variables, context) => {
            onSettled(data, error, variables, context);
        } : undefined,
    });

    return { ...mutationResult };
}


/* export function useConfigurableMutation(mutationFunction:(variables: any) => Promise<any>,queryKey:string[],config:UseMutationOptions<any, any, any, any>){
    const queryClient = useQueryClient();
    const {onSuccess,onError,onMutate,onSettled,...restOptions} = config;

    const mutation = useMutation({
        mutationFn:mutationFunction,
        ...restOptions,
        onMutate: async(variables)=>{
            const controller = new AbortController();
            const signal  = controller.signal;

            return {variables,context:{signal}}
        },
        onSuccess: async(data, variables, context) => {
            await queryClient.invalidateQueries({queryKey});
            onSuccess?.(data, variables, context);
           
            toast.success(data?.message || "Success");
        },
        onError: async(error, variables, context) => {
            onError?.(error, variables, context);
           
            toast.error(error.response?.data?.message || "Something went wrong");
        },
        onSettled: onSettled ? () => {
            onSettled();
        } : undefined,
    })
    return {...mutation}; 
}

*/

