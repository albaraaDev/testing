import { useTripsContext } from '../providers/TripsContext';
import 'react-resizable/css/styles.css';
import TripCard from './TripCard';
import { TripsSearch } from './TripsSearch';
import { FormattedMessage, useIntl } from 'react-intl';
import { ButtonRadioGroup } from '@/pages/dashboards/blocks/ButtonRadioGroup';
import { IntervalType } from '@/api/trips';
import { useState } from 'react';
import { CircularProgress } from '@mui/material';

export const MainCard = () => {
  const intl = useIntl();
  const {
    setSelectedVehicle,
    searchDeviceQuery,
    setSearchDeviceQuery,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    intervalType,
    setIntervalType,
    search,
    dateList,
    perDateTrips,
    perDateLoading,
    fetchTripsForDate,
    loading,
    selectedVehicle
  } = useTripsContext();

  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchDeviceQuery) return;
    setIsSearching(true);
    try {
      await search();
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="card-body md:w-[411px] flex flex-col gap-2 px-3 py-3 h-full">
      <TripsSearch
        search={searchDeviceQuery}
        setSearch={setSearchDeviceQuery}
        onSelectDevice={setSelectedVehicle}
        loading={loading}
      />
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 shrink-0">
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-[#3F4254] dark:text-gray-50">
            <FormattedMessage id="TRIPS.FIELD.START_DATE" />
          </div>
          <div className="input input-sm h-[34px] shrink-0">
            <input
              type="date"
              className="dark:[color-scheme:dark]"
              value={startDate || ''}
              onChange={(e) => {
                setStartDate(e.target.value || undefined);
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-[#3F4254] dark:text-gray-50">
            <FormattedMessage id="TRIPS.FIELD.END_DATE" />
          </div>
          <div className="input input-sm h-[34px] shrink-0">
            <input
              type="date"
              className="dark:[color-scheme:dark]"
              value={endDate || ''}
              onChange={(e) => {
                setEndDate(e.target.value || undefined);
              }}
            />
          </div>
        </div>
      </div>
      <ButtonRadioGroup<IntervalType>
        selection={intervalType}
        setSelection={setIntervalType}
        selections={[IntervalType.Trip, IntervalType.Parking]}
        translations={{
          [IntervalType.Trip]: intl.formatMessage({ id: 'TRIPS.FIELD.TRIP' }),
          [IntervalType.Parking]: intl.formatMessage({ id: 'TRIPS.FIELD.PARKING' })
        }}
        className="w-full btn data-[selected=true]:btn-dark btn-light data-[selected=false]:btn-clear items-center justify-center mb-4"
      />
      <button
        className="btn btn-info justify-center text-xs font-medium shrink-0 mt-2 relative"
        onClick={handleSearch}
        disabled={!searchDeviceQuery || loading || isSearching}
      >
        {isSearching ? (
          <>
            <CircularProgress size={16} className="mr-2" color="inherit" />
            <FormattedMessage id="COMMON.SEARCH" defaultMessage="Searching..." />
          </>
        ) : (
          <FormattedMessage id={'COMMON.SEARCH'} />
        )}
      </button>

      {loading || isSearching ? (
        <div className="text-center text-gray-500 h-full flex items-center justify-center py-2">
          <div className="flex flex-col items-center gap-2">
            <CircularProgress size={24} />
            <FormattedMessage id="COMMON.LOADING" />
          </div>
        </div>
      ) : (!dateList.length && selectedVehicle) || !selectedVehicle ? (
        <div className="text-center text-gray-500 h-full flex items-center justify-center py-2">
          <div className="flex flex-col items-center gap-2">
            <FormattedMessage id="DATA_GRID.EMPTY" />
          </div>
        </div>
      ) : (
        <div className="scrollable-y-auto pb-2 flex flex-col gap-[10px]">
          {dateList.map((date) => {
            const key = date.toISOString().slice(0, 10);
            return (
              <TripCard
                key={key}
                date={date}
                tripGroup={perDateTrips[key]}
                loading={!!perDateLoading[key]}
                fetchTripsForDate={fetchTripsForDate}
                intervalType={intervalType}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
