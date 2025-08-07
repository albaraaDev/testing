import { useCallback } from 'react';

import { useExportLoading } from '@/pages/reports/context/ExportLoadingHooks';

interface UseReportSortingProps {
  defaultSort?: string;
  reportType?: string;
}

export function useReportSorting({ defaultSort = 'date,desc', reportType }: UseReportSortingProps) {
  const { startLoading, stopLoading } = useExportLoading();
  const handleFetchWithSort = useCallback(
    async (params: any, filters: any, fetchData: Function) => {
      const sortParam = params.sorting?.[0]
        ? `${params.sorting[0].id},${params.sorting[0].desc ? 'desc' : 'asc'}`
        : defaultSort;

      const queryParams = {
        ...params,
        type: reportType,
        ...filters,
        sort: sortParam
      };

      startLoading(reportType || 'default');

      let result: any = null;
      try {
        result = await fetchData(queryParams);
      } finally {
        stopLoading();
      }

      return result;
    },
    [defaultSort, reportType, startLoading, stopLoading]
  );

  return {
    handleFetchWithSort
  };
}
