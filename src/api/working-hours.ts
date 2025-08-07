import { axios } from './axios';
import { PaginatedResponseModelOrNull, ResponseModel, ResponseModelOrNull } from './response';

export interface WorkingPeriodDTO {
  id: string;
  name: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  userId: string;
}

export interface WorkingPeriodModel {
  id: string;
  name: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  userId: string;
}
interface WorkingPeriodQueryParams {
  page?: number;
  offset?: number;
  size?: number;
  search?: string;
  sort?: string;
}
export const getWorkingPeriods = async (
  params: WorkingPeriodQueryParams
): Promise<PaginatedResponseModelOrNull<WorkingPeriodModel>> => {
  const prms = {
    page: params.page || 0,
    offset: params.offset || 0,
    size: params.size || 10
  } as WorkingPeriodQueryParams;
  if (params.search) {
    prms.search = params.search;
  }
  if (params.sort) {
    prms.sort = params.sort;
  }
  const res = await axios.get<PaginatedResponseModelOrNull<WorkingPeriodDTO>>(
    '/api/vehicles/working-periods/index',
    {
      params: prms
    }
  );

  return res.data;
};

export const createWorkingPeriod = async (
  workingPeriod: Partial<WorkingPeriodModel>
): Promise<ResponseModelOrNull<WorkingPeriodDTO>> => {
  const response = await axios.post<ResponseModelOrNull<WorkingPeriodDTO>>(
    '/api/vehicles/working-periods/create',
    workingPeriod
  );

  return response.data;
};

export const updateWorkingPeriod = async (
  workingPeriod: WorkingPeriodModel
): Promise<ResponseModelOrNull<WorkingPeriodDTO>> => {
  const response = await axios.put<ResponseModelOrNull<WorkingPeriodDTO>>(
    `/api/vehicles/working-periods/update`,
    workingPeriod
  );

  return response.data;
};

export const deleteWorkingPeriod = async (
  id: string
): Promise<ResponseModelOrNull<WorkingPeriodDTO>> => {
  const res = await axios.delete<ResponseModelOrNull<WorkingPeriodDTO>>(
    `/api/vehicles/working-periods/delete/${id}`
  );

  return res.data;
};

export const getVehicleWorkingPeriods = async (
  vehicleId: string
): Promise<WorkingPeriodModel[]> => {
  const response = await axios.get<ResponseModel<WorkingPeriodDTO[]>>(
    `/api/vehicles/cars/get-working-periods/${vehicleId}`
  );

  return response.data.result.map((period) => ({
    id: period.id,
    name: period.name,
    daysOfWeek: period.daysOfWeek,
    startTime: period.startTime,
    endTime: period.endTime,
    userId: period.userId
  }));
};

export const getWorkingPeriodDetails = async (
  id: string
): Promise<ResponseModelOrNull<WorkingPeriodModel>> => {
  const response = await axios.get<ResponseModelOrNull<WorkingPeriodDTO>>(
    `/api/vehicles/working-periods/show/${id}`
  );

  return response.data;
};

export interface VehicleModelDto {
  vehicleId: string;
  plate: string;
  image: string | null;
  type: string;
  archived: boolean;
  userId: string | null;
  deviceId: string;
  deviceIdent: string;
  vehicleScratches: any[];
  createdAt: string | null;
  updatedAt: string;
}

export const getLinkedVehiclesWorkingPeriod = async (
  workingPeriodId: string,
  params: WorkingPeriodQueryParams
): Promise<PaginatedResponseModelOrNull<VehicleModelDto>> => {
  const res = await axios.get<PaginatedResponseModelOrNull<VehicleModelDto>>(
    `/api/vehicles/working-periods/get-link-vehicles/${workingPeriodId}`,
    { params }
  );

  return res.data;
};
export const getUnLinkedVehiclesWorkingPeriod = async (
  workingPeriodId: string,
  params: WorkingPeriodQueryParams
): Promise<PaginatedResponseModelOrNull<VehicleModelDto>> => {
  const res = await axios.get<PaginatedResponseModelOrNull<VehicleModelDto>>(
    `/api/vehicles/working-periods/get-unlink-vehicles/${workingPeriodId}`,
    { params }
  );

  return res.data;
};
