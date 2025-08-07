import { OffsetBounds, Paginated } from './common';
import { axios } from './axios';
import {
  PaginatedResponseModel,
  ResponseModel,
  ResponseModelMessage,
  ResponseModelOrNull
} from './response';
import { TDataGridRequestParams } from '@/components';
import { getVehicle, Vehicle } from './cars';

interface DriverDTO {
  id: string;
  fullName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  identityType: string;
  frontNationalIdPhoto: string;
  backNationalIdPhoto: string;
  nationality: string;
  passportPhoto: string;
  lastEntryPhoto: string;
  passportNumber: string;
  idNumber: string;
  licenseSerialNumber: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  billingAddress: string;
  frontDrivingLicensePhoto: string;
  backDriverLicensePhoto: string;
  licensePlace: string;
  type: string;
  licenseClass: string;
  email: string;
  firstPhoneCode: string;
  firstPhone: string;
  secondPhoneCode: string;
  secondPhone: string;
  country: string;
  state: string;
  city: string;
  address: string;
  archived: boolean;
  userId: string;
  vehicleBrand: string;
  vehicleId: string;
  vehicleImage: string;
  vehicleModel: string;
  vehiclePlate: string;
  status: boolean;
}

export interface Driver {
  name: string;
  avatar?: string;
  email: string;
}

export interface DriverDetails {
  id: string;
  driver: Driver;
  nationality: string;
  country: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  phoneParts: {
    phone: string;
    code: string;
  };
  phone2: string;
  phone2Parts: {
    phone: string;
    code: string;
  };
  status: string;
  dateOfBirth: string;
  idNumber?: string;
  passportNumber?: string;
  licenseNumber: string;
  licenseIssueDate: string;
  licenseExpiry: string;
  vehicle: Vehicle;
  identityType: string;
  frontNationalIdPhoto?: string;
  backNationalIdPhoto?: string;
  passportPhoto?: string;
  lastEntryPhoto?: string;
  frontDrivingLicensePhoto?: string;
  backDriverLicensePhoto?: string;
  licensePlace: string;
  username: string;
}

export const getDrivers = async (
  params: TDataGridRequestParams | OffsetBounds
): Promise<Paginated<DriverDetails>> => {
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

  const drivers = await axios.get<PaginatedResponseModel<DriverDTO>>('/api/drivers/index', {
    params: requestParams
  });

  return {
    data: drivers.data.result.content.map((driver) => ({
      id: driver.id,
      driver: {
        name: driver.fullName,
        email: driver.email
      },
      nationality: driver.nationality,
      country: driver.country,
      city: driver.city,
      state: driver.state,
      address: driver.address,
      phone: `${driver.firstPhoneCode} ${driver.firstPhone}`,
      phoneParts: {
        phone: driver.firstPhone,
        code: driver.firstPhoneCode
      },
      phone2: `${driver.secondPhoneCode} ${driver.secondPhone}`,
      phone2Parts: {
        phone: driver.secondPhone,
        code: driver.secondPhoneCode
      },
      status: driver.status ? 'Active' : 'Under Review',
      dateOfBirth: driver.dateOfBirth,
      idNumber: driver.idNumber,
      passportNumber: driver.passportNumber,
      licenseNumber: driver.licenseSerialNumber,
      licenseIssueDate: driver.licenseIssueDate,
      licenseExpiry: driver.licenseExpiryDate,
      identityType: driver.identityType,
      frontNationalIdPhoto: driver.frontNationalIdPhoto,
      backNationalIdPhoto: driver.backNationalIdPhoto,
      passportPhoto: driver.passportPhoto,
      lastEntryPhoto: driver.lastEntryPhoto,
      frontDrivingLicensePhoto: driver.frontDrivingLicensePhoto,
      backDriverLicensePhoto: driver.backDriverLicensePhoto,
      licensePlace: driver.licensePlace,
      username: driver.email,
      vehicle: {
        brandImage: '',
        id: driver.vehicleId,
        imei: '',
        name: '',
        plate: driver.vehiclePlate
      }
    })),
    totalCount: drivers.data.result.totalElements,
    offset: drivers.data.result.pageable.offset
  };
};

