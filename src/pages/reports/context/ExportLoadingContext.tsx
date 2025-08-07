import { ScreenLoader } from '@/components';
import React, { useState } from 'react';
import { ExportLoadingContext } from './ExportLoadingHooks';

export const ExportLoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportingReportId, setExportingReportId] = useState<string | null>(null);

  const LOADING_TIMEOUT = 20000; // 20 seconds
  const EXPORTING_TIMEOUT = 20000; // 20 seconds

  const loadingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const exportingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      if (exportingTimeoutRef.current) {
        clearTimeout(exportingTimeoutRef.current);
        exportingTimeoutRef.current = null;
      }
    };
  }, []);
  const startExporting = (reportId: string) => {
    if (exportingTimeoutRef.current) {
      clearTimeout(exportingTimeoutRef.current);
      exportingTimeoutRef.current = null;
    }

    setIsExporting(true);
    setExportingReportId(reportId);

    exportingTimeoutRef.current = setTimeout(() => {
      stopExporting();
    }, EXPORTING_TIMEOUT);
  };

  const stopExporting = () => {
    setIsExporting(false);
    setExportingReportId(null);
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingReportId, setLoadingReportId] = useState<string | null>(null);

  const startLoading = (reportId: string) => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    setIsLoading(true);
    setLoadingReportId(reportId);

    loadingTimeoutRef.current = setTimeout(() => {
      stopLoading();
    }, LOADING_TIMEOUT);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setLoadingReportId(null);
  };

  return (
    <ExportLoadingContext.Provider
      value={{
        isExporting,
        setIsExporting,
        exportingReportId,
        startExporting,
        stopExporting,
        isLoading,
        setIsLoading,
        loadingReportId,
        startLoading,
        stopLoading
      }}
    >
      {(isExporting || isLoading) && <ScreenLoader type="content" mode="transparent" />}
      {children}
    </ExportLoadingContext.Provider>
  );
};
