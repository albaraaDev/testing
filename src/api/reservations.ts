import { TDataGridRequestParams } from '@/components';
import { axios } from './axios';
import { OffsetBounds, Paginated } from './common';
import { PaginatedResponseModel, ResponseModel, ResponseModelOrNull } from './response';

export type PickUpLocationType = 'IN_OFFICE' | 'IN_ANOTHER_ADDRESS';

type ReservationStatus = 'UNCONFIRMED' | 'CONFIRMED' | 'INPROGRESS' | 'CANCELED' | 'COMPLETED';
export const reservationStatusKey = (status: ReservationStatus): string => {
  switch (status) {
    case 'UNCONFIRMED':
      return 'RESERVATIONS.RESERVATION_STATUS.UNCONFIRMED';
    case 'CONFIRMED':
      return 'RESERVATIONS.RESERVATION_STATUS.CONFIRMED';
    case 'INPROGRESS':
      return 'RESERVATIONS.RESERVATION_STATUS.INPROGRESS';
    case 'CANCELED':
      return 'RESERVATIONS.RESERVATION_STATUS.CANCELED';
    case 'COMPLETED':
      return 'RESERVATIONS.RESERVATION_STATUS.COMPLETED';
    default:
      return '';
  }
};

export type ReservationTypeOfRent = 'DAILY' | 'MONTHLY' | 'YEARLY';
export const reservationTypeOfRentKey = (type: ReservationTypeOfRent): string => {
  switch (type) {
    case 'DAILY':
      return 'RESERVATIONS.TYPE_OF_RENT.DAILY';
    case 'MONTHLY':
      return 'RESERVATIONS.TYPE_OF_RENT.MONTHLY';
    case 'YEARLY':
      return 'RESERVATIONS.TYPE_OF_RENT.YEARLY';
    default:
      return '';
  }
};

