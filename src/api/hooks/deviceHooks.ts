import { useMutation, QueryClient, useQuery } from '@tanstack/react-query';
import { axios } from '../axios';
import { ResponseModelOrNull } from '../response';
import {
  getMonitoring,
  getProtocols,
  getTypes,
  MonitoringDTO,
  MonitoringVehicleDTO
} from '../devices';
import { cacheDur } from './invalidateCoreDataHooks';
import { useMemo } from 'react';

// Link/unlink devices to a distributor
export const useLinkUnlinkDevices = (queryClient: QueryClient) => {
  return useMutation({
    mutationFn: async ({
      userId,
      deviceIdents,
      isUnlink = false
    }: {
      userId: string | null;
      deviceIdents: string[];
      isUnlink?: boolean;
    }) => {
      const res = await axios.post<ResponseModelOrNull<void>>(
        `/api/devices/link-unlink-devices`,
        deviceIdents,
        {
          params: {
            userId: isUnlink ? null : userId,
            type: 'distributor'
          }
        }
      );

      return res.data;
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['linkedDevices'] });
      queryClient.invalidateQueries({ queryKey: ['unlinkedDevices'] });
    }
  });
};

export const useGetProtocols = () => {
  return useQuery({
    queryKey: ['protocols'],
    queryFn: getProtocols,
    staleTime: cacheDur,
    gcTime: cacheDur
  });
};

export const useGetTypes = () => {
  return useQuery({
    queryKey: ['types'],
    queryFn: getTypes,
    staleTime: cacheDur,
    gcTime: cacheDur
  });
};

export const useGetMonitoring = () => {
  return useQuery({
    queryKey: ['monitoring'],
    queryFn: getMonitoring,
    staleTime: cacheDur,
    gcTime: cacheDur
  });
};

export const useGetMonitoringVehicles = () => {
  const monitoringQuery = useGetMonitoring();

  const filteredData = useMemo(() => {
    return (monitoringQuery.data?.filter((device) => device.vehicleId !== null) ??
      []) as MonitoringVehicleDTO[];
  }, [monitoringQuery.data]);

  return {
    ...monitoringQuery,
    data: filteredData
  };
};

export const useGetMonitoringDevices = () => {
  const monitoringQuery = useGetMonitoring();

  const memoizedData = useMemo(() => {
    return (monitoringQuery.data ?? []) as MonitoringDTO[];
  }, [monitoringQuery.data]);

  return {
    ...monitoringQuery,
    data: memoizedData
  };
};
