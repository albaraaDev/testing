import { axios } from './axios';
import { OffsetBounds, Paginated } from './common';
import { PaginatedResponseModel, ResponseModel, ResponseModelOrNull } from './response';

export type GeoFenceType = 'circle' | 'polygon';

interface GeofenceCenter {
  latitude: number;
  longitude: number;
}

type GeofenceGeom = { latitude: number; longitude: number }[];
export interface GeofenceDTO {
  id: string;
  name: string;
  type: GeoFenceType;
  radius?: number;
  center?: GeofenceCenter;
  geom?: GeofenceGeom;
  userId?: string;
}

interface Geofence {
  id: string;
  name: string;
  type: GeoFenceType;
  center?: string;
  geom?: string;
  radius?: number;
  userId?: string;
}

const geofenceToDTO = (geofence: Geofence): GeofenceDTO => {
  const dto: GeofenceDTO = {
    id: geofence.id,
    name: geofence.name,
    type: geofence.type,
    userId: geofence.userId
  };

  // the backend always returns both center and geom, but only one of them is used based on the type

  if (geofence.center && geofence.type === 'circle') {
    const [latitude, longitude] = geofence.center
      .replace('POINT (', '')
      .replace(')', '')
      .split(' ');
    dto.center = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    };
  }

  if (geofence.geom && geofence.type === 'polygon') {
    const positions = geofence.geom
      .replace('POLYGON ((', '')
      .replace('))', '')
      .split(',')
      .map((pos) => {
        const [lat, lng] = pos.trim().split(' ');
        return { latitude: parseFloat(lat), longitude: parseFloat(lng) };
      });
    dto.geom = positions;
  }

  if (geofence.radius) {
    dto.radius = geofence.radius;
  }

  return dto;
};

export const getGeofences = async (params: OffsetBounds): Promise<Paginated<GeofenceDTO>> => {
  const requestParams = {
    offset: params.start,
    size: params.end - params.start + 1,
    search: params.search
  };
  const geofences = await axios.get<PaginatedResponseModel<Geofence>>('/api/geofences/index', {
    params: requestParams
  });
  const data = geofences.data.result.content.map(geofenceToDTO);
  return {
    data,
    totalCount: geofences.data.result.totalElements
  };
};

export const getGeofence = async (id: string): Promise<GeofenceDTO> => {
  const geofence = await axios.get<ResponseModel<Geofence>>(`/api/geofences/show/${id}`);
  return geofenceToDTO(geofence.data.result);
};

export const createGeofence = async (
  formData: FormData
): Promise<ResponseModelOrNull<GeofenceDTO>> => {
  const res = await axios.post<ResponseModelOrNull<Geofence>>('/api/geofences/create', formData);

  const data = res.data;
  const result = data.result;
  return {
    message: data.message,
    success: data.success,
    result: result ? geofenceToDTO(result) : null
  };
};

export const updateGeofence = async (
  id: string,
  formData: FormData
): Promise<ResponseModelOrNull<GeofenceDTO>> => {
  formData.append('id', id);
  const res = await axios.put<ResponseModelOrNull<Geofence>>(`/api/geofences/update`, formData);

  const data = res.data;
  const result = data.result;
  return {
    message: data.message,
    success: data.success,
    result: result ? geofenceToDTO(result) : null
  };
};

export const deleteGeofence = async (id: string): Promise<ResponseModelOrNull<GeofenceDTO>> => {
  const res = await axios.get<ResponseModelOrNull<Geofence>>(`/api/geofences/delete/${id}`);

  const data = res.data;
  const result = data.result;
  return {
    message: data.message,
    success: data.success,
    result: result ? geofenceToDTO(result) : null
  };
};
