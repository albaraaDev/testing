import React from 'react';

export interface TreeItem {
  id: string;
  label: string;
  hasChildren: boolean;
  children?: TreeItem[];
  parentId?: string;
  [key: string]: any;
}

export interface FetchDataParams {
  itemId?: string; // undefined for root items, nodeId for children
  start: number;
  end: number;
}

export interface FetchDataResponse {
  items: TreeItem[];
  total: number; // total number of items available
}

export interface TreeViewProps {
  fetchData: (params: FetchDataParams) => Promise<FetchDataResponse>;
  onSelect?: (node: TreeItem) => void;
  noChildrenMessage?: string | boolean;
  preExpandedIds?: string[];
  selectedId?: string | null;
  suffix?: React.ReactNode | ((item: TreeItem, index: number) => React.ReactNode);
  pageSize?: number;
  expandable?: boolean;
}

export interface FlattenedTreeItem extends TreeItem {
  depth: number;
  isExpanded: boolean;
  isLoading: boolean;
  isSelected: boolean;
  isPlaceholder?: boolean;
}
