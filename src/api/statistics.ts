import { AxiosResponse } from 'axios';
import { axios } from './axios';
import { ResponseModel } from './response';

interface StatisticsDTO {
  id: string;
  ident: string;
  date: string;
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

export interface Statistics {
  date: string;
  existingKilometers: string;
  engineHours: string;
}

type GroupByParam = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type StatisticsParams = {
  startDate: string;
  endDate: string;
  groupedBy: GroupByParam;
  vehicleId?: string;
  ident: string;
  type: 'vehicle' | 'device';
};

export const getStatistics = async (params: StatisticsParams): Promise<Statistics[]> => {
  let statistics: AxiosResponse<ResponseModel<StatisticsDTO[]>, any>;
  if (params.type === 'vehicle' && params.vehicleId) {
    statistics = await axios.get<ResponseModel<StatisticsDTO[]>>(
      `/api/statistics/getLastByVehicleId`,
      {
        params: {
          ...params,
          vehicleId: params.vehicleId,
          ident: params.ident
        }
      }
    );
  } else {
    statistics = await axios.get<ResponseModel<StatisticsDTO[]>>(`/api/statistics/getLastByIdent`, {
      params: {
        ...params,
        ident: params.ident
      }
    });
  }
  let result: Statistics[];
  switch (params.groupedBy) {
    case 'daily':
      result = statistics.data.result.map((stat) => ({
        date: stat.date,
        existingKilometers: stat.dailyExistingKilometers,
        engineHours: stat.dailyEngineHours
      }));
      break;
    case 'weekly':
      result = statistics.data.result.map((stat) => ({
        date: stat.date,
        existingKilometers: stat.weeklyExistingKilometers,
        engineHours: stat.weeklyEngineHours
      }));
      break;
    case 'monthly':
      result = statistics.data.result.map((stat) => ({
        date: stat.date,
        existingKilometers: stat.monthlyExistingKilometers,
        engineHours: stat.monthlyEngineHours
      }));
      break;
    case 'yearly':
      result = statistics.data.result.map((stat) => ({
        date: stat.date,
        existingKilometers: stat.yearlyExistingKilometers,
        engineHours: stat.yearlyEngineHours
      }));
      break;
  }
  return result.sort((a, b) => a.date.localeCompare(b.date));
};
