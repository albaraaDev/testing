import { axios } from './axios';
import { ResponseModel } from './response';
import { IntervalType } from './trips';

export interface ReplayDTO {
  id: string;
  ident: string;
  deviceId: string | null;
  vehiclePlate: string | null;
  vehicleId: string | null;
  userId: string | null;
  intervalType: IntervalType;
  startTime: number;
  endTime: number;
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
  pointsList: ReplayPoint[];
  totalDistance: number;
  foramtedTotalDistance: string;
  totalDuration: number;
  formatedTotalDuration: string;
  maxSpeed: number;
  formatedMaxSpeed: string;
  averageSpeed: number;
  formatedAverageSpeed: string;
  route: string | null;
}

export interface ReplayPoint {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  speed: number;
  direction: number;
}

export interface SearchTripsParams {
  ident: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

export async function searchReplays(params: SearchTripsParams): Promise<ReplayDTO[]> {
  const replay = await axios.get<ResponseModel<ReplayDTO[]>>('/api/intervals/replay', {
    params: {
      ...params
    }
  });

  return replay.data.result;
}
