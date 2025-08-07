import { TDataGridRequestParams } from '@/components';
import { OffsetBounds, Paginated } from './common';
import { Driver } from './drivers';
import { getUser, User } from './user';
import { axios } from './axios';
import { PaginatedResponseModel, ResponseModel, ResponseModelOrNull } from './response';
import { getDevice, getDeviceModelByImei } from './devices';
import { objectToFormData, toAbsoluteUrl } from '@/utils';
import { CarType, FuelType, GearType, RegistrationType } from '@/pages/vehicle/add-vehicle';

export interface CarCountsDTO {
  total: number;
  offline?: number;
  online?: number;
  moving?: number;
  parking?: number;
}

export const getCarCount = async (): Promise<Record<string, number>> => {
  const carCounts = await axios.get<ResponseModel<CarCountsDTO>>('/api/devices/counts');
  return {
    Moving: carCounts.data.result.moving ?? 0,
    Parked: carCounts.data.result.parking ?? 0,
    Online: carCounts.data.result.online ?? 0,
    Offline: carCounts.data.result.offline ?? 0
  };
};

export interface Vehicle {
  id: string;
  brandImage: string;
  plate: string;
  imei: string;
  name: string;
}

export interface VehicleDetails {
  vehicle: Vehicle;
  customer: Driver;
  brandName: string;
  type?: string;
  mileage?: string;
  status: string;
  deviceName: string;
  carId: string;
}

