

export interface ListResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
}