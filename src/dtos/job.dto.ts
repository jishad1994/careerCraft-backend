import { PaginationMeta } from "../utils/apiResponse.utils";

export interface JobsPaginatedDTO<T> {
    data: T[];
    paginationMeta: PaginationMeta;
}