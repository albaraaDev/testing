/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  useReactTable,
  ColumnFiltersState
} from '@tanstack/react-table';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { DataGridInner } from './DataGridInner';
import { TDataGridProps, TDataGridSelectedRowIds } from './DataGrid';
import { deepMerge } from '@/utils';
import { useIntl } from 'react-intl';

export interface IDataGridContextProps<TData extends object> {
  props: TDataGridProps<TData>;
  table: any;
  totalRows: number;
  loading: boolean;
  setLoading: (state: boolean) => void;
  selectedRowIds: Set<string>;
  toggleRowSelection: (id: string) => void;
  toggleAllRowsSelection: (checked: boolean) => void;
  getSelectedRowIds: () => string[];
  isSelectAllChecked: boolean;
  isSelectAllIndeterminate: boolean;
  fetchServerSideData: () => void;
}

const DataGridContext = createContext<IDataGridContextProps<any> | undefined>(undefined);

export const useDataGrid = () => {
  const context = useContext(DataGridContext);
  if (!context) {
    throw new Error('useDataGrid must be used within a DataGridProvider');
  }
  return context;
};

export const DataGridProvider = <TData extends object>(props: TDataGridProps<TData>) => {
  const intl = useIntl();
  const defaultValues: Partial<TDataGridProps<TData>> = {
    messages: {
      empty: intl.formatMessage({ id: 'DATA_GRID.EMPTY', defaultMessage: 'No data available' }),
      loading: intl.formatMessage({ id: 'DATA_GRID.LOADING', defaultMessage: 'Loading...' })
    },
    pagination: {
      info: intl.formatMessage({
        id: 'DATA_GRID.PAGINATION.INFO',
        defaultMessage: '{from} - {to} of {count}'
      }),
      sizes: [10, 25, 50, 100],
      sizesLabel: intl.formatMessage({
        id: 'DATA_GRID.PAGINATION.SIZES_LABEL',
        defaultMessage: 'Show'
      }),
      sizesDescription: intl.formatMessage({
        id: 'DATA_GRID.PAGINATION.SIZES_DESCRIPTION',
        defaultMessage: 'per page'
      }),
      size: 10,
      page: 0,
      moreLimit: 5,
      more: false
    },
    rowSelect: false,
    serverSide: false
  };

  const mergedProps = deepMerge(defaultValues, props);

  const [data, setData] = useState<TData[]>(mergedProps.data ?? []);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRows, setTotalRows] = useState<number>(mergedProps.data?.length ?? 0);

  // State management for selected rows
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [isSelectAllChecked, setIsSelectAllChecked] = useState<boolean>(false);
  const [isSelectAllIndeterminate, setIsSelectAllIndeterminate] = useState<boolean>(false);

  // Pagination and Sorting from props
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: props.pagination?.page ?? 0,
    pageSize: props.pagination?.size ?? 10
  });
  const [sorting, setSorting] = useState<any[]>(mergedProps.sorting ?? []);
  const [filters, setFilters] = useState<ColumnFiltersState>(mergedProps.filters ?? []);

  const serverSideRefs = useRef<{
    pagination: PaginationState;
    sorting: any[];
    filters: ColumnFiltersState;
  } | null>(null);

  // Fetch data for server-side pagination, sorting, and filtering
  const fetchServerSideData = async () => {
    if (!mergedProps.onFetchData) return;

    setLoading(true);
    try {
      const requestParams = {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        filters
      };

      const { data, totalCount } = await mergedProps.onFetchData(requestParams);

      if (data && totalCount) {
        setData(data);
        setTotalRows(totalCount);
      } else {
        setData([]);
        setTotalRows(0);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const table = useReactTable({
    columns: mergedProps.columns,
    data: data,
    debugTable: false,
    pageCount: mergedProps.serverSide ? Math.ceil(totalRows / pagination.pageSize) : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: mergedProps.serverSide,
    manualSorting: mergedProps.serverSide,
    manualFiltering: mergedProps.serverSide,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setFilters,
    state: {
      pagination,
      sorting,
      columnFilters: filters
    }
  });

  const toggleRowSelection = (id: string) => {
    setSelectedRowIds((prevSelected) => {
      const newSelected: TDataGridSelectedRowIds = new Set(prevSelected);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      if (props.onRowsSelectChange) {
        props.onRowsSelectChange(newSelected);
      }
      return newSelected;
    });
  };

  const toggleAllRowsSelection = (checked: boolean) => {
    const allRowIds = table.getRowModel().rows.map((row) => row.id);
    const newSelectedRowIds: TDataGridSelectedRowIds = checked ? new Set(allRowIds) : new Set();
    setSelectedRowIds(newSelectedRowIds);
    if (props.onRowsSelectChange) {
      props.onRowsSelectChange(newSelectedRowIds);
    }
  };

  const getSelectedRowIds = () => {
    return Array.from(selectedRowIds);
  };

  useEffect(() => {
    // UPDATE: well this sounds good in theory, but the whole system's state depends on this component being faulty and fetching data on every change
    // e.g. notification status change
    // if (!isServerSideDataChanged()) {
    //   logger.debug('No changes detected in server-side data parameters. Skipping fetch.');
    //   return;
    // }
    serverSideRefs.current = {
      pagination,
      sorting,
      filters
    };
    if (mergedProps.serverSide) {
      const timer = setTimeout(() => {
        fetchServerSideData();
      }, 300); // Debounce the fetch
      return () => clearTimeout(timer);
    }
  }, [pagination, sorting, filters]);

  useEffect(() => {
    if (mergedProps.filters) {
      setFilters(mergedProps.filters);
    }
  }, [mergedProps.filters]);

  useEffect(() => {
    const allRowIds = table.getRowModel().rows.map((row) => row.id);
    const isAllSelected = allRowIds.every((id) => selectedRowIds.has(id));
    const isSomeSelected = allRowIds.some((id) => selectedRowIds.has(id));

    setIsSelectAllChecked(isAllSelected);
    setIsSelectAllIndeterminate(!isAllSelected && isSomeSelected);
  }, [selectedRowIds, table.getRowModel().rows]);

  return (
    <DataGridContext.Provider
      value={{
        props: mergedProps,
        table,
        totalRows,
        loading,
        setLoading,
        selectedRowIds,
        toggleRowSelection,
        toggleAllRowsSelection,
        getSelectedRowIds,
        isSelectAllChecked,
        isSelectAllIndeterminate,
        fetchServerSideData
      }}
    >
      <DataGridInner />
    </DataGridContext.Provider>
  );
};
