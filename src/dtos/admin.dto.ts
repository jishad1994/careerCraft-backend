export interface UsersPaginatedDTO<T> {
    data: T[];
    total: number;
}

export interface UsersPaginatedResponseDTO<T> {
    success: boolean;
    message: string;
    data: T[];
    pagination: { total: number; page: number; limit: number };
}
