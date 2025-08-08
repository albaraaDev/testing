import { axios } from '@/api/axios.ts';
import { Vehicle } from '@/api/cars.ts';
import { Paginated } from '@/api/common.ts';
import { PaginatedResponseModel, ResponseModel, ResponseModelOrNull } from '@/api/response.ts';
import { TDataGridRequestParams } from '@/components';
import React from 'react';

export interface Maintenance {
  id: string;
  date: Date;
  vehicle: Vehicle | null;
  type: string;
  supplier: string;
  price: number;
  status: string;
}

export interface MaintenanceModel {
  id: string;
  type: string;
  reservationId: string;
  customerId: string;
  description: string;
  supplier: string;
  startDate: string;
  endDate: string;
  status: string;
  amount: number | undefined;
  vehicleId: string;
  vehiclePlate: string;
  vehicleImage: string;
  vehicleBrand: string;
  vehicleModel: string;
  userId: string;
}

export interface MaintenanceUpdateModel {
  id: string;
  type: string;
  description: string;
  supplier: string;
  startDate: string;
  endDate: string;
  status: string;
  amount: number | undefined;
  vehicleId: string;
  vehiclePlate: string;
  vehicleImage: string;
  vehicleBrand: string;
  vehicleModel: string;
  userId: string;
}

export interface IMaintenanceTableData {
  id: string;
  type: string;
  supplier: string;
  startDate: Date;
  endDate: Date;
  status: string;
  amount: number;
  vehicleId: string;
  vehiclePlate: string;
  vehicleImage: string;
  vehicleName: string;
  vehicleBrand: string;
  userId: string;
}

export interface IMaintenanceStats {
  total: number;
  lastMonth: number;
  ongoing: number;
  finished: number;
}

export interface IMaintenanceCardProps {
  classNames?: {
    root?: string;
    icon?: string;
    label?: string;
    value?: string;
  };
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

export const getMaintenanceStats = async (): Promise<IMaintenanceStats> => {
  const stats = await axios.get<ResponseModel<IMaintenanceStats>>('/api/maintenances/stats');
  return stats.data.result;
};

export const getMaintenance = async (
  params: TDataGridRequestParams,
  context: 'vehicle' | 'reservation' = 'vehicle'
): Promise<Paginated<IMaintenanceTableData>> => {
  const filters =
    params.filters?.reduce(
      (acc, filter) => {
        acc[filter.id] = filter.value;
        return acc;
      },
      {} as Record<string, unknown>
    ) ?? {};

  let endpoint = '/api/maintenances/index';

  if (context === 'reservation' && filters['reservationId']) {
    endpoint = `/api/maintenances/get-by-reservation-id/${filters['reservationId']}`;
  } else if (filters['vehicleId']) {
    endpoint = `/api/maintenances/get-by-vehicle-id/${filters['vehicleId']}`;
  }

  const maintenances = await axios.get<PaginatedResponseModel<MaintenanceModel>>(endpoint, {
    params: {
      page: params.pageIndex,
      size: params.pageSize,
      search: filters['__any'] && filters['__any'].toString(),
      ...(params.sorting?.[0] && {
        sort: `${params.sorting[0].id},${params.sorting[0].desc ? 'desc' : 'asc'}`
      })
    }
  });

  return {
    data: maintenances.data.result.content.map((maintenance) => ({
      id: maintenance.id,
      type: maintenance.type,
      supplier: maintenance.supplier,
      amount: maintenance.amount!,
      status: maintenance.status,
      vehicleId: maintenance.vehicleId,
      vehiclePlate: maintenance.vehiclePlate,
      vehicleImage: maintenance.vehicleImage,
      vehicleName: maintenance.vehicleBrand + ' ' + maintenance.vehicleModel,
      startDate: new Date(maintenance.startDate!),
      endDate: new Date(maintenance.endDate!),
      userId: maintenance.userId,
      vehicleBrand: maintenance.vehicleBrand
    })),
    totalCount: maintenances.data.result.totalElements
  };
};

export const updateMaintenanceStatus = async (id: string, status: string): Promise<void> => {
  await axios.patch(`/api/maintenances/update-status/${id}`, undefined, { params: { status } });
};

export const getMaintenanceById = async (id: string) => {
  return await axios.get<ResponseModel<MaintenanceModel>>(`/api/maintenances/show/${id}`);
};

export const createMaintenance = async (
  data: FormData
): Promise<ResponseModelOrNull<MaintenanceModel>> => {
  // Fix startDate and endDate
  if (data.get('startDate')) {
    data.set('startDate', new Date(data.get('startDate') as string).toISOString());
  }
  if (data.get('endDate')) {
    data.set('endDate', new Date(data.get('endDate') as string).toISOString());
  }
  const response = await axios.post<ResponseModelOrNull<MaintenanceModel>>(
    '/api/maintenances/create',
    data
  );
  return response.data;
};

export const updateMaintenance = async (
  id: string,
  data: FormData
): Promise<ResponseModelOrNull<MaintenanceModel>> => {
  data.append('id', id);
  // Fix startDate and endDate
  if (data.get('startDate')) {
    data.set('startDate', new Date(data.get('startDate') as string).toISOString());
  }
  if (data.get('endDate')) {
    data.set('endDate', new Date(data.get('endDate') as string).toISOString());
  }
  const response = await axios.put<ResponseModelOrNull<MaintenanceModel>>(
    '/api/maintenances/update',
    data
  );
  return response.data;
};

export const deleteMaintenance = async (
  id: string
): Promise<ResponseModelOrNull<MaintenanceModel>> => {
  const res = await axios.get<ResponseModelOrNull<MaintenanceModel>>(
    `/api/maintenances/delete/${id}`
  );

  return res.data;
};
