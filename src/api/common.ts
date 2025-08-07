export type Paginated<T> = {
  data: T[];
  totalCount: number;
  offset?: number;
};

export interface OffsetBounds {
  start: number;
  end: number;
  search?: string;
}
