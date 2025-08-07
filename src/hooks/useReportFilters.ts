import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface ReportFilters {
  ident?: string;
  vehicleId?: string;
  plate?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
  period?: string;
}

export function useReportFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<ReportFilters>(() => {
    const initialFilters: ReportFilters = {};
    searchParams.forEach((value, key) => {
      if (key in initialFilters) {
        initialFilters[key as keyof ReportFilters] = value;
      }
    });
    return initialFilters;
  });

  useEffect(() => {
    const currentFilters: ReportFilters = {};
    searchParams.forEach((value, key) => {
      if (
        key === 'ident' ||
        key === 'vehicleId' ||
        key === 'plate' ||
        key === 'startDate' ||
        key === 'endDate' ||
        key === 'startTime' ||
        key === 'endTime' ||
        key === 'type' ||
        key === 'period'
      ) {
        currentFilters[key as keyof ReportFilters] = value;
      }
    });

    setFilters((prevFilters) => {
      const hasChanged =
        Object.keys(currentFilters).length !== Object.keys(prevFilters).length ||
        Object.entries(currentFilters).some(
          ([key, value]) => prevFilters[key as keyof ReportFilters] !== value
        );

      return hasChanged ? currentFilters : prevFilters;
    });
  }, [searchParams]);

  const updateFilters = (newFilters: ReportFilters) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([, value]) => value != null && value !== '')
    );
    setFilters(cleanFilters);

    setSearchParams(
      (prevParams) => {
        const newParams = new URLSearchParams(prevParams);
        Object.keys(filters).forEach((key) => newParams.delete(key));
        Object.entries(cleanFilters).forEach(([key, value]) => {
          if (value) {
            newParams.set(key, value);
          }
        });
        return newParams;
      },
      { replace: true }
    );
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newFilters = {
      ident: formData.get('ident')?.toString() || '',
      vehicleId: formData.get('vehicleId')?.toString() || '',
      plate: formData.get('plate')?.toString() || '',
      startDate: formData.get('startDate')?.toString() || '',
      endDate: formData.get('endDate')?.toString() || '',
      type: formData.get('type')?.toString() || '',
      startTime: formData.get('startTime')?.toString() || '',
      endTime: formData.get('endTime')?.toString() || '',
      period: formData.get('period')?.toString() || ''
    };

    updateFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({});
    setSearchParams(
      (prevParams) => {
        const newParams = new URLSearchParams(prevParams);
        Object.keys(filters).forEach((key) => newParams.delete(key));
        return newParams;
      },
      { replace: true }
    );
  };

  const getDataGridFilters = useCallback(
    () =>
      Object.entries(filters).map(([key, value]) => ({
        id: key,
        value
      })),
    [filters]
  );

  return {
    filters,
    handleSearch,
    updateFilters,
    resetFilters,
    getDataGridFilters
  };
}