export interface ReservationDetails {
  id: string;
  status: ReservationStatus;
  typeOfRent: ReservationTypeOfRent;
  pickUpDate: string;
  pickUpTime: string; // Assuming LocalTime is a string in ISO format
  pickUpUserId: string;
  dropOffDate: string;
  dropOffTime: string; // Assuming LocalTime is a string in ISO format
  dropOffUserId: string;
  dropOffFullAddress?: string | null;
  customerId: string;
  customerFullName?: string | null;
  virtualInsurance?: string | null;
  vehicleId: string;
  vehiclePlate: string | null;
  deviceIdent?: string;
  dailyRate: number;
  numberOfDays: number;
  discount?: number | null;
  totalAmount: number;
  mileageAtPickup?: number | null;
  fuelStatusAtPickup?: number | null; // Assuming fuel status is an integer percentage
  imageAtPickup?: string | null;
  videoAtPickup?: string | null;
  imageAtPickupFile?: string | null; // Assuming this is a file path or URL
  videoAtPickupFile?: string | null; // Assuming this is a file path or URL
  passportValidity?: boolean | null;
  licenceValidity?: boolean | null;
  fillInContractDetails?: boolean | null;
  receivingRentalAmount?: boolean | null;
  recipientsID?: boolean | null;
  deliveryOfContractToClient?: boolean | null;
  availabilityOfADriver?: boolean | null;
  imageAtDropOff?: string | null;
  videoAtDropOff?: string | null;
  imageAtDropOffFile?: string | null; // Assuming this is a file path or URL
  videoAtDropOffFile?: string | null; // Assuming this is a file path or URL
  fuelPrice?: number | null;
  mileageAtDropOff?: number | null;
  hgsFees?: number | null;
  reservationItems: ReservationItem[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  additionalMileageAtDropOff?: number | null;
  additionalMileagePrice?: number | null;
  fuelStatusAtDropOff?: number | null; // Assuming fuel status is an integer percentage
}
export interface ReservationRequest {
  id: string;
  status: ReservationStatus;
  typeOfRent: ReservationTypeOfRent;
  pickUpDate: string;
  pickUpTime: string; // Assuming LocalTime is a string in ISO format
  pickUpUserId: string;
  pickUpFullAddress?: string | null; // Assuming this is a full address string
  dropOffDate: string;
  dropOffTime: string; // Assuming LocalTime is a string in ISO format
  dropOffUserId: string;
  dropOffFullAddress?: string | null;
  customerId: string;
  customerFullName?: string | null;
  virtualInsurance?: string | null;
  vehicleId: string;
  dailyRate: number;
  numberOfDays: number;
  discount?: number | null;
  totalAmount: number;
  mileageAtPickup?: number | null;
  fuelStatusAtPickup?: number | null; // Assuming fuel status is an integer percentage
  imageAtPickup?: string | null;
  videoAtPickup?: string | null;
  imageAtPickupFile?: string | null; // Assuming this is a file path or URL
  videoAtPickupFile?: string | null; // Assuming this is a file path or URL
  passportValidity?: boolean | null;
  licenceValidity?: boolean | null;
  fillInContractDetails?: boolean | null;
  receivingRentalAmount?: boolean | null;
  recipientsID?: boolean | null;
  deliveryOfContractToClient?: boolean | null;
  availabilityOfADriver?: boolean | null;
  imageAtDropOff?: string | null;
  videoAtDropOff?: string | null;
  imageAtDropOffFile?: string | null; // Assuming this is a file path or URL
  videoAtDropOffFile?: string | null; // Assuming this is a file path or URL
  fuelPrice?: number | null;
  mileageAtDropOff?: number | null;
  hgsFees?: number | null;
  additionalServices: ReservationRequestItem[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  additionalMileageAtDropOff?: number | null;
  additionalMileagePrice?: number | null;
  fuelStatusAtDropOff?: number | null; // Assuming fuel status is an integer percentage
}

export interface ReservationItem {
  id: string;
  additionalServiceType: string;
  reservationId: string;
  itemType: string; // e.g., 'vehicle_rental', 'CHILD_SEAT'
  itemId?: string | null; // Optional, can be null if not applicable
  name: string;
  price: number;
  quantity: number;
  discount?: number | null;
  total: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface ReservationRequestItem {
  id: string;
  quantity: number;
  name: string;
  price: number;
}

export interface AdditionalService {
  id: string;
  type: string;
  nameEn: string;
  nameAr: string;
  nameTr: string;
  descriptionEn: string;
  descriptionAr: string;
  descriptionTr: string;
  imageFile: string | null;
  image: string | null;
  unit: string;
  status: boolean;
  maxQuantity: number;
  specialPrice: number;
  defaultPrice: number;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationStats {
  total: number;
  unconfirmed: number;
  confirmed: number;
  inprogress: number;
  canceled: number;
  completed: number;
}

export const getReservationsBy = async (
  params: TDataGridRequestParams | OffsetBounds,
  customerId?: string
): Promise<Paginated<ReservationDetails>> => {
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

  const url = customerId
    ? `/api/reservations/get-by-customer-id/${customerId}`
    : '/api/reservations/index';

  const reservationsRes = await axios.get<PaginatedResponseModel<ReservationDetails>>(url, {
    params: requestParams
  });

  return {
    data: reservationsRes.data.result.content,
    totalCount: reservationsRes.data.result.totalElements
  };
};

export const getReservationDetails = async (id: string): Promise<ReservationDetails> => {
  const res = await axios.get<ResponseModel<ReservationDetails>>(`/api/reservations/show/${id}`);
  return res.data.result;
};

export const getReservationsByCustomer = async (
  params: TDataGridRequestParams | OffsetBounds,
  customerId: string
): Promise<Paginated<ReservationDetails>> => {
  return getReservationsBy(params, customerId);
};
export const getReservations = async (
  params: TDataGridRequestParams | OffsetBounds
): Promise<Paginated<ReservationDetails>> => {
  return getReservationsBy(params);
};

export const getReservationsStats = async (): Promise<ReservationStats> => {
  const stats = await axios.get<ResponseModel<ReservationStats>>('api/reservations/stats');
  return stats.data.result;
};

export const getAdditionalServices = async (params?: {
  page?: number;
  offset?: number;
  size?: number;
  search?: string;
  sort?: string;
}): Promise<Paginated<AdditionalService>> => {
  const requestParams = {
    page: params?.page || 0,
    offset: params?.offset || 0,
    size: params?.size || 50,
    search: params?.search || '',
    sort: params?.sort || 'updatedAt,asc'
  };

  const response = await axios.get<PaginatedResponseModel<AdditionalService>>(
    '/api/reservations/additional-services/index',
    {
      params: requestParams
    }
  );

  return {
    data: response.data.result.content,
    totalCount: response.data.result.totalElements
  };
};

export const deleteReservation = async (
  id: string
): Promise<PaginatedResponseModel<ReservationDetails>> => {
  const res = await axios.get<PaginatedResponseModel<ReservationDetails>>(
    `/api/reservations/delete/${id}`
  );

  return res.data;
};

export const exportReservationReport = async (params: TDataGridRequestParams): Promise<Blob> => {
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
    })
  };

