import { axios } from './axios';
import { PaginatedResponseModel, ResponseModel, ResponseModelOrNull } from './response';
import { TDataGridRequestParams } from '@/components';
import { Paginated } from './common';

export interface ModificationRequestDTO {
  id: string;
  serviceName: string;
  entityType: string;
  entityId: string;
  originalData: string;
  modifiedData: string;
  requestedBy: string;
  requestDate: string;
  requestedUserId: string;
  eventType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy: string | null;
  reviewedDate: string | null;
  reviewedUserId: string | null;
  comments: string | null;
  queryString: string;
}

export const getModificationRequests = async (
  params: TDataGridRequestParams
): Promise<Paginated<ModificationRequestDTO>> => {
  const requestParams = {
    page: params.pageIndex,
    offset: params.pageIndex * params.pageSize,
    size: params.pageSize,
    search: params.filters?.find((filter) => filter.id === 'search')?.value || '',
    sort: params.sorting?.[0]
      ? `${params.sorting[0].id},${params.sorting[0].desc ? 'desc' : 'asc'}`
      : 'requestDate,desc'
  };

  const response = await axios.get<PaginatedResponseModel<ModificationRequestDTO>>(
    '/api/users/modification-requests/index',
    { params: requestParams }
  );

  return {
    data: response.data.result.content,
    totalCount: response.data.result.totalElements
  };
};

interface ModificationRequestUpdateDTO {
  id: string;
  status: 'APPROVED' | 'REJECTED';
  comments: string;
}

export const updateModificationRequest = async (
  updateData: ModificationRequestUpdateDTO
): Promise<ResponseModelOrNull<ModificationRequestDTO>> => {
  const response = await axios.put<ResponseModelOrNull<ModificationRequestDTO>>(
    '/api/users/modification-requests/update',
    updateData
  );
  return response.data;
};

export const getModificationRequestDetails = async (
  id: string
): Promise<ModificationRequestDTO> => {
  const response = await axios.get<ResponseModel<ModificationRequestDTO>>(
    `/api/users/modification-requests/show/${id}`
  );
  return response.data.result;
};
