type PaginationMetadata = {
  current_page: number;
  items_per_page: number;
  total_items?: number; //undefined means unknown
  has_next_page: boolean;
  total_pages?: number; //undefined means unknown
};

type PaginatedRequestMetadata = {
  limit: number;
  offset: number;
};

type PaginatedResponse<T> = {
  items: T[];
  metadata: PaginationMetadata;
};
