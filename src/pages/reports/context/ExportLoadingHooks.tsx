import { createContext, useContext } from 'react';

interface ExportLoadingContextType {
  isExporting: boolean;
  setIsExporting: (isExporting: boolean) => void;
  exportingReportId: string | null;
  startExporting: (reportId: string) => void;
  stopExporting: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  loadingReportId: string | null;
  startLoading: (reportId: string) => void;
  stopLoading: () => void;
}

export const ExportLoadingContext = createContext<ExportLoadingContextType | undefined>(undefined);

export const useExportLoading = (): ExportLoadingContextType => {
  const context = useContext(ExportLoadingContext);
  if (context === undefined) {
    throw new Error('useExportLoading must be used within an ExportLoadingProvider');
  }
  return context;
};
