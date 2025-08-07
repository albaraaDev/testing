import { axios } from './axios';
import { OffsetBounds } from './common';
import { ResponseModel } from './response';

interface TripGroupsDTO {
  [key: string]: TripDTO[];
}

interface TripDTO {
  id: string;
  ident: string;
  intervalType: string;
  startTime: string;
  endTime: string;
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
  totalDistance: number;
  formattedTotalDistance: string;
  pointsList: TripPoint[];
  totalDuration: number;
  formatedTotalDuration: string;
  maxSpeed: number;
  averageSpeed: string;
  route: string;
  totalIdling: number | null;
}

export interface TripPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed: number;
  direction: number;
}

export interface Trip {
  id: string;
  imei: string;
  startDate: Date;
  endDate: Date;
  mileage: number;
  maxSpeed: number;
  path: TripPath[];
  startLatitude: number;
  startLongitude: number;
  formattedTotalDuration: string;
  totalDuration: number;
  totalIdling: number | null;
}

export interface TripPath {
  tripId: string;
  latitude: number;
  longitude: number;
  direction: number;
  speed: number;
  timestamp: Date;
}

export interface TripGroup {
  id: string;
  trips: Trip[];
  date: Date;
}

export enum IntervalType {
  Trip = 'TRIP',
  Parking = 'PARKING'
}

export interface SearchTripsParams {
  query: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  offset?: OffsetBounds;
  intervalType: IntervalType;
}

export const TRIPS_PAGE_SIZE = 20;

export const searchTrips = async ({
  query,
  startDate,
  endDate,
  startTime,
  endTime,
  offset,
  intervalType = IntervalType.Trip
}: SearchTripsParams): Promise<TripGroup[]> => {
  const trips = await axios.get<ResponseModel<TripGroupsDTO>>('/api/intervals/search', {
    params: {
      ident: query,
      startDate: startDate,
      endDate: endDate,
      startTime: startTime,
      endTime: endTime,
      intervalType,
      sort: 'startTime,desc',
      page: offset ? Math.ceil(offset.start / TRIPS_PAGE_SIZE) : 0,
      size: offset ? offset.end - offset.start : TRIPS_PAGE_SIZE
    }
  });

  return Object.entries(trips.data.result).map(([date, tripGroup]) => ({
    id: date,
    date: new Date(date),
    trips: tripGroup
      .map((trip) => ({
        id: trip.id,
        imei: trip.ident,
        startDate: new Date(trip.startTime),
        endDate: new Date(trip.endTime),
        mileage: trip.totalDistance,
        maxSpeed: trip.maxSpeed,
        path: trip.pointsList.map((point) => ({
          tripId: trip.id,
          latitude: point.latitude,
          longitude: point.longitude,
          direction: point.direction,
          speed: point.speed,
          timestamp: new Date(point.timestamp * 1000)
        })),
        startLatitude: trip.startLatitude,
        startLongitude: trip.startLongitude,
        formattedTotalDuration: trip.formatedTotalDuration,
        totalDuration: trip.totalDuration,
        totalIdling: trip.totalIdling
      }))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  }));
};

export const getFirstTripDate = async (vehicleId: string): Promise<Date | null> => {
  const response = await axios.get<ResponseModel<number | null>>(
    '/api/intervals/find_first_interval_date',
    {
      params: { vehicleId }
    }
  );

  return response.data.result ? new Date(response.data.result * 1000) : null;
};
