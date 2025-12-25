
export interface ListResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
}

export interface Response<T> {
    data: T;
    message: string;
    status: number;
}