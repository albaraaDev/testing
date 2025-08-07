import { ReplayDTO } from '@/api/replay';
import { IntervalType } from '@/api/trips';
import { createContext, useContext } from 'react';

export type SelectionStateType = IntervalType | 'all' | 'none';

export interface SelectionState {
  all: boolean;
  trips: boolean;
  parkings: boolean;
}

interface ReplayContextProps {
  searchDeviceQuery: string;
  setSearchDeviceQuery: (query: string) => void;
  startDate?: string;
  setStartDate: (date: string) => void;
  endDate?: string;
  setEndDate: (date: string) => void;
  startTime?: string;
  setStartTime: (time: string) => void;
  endTime?: string;
  setEndTime: (time: string) => void;
  search: () => void;
  replayData?: ReplayDTO[];
  loading: boolean;
  selectedIntervals: string[];
  selectedIntervalsData?: Record<string, ReplayDTO>;
  handleIntervalSelection: (interval: ReplayDTO) => void;
  handleSelectAll: (type: SelectionStateType) => void;
  handleDeselectAll: (type: SelectionStateType) => void;
  selectionState: SelectionState;
}

export const ReplayContext = createContext<ReplayContextProps>({
  searchDeviceQuery: '',
  setSearchDeviceQuery: () => {},
  startDate: undefined,
  setStartDate: () => {},
  endDate: undefined,
  setEndDate: () => {},
  startTime: undefined,
  setStartTime: () => {},
  endTime: undefined,
  setEndTime: () => {},
  search: () => {},
  loading: false,
  selectedIntervals: [],
  selectedIntervalsData: {},
  handleIntervalSelection: () => {},
  handleSelectAll: () => {},
  handleDeselectAll: () => {},
  selectionState: {
    all: false,
    trips: false,
    parkings: false
  }
});

export const useReplayContext = () => {
  return useContext(ReplayContext);
};
