export type EntityId = string;

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type ListResponse<T> = {
  items: T[];
  total: number;
};
