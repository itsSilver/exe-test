export interface ApiMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
}

export interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
}

export interface ApiPaginatedResponse<T> extends ApiResponse<T[]> {
	meta: ApiMeta;
}

export interface ApiErrorResponse {
	success: false;
	message: string;
	code: string;
}

export interface PaginationInput {
	page: number;
	limit: number;
	total: number;
}