export const getDriver = async (id: string): Promise<DriverDetails> => {
  try {
    const driver = await axios.get<ResponseModel<DriverDTO>>(`/api/drivers/show/${id}`);
    let vehicle = null;

    if (driver.data.result.vehicleId) {
      vehicle = await getVehicle(driver.data.result.vehicleId);
    }

    return {
      id: driver.data.result.id,
      driver: {
        name: driver.data.result.fullName,
        email: driver.data.result.email
      },
      nationality: driver.data.result.nationality,
      country: driver.data.result.country,
      city: driver.data.result.city,
      state: driver.data.result.state,
      address: driver.data.result.address,
      phone: `${driver.data.result.firstPhoneCode} ${driver.data.result.firstPhone}`,
      phoneParts: {
        phone: driver.data.result.firstPhone,
        code: driver.data.result.firstPhoneCode
      },
      phone2: `${driver.data.result.secondPhoneCode} ${driver.data.result.secondPhone}`,
      phone2Parts: {
        phone: driver.data.result.secondPhone,
        code: driver.data.result.secondPhoneCode
      },
      status: driver.data.result.status ? 'Active' : 'Under Review',
      dateOfBirth: driver.data.result.dateOfBirth,
      idNumber: driver.data.result.idNumber,
      passportNumber: driver.data.result.passportNumber,
      licenseNumber: driver.data.result.licenseSerialNumber,
      licenseIssueDate: driver.data.result.licenseIssueDate,
      licenseExpiry: driver.data.result.licenseExpiryDate,
      identityType: driver.data.result.identityType,
      frontNationalIdPhoto: driver.data.result.frontNationalIdPhoto,
      backNationalIdPhoto: driver.data.result.backNationalIdPhoto,
      passportPhoto: driver.data.result.passportPhoto,
      lastEntryPhoto: driver.data.result.lastEntryPhoto,
      frontDrivingLicensePhoto: driver.data.result.frontDrivingLicensePhoto,
      backDriverLicensePhoto: driver.data.result.backDriverLicensePhoto,
      licensePlace: driver.data.result.licensePlace,
      username: driver.data.result.email,
      vehicle: {
        brandImage: '',
        id: driver.data.result.vehicleId || '',
        imei: vehicle?.imei || '',
        name: '',
        plate: driver.data.result.vehiclePlate || ''
      }
    };
  } catch (error) {
    console.error('Error fetching driver details:', error);
    throw error;
  }
};

export const deleteDriver = async (id: string): Promise<ResponseModelMessage> => {
  const res = await axios.get(`/api/drivers/delete/${id}`);

  return res.data;
};

export interface DriverStats {
  total: number;
  active: number;
  unactive: number;
}

export const getDriversStats = async (): Promise<DriverStats> => {
  const stats = await axios.get<ResponseModel<DriverStats>>('/api/drivers/stats');
  return stats.data.result;
};

export const updateDriverStatus = async (id: string, status: boolean) => {
  await axios.patch(`/api/drivers/update-status/${id}`, undefined, {
    params: {
      status
    }
  });
};

export const createDriver = async (data: FormData): Promise<ResponseModelOrNull<DriverDTO>> => {
  data.set('identityType', data.get('idNumber') ? 'National ID' : 'Passport');
  data.set('type', "Driver's License");
  data.set('licenseClass', 'Class D');
  if (data.get('idNumber')) {
    data.set('nationality', 'Turkey');
  }
  const response = await axios.post<ResponseModelOrNull<DriverDTO>>('/api/drivers/create', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateDriver = async (
  id: string,
  data: FormData
): Promise<ResponseModelOrNull<DriverDTO>> => {
  data.set('id', id.toString());
  data.set('identityType', data.get('idNumber') ? 'National ID' : 'Passport');
  data.set('type', "Driver's License");
  data.set('licenseClass', 'Class D');
  if (data.get('idNumber')) {
    data.set('nationality', 'Turkey');
  }

  for (const key of data.keys()) {
    const value = data.get(key);
    if (value === null || value === undefined || !value) {
      data.delete(key);
    }
  }

  const response = await axios.put<ResponseModelOrNull<DriverDTO>>('/api/drivers/update', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
