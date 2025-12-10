export type APIResponse<T> = {
  status: string;
  statusCode: number;
  version: number;
  type: string;
  timestamp: string;
  message: string;
  signature: string;
  error?: {
    detailMessage: string;
    referenceId: string;
  };
  pagination?: PaginationProps;
  payload: T;
};

export type APIViaIndexResponse<T> = {
  status: string;
  statusCode: number;
  version: number;
  type: string;
  timestamp: string;
  message: string;
  signature: string;
  error?: {
    detailMessage: string;
    referenceId: string;
  };
  pagination?: PaginationViaIndexProps;
  payload: T;
};

export type PaginationProps = {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type PaginationViaIndexProps = {
  nextCursor: number;
  previousCursor: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
  totalItems: number;
};
