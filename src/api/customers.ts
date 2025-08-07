import { TDataGridRequestParams } from '@/components';
import { axios } from './axios';
import { PaginatedResponseModel, ResponseModel, ResponseModelOrNull } from './response';
import { OffsetBounds, Paginated } from './common';

export interface CustomerStats {
  total: number;
  companyCount: number;
  turkishCount: number;
  foreignCount: number;
}

export type IdentityType = 'turkish' | 'foreign' | 'company';

export const identityTypeKey = (type: IdentityType): string => {
  switch (type) {
    case 'turkish':
      return 'CUSTOMER.IDENTITY_TYPE.TURKISH';
    case 'foreign':
      return 'CUSTOMER.IDENTITY_TYPE.FOREIGN';
    case 'company':
      return 'CUSTOMER.IDENTITY_TYPE.COMPANY';
    default:
      return '';
  }
};

export interface CustomerDetails {
  id: string;
  fullName: string;
  companyName?: string | null;
  dateOfBirth?: string | null;
  placeOfBirth?: string | null;
  status?: boolean | null;
  identityType?: IdentityType | null;
  taxNumberPhoto?: string | null;
  taxNumberPhotoFile?: string | null;
  companyLogoPhoto?: string | null;
  companyLogoPhotoFile?: string | null;
  frontNationalIdPhoto?: string | null;
  frontNationalIdPhotoFile?: string | null;
  backNationalIdPhoto?: string | null;
  backNationalIdPhotoFile?: string | null;
  nationality?: string | null;
  passportPhoto?: string | null;
  passportPhotoFile?: string | null;
  lastEntryPhoto?: string | null;
  lastEntryPhotoFile?: string | null;
  passportNumber?: string | null;
  idNumber?: string | null;
  licenseSerialNumber?: string | null;
  licenseIssueDate?: string | null;
  licenseExpiryDate?: string | null;
  billingAddress?: string | null;
  frontDrivingLicensePhoto?: string | null;
  frontDrivingLicensePhotoFile?: string | null;
  backDrivingLicensePhoto?: string | null;
  backDrivingLicensePhotoFile?: string | null;
  licensePlace?: string | null;
  type?: string | null;
  licenseClass?: string | null;
  email?: string | null;
  firstPhoneCode?: string | null;
  firstPhone?: string | null;
  secondPhoneCode?: string | null;
  secondPhone?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  address?: string | null;
  archived?: boolean | null;
  userId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export const updateCustomerStatus = async (id: string, status: boolean): Promise<void> => {
  await axios.patch(`/api/customers/update-status/${id}`, undefined, {
    params: {
      status
    }
  });
};

export const createCustomer = async (
  data: FormData
): Promise<ResponseModelOrNull<CustomerDetails>> => {
  const response = await axios.post<ResponseModelOrNull<CustomerDetails>>(
    '/api/customers/create',
    data,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );
  return response.data;
};

export const updateCustomer = async (
  id: string,
  data: FormData
): Promise<ResponseModelOrNull<CustomerDetails>> => {
  data.set('id', id.toString());

  for (const key of data.keys()) {
    const value = data.get(key);
    if (value === null || value === undefined || !value) {
      data.delete(key);
    }
  }

  const response = await axios.put<ResponseModelOrNull<CustomerDetails>>(
    '/api/customers/update',
    data,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );
  return response.data;
};

export const getCustomersStats = async (): Promise<CustomerStats> => {
  const stats = await axios.get<ResponseModel<CustomerStats>>('api/customers/stats');
  return stats.data.result;
};

export const getCustomers = async (
  params: TDataGridRequestParams | OffsetBounds
): Promise<Paginated<CustomerDetails>> => {
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

  const customersRes = await axios.get<PaginatedResponseModel<CustomerDetails>>(
    '/api/customers/index',
    {
      params: requestParams
    }
  );

  return {
    data: customersRes.data.result.content,
    totalCount: customersRes.data.result.totalElements
  };
};

export const getCustomerDetails = async (id: string): Promise<CustomerDetails> => {
  const res = await axios.get<ResponseModel<CustomerDetails>>(`/api/customers/show/${id}`);
  return res.data.result;
};

export const deleteCustomer = async (
  id: string
): Promise<PaginatedResponseModel<CustomerDetails>> => {
  const res = await axios.get<PaginatedResponseModel<CustomerDetails>>(
    `/api/customers/delete/${id}`
  );

  return res.data;
};

export const exportCustomerReport = async (params: TDataGridRequestParams): Promise<Blob> => {
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

  const response = await axios.get<Blob>('/api/customers/export', {
    responseType: 'blob',
    params: requestParams
  });

  return response.data;
};
