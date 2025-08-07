import { KeenIcon } from '@/components';
import { Skeleton } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { FormattedMessage, useIntl } from 'react-intl';
import { useQuery } from '@tanstack/react-query';
import { SearchVehicleDTO, searchVehicles } from '@/api/cars';
import { Field, useField, useFormikContext } from 'formik';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';

interface VehicleSearchProps {
  idFieldName: string;
  place?: 'top' | 'bottom';
  required?: boolean;
  pickUpDate?: string;
  dropOffDate?: string;
}

export const VehicleSearch = ({
  idFieldName,
  place = 'bottom',
  required = false,
  pickUpDate,
  dropOffDate
}: VehicleSearchProps) => {
  const { formatMessage } = useIntl();
  const [field] = useField(idFieldName);
  const { setFieldValue, values, errors, touched } = useFormikContext<any>();

  const [shownVehicles, setShownVehicles] = useState<SearchVehicleDTO[]>([]);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [privateSearch, setPrivateSearch] = useState('');

  // Use pickup/dropoff dates from props or form values
  const effectivePickUpDate = pickUpDate || values.pickUpDate;
  const effectiveDropOffDate = dropOffDate || values.dropOffDate;

  // Get selected vehicle for display
  const selectedVehicle = useMemo(() => {
    return shownVehicles.find((vehicle) => vehicle.vehicleId === field.value);
  }, [field.value, shownVehicles]);

  const { data: vehiclesData, isLoading } = useQuery({
    queryKey: ['search-vehicles', privateSearch, effectivePickUpDate, effectiveDropOffDate],
    queryFn: () =>
      searchVehicles({
        page: 0,
        offset: 0,
        size: 50,
        search: privateSearch,
        pickUpDate: effectivePickUpDate,
        dropOffDate: effectiveDropOffDate
      }),
    enabled: Boolean(effectivePickUpDate && effectiveDropOffDate)
  });

  const availableVehicles = useMemo(() => vehiclesData?.data || [], [vehiclesData?.data]);

  useEffect(() => {
    if (privateSearch) {
      const filtered = availableVehicles.filter(
        (vehicle) =>
          vehicle.plate?.toLowerCase().includes(privateSearch.toLowerCase()) ||
          vehicle.brand?.toLowerCase().includes(privateSearch.toLowerCase()) ||
          vehicle.model?.toLowerCase().includes(privateSearch.toLowerCase()) ||
          vehicle.modelSeries?.toLowerCase().includes(privateSearch.toLowerCase())
      );
      setShownVehicles(filtered);
    } else {
      setShownVehicles(availableVehicles);
    }
  }, [privateSearch, availableVehicles]);

  // Update search when vehicle is selected
  useEffect(() => {
    if (field.value && selectedVehicle) {
      setPrivateSearch(selectedVehicle.plate || '');
    }
  }, [field.value, selectedVehicle]);

  const isDisabled = !effectivePickUpDate || !effectiveDropOffDate;

  return (
    <div className="grid gap-2.5">
      <div className="input shrink-0 relative">
        <Field type="text" name={idFieldName} hidden />
        <input
          type="text"
          placeholder={
            isDisabled
              ? formatMessage({
                  id: 'RESERVATION.ADD.VEHICLE.SELECT_DATES_FIRST',
                  defaultMessage: 'Please select pickup and dropoff dates first'
                })
              : formatMessage({
                  id: 'RESERVATION.ADD.VEHICLE.SEARCH_PLACEHOLDER',
                  defaultMessage: 'Search vehicles by plate, brand, or model...'
                })
          }
          value={privateSearch}
          onChange={(e) => setPrivateSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={isDisabled}
          required={required}
          className={errors[idFieldName] && touched[idFieldName] ? 'border-red-500' : ''}
        />
        <button
          className="btn btn-icon"
          type="button"
          onClick={() => {
            setFieldValue(idFieldName, '');
            setPrivateSearch('');
          }}
        >
          <KeenIcon icon="cross" />
        </button>

        {(focused || hovered) && !isDisabled && (
          <div
            className={`absolute ${place === 'top' ? 'bottom' : 'top'}-[calc(100%+4px)] px-2 left-0 w-full max-h-96 card dark:border-gray-200 mt-1 z-50`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {isLoading ? (
              <div className="p-2">
                <FormattedMessage id="COMMON.LOADING" defaultMessage="Loading..." />
              </div>
            ) : (
              <AutoSizer disableHeight>
                {({ width }) => (
                  <List
                    className="scrollable-y !overflow-x-hidden"
                    height={384}
                    width={width}
                    rowCount={shownVehicles.length}
                    rowHeight={60}
                    rowRenderer={({ key, index, style }) => {
                      const vehicle = shownVehicles[index];

                      if (!vehicle) {
                        return <Skeleton key={key} style={style} height={60} />;
                      }

                      return (
                        <div key={key} style={style}>
                          <div
                            className="p-2 hover:bg-gray-100 flex items-center gap-3 cursor-pointer"
                            onClick={() => {
                              setFieldValue(idFieldName, vehicle.vehicleId);
                              setHovered(false);
                            }}
                          >
                            <CarPlate plate={vehicle.plate} className="flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {vehicle.brand} {vehicle.model} {vehicle.modelSeries}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                <span className="font-medium">{vehicle.plate}</span>
                                {vehicle.status && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <FormattedMessage id="VEHICLE.STATUS" defaultMessage="Status" />
                                    {': '}
                                    {vehicle.status}
                                  </>
                                )}
                                {/* Show rental information based on type of rent */}
                                {(() => {
                                  const typeOfRent = values.typeOfRent;
                                  let minPrice, maxPrice, kilometers, period;

                                  if (typeOfRent === 'DAILY') {
                                    minPrice = vehicle.dailyMinimumPrice;
                                    maxPrice = vehicle.dailyMaximumPrice;
                                    kilometers = vehicle.dailyKilometers;
                                    period = 'DAILY';
                                  } else if (typeOfRent === 'MONTHLY') {
                                    minPrice = vehicle.monthlyMinimumPrice;
                                    maxPrice = vehicle.monthlyMaximumPrice;
                                    kilometers = vehicle.monthlyKilometers;
                                    period = 'MONTHLY';
                                  } else if (typeOfRent === 'YEARLY') {
                                    minPrice = vehicle.yearlyMinimumPrice;
                                    maxPrice = vehicle.yearlyMaximumPrice;
                                    kilometers = vehicle.yearlyKilometers;
                                    period = 'YEARLY';
                                  }

                                  return (
                                    <>
                                      {vehicle.minimumRentalPeriod && (
                                        <>
                                          <span className="mx-1">•</span>
                                          <FormattedMessage
                                            id="VEHICLE.MIN_RENTAL_PERIOD"
                                            defaultMessage="Min Rental"
                                          />
                                          {': '}
                                          {vehicle.minimumRentalPeriod}
                                          {period && (
                                            <>
                                              {' '}
                                              <FormattedMessage
                                                id={
                                                  period === 'DAILY'
                                                    ? 'VEHICLE.PERIOD.DAILY'
                                                    : period === 'MONTHLY'
                                                      ? 'VEHICLE.PERIOD.MONTHLY'
                                                      : period === 'YEARLY'
                                                        ? 'VEHICLE.PERIOD.YEARLY'
                                                        : ''
                                                }
                                                defaultMessage={period.toLowerCase()}
                                              />
                                            </>
                                          )}
                                        </>
                                      )}
                                      {(minPrice || maxPrice) && (
                                        <>
                                          <span className="mx-1">•</span>
                                          <FormattedMessage
                                            id="VEHICLE.PRICE_RANGE"
                                            defaultMessage="Price"
                                          />
                                          {': '}
                                          {minPrice && maxPrice
                                            ? `${minPrice} - ${maxPrice}`
                                            : minPrice || maxPrice}
                                        </>
                                      )}
                                      {kilometers && (
                                        <>
                                          <span className="mx-1">•</span>
                                          <FormattedMessage
                                            id="VEHICLE.KILOMETERS"
                                            defaultMessage="KM"
                                          />
                                          {': '}
                                          {kilometers}
                                        </>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                )}
              </AutoSizer>
            )}

            {shownVehicles.length === 0 && !isLoading && (
              <div className="p-4 text-center text-gray-500">
                <FormattedMessage
                  id="RESERVATION.ADD.VEHICLE.NO_VEHICLES_FOUND"
                  defaultMessage="No vehicles found for your search"
                />
              </div>
            )}
          </div>
        )}
        <input type="hidden" {...field} />
      </div>

      {errors[idFieldName] && touched[idFieldName] && typeof errors[idFieldName] === 'string' && (
        <div className="text-red-500 text-xs mt-1">{errors[idFieldName]}</div>
      )}

      {isDisabled && (
        <div className="text-sm text-gray-500">
          <FormattedMessage
            id="RESERVATION.ADD.VEHICLE.SELECT_DATES_MESSAGE"
            defaultMessage="Please select pickup and dropoff dates to search for available vehicles"
          />
        </div>
      )}
    </div>
  );
};
