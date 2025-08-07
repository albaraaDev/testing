import { TDataGridRequestParams } from '@/components';
import { axios } from './axios';
import { OffsetBounds, Paginated } from './common';
import {
  PaginatedResponseModel,
  PaginatedResponseModelOrNull,
  ResponseModel,
  ResponseModelMessage,
  ResponseModelOrNull
} from './response';

interface DeviceQueryParams {
  page?: number;
  offset?: number;
  size?: number;
  search?: string;
  sort?: string;
  type?: UserType;
}
export interface DeviceDTO {
  id: string;
  ident: string;
  name: string;
  vehiclePlate: string;
  vehicleImage: string | null;
  vehicleId?: string;
  phoneCode: string;
  phone: string;
  webNotification: boolean;
  smsNotification: boolean;
  status: string;
  motionStatus: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  userId: string;
  skynasaDeviceId: string;
  protocolId: string;
  typeId: string;
  installationStatus: string;
  installationDate: string;
  distributorId: string;
  distributorName: string;
  currentMileage: number;
}

export interface DeviceWithoutVehicleDTO
  extends Omit<DeviceDTO, 'vehiclePlate' | 'vehicleImage' | 'vehicleId'> {}

export interface Device {
  id: string;
  imei: string;
  name: string;
  vehiclePlate: string;
  ident: string;
}

export const getDeviceModel = async (id: string): Promise<DeviceDTO> => {
  const device = await axios.get<ResponseModel<DeviceDTO>>(`/api/devices/show/${id}`);
  return device.data.result;
};

export const getDeviceModelByImei = async (imei: string): Promise<DeviceDTO> => {
  const device = await axios.get<ResponseModel<DeviceDTO>>(`/api/devices/find-by-ident/${imei}`);
  return device.data.result;
};

export const getDevice = async (id: string): Promise<Device> => {
  const device = await getDeviceModel(id);
  return {
    id: device.id,
    imei: device.ident,
    name: device.name,
    vehiclePlate: device.vehiclePlate,
    ident: device.ident
  };
};

export const getDevices = async (
  params: TDataGridRequestParams | OffsetBounds
): Promise<Paginated<DeviceDTO>> => {
  // Convert filters to map
  const filters =
    'filters' in params
      ? (params.filters?.reduce(
          (acc, filter) => {
            acc[filter.id] = filter.value;
            return acc;
          },
          {} as Record<string, unknown>
        ) ?? {})
      : {};

  const requestParams =
    'start' in params
      ? {
          offset: params.start,
          size: params.end - params.start + 1,
          search: params.search
        }
      : {
          page: params.pageIndex,
          size: params.pageSize,
          search: filters['__any'] && filters['__any'].toString(),
          ...(params.sorting?.[0] && {
            sort: `${params.sorting[0].id},${params.sorting[0].desc ? 'desc' : 'asc'}`
          })
        };

  const devices = await axios.get<PaginatedResponseModel<DeviceDTO>>(
    filters['userId'] ? `/api/devices/get-by-user-id/${filters['userId']}` : '/api/devices/index',
    {
      params: requestParams
    }
  );

  return {
    data: devices.data.result.content,
    totalCount: devices.data.result.totalElements
  };
};

export const getDevicesWithoutVehicle = async (
  params: DeviceQueryParams
): Promise<PaginatedResponseModelOrNull<DeviceWithoutVehicleDTO>> => {
  const devices = await axios.get<PaginatedResponseModelOrNull<DeviceWithoutVehicleDTO>>(
    `/api/devices/get-devices-without-vehicle`,
    {
      params
    }
  );

  return devices.data;
};

export interface MonitoringDTO {
  ident: string;
  status: string;
  motionStatus: string;
  userId: string;
  vehiclePlate: string | null;
  vehicleImage: string | null;
}
export type MonitoringVehicleDTO = MonitoringDTO & {
  vehicleId: string;
};

export const getMonitoring = async (): Promise<MonitoringVehicleDTO[]> => {
  const availableLocations =
    await axios.get<ResponseModel<MonitoringVehicleDTO[]>>('api/devices/monitoring');
  return availableLocations.data.result;
};

export interface DeviceStats {
  total: number;
  online: number;
  offline: number;
  connected: number;
  disconnected: number;
}

export const getDevicesStats = async (): Promise<DeviceStats> => {
  const stats = await axios.get<ResponseModel<DeviceStats>>('/api/devices/stats');
  return stats.data.result;
};

export const deleteDevice = async (id: string): Promise<ResponseModelMessage> => {
  const res = await axios.get(`/api/devices/delete/${id}`);

  return res.data;
};

interface ProtocolDTO {
  id: string;
  name: string;
  skynasaProtocolId: string;
}

export const getProtocols = async (): Promise<Record<string, string>> => {
  const protocols = await axios.get<PaginatedResponseModel<ProtocolDTO>>(
    '/api/devices/protocols/index',
    {
      params: { size: 100 }
    }
  );
  return protocols.data.result.content.reduce(
    (acc, protocol) => ({
      ...acc,
      [protocol.id]: protocol.name
    }),
    {}
  );
};

