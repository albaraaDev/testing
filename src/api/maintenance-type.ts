import { TDataGridRequestParams } from '@/components';
import { OffsetBounds, Paginated } from '@/api/common.ts';
import { axios } from '@/api/axios.ts';
import { PaginatedResponseModel, ResponseModel, ResponseModelOrNull } from '@/api/response.ts';

export interface IMaintenanceTypeTableData {
  id: string;
  code: string;
  title: {
    en?: string;
    ar?: string;
    tr?: string;
  };
}

export interface MaintenanceTypeModel {
  id: string;
  code: string;
  titleEn?: string;
  titleAr?: string;
  titleTr?: string;
}
const mapMaintenanceTypeToModel = (
  maintenanceType: MaintenanceTypeModel
): IMaintenanceTypeTableData => ({
  id: maintenanceType.id,
  code: maintenanceType.code,
  title: {
    en: maintenanceType.titleEn,
    ar: maintenanceType.titleAr,
    tr: maintenanceType.titleTr
  }
});

export const getMaintenanceTypeTitle = (
  maintenanceType: IMaintenanceTypeTableData,
  language: 'en' | 'ar' | 'tr'
): string | undefined => {
  switch (language) {
    case 'en':
      return maintenanceType.title.en;
    case 'ar':
      return maintenanceType.title.ar;
    case 'tr':
      return maintenanceType.title.tr;
  }
};

export const getMaintenanceTypes = async (
  params: TDataGridRequestParams
): Promise<Paginated<IMaintenanceTypeTableData>> => {
  const filters =
    params.filters?.reduce(
      (acc, filter) => {
        acc[filter.id] = filter.value;
        return acc;
      },
      {} as Record<string, unknown>
    ) ?? {};
  const maintenanceTypes = await axios.get<PaginatedResponseModel<MaintenanceTypeModel>>(
    '/api/maintenances/types/index',
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

  return {
    data: maintenanceTypes.data.result.content.map(mapMaintenanceTypeToModel),
    totalCount: maintenanceTypes.data.result.totalElements
  };
};

export const searchMaintenanceTypes = async (
  params: TDataGridRequestParams | OffsetBounds
): Promise<Paginated<IMaintenanceTypeTableData>> => {
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

  const maintenanceTypes = await axios.get<PaginatedResponseModel<MaintenanceTypeModel>>(
    '/api/maintenances/types/index',
    {
      params: requestParams
    }
  );

  return {
    data: maintenanceTypes.data.result.content.map(mapMaintenanceTypeToModel),
    totalCount: maintenanceTypes.data.result.totalElements
  };
};

export const getMaintenanceTypeById = async (
  id: string
): Promise<ResponseModel<IMaintenanceTypeTableData>> => {
  const res = await axios.get<ResponseModel<MaintenanceTypeModel>>(
    `/api/maintenances/types/show/${id}`
  );

  return {
    success: res.data.success,
    message: res.data.message,
    result: mapMaintenanceTypeToModel(res.data.result)
  };
};

export const createMaintenanceType = async (
  data: FormData
): Promise<ResponseModelOrNull<IMaintenanceTypeTableData>> => {
  const response = await axios.post<ResponseModelOrNull<MaintenanceTypeModel>>(
    '/api/maintenances/types/create',
    data
  );
  return {
    success: response.data.success,
    message: response.data.message,
    result: response.data.result ? mapMaintenanceTypeToModel(response.data.result) : null
  };
};

export const updateMaintenanceType = async (
  id: string,
  data: FormData
): Promise<ResponseModelOrNull<IMaintenanceTypeTableData>> => {
  data.append('id', id);
  const response = await axios.put<ResponseModelOrNull<MaintenanceTypeModel>>(
    '/api/maintenances/types/update',
    data
  );
  return {
    success: response.data.success,
    message: response.data.message,
    result: response.data.result ? mapMaintenanceTypeToModel(response.data.result) : null
  };
};

export const deleteMaintenanceType = async (
  id: string
): Promise<ResponseModelOrNull<IMaintenanceTypeTableData>> => {
  const response = await axios.get<ResponseModelOrNull<MaintenanceTypeModel>>(
    `/api/maintenances/types/delete/${id}`
  );

  return {
    success: response.data.success,
    message: response.data.message,
    result: response.data.result ? mapMaintenanceTypeToModel(response.data.result) : null
  };
};
