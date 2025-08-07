import React, { useCallback, useEffect, useState, useRef } from 'react';
import { List, AutoSizer, ListRowProps } from 'react-virtualized';
import { TreeViewItem } from './TreeViewItem';
import { TreeItem, TreeViewProps, FlattenedTreeItem } from './types';

interface NodePaginationInfo {
  loadedCount: number;
  totalCount: number;
  isLoading: boolean;
}

const TreeView: React.FC<TreeViewProps> = ({
  fetchData,
  onSelect,
  noChildrenMessage = 'No children under this item',
  preExpandedIds = [],
  selectedId = null,
  suffix,
  pageSize = 50,
  expandable = true
}) => {
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const [flattenedItems, setFlattenedItems] = useState<FlattenedTreeItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(preExpandedIds));
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  // Track pagination info for root and each node
  const [paginationInfo, setPaginationInfo] = useState<Map<string, NodePaginationInfo>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  const listRef = useRef<List>(null);
  const initialLoad = useRef(true);
  const lastAction = useRef<'expand' | 'select' | 'initial'>('initial');
  const prevSelectedId = useRef<string | null>(null);

  // Helper to find a node in the tree by ID
  const findNodeById = useCallback((items: TreeItem[], id: string): TreeItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children && item.children.length > 0) {
        const found = findNodeById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Helper to update a node in the tree
  const updateNodeInTree = useCallback(
    (items: TreeItem[], id: string, updater: (node: TreeItem) => TreeItem): TreeItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return updater(item);
        }
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: updateNodeInTree(item.children, id, updater)
          };
        }
        return item;
      });
    },
    []
  );

  // Fetch data for root or children with pagination
  const fetchDataWithPagination = useCallback(
    async (itemId?: string, append = false) => {
      const key = itemId || 'root';
      const currentInfo = paginationInfo.get(key) || {
        loadedCount: 0,
        totalCount: 0,
        isLoading: false
      };

      if (currentInfo.isLoading) return;

      setPaginationInfo((prev) => new Map(prev).set(key, { ...currentInfo, isLoading: true }));
      setLoadingIds((prev) => new Set(prev).add(key));

      try {
        const start = append ? currentInfo.loadedCount : 0;
        const end = start + pageSize;

        const response = await fetchData({ itemId, start, end });

        setPaginationInfo((prev) =>
          new Map(prev).set(key, {
            loadedCount: append
              ? currentInfo.loadedCount + response.items.length
              : response.items.length,
            totalCount: response.total,
            isLoading: false
          })
        );

        if (itemId) {
          // Update children for a specific node
          setTreeData((prevData) =>
            updateNodeInTree(prevData, itemId, (node) => ({
              ...node,
              children: append ? [...(node.children || []), ...response.items] : response.items
            }))
          );
        } else {
          // Update root items
          setTreeData((prevData) => (append ? [...prevData, ...response.items] : response.items));
        }
      } catch (error) {
        console.error(`Error fetching data for ${itemId || 'root'}:`, error);
        setPaginationInfo((prev) => new Map(prev).set(key, { ...currentInfo, isLoading: false }));
      } finally {
        setLoadingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    },
    [fetchData, pageSize, paginationInfo, updateNodeInTree]
  );

  // Convert hierarchical tree data into a flattened array for virtualization
  const flattenTree = useCallback(
    (items: TreeItem[], depth = 0, parentId?: string): FlattenedTreeItem[] => {
      let result: FlattenedTreeItem[] = [];

      for (const item of items) {
        // Add the current item to the flattened list
        result.push({
          ...item,
          depth,
          isExpanded: expandedIds.has(item.id),
          isLoading: loadingIds.has(item.id),
          isSelected: selectedId === item.id,
          parentId: parentId
        });

        // If this item is expanded, add its children to the flattened list
        if (expandedIds.has(item.id)) {
          if (item.children && item.children.length > 0) {
            // Add all children recursively
            result = result.concat(flattenTree(item.children, depth + 1, item.id));
          } else if (!loadingIds.has(item.id)) {
            // If we're not currently loading children and no children exist, show the "no children" message
            const showEmptyMessage =
              item.hasChildren === false ||
              (item.hasChildren && item.children && item.children.length === 0);

            if (showEmptyMessage) {
              result.push({
                id: `${item.id}-empty`,
                label: noChildrenMessage as string,
                hasChildren: false,
                depth: depth + 1,
                isExpanded: false,
                isLoading: false,
                isSelected: false,
                isPlaceholder: true,
                parentId: item.id
              } as FlattenedTreeItem);
            }
          }
        }
      }

      return result;
    },
    [expandedIds, loadingIds, selectedId, noChildrenMessage]
  );

  // Update flattened items whenever treeData changes
  useEffect(() => {
    setFlattenedItems(flattenTree(treeData));
  }, [treeData, flattenTree]);

  // Initialize with root data
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      fetchDataWithPagination();
    }
  }, [isInitialized, fetchDataWithPagination]);

  // Handle pre-expanded nodes on initial load
  useEffect(() => {
    const loadPreExpandedNodes = async () => {
      if (!preExpandedIds.length || initialLoad.current === false) return;
      initialLoad.current = false;
      lastAction.current = 'initial';

      const nodesToExpand = preExpandedIds.filter((id) => {
        const node = findNodeById(treeData, id);
        return node && node.hasChildren && (!node.children || node.children.length === 0);
      });

      for (const id of nodesToExpand) {
        await fetchDataWithPagination(id);
        setExpandedIds((prev) => new Set(prev).add(id));
      }
    };

    loadPreExpandedNodes();
  }, [preExpandedIds, treeData, fetchDataWithPagination, findNodeById]);

  // Handle node expansion/collapse
  const handleToggleExpand = async (item: FlattenedTreeItem) => {
    if (item.isPlaceholder) return;

    // Set the action to expand to prevent scrolling
    lastAction.current = 'expand';

    // If already expanded, collapse the node
    if (expandedIds.has(item.id)) {
      const newExpandedIds = new Set(expandedIds);
      newExpandedIds.delete(item.id);
      setExpandedIds(newExpandedIds);
      return;
    }

    // Mark as expanded immediately for better UX
    setExpandedIds((prev) => new Set(prev).add(item.id));

    // Only fetch children if they haven't been loaded yet
    if (item.hasChildren && (!item.children || item.children.length === 0)) {
      await fetchDataWithPagination(item.id);
    }
  };

  // Handle infinite scroll when user reaches near the end of visible items
  const handleRowsRendered = useCallback(
    async ({ stopIndex }: { startIndex: number; stopIndex: number }) => {
      // Check if we need to load more root items
      const totalItems = flattenedItems.length;
      const threshold = 10; // Load more when within 10 items of the end

      if (stopIndex >= totalItems - threshold) {
        const rootInfo = paginationInfo.get('root');
        if (rootInfo && rootInfo.loadedCount < rootInfo.totalCount && !rootInfo.isLoading) {
          await fetchDataWithPagination(undefined, true);
        }
      }

      // Check if we need to load more children for expanded nodes
      const visibleItems = flattenedItems.slice(0, stopIndex + threshold);
      for (const item of visibleItems) {
        if (item.isExpanded && item.hasChildren && !item.isPlaceholder) {
          const childInfo = paginationInfo.get(item.id);
          if (childInfo && childInfo.loadedCount < childInfo.totalCount && !childInfo.isLoading) {
            // Check if we're near the end of this node's children
            const childrenInView = flattenedItems.filter(
              (flatItem) => flatItem.parentId === item.id && !flatItem.isPlaceholder
            );
            if (childrenInView.length > 0) {
              const lastChildIndex = flattenedItems.findIndex(
                (flatItem) => flatItem.id === childrenInView[childrenInView.length - 1].id
              );
              if (lastChildIndex >= 0 && stopIndex >= lastChildIndex - threshold) {
                await fetchDataWithPagination(item.id, true);
              }
            }
          }
        }
      }
    },
    [flattenedItems, paginationInfo, fetchDataWithPagination]
  );

  // Handle node selection
  const handleSelect = (item: FlattenedTreeItem) => {
    if (item.isPlaceholder) {
      return;
    }

    // Set the action to select to allow scrolling
    lastAction.current = 'select';

    if (onSelect) {
      onSelect(item);
    }
  };

  // Scroll to selected node when selectedId changes, but only if it's from a selection action
  useEffect(() => {
    // Only scroll if the selectedId actually changed
    if (selectedId !== prevSelectedId.current) {
      prevSelectedId.current = selectedId;

      // Only scroll if this was from a selection action or initial load
      if ((lastAction.current === 'select' || lastAction.current === 'initial') && selectedId) {
        const selectedIndex = flattenedItems.findIndex((item) => item.id === selectedId);
        if (selectedIndex >= 0 && listRef.current) {
          listRef.current.scrollToRow(selectedIndex);
        }
      }
    }
  }, [selectedId, flattenedItems]);

  // Row renderer for the virtualized list
  const rowRenderer = ({ index, key, style }: ListRowProps) => {
    const item = flattenedItems[index];

    // Determine if we should show suffix and what it should be
    let itemSuffix = null;
    if (!item.isPlaceholder && suffix) {
      itemSuffix = typeof suffix === 'function' ? suffix(item, index) : suffix;
    }

    return (
      <div key={key} style={style}>
        <TreeViewItem
          item={item}
          onToggle={() => handleToggleExpand(item)}
          onSelect={() => handleSelect(item)}
          suffix={itemSuffix}
          expandable={expandable}
        />
      </div>
    );
  };

  return (
    <div className="w-full h-full min-h-[200px] overflow-hidden border border-gray-200 rounded-md p-2">
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height}
            width={width}
            rowCount={flattenedItems.length}
            rowHeight={54}
            rowRenderer={rowRenderer}
            onRowsRendered={handleRowsRendered}
            overscanRowCount={5}
            // https://github.com/bvaughn/react-virtualized/issues/454#issuecomment-2117701602
            // react virtualized has marked RTL support as non-planned since 2016, so we need to handle it manually
            style={{
              direction:
                getComputedStyle(document.documentElement).direction === 'rtl' ? 'rtl' : 'ltr'
            }}
          />
        )}
      </AutoSizer>
    </div>
  );
};

export default TreeView;
