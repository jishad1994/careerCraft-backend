import { PaginationMeta } from "../utils/apiResponse.utils";

export interface UsersPaginatedDTO<T> {
    data: T[];
    paginationMeta: PaginationMeta;
}

export interface UsersPaginatedResponseDTO<T> {
    success: boolean;
    message: string;
    data: T[];
    pagination: { total: number; page: number; limit: number };
}
