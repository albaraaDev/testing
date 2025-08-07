import { TDataGridRequestParams } from '@/components';
import { axios } from './axios';
import { PaginatedResponseModel, ResponseModel, ResponseModelOrNull } from './response';
import { OffsetBounds, Paginated } from './common';

export interface UserModel {
  id: string;
  name: string;
  identifyNumber: string;
  username: string;
  password: string | null;
  email: string;
  frontPhotoNationalId: string | null;
  frontPhotoNationalIdFile: string | null;
  nationalIdBackground: string | null;
  nationalIdBackgroundFile: string | null;
  contractPdf: string | null;
  contractPdfFile: string | null;
  taxPlate: string | null;
  taxPlateFile: string | null;
  companyTaxNumber: string | null;
  phoneCode: string;
  phone: string;
  secondaryPhoneCode: string;
  secondaryPhone: string;
  country: string;
  state: string;
  city: string;
  role: string;
  status: boolean;
  address: string;
  subscriptionStartDate: string;
  timezone: string;
  locale: string | null;
  parentId: string | null;
  keycloakUserId: string;
  createdAt: string | null;
  updatedAt: string;
}

export type FormUserModel = {
  [K in keyof UserModel]: UserModel[K] | null;
};

export interface User {
  id: string;
  name: string;
  avatar?: string;
  email: string;
}

export const getMonitoringUsers = async (): Promise<User[]> => {
  const clients = await axios.get<ResponseModel<UserModel[]>>(
    '/api/users/get-current-user-with-children'
  );
  return clients.data.result.map((client) => ({
    id: client.id,
    name: client.name,
    email: client.email
  }));
};

export const getUsers = async (
  params: TDataGridRequestParams | OffsetBounds
): Promise<Paginated<UserModel>> => {
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
          search: params.filters?.[0] && params.filters[0].value
        };
  const clients = await axios.get<PaginatedResponseModel<UserModel>>('/api/users/index', {
    params: requestParams
  });
  return {
    data: clients.data.result.content,
    totalCount: clients.data.result.totalElements
  };
};

export const getUsersByParentId = async (
  params: TDataGridRequestParams | OffsetBounds,
  userId: string | null
): Promise<Paginated<UserModel>> => {
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

  let client;
  if (userId != null) {
    client = await axios.get<PaginatedResponseModel<UserModel>>(
      `/api/users/get-by-parent-id/${userId}`,
      {
        params: requestParams
      }
    );
  } else {
    client = await axios.get<PaginatedResponseModel<UserModel>>('/api/users/index', {
      params: requestParams
    });
  }

  return {
    data: client.data.result.content,
    totalCount: client.data.result.totalElements
  };
};

export const getUsersByRoleId = async (
  params: TDataGridRequestParams | OffsetBounds,
  roleId: string
): Promise<Paginated<UserModel>> => {
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

  const client = await axios.get<PaginatedResponseModel<UserModel>>(
    `/api/users/get-users-by-role/${roleId}`,
    {
      params: requestParams
    }
  );

  return {
    data: client.data.result.content,
    totalCount: client.data.result.totalElements
  };
};

export const getUserModel = async (id: string): Promise<UserModel> => {
  const client = await axios.get<ResponseModel<UserModel>>(`/api/users/show/${id}`);
  return client.data.result;
};

export const getUser = async (id: string): Promise<User | null> => {
  const client = await getUserModel(id);
  if (client === null) {
    return null;
  }
  return {
    id: client.id,
    name: client.name,
    email: client.email
  };
};

export interface Topics {
  monitoring: string[];
  notifications: string[];
}

export const getTopics = async (): Promise<Topics> => {
  const topics = await axios.get<ResponseModel<Topics>>('/api/users/get-user-topics');
  return topics.data.result;
};

export interface UserStats {
  total: number;
  active: number;
  unactive: number;
}

export const getUserStats = async (): Promise<UserStats> => {
  const stats = await axios.get<ResponseModel<UserStats>>('/api/users/stats');
  return stats.data.result;
};

export const updateUserStatus = async (id: string, status: boolean) => {
  await axios.patch(`/api/users/update-status/${id}`, undefined, {
    params: {
      status
    }
  });
};

export const createUser = async (data: FormData): Promise<ResponseModelOrNull<UserModel>> => {
  const response = await axios.post<ResponseModelOrNull<UserModel>>('/api/users/create', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateUser = async (
  id: string,
  data: FormData
): Promise<ResponseModelOrNull<UserModel>> => {
  data.set('id', id.toString());

  for (const key of data.keys()) {
    const value = data.get(key);
    if (value === null || value === undefined || !value) {
      data.delete(key);
    }
  }

  const response = await axios.put<ResponseModelOrNull<UserModel>>('/api/users/update', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteUser = async (id: string): Promise<ResponseModelOrNull<UserModel>> => {
  const res = await axios.get<ResponseModelOrNull<UserModel>>(`/api/users/delete/${id}`);

  return res.data;
};

export const getUsersUnderParent = async (
  parentId: string,
  params: TDataGridRequestParams | OffsetBounds
): Promise<Paginated<UserModel>> => {
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
          search: params.filters?.[0] && params.filters[0].value
        };
  const clients = await axios.get<PaginatedResponseModel<UserModel>>(
    `/api/users/get-by-parent-id/${parentId}`,
    {
      params: requestParams
    }
  );
  return {
    data: clients.data.result.content,
    totalCount: clients.data.result.totalElements
  };
};

export const getParentPath = async (userId: string): Promise<string[]> => {
  try {
    const user = await getUserModel(userId);
    const path: string[] = [];

    if (!user.parentId) {
      return path;
    }

    let currentParentId = user.parentId;
    while (currentParentId) {
      path.unshift(currentParentId);
      const parent = await getUserModel(currentParentId);
      currentParentId = parent.parentId || '';
    }

    return path;
  } catch (error) {
    console.error('Error getting parent path:', error);
    return [];
  }
};

export const updateUserLocale = async (locale: string): Promise<ResponseModel<UserModel>> => {
  const res = await axios.patch<ResponseModel<UserModel>>('/api/users/update-locale', { locale });
  return res.data;
};

export const getUserHirarchy = async (id: string): Promise<UserModel[]> => {
  const res = await axios.get<ResponseModel<UserModel[]>>(`/api/users/get-user-hierarchy/${id}`);

  return res.data.result;
};

export const getDistributors = async (
  params: TDataGridRequestParams | OffsetBounds
): Promise<Paginated<UserModel>> => {
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

  const response = await axios.get<PaginatedResponseModel<UserModel>>(
    '/api/users/get-distributors',
    {
      params: requestParams
    }
  );

  return {
    data: response.data.result.content,
    totalCount: response.data.result.totalElements
  };
};
