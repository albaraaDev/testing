export interface ResponseModel<T> {
  success: boolean;
  message: string;
  result: T;
}
// might be 2xx, but success is false and result is null
// such as 202 Accepted, which is used when admin apprval
// is required
export interface ResponseModelOrNull<T> {
  success: boolean;
  message: string;
  result?: T | null;
}

// used for delete operations
export interface ResponseModelMessage {
  success: boolean;
  message: string;
}

export interface PaginatedModel<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: any[];
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: any[];
  numberOfElements: number;
  empty: boolean;
}

export type PaginatedResponseModel<T> = ResponseModel<PaginatedModel<T>>;
export type PaginatedResponseModelOrNull<T> = ResponseModelOrNull<PaginatedModel<T>>;