interface TypeDTO {
  id: string;
  name: string;
  protocolId: string;
  skynasaTypeId: string;
}

export type DeviceTypeDTO = Record<string, { name: string; protocolId: string }>;

export const getTypes = async (): Promise<DeviceTypeDTO> => {
  const types = await axios.get<PaginatedResponseModel<TypeDTO>>('/api/devices/types/index', {
    params: { size: 100 }
  });
  return types.data.result.content.reduce(
    (acc, type) => ({
      ...acc,
      [type.id]: {
        name: type.name,
        protocolId: type.protocolId
      }
    }),
    {}
  );
};

export const updateDevice = async (
  id: string,
  data: FormData
): Promise<ResponseModelOrNull<DeviceDTO>> => {
  data.set('id', id);
  const device = await axios.put<ResponseModelOrNull<DeviceDTO>>('/api/devices/update', data);
  return device.data;
};

export const createDevice = async (data: FormData): Promise<ResponseModelOrNull<DeviceDTO>> => {
  const device = await axios.post<ResponseModelOrNull<DeviceDTO>>('/api/devices/create', data);
  return device.data;
};

export const getUnlinkedDevices = async (
  params: DeviceQueryParams
): Promise<PaginatedResponseModelOrNull<DeviceDTO>> => {
  const requestParams = params;
  const res = await axios.get<PaginatedResponseModel<DeviceDTO>>(
    '/api/devices/get-unlinked-devices',
    {
      params: requestParams
    }
  );
  return res.data;
};

export const getLinkedDevicesByUser = async (
  userId: string,
  params: Omit<DeviceQueryParams, 'type'>
): Promise<PaginatedResponseModel<DeviceDTO>> => {
  const devices = await axios.get<PaginatedResponseModel<DeviceDTO>>(
    `/api/devices/get-by-user-id/${userId}`,
    {
      params
    }
  );

  return devices.data;
};

export const unlinkLinkDevice = async (
  userId: string,
  imei: string | string[],
  userType: UserType
): Promise<ResponseModelOrNull<DeviceDTO>> => {
  const res = await axios.post(`/api/devices/link-unlink-devices`, [imei].flat(), {
    params: { userId, type: userType }
  });

  return res.data;
};

interface Address {
  road: string;
  village: string;
  state_district: string;
  state: string;
  ISO3166_2_lvl4: string;
  postcode: string;
  country: string;
  country_code: string;
}

interface ReverseGeoLocationResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  category: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: Address;
  boundingbox: string[];
}

export const reverseGeoLocation = async (
  lat: number,
  lng: number,
  locale?: string
): Promise<string> => {
  const location = await axios.get<ReverseGeoLocationResponse>(
    `https://nominatim.openstreetmap.org/reverse`,
    {
      params: { lat, lon: lng, format: 'jsonv2' },
      ...(locale ? { headers: { 'Accept-Language': locale } } : {})
    }
  );
  return location.data.display_name;
};

export const exportDevicesIntoExcel = async (params: TDataGridRequestParams): Promise<Blob> => {
  const filters =
    params.filters?.reduce(
      (acc, filter) => {
        acc[filter.id] = filter.value;
        return acc;
      },
      {} as Record<string, unknown>
    ) ?? {};

  const requestParams = {
    page: params.pageIndex,
    size: params.pageSize,
    search: filters['__any'] && filters['__any'].toString(),
    ...(params.sorting?.[0] && {
      sort: `${params.sorting[0].id},${params.sorting[0].desc ? 'desc' : 'asc'}`
    }),
    reportType: 'devices'
  };

  const response = await axios.get<Blob>('/api/devices/export', {
    responseType: 'blob',
    params: requestParams
  });

  return response.data;
};

export const importDevicesFromExcel = async (
  data: FormData
): Promise<PaginatedResponseModel<void>> => {
  const res = await axios.post<PaginatedResponseModel<void>>('/api/devices/import', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return res.data;
};

export type InstallationStatusOption = {
  name: string;
  value: string;
};

export const getInstallationStatusOptions = async (): Promise<InstallationStatusOption[]> => {
  const response = await axios.get<ResponseModel<InstallationStatusOption[]>>(
    '/api/devices/lists/installation_status'
  );
  return response.data.result;
};

export type UserType = 'user' | 'distributor';

export const getDevicesByDistributor = async (
  distributorId: string,
  params: Omit<DeviceQueryParams, 'type'>
): Promise<PaginatedResponseModel<DeviceDTO>> => {
  const devices = await axios.get<PaginatedResponseModel<DeviceDTO>>(
    `/api/devices/get-by-distributor-id/${distributorId}`,
    {
      params
    }
  );

  return devices.data;
};

export const getLinkedDevicesByDistributor = async (
  distributorId: string | null,
  params: Omit<DeviceQueryParams, 'type'>
): Promise<PaginatedResponseModelOrNull<DeviceDTO>> => {
  const res = await axios.get<PaginatedResponseModelOrNull<DeviceDTO>>(
    `/api/devices/get-linked-devices`,
    {
      params: {
        ...params,
        type: 'distributor',
        userId: distributorId
      }
    }
  );

  return res.data;
};