export interface VehicleDTO {
  id: string;
  plate: string;
  image?: string | null;
  imageFile?: string | null;
  type: RegistrationType;
  status: string;
  brand: string;
  model: string;
  modelSeries: string;
  modelYear: number;
  volume: string;
  power: string;
  fuelType: FuelType;
  carType: CarType;
  gear: GearType;
  color: string;
  numberOfSeats: number;
  identifyNumber: string;
  chassisNumber: string;
  engineNumber: string;
  registrationNumber: string;
  registrationDate: string;
  firstRegistrationDate: string;
  licenseSerialNumber: string;
  price: number;
  inspectionStartDate: string;
  inspectionEndDate: string;
  insuranceStartDate: string;
  insuranceEndDate: string;
  kaskoInsuranceStartDate: string;
  kaskoInsuranceEndDate: string;
  exhaustStartDate: string;
  exhaustEndDate: string;
  hgsNumber: string;
  currentMileage?: string;
  maintenanceMileage: string;
  fuelConsumption: number;
  licenseImage?: string | null;
  licenseImageFile?: string;
  owner: string;
  userId?: string;
  deviceId?: string;
  deviceIdent?: string;
  vehicleId: string;
  engineHours?: number;
  formatedEngineHours?: string | null;
  mileage?: number;
  formatedMileage?: string | null;
  scratches: ScratchDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ScratchDTO {
  id?: string;
  place: number;
  image?: string | null;
  imageFile?: string | null;
  explanationOf: string;
  vehicleId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleStats {
  total: number;
  available: number;
  unavailable: number;
  inMaintenance: number;
}

interface CarsMileageAndEngineDTO {
  id: string;
  ident: string;
  date: string;
  deviceId: string | null;
  deviceName: string | null;
  vehiclePlate: string | null;
  vehicleImage: string | null;
  formatedDailyExistingKilometers: string;
  formatedTotalExistingKilometers: string;
  dailyExistingKilometers: number;
  totalExistingKilometers: number;
  formatedDailyParkingTime: string;
  formatedTotalParkingTime: string;
  dailyParkingTime: number;
  totalParkingTime: number;
  formatedDailyEngineHours: string;
  formatedTotalEngineHours: string;
  dailyEngineHours: number;
  totalEngineHours: number;
}

export interface CarMileageAndEngine {
  vehicle: Vehicle;
  mileage: number;
  engine: number;
  formattedMilage: string;
  formattedEngine: string;
}

export interface VehicleTotalMileage {
  totalMileage: number;
  formatedTtotalMileage: string;
}

export const getCarsMileageAndEngine = async (
  offset: OffsetBounds,
  sort: 'kilometers' | 'engine' = 'kilometers'
): Promise<Paginated<CarMileageAndEngine>> => {
  const carsMileageAndEngine = await axios.get<PaginatedResponseModel<CarsMileageAndEngineDTO>>(
    '/api/statistics/counts',
    {
      params: {
        offset: offset.start,
        size: offset.end - offset.start + 1,
        sort: sort === 'engine' ? 'dailyEngineHours,desc' : 'dailyExistingKilometers,desc',
        search: offset.search
      }
    }
  );
  return {
    data: carsMileageAndEngine.data.result.content.map((car) => ({
      vehicle: {
        id: car.id,
        brandImage: car.vehicleImage ?? '',
        plate: car.vehiclePlate ?? '',
        imei: car.ident,
        name: car.vehiclePlate ?? ''
      },
      mileage: car.dailyExistingKilometers,
      engine: car.dailyEngineHours,
      formattedMilage: car.formatedDailyExistingKilometers,
      formattedEngine: car.formatedDailyEngineHours
    })),
    totalCount: carsMileageAndEngine.data.result.totalElements
  };
};

export interface ViolationDTO {
  id: string;
  type: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  amount: number;
  userId: string;
  vehicleId: string;
}

export interface Violation {
  id: string;
  vehicle: Vehicle | null;
  date: Date;
  user: User;
  type: string;
  price: number;
  status: string;
}

export const getViolations = async (
  params: TDataGridRequestParams
): Promise<Paginated<Violation>> => {
  // Convert filters to map
  const filters =
    params.filters?.reduce(
      (acc, filter) => {
        acc[filter.id] = filter.value;
        return acc;
      },
      {} as Record<string, unknown>
    ) ?? {};
  const violations = await axios.get<PaginatedResponseModel<ViolationDTO>>(
    filters['vehicleId']
      ? `/api/violations/get-by-vehicle-id/${filters['vehicleId']}`
      : '/api/violations/index',
    {
      params: {
        page: params.pageIndex,
        size: params.pageSize,
        search: filters['__any'] && filters['__any'].toString(),
        ...(params.sorting?.[0] && {
          sort: `${params.sorting[0].id},${params.sorting[0].desc ? 'desc' : 'asc'}`
        })
      }
    }
  );

  const usersPromise = violations.data.result.content.map((violation) => getUser(violation.userId));
  const users = await Promise.all(usersPromise);

  const vehiclePromise = violations.data.result.content.map((violation) =>
    getVehicle(violation.vehicleId)
  );
  const vehicles = await Promise.all(vehiclePromise);

  return {
    data: violations.data.result.content.map((violation, i) => ({
      id: violation.id,
      vehicle: vehicles[i]!,
      date: new Date(violation.startDate),
      user: users[i]!,
      type: violation.type,
      price: violation.amount,
      status: violation.status
    })),
    totalCount: violations.data.result.totalElements
  };
};

export const updateViolationStatus = async (id: string, status: string): Promise<void> => {
  await axios.patch(`/api/violations/update-status/${id}`, undefined, {
    params: {
      status
    }
  });
};

export const updateVehicleStatus = async (id: string, status: string): Promise<void> => {
  await axios.post(`/api/vehicles/cars/update-status/${id}`, undefined, {
    params: {
      status
    }
  });
};

export const getVehicles = async (
  params: TDataGridRequestParams | OffsetBounds
): Promise<Paginated<VehicleDetails>> => {
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
          search: params.filters?.[0] && params.filters[0].value,
          ...(params.sorting?.[0] && {
            sort: `${params.sorting[0].id},${params.sorting[0].desc ? 'desc' : 'asc'}`
          })
        };

  const vehiclesRes = await axios.get<PaginatedResponseModel<VehicleDTO>>(
    '/api/vehicles/cars/index',
    {
      params: requestParams
    }
  );

  const fullVehicleDetails: VehicleDetails[] = vehiclesRes.data.result.content.map((vehicle) => ({
    vehicle: {
      id: vehicle.vehicleId,
      brandImage: vehicle.image ?? '',
      plate: vehicle.plate,
      imei: vehicle.deviceIdent ?? '',
      name: `${vehicle.brand} ${vehicle.model} ${vehicle.modelSeries}`
    },
    customer: {
      name: vehicle.owner,
      avatar: '',
      email: ''
    },
    brandName: vehicle.brand,
    type: vehicle.gear,
    mileage: vehicle.maintenanceMileage || 'NA',
    status: vehicle.status,
    deviceName: 'Device Name',
    carId: vehicle.id
  }));

  return {
    data: fullVehicleDetails,
    totalCount: vehiclesRes.data.result.totalElements
  };
};

export const getVehicle = async (id: string): Promise<Vehicle | null> => {
  const vehicle = await axios.get<ResponseModel<VehicleDTO | null>>(
    `/api/vehicles/cars/find-by-vehicle-id/${id}`
  );

  if (!vehicle.data.result) {
    return null;
  }

  const device = vehicle.data.result.deviceId
    ? await getDevice(vehicle.data.result.deviceId)
    : undefined;
  return {
    id: vehicle.data.result.id,
    brandImage: toAbsoluteUrl(`/media/car-brands/${vehicle.data.result.brand}.png`),
    plate: vehicle.data.result.plate,
    imei: device?.imei ?? '',
    name: `${vehicle.data.result.brand} ${vehicle.data.result.model}`
  };
};

export const getVehicleDetails = async (vehicleId: string): Promise<VehicleDTO | null> => {
  return (
    await axios.get<ResponseModel<VehicleDTO | null>>(
      '/api/vehicles/cars/find-by-vehicle-id/' + vehicleId
    )
  ).data.result;
};

export interface VehicleStatus {
  engineStatus: boolean;
  parkingTime: string;
  timestamp: Date;
  speed: number;
  satellietes: number;
  batteryLevel: number;
  engineBlocked: boolean;
  defenseStatus: boolean;
  signalLevel: number;
  existingKilometer: string;
}

export interface VehicleLocation {
  vehicle: Vehicle;
  online: boolean;
  long: number;
  lat: number;
  angle: number;
  status: VehicleStatus;
}

export const getVehiclesStats = async (): Promise<VehicleStats> => {
  const stats = await axios.get<ResponseModel<VehicleStats>>('api/vehicles/cars/stats');
  return stats.data.result;
};

export const createVehicle = async (
  vehicle: Partial<VehicleDTO>
): Promise<ResponseModelOrNull<VehicleDTO>> => {
  const formData = objectToFormData(vehicle);
  for (const [key, value] of [...formData.entries()]) {
    if (!value || value === 'undefined') {
      formData.delete(key);
    }
  }
  const newVehicle = await axios.post<ResponseModelOrNull<VehicleDTO>>(
    '/api/vehicles/cars/create',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return newVehicle.data;
};

export const updateVehicle = async (
  vehicle: VehicleDTO
): Promise<ResponseModelOrNull<VehicleDTO>> => {
  const formData = objectToFormData(vehicle);
  for (const [key, value] of [...formData.entries()]) {
    if (!value || value === 'undefined') {
      formData.delete(key);
    }
  }
  formData.delete('scratches');
  const updatedVehicle = await axios.put<ResponseModelOrNull<VehicleDTO>>(
    `/api/vehicles/cars/update`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return updatedVehicle.data;
};

export const createScratch = async (
  formData: FormData
): Promise<ResponseModelOrNull<ScratchDTO>> => {
  const newScratch = await axios.post<ResponseModelOrNull<ScratchDTO>>(
    '/api/vehicles/scratches/create',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return newScratch.data;
};

export const updateScratch = async (
  formData: FormData
): Promise<ResponseModelOrNull<ScratchDTO>> => {
  for (const [key, value] of [...formData.entries()]) {
    if (!value || value === 'undefined' || (value instanceof File && value?.name === '')) {
      formData.delete(key);
    }
  }
  const updatedScratch = await axios.put<ResponseModelOrNull<ScratchDTO>>(
    '/api/vehicles/scratches/update',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return updatedScratch.data;
};

export const getScratches = async (
  vehicleId: string,
  params: OffsetBounds
): Promise<ScratchDTO[]> => {
  const scratches = await axios.get<PaginatedResponseModel<ScratchDTO>>(
    `/api/vehicles/scratches/get-by-vehicle-id/${vehicleId}`,
    {
      params: {
        offset: params.start,
        size: params.end - params.start + 1
      }
    }
  );
  return scratches.data.result.content;
};

export const deleteScratch = async (id: string): Promise<PaginatedResponseModel<ScratchDTO>> => {
  const res = await axios.get<PaginatedResponseModel<ScratchDTO>>(
    `/api/vehicles/scratches/delete/${id}`
  );

  return res.data;
};

export const deleteVehicle = async (id: string): Promise<PaginatedResponseModel<ScratchDTO>> => {
  const res = await axios.get<PaginatedResponseModel<ScratchDTO>>(
    `/api/vehicles/cars/delete/${id}`
  );

  return res.data;
};

export const getVehicleTotalMileage = async (
  ident: string
): Promise<{
  formattedTotalMileage: string;
  vehicleId: string;
  userId: string | null;
} | null> => {
  const device = await getDeviceModelByImei(ident);
  if (device) {
    const data = await axios.get<ResponseModel<VehicleTotalMileage>>(
      `/api/vehicles/cars/get-total-mileage/${device.vehicleId}`
    );
    return {
      formattedTotalMileage: data.data.result.formatedTtotalMileage,
      vehicleId: device.vehicleId ?? '',
      userId: device.userId
    };
  }

  return null;
};

export interface SearchVehicleParams {
  page?: number;
  offset?: number;
  size?: number;
  search?: string;
  pickUpDate?: string;
  dropOffDate?: string;
  vehicleId?: string;
  brand?: string;
  model?: string;
  type?: string;
  gear?: string;
  fuelType?: string;
  numberOfSeats?: number;
}

export interface SearchVehicleDTO {
  id: string;
  plate: string;
  image?: string | null;
  type?: string;
  status: string;
  brand?: string | null;
  model?: string | null;
  modelSeries?: string | null;
  modelYear?: number | null;
  volume?: string | null;
  power?: string | null;
  fuelType?: string | null;
  carType?: string | null;
  gear?: string | null;
  color?: string | null;
  numberOfSeats?: number | null;
  identifyNumber?: string | null;
  chassisNumber?: string | null;
  engineNumber?: string | null;
  registrationNumber?: string | null;
  registrationDate?: string | null;
  firstRegistrationDate?: string | null;
  licenseSerialNumber?: string | null;
  price?: number | null;
  inspectionStartDate?: string | null;
  inspectionEndDate?: string | null;
  insuranceStartDate?: string | null;
  insuranceEndDate?: string | null;
  kaskoInsuranceStartDate?: string | null;
  kaskoInsuranceEndDate?: string | null;
  exhaustStartDate?: string | null;
  exhaustEndDate?: string | null;
  hgsNumber?: string | null;
  currentMileage?: string | null;
  maintenanceMileage?: string | null;
  fuelConsumption?: number | null;
  licenseImage?: string | null;
  owner?: string | null;
  userId?: string | null;
  deviceId?: string | null;
  deviceIdent?: string | null;
  vehicleId: string;
  minimumRentalPeriod?: number | null;
  dailyMinimumPrice?: number | null;
  dailyMaximumPrice?: number | null;
  dailyKilometers?: number | null;
  dailyExtraKilometersPrice?: number | null;
  monthlyMinimumPrice?: number | null;
  monthlyMaximumPrice?: number | null;
  monthlyKilometers?: number | null;
  monthlyExtraKilometersPrice?: number | null;
  yearlyMinimumPrice?: number | null;
  yearlyMaximumPrice?: number | null;
  yearlyKilometers?: number | null;
  yearlyExtraKilometersPrice?: number | null;
}

export const searchVehicles = async (
  params: SearchVehicleParams
): Promise<Paginated<SearchVehicleDTO>> => {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) searchParams.append('page', params.page.toString());
  if (params.offset !== undefined) searchParams.append('offset', params.offset.toString());
  if (params.size !== undefined) searchParams.append('size', params.size.toString());
  if (params.search) searchParams.append('search', params.search);
  if (params.pickUpDate) searchParams.append('pickUpDate', params.pickUpDate);
  if (params.dropOffDate) searchParams.append('dropOffDate', params.dropOffDate);
  if (params.vehicleId) searchParams.append('vehicleId', params.vehicleId);
  if (params.brand) searchParams.append('brand', params.brand);
  if (params.model) searchParams.append('model', params.model);
  if (params.type) searchParams.append('type', params.type);
  if (params.gear) searchParams.append('gear', params.gear);
  if (params.fuelType) searchParams.append('fuelType', params.fuelType);
  if (params.numberOfSeats) searchParams.append('numberOfSeats', params.numberOfSeats.toString());

  const vehicles = await axios.get<PaginatedResponseModel<SearchVehicleDTO>>(
    `/api/vehicles/cars/search?${searchParams.toString()}`
  );

  return {
    data: vehicles.data.result.content,
    totalCount: vehicles.data.result.totalElements
  };
};