  const response = await axios.get<Blob>('/api/reservations/export', {
    responseType: 'blob',
    params: requestParams
  });

  return response.data;
};
export const createReservation = async (
  reservation: ReservationRequest
): Promise<ResponseModelOrNull<ReservationDetails>> => {
  const jsonData = JSON.stringify(reservation, (_, value) =>
    value === undefined ? undefined : value
  );

  const response = await axios.post<ResponseModelOrNull<ReservationDetails>>(
    '/api/reservations/create',
    jsonData,
    {}
  );
  return response.data;
};

export const updateReservation = async (
  reservation: ReservationRequest
): Promise<ResponseModelOrNull<ReservationDetails>> => {
  const jsonData = JSON.stringify(reservation, (_, value) =>
    value === undefined ? undefined : value
  );

  const response = await axios.put<ResponseModelOrNull<ReservationDetails>>(
    '/api/reservations/update',
    jsonData,
    {}
  );
  return response.data;
};

export interface PickupReservationRequest {
  mileageAtPickup: string;
  fuelStatusAtPickup: string;
  pickUpDate: string;
  pickUpTime: string;
  imageAtPickUpFile?: File[];
  videoAtPickUpFile?: File[];
  passportValidity: boolean;
  licenceValidity: boolean;
  fillInContractDetails: boolean;
  receivingRentalAmount: boolean;
  recipientsID: boolean;
  deliveryOfContractToClient: boolean;
  availabilityOfADriver: boolean;
  additionalServices?: ReservationRequestItem[];
}

export interface DropoffReservationRequest {
  dropOffDate: string;
  dropOffTime: string;
  imageAtDropOff?: File[];
  videoAtDropOff?: File[];
  passportValidity: boolean;
  licenceValidity: boolean;
  fillInContractDetails: boolean;
  receivingRentalAmount: boolean;
  recipientsID: boolean;
  deliveryOfContractToClient: boolean;
  availabilityOfADriver: boolean;
  mileageAtDropOff: string;
  additionalMileageAtDropOff: string;
  additionalMileagePrice: string;
  fuelStatusAtDropOff: string;
  fuelPrice: string;
  hgsFees: string;
}

export const pickupReservation = async (
  reservationId: string,
  pickupData: PickupReservationRequest
): Promise<ResponseModelOrNull<ReservationDetails>> => {
  const formData = new FormData();

  // Add text fields
  Object.entries(pickupData).forEach(([key, value]) => {
    if (key === 'imageAtPickUpFile' || key === 'videoAtPickUpFile') {
      if (value && Array.isArray(value)) {
        value.forEach((file: File) => {
          formData.append(key, file);
        });
      }
    } else if (key === 'additionalServices') {
      if (value && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      }
    } else {
      // Convert boolean values to string for API
      const stringValue = typeof value === 'boolean' ? value.toString() : (value as string);
      formData.append(key, stringValue);
    }
  });

  const response = await axios.patch<ResponseModelOrNull<ReservationDetails>>(
    `/api/reservations/pickup-reservation/${reservationId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};

export const dropoffReservation = async (
  reservationId: string,
  dropoffData: DropoffReservationRequest
): Promise<ResponseModelOrNull<ReservationDetails>> => {
  const formData = new FormData();

  // Add text fields
  Object.entries(dropoffData).forEach(([key, value]) => {
    if (key === 'imageAtDropOff' || key === 'videoAtDropOff') {
      if (value && Array.isArray(value)) {
        value.forEach((file: File) => {
          formData.append(key, file);
        });
      }
    } else {
      // Convert boolean values to string for API
      const stringValue = typeof value === 'boolean' ? value.toString() : (value as string);
      formData.append(key, stringValue);
    }
  });

  const response = await axios.patch<ResponseModelOrNull<ReservationDetails>>(
    `/api/reservations/dropoff-reservation/${reservationId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};
