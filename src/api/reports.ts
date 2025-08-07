import { TDataGridRequestParams } from '@/components';
import { axios } from './axios';
import { Paginated } from './common';
import { PaginatedResponseModel, ResponseModel } from './response';
import { IntervalType, TripPoint } from './trips';
import { format } from 'date-fns';

interface StatisticsReportDTO {
  id: string;
  ident: string;
  date: string;
  deviceId: string;
  vehiclePlate: string;
  vehicleId: string;
  userId: string | null;
  dailyExistingKilometers: string;
  weeklyExistingKilometers: string;
  monthlyExistingKilometers: string;
  yearlyExistingKilometers: string;
  totalExistingKilometers: string;
  existingKilometers: string;
  dailyParkingTime: string;
  weeklyParkingTime: string;
  monthlyParkingTime: string;
  yearlyParkingTime: string;
  totalParkingTime: string;
  parkingTime: string;
  dailyEngineHours: string;
  weeklyEngineHours: string;
  monthlyEngineHours: string;
  yearlyEngineHours: string;
  totalEngineHours: string;
  engineHours: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface MileageStatisticsReport {
  id: string;
  ident: string;
  vehiclePlate: string;
  date: string;
  dailyExistingKilometers: string;
  weeklyExistingKilometers: string;
  monthlyExistingKilometers: string;
  yearlyExistingKilometers: string;
  totalExistingKilometers: string;
}

export interface EngineHoursStatisticsReport {
  id: string;
  ident: string;
  vehiclePlate: string;
  date: string;
  dailyEngineHours: string;
  weeklyEngineHours: string;
  monthlyEngineHours: string;
  yearlyEngineHours: string;
  totalEngineHours: string;
}

type StatisticsReport = MileageStatisticsReport | EngineHoursStatisticsReport;

export type StatisticsReportParams = {
  vehicleId?: string;
  ident?: string;
  startDate?: string;
  endDate?: string;
  type: 'Mileage' | 'EngineHours';
  pageIndex: number;
  pageSize: number;
  sort?: string;
};

export async function getStatisticsReport(
  params: StatisticsReportParams
): Promise<Paginated<StatisticsReport>> {
  const statistics = await axios.get<PaginatedResponseModel<StatisticsReportDTO>>(
    `/api/statistics/reports`,
    {
      params: {
        page: params.pageIndex,
        size: params.pageSize,
        vehicleId: params.vehicleId,
        startDate: params.startDate,
        endDate: params.endDate,
        sort: params.sort || 'date,desc'
      }
    }
  );
  return {
    data: statistics.data.result.content.map((stat) => {
      if (params.type === 'Mileage') {
        return {
          id: stat.id,
          ident: stat.ident,
          vehiclePlate: stat.vehiclePlate,
          date: stat.date,
          dailyExistingKilometers: stat.dailyExistingKilometers,
          weeklyExistingKilometers: stat.weeklyExistingKilometers,
          monthlyExistingKilometers: stat.monthlyExistingKilometers,
          yearlyExistingKilometers: stat.yearlyExistingKilometers,
          totalExistingKilometers: stat.totalExistingKilometers
        };
      }
      if (params.type === 'EngineHours') {
        return {
          id: stat.id,
          ident: stat.ident,
          vehiclePlate: stat.vehiclePlate,
          date: stat.date,
          dailyEngineHours: stat.dailyEngineHours,
          weeklyEngineHours: stat.weeklyEngineHours,
          monthlyEngineHours: stat.monthlyEngineHours,
          yearlyEngineHours: stat.yearlyEngineHours,
          totalEngineHours: stat.totalEngineHours
        };
      }
      throw new Error(`Unexpected statistics type: ${params.type}`);
    }),
    totalCount: statistics.data.result.totalElements
  };
}

interface TripsAndParkingReportDTO {
  id: string;
  ident: string;
  deviceId: string;
  vehiclePlate: string;
  vehicleId: string;
  userId: string | null;
  intervalType: IntervalType;
  startTime: number;
  endTime: number;
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
  pointsList: TripPoint[];
  totalDistance: number;
  foramtedTotalDistance: string;
  totalDuration: number;
  formatedTotalDuration: string;
  maxSpeed: number;
  formatedMaxSpeed: string;
  averageSpeed: number;
  formatedAverageSpeed: string;
  route: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITripsAndParkingReport {
  id: string;
  ident: string;
  vehiclePlate: string;
  intervalType: string;
  startTime: number;
  endTime: number;
  foramtedTotalDistance: string;
  formatedTotalDuration: string;
  formatedMaxSpeed: string;
  pointsList: TripPoint[];
  startLatitude: number;
  startLongitude: number;
}

export type TripsAndParkingReportParams = {
  vehicleId?: string;
  startDate?: string;
  endDate?: string;
  intervalType: IntervalType;
  pageIndex: number;
  pageSize: number;
  sort?: string;
};

export async function getTripsAndParkingReport(
  params: TripsAndParkingReportParams
): Promise<Paginated<ITripsAndParkingReport>> {
  const report = await axios.get<PaginatedResponseModel<TripsAndParkingReportDTO>>(
    `/api/intervals/reports`,
    {
      params: {
        page: params.pageIndex,
        size: params.pageSize,
        vehicleId: params.vehicleId,
        startDate: params.startDate,
        endDate: params.endDate,
        intervalType: params.intervalType,
        sort: params.sort || 'startTime,desc'
      }
    }
  );

  return {
    data: report.data.result.content.map((item) => ({
      id: item.id,
      ident: item.ident,
      vehiclePlate: item.vehiclePlate,
      intervalType: item.intervalType === IntervalType.Trip ? 'Trip' : 'Parking',
      startTime: item.startTime,
      endTime: item.endTime,
      foramtedTotalDistance: item.foramtedTotalDistance,
      formatedTotalDuration: item.formatedTotalDuration,
      formatedMaxSpeed: item.formatedMaxSpeed,
      pointsList: item.pointsList,
      startLatitude: item.startLatitude,
      startLongitude: item.startLongitude
    })),
    totalCount: report.data.result.totalElements
  };
}

interface AlarmReportDTO {
  id: string;
  type: string;
  text: string;
  typeTrans: string;
  textTrans: string;
  userId: string | null;
  deviceId: string;
  deviceIdent: string;
  vehicleId: string;
  vehiclePlate: string;
  geofenceId: string | null;
  geofenceName: string | null;
  latitude: number;
  longitude: number;
  createdAt: number;
  read: boolean;
}

export interface IAlarmReport {
  id: string;
  deviceIdent: string;
  vehiclePlate: string;
  createdAt: string;
  type: string;
}

export type AlarmReportParams = {
  vehicleId?: string;
  startDate?: string;
  endDate?: string;
  pageIndex: number;
  pageSize: number;
  sort?: string;
  alarmCode?: string;
};

export async function getAlarmReport(params: AlarmReportParams): Promise<Paginated<IAlarmReport>> {
  const report = await axios.get<PaginatedResponseModel<AlarmReportDTO>>(
    `/api/notifications/reports`,
    {
      params: {
        page: params.pageIndex,
        size: params.pageSize,
        vehicleId: params.vehicleId,
        startDate: params.startDate,
        endDate: params.endDate,
        sort: params.sort || 'createdAt,desc',
        alarmCode: params.alarmCode
      }
    }
  );

  return {
    data: report.data.result.content.map((item) => ({
      id: item.id,
      deviceIdent: item.deviceIdent,
      vehiclePlate: item.vehiclePlate,
      createdAt: format(new Date(item.createdAt * 1000), 'yyyy/MM/dd HH:mm:ss'),
      type: item.textTrans
    })),
    totalCount: report.data.result.totalElements
  };
}

export interface IWorkingHourReport {
  ident: string;
  date: string;
  plate: string;
  durationHours: number;
  formattedDurationHours: string;
  distanceKm: number;
  formattedDistanceKm: string;
  offDurationHours: number;
  formattedOffDurationHours: string;
  offDistanceKm: number;
  formattedOffDistanceKm: string;
}

export type WorkingHourReportParams = {
  vehicleId?: string;
  startDate?: string;
  endDate?: string;
  pageIndex: number;
  pageSize: number;
  sort?: string;
  workingHourCode?: string;
};

export async function getWorkingHourReport(
  params: WorkingHourReportParams
): Promise<Paginated<IWorkingHourReport>> {
  console.log('Fetching working hour report with params:', params);
  const report = await axios.get<ResponseModel<IWorkingHourReport[]>>(
    `/api/messages/working_periods_reports`,
    {
      params: {
        page: params.pageIndex,
        size: params.pageSize,
        vehicleId: params.vehicleId,
        // startDate: params.startDate,
        // endDate: params.endDate,
        date: params.startDate,
        sort: params.sort || 'createdAt,desc',
        workingHourCode: params.workingHourCode
      }
    }
  );

  console.log('Received working hour report:', report);

  return {
    data: report.data.result,
    totalCount: report.data.result.length
  };
}

type MessageReportsParams = {
  pageIndex: number;
  pageSize: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  sort: string;
  ident: string;
  minSpeed?: number;
};

export interface IMessagesReports {
  ident: string;
  plate: string;
  timestamp: string;
  ignitionStatus: boolean;
  positionLatitude: number;
  positionLongitude: number;
  positionDirection: number;
  positionSpeed: number;
}

export async function getMaxSpeedReport(
  params: MessageReportsParams
): Promise<Paginated<IMessagesReports>> {
  const report = await axios.get<PaginatedResponseModel<IMessagesReports>>(
    '/api/messages/max_speed_reports',
    {
      params: {
        page: params.pageIndex,
        size: params.pageSize,
        startDate: params.startDate,
        endDate: params.endDate,
        startTime: params.startTime,
        endTime: params.endTime,
        sort: params.sort,
        ident: params.ident,
        minSpeed: params.minSpeed
      }
    }
  );

  return {
    data: report.data.result.content.map((item) => ({
      ident: item.ident,
      plate: item.plate,
      timestamp: format(new Date(item.timestamp), 'yyyy/MM/dd HH:mm:ss'),
      ignitionStatus: item.ignitionStatus,
      positionLatitude: item.positionLatitude,
      positionLongitude: item.positionLongitude,
      positionDirection: item.positionDirection,
      positionSpeed: item.positionSpeed
    })),
    totalCount: report.data.result.totalElements
  };
}

export async function getMessagesReport(
  params: MessageReportsParams
): Promise<Paginated<IMessagesReports>> {
  const report = await axios.get<PaginatedResponseModel<IMessagesReports>>(
    '/api/messages/reports',
    {
      params: {
        page: params.pageIndex,
        size: params.pageSize,
        startDate: params.startDate,
        endDate: params.endDate,
        startTime: params.startTime,
        endTime: params.endTime,
        sort: params.sort,
        ident: params.ident,
        minSpeed: params.minSpeed
      }
    }
  );

  return {
    data: report.data.result.content.map((item) => ({
      ident: item.ident,
      plate: item.plate,
      timestamp: format(new Date(item.timestamp), 'yyyy/MM/dd HH:mm:ss'),
      ignitionStatus: item.ignitionStatus,
      positionLatitude: item.positionLatitude,
      positionLongitude: item.positionLongitude,
      positionDirection: item.positionDirection,
      positionSpeed: item.positionSpeed
    })),
    totalCount: report.data.result.totalElements
  };
}

type SubscriptionExpiryPeriodType = 'today' | 'this_week' | 'this_month' | 'this_year';

type SubscriptionExpiryParams = {
  ident: string;
  pageIndex: number;
  pageSize: number;
  sort: string;
  period: SubscriptionExpiryPeriodType;
};

interface SubscriptionExpiryReportDTO {
  ident: string;
  name: string;
  phone: string;
  plate: string;
  protocol: string;
  type: string;
  startDate: string;
  endDate: string;
  users: string;
}

export interface ISubscriptionExpiryReport {
  ident: string;
  name: string;
  phone: string;
  plate: string;
  protocol: string;
  type: string;
  startDate: string;
  endDate: string;
  user: {
    name: string;
    phone: string;
  };
}

export const getSubscriptionExpiryReport = async (
  params: SubscriptionExpiryParams
): Promise<Paginated<ISubscriptionExpiryReport>> => {
  const report = await axios.get<PaginatedResponseModel<SubscriptionExpiryReportDTO>>(
    `/api/devices/expiring-subscriptions-reports`,
    {
      params: {
        page: params.pageIndex,
        size: params.pageSize,
        sort: params.sort || 'createdAt,desc',
        search: params.ident,
        period: params.period
      }
    }
  );
  return {
    data: report.data.result.content.map((item) => ({
      ident: item.ident,
      name: item.name,
      phone: item.phone,
      plate: item.plate,
      protocol: item.protocol,
      type: item.type,
      startDate: item.startDate,
      endDate: item.endDate,
      user: {
        name: item.users.split(',')[0]?.split(':')[1],
        phone: item.users.split(',')[1]?.split(':')[1]
      }
    })),
    totalCount: report.data.result.totalElements
  };
};

export const exportMessagesReport = async (
  params: MessageReportsParams & { reportType: 'max_speed' | 'messages' | 'working_hours' }
): Promise<Blob> => {
  const response = await axios.get<Blob>('/api/messages/export', {
    responseType: 'blob',
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
      startTime: params.startTime,
      endTime: params.endTime,
      ident: params.ident,
      minSpeed: params.minSpeed,
      sort: params.sort,
      page: params.pageIndex,
      size: params.pageSize,
      reportType: params.reportType
    }
  });
  return response.data;
};

export const exportWorkingHourReport = async (params: MessageReportsParams): Promise<Blob> => {
  return exportMessagesReport({
    ...params,
    reportType: 'working_hours'
  });
};

export const exportStatisticsReport = async (params: StatisticsReportParams): Promise<Blob> => {
  const response = await axios.get<Blob>(`/api/statistics/export`, {
    responseType: 'blob',
    params: {
      vehicleId: params.vehicleId,
      ident: params.ident,
      startDate: params.startDate,
      endDate: params.endDate,
      type: params.type,
      page: params.pageIndex,
      size: params.pageSize
    }
  });
  return response.data;
};

export const exportTripsAndParkingReport = async (
  params: TripsAndParkingReportParams
): Promise<Blob> => {
  const response = await axios.get<Blob>(`/api/intervals/export`, {
    responseType: 'blob',
    params: {
      vehicleId: params.vehicleId,
      startDate: params.startDate,
      endDate: params.endDate,
      intervalType: params.intervalType,
      page: params.pageIndex,
      size: params.pageSize,
      reportType: 'intervals'
    }
  });
  return response.data;
};

export const exportAlarmReport = async (params: AlarmReportParams): Promise<Blob> => {
  const response = await axios.get<Blob>(`/api/notifications/export`, {
    responseType: 'blob',
    params: {
      vehicleId: params.vehicleId,
      startDate: params.startDate,
      endDate: params.endDate,
      page: params.pageIndex,
      size: params.pageSize,
      reportType: 'notifications'
    }
  });
  return response.data;
};

export const exportSubscriptionExpiryReport = async (
  params: TDataGridRequestParams
): Promise<Blob> => {
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
    reportType: 'expiring-subscriptions'
  };

  const response = await axios.get<Blob>('/api/devices/export', {
    responseType: 'blob',
    params: requestParams
  });

  return response.data;
};
