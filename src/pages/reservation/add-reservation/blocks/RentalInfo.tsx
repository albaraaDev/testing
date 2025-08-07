import { searchVehicles } from '@/api/cars';
import { useCurrentUser } from '@/api/hooks/userHooks';
import {
  AdditionalService,
  getAdditionalServices,
  PickUpLocationType,
  ReservationRequestItem
} from '@/api/reservations';
import { getUsersByParentId, UserModel } from '@/api/user';
import { CalendarIcon } from '@/assets/svg';
import { KeenIcon, TimePicker } from '@/components';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import FormRadioButton from '@/pages/vehicle/add-vehicle/components/FormRadioButton';
import { Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Field, FieldProps, useField, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { AutoSizer, List } from 'react-virtualized';
import { AddReservationPageProps } from '../AddReservationPage';
import { CustomerSearch } from './CustomerSearch';
import { VehicleSearch } from './VehicleSearch';

const RentalInfo = (props: AddReservationPageProps) => {
  const { reservation: _reservation } = props;

  return (
    <>
      <div className="card-header" id="general_settings">
        <h3 className="card-title">
          <FormattedMessage id="RESERVATION.ADD.RENTAL_INFO.TITLE" />
        </h3>
      </div>
      <div className="card-body grid gap-5">
        <TypeOfRentRadio />
        <FormEffectsHandler />
        <VehiclePriceEffectHandler />
        <CustomerSearch idFieldName="customerId" place="bottom" required={true} />

        {/* pickup and drop-off */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="RESERVATION.ADD.PICKUP_DATE" />
            </label>
            <div
              className="input"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                (e.currentTarget.children[0] as HTMLInputElement).showPicker();
              }}
            >
              <Field name="pickUpDate">
                {({ field, form }: FieldProps) => (
                  <input
                    {...field}
                    type="date"
                    className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                    placeholder="DD/MM/YYYY"
                    onChange={(e) => {
                      form.setFieldValue('pickUpDate', e.target.value);

                      // Calculate dropoff date for MONTHLY/YEARLY when pickup date changes
                      const typeOfRent = form.values.typeOfRent;
                      const numberOfDays = form.values.numberOfDays;

                      if (
                        (typeOfRent === 'MONTHLY' || typeOfRent === 'YEARLY') &&
                        numberOfDays &&
                        e.target.value
                      ) {
                        const pickup = new Date(e.target.value);

                        if (typeOfRent === 'MONTHLY') {
                          const totalDays = numberOfDays * 30;
                          pickup.setDate(pickup.getDate() + totalDays);
                        } else if (typeOfRent === 'YEARLY') {
                          pickup.setFullYear(pickup.getFullYear() + numberOfDays);
                        }

                        form.setFieldValue('dropOffDate', pickup.toISOString().split('T')[0]);
                      }

                      // Calculate numberOfDays for DAILY when pickup date changes
                      if (typeOfRent === 'DAILY' && form.values.dropOffDate && e.target.value) {
                        const pickup = new Date(e.target.value);
                        const dropoff = new Date(form.values.dropOffDate);
                        const diffTime = Math.abs(dropoff.getTime() - pickup.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        form.setFieldValue('numberOfDays', diffDays > 0 ? diffDays : 1);
                      }
                    }}
                  />
                )}
              </Field>
              <CalendarIcon />
            </div>
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="RESERVATION.ADD.PICKUP_TIME" />
            </label>
            <Field name="pickUpTime">
              {({ field, form }: FieldProps) => (
                <TimePicker
                  value={field.value || ''}
                  onChange={(value) => form.setFieldValue(field.name, value)}
                  className="input"
                />
              )}
            </Field>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <Field name="typeOfRent">
            {({ field: typeOfRentField }: FieldProps) => {
              const typeOfRent = typeOfRentField.value;
              const isDaily = typeOfRent === 'DAILY';

              return (
                <div className="grid gap-2.5">
                  <label className="form-label">
                    <FormattedMessage id="RESERVATION.ADD.DROPOFF_DATE" />
                  </label>
                  <div
                    className={`input ${!isDaily ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    onClick={(e) => {
                      if (isDaily) {
                        e.preventDefault();
                        e.stopPropagation();
                        (e.currentTarget.children[0] as HTMLInputElement).showPicker();
                      }
                    }}
                  >
                    <Field name="dropOffDate">
                      {({ field, form }: FieldProps) => (
                        <input
                          {...field}
                          type="date"
                          className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                          placeholder="DD/MM/YYYY"
                          disabled={!isDaily}
                          onChange={(e) => {
                            form.setFieldValue('dropOffDate', e.target.value);

                            // Calculate numberOfDays for DAILY when dropoff date changes
                            if (isDaily && form.values.pickUpDate && e.target.value) {
                              const pickup = new Date(form.values.pickUpDate);
                              const dropoff = new Date(e.target.value);
                              const diffTime = Math.abs(dropoff.getTime() - pickup.getTime());
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              form.setFieldValue('numberOfDays', diffDays > 0 ? diffDays : 1);
                            }
                          }}
                        />
                      )}
                    </Field>
                    <CalendarIcon />
                  </div>
                </div>
              );
            }}
          </Field>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="RESERVATION.ADD.DROPOFF_TIME" />
            </label>
            <Field name="dropOffTime">
              {({ field, form }: FieldProps) => (
                <TimePicker
                  value={field.value || ''}
                  onChange={(value) => form.setFieldValue(field.name, value)}
                  className="input"
                />
              )}
            </Field>
          </div>
        </div>

        {/* number of periods - full width row */}
        <NumberOfPeriodsField />

        {/* vehicle selection - conditional layout */}
        <VehicleSelectionSection />

        {/* daily rate field */}
        <DailyRateField />

        {/* pickup and dropoff locations */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="grid gap-5">
            <PickupLocationRadio />
            <PickUpAddressField />
          </div>
          <div className="grid gap-5">
            <DropoffLocationRadio />
            <DropOffAddressField />
          </div>
        </div>

        {/* dropoff user */}
        <div className="grid gap-2.5">
          <label className="form-label">
            <FormattedMessage
              id="RESERVATION.ADD.DROPOFF_USER.TITLE"
              defaultMessage="Dropoff User"
            />
          </label>
          <DropoffUserSection />
        </div>

        {/* hidden pickup user field */}
        <PickupUserHiddenField />

        {/* insurance and additional services */}
        <InsuranceSection />
        <AdditionalServicesSection />
      </div>
    </>
  );
};

const FormEffectsHandler = () => {
  const { values, setFieldValue } = useFormikContext<any>();

  React.useEffect(() => {
    const typeOfRent = values.typeOfRent;
    const numberOfDays = values.numberOfDays;
    const pickupDate = values.pickUpDate;

    if ((typeOfRent === 'MONTHLY' || typeOfRent === 'YEARLY') && numberOfDays && pickupDate) {
      const pickup = new Date(pickupDate);

      if (typeOfRent === 'MONTHLY') {
        const totalDays = numberOfDays * 30;
        pickup.setDate(pickup.getDate() + totalDays);
      } else if (typeOfRent === 'YEARLY') {
        pickup.setFullYear(pickup.getFullYear() + numberOfDays);
      }

      const newDropoffDate = pickup.toISOString().split('T')[0];
      if (newDropoffDate !== values.dropOffDate) {
        setFieldValue('dropOffDate', newDropoffDate);
      }
    }
  }, [
    values.typeOfRent,
    values.numberOfDays,
    values.pickUpDate,
    setFieldValue,
    values.dropOffDate
  ]);

  return null;
};

const VehiclePriceEffectHandler = () => {
  const { values, setFieldValue } = useFormikContext<any>();

  // Get vehicle data to access pricing
  const { data: vehiclesData } = useQuery({
    queryKey: ['search-vehicles', '', values.pickUpDate, values.dropOffDate],
    queryFn: () =>
      searchVehicles({
        page: 0,
        offset: 0,
        size: 50,
        search: '',
        pickUpDate: values.pickUpDate,
        dropOffDate: values.dropOffDate
      }),
    enabled: Boolean(values.pickUpDate && values.dropOffDate)
  });

  React.useEffect(() => {
    const availableVehicles = vehiclesData?.data || [];
    const selectedVehicle = availableVehicles.find(
      (vehicle) => vehicle.vehicleId === values.vehicleId
    );

    if (selectedVehicle && values.typeOfRent) {
      let minPrice: number | undefined;

      // Get minimum price based on rental type
      if (values.typeOfRent === 'DAILY') {
        minPrice = selectedVehicle.dailyMinimumPrice ?? undefined;
      } else if (values.typeOfRent === 'MONTHLY') {
        minPrice = selectedVehicle.monthlyMinimumPrice ?? undefined;
      } else if (values.typeOfRent === 'YEARLY') {
        minPrice = selectedVehicle.yearlyMinimumPrice ?? undefined;
      }

      // Set daily rate to minimum price if not already set or if it's zero
      if (minPrice && (!values.dailyRate || values.dailyRate === 0)) {
        setFieldValue('dailyRate', minPrice);
      }
    }
  }, [values.vehicleId, values.typeOfRent, vehiclesData, values.dailyRate, setFieldValue]);

  return null;
};

const TypeOfRentRadio = () => {
  const intl = useIntl();

  const rentOptions = [
    {
      value: 'DAILY',
      label: intl.formatMessage({ id: 'RESERVATION.ADD.RENTAL_INFO.TYPE_OF_RENT.DAILY' })
    },
    {
      value: 'MONTHLY',
      label: intl.formatMessage({ id: 'RESERVATION.ADD.RENTAL_INFO.TYPE_OF_RENT.MONTHLY' })
    },
    {
      value: 'YEARLY',
      label: intl.formatMessage({ id: 'RESERVATION.ADD.RENTAL_INFO.TYPE_OF_RENT.YEARLY' })
    }
  ];

  return (
    <div className="grid gap-2.5">
      <label className="form-label">
        <FormattedMessage id="RESERVATION.ADD.RENTAL_INFO.TYPE_OF_RENT" />
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-col-6 gap-4 w-full">
        {rentOptions.map((option) => (
          <FormRadioButton
            key={option.value}
            name="typeOfRent"
            value={option.value}
            label={option.label}
          />
        ))}
      </div>
    </div>
  );
};

const PickupLocationRadio = () => {
  const intl = useIntl();

  const locationOptions: { value: PickUpLocationType; label: string }[] = [
    {
      value: 'IN_OFFICE',
      label: intl.formatMessage({
        id: 'RESERVATION.ADD.PICKUP_LOCATION.IN_OFFICE',
        defaultMessage: 'In Office'
      })
    },
    {
      value: 'IN_ANOTHER_ADDRESS',
      label: intl.formatMessage({
        id: 'RESERVATION.ADD.PICKUP_LOCATION.IN_ANOTHER_ADDRESS',
        defaultMessage: 'In Another Address'
      })
    }
  ];

  return (
    <div className="grid gap-2.5">
      <label className="form-label">
        <FormattedMessage
          id="RESERVATION.ADD.PICKUP_LOCATION.TITLE"
          defaultMessage="Pick up location"
        />
      </label>
      <div className="grid grid-cols-2 gap-4 w-full">
        {locationOptions.map((option) => (
          <FormRadioButton
            key={option.value}
            name="pickupLocation"
            value={option.value}
            label={option.label}
          />
        ))}
      </div>
    </div>
  );
};

const PickUpAddressField = () => {
  const intl = useIntl();

  return (
    <Field name="pickupLocation">
      {({ field: pickupLocationField }: FieldProps) => {
        const isAnotherAddress = pickupLocationField.value === 'IN_ANOTHER_ADDRESS';

        return (
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage
                id="RESERVATION.ADD.PICKUP_ADDRESS.TITLE"
                defaultMessage="Pickup Address"
              />
            </label>
            <Field
              type="text"
              name="pickUpAddress"
              className={`input ${!isAnotherAddress ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              disabled={!isAnotherAddress}
              placeholder={intl.formatMessage({
                id: 'RESERVATION.ADD.PICKUP_ADDRESS.PLACEHOLDER',
                defaultMessage: 'Enter pickup address'
              })}
            />
          </div>
        );
      }}
    </Field>
  );
};

const DropoffLocationRadio = () => {
  const intl = useIntl();

  const locationOptions: { value: PickUpLocationType; label: string }[] = [
    {
      value: 'IN_OFFICE',
      label: intl.formatMessage({
        id: 'RESERVATION.ADD.DROPOFF_LOCATION.IN_OFFICE',
        defaultMessage: 'In Office'
      })
    },
    {
      value: 'IN_ANOTHER_ADDRESS',
      label: intl.formatMessage({
        id: 'RESERVATION.ADD.DROPOFF_LOCATION.IN_ANOTHER_ADDRESS',
        defaultMessage: 'In Another Address'
      })
    }
  ];

  return (
    <div className="grid gap-2.5">
      <label className="form-label">
        <FormattedMessage
          id="RESERVATION.ADD.DROPOFF_LOCATION.TITLE"
          defaultMessage="Drop off location"
        />
      </label>
      <div className="grid grid-cols-2 gap-4 w-full">
        {locationOptions.map((option) => (
          <FormRadioButton
            key={option.value}
            name="dropoffLocation"
            value={option.value}
            label={option.label}
          />
        ))}
      </div>
    </div>
  );
};

const DropOffAddressField = () => {
  const intl = useIntl();

  return (
    <Field name="dropoffLocation">
      {({ field: dropoffLocationField }: FieldProps) => {
        const isAnotherAddress = dropoffLocationField.value === 'IN_ANOTHER_ADDRESS';

        return (
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage
                id="RESERVATION.ADD.DROPOFF_ADDRESS.TITLE"
                defaultMessage="Dropoff Address"
              />
            </label>
            <Field
              type="text"
              name="dropOffAddress"
              className={`input ${!isAnotherAddress ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              disabled={!isAnotherAddress}
              placeholder={intl.formatMessage({
                id: 'RESERVATION.ADD.DROPOFF_ADDRESS.PLACEHOLDER',
                defaultMessage: 'Enter dropoff address'
              })}
            />
          </div>
        );
      }}
    </Field>
  );
};

const DropoffUserSection = () => {
  const { formatMessage } = useIntl();
  const [field] = useField('dropOffUserId');
  const { setFieldValue } = useFormikContext();
  const { data: currentUser } = useCurrentUser();

  const [shownUsers, setShownUsers] = useState<UserModel[]>([]);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [privateSearch, setPrivateSearch] = useState('');

  // Determine the parent ID to use for the user picker
  const parentUserId = currentUser?.parentId || currentUser?.id || null;

  useEffect(() => {
    if (field.value) {
      setPrivateSearch(shownUsers.find((x: UserModel) => x.id === field.value)?.name || '');
    }
  }, [field.value, shownUsers]);

  const { data: users } = useQuery({
    queryKey: ['users-by-parent', parentUserId, privateSearch],
    queryFn: async () =>
      (await getUsersByParentId({ start: 0, end: 10, search: privateSearch }, parentUserId)).data,
    enabled: Boolean(parentUserId)
  });

  useEffect(() => {
    const usrs = users || [];
    if (privateSearch) {
      const filtered = usrs.filter((user: UserModel) =>
        user.name?.toLowerCase().includes(privateSearch.toLowerCase())
      );
      setShownUsers(filtered);
    } else {
      setShownUsers(usrs);
    }
  }, [privateSearch, users]);

  return (
    <div className="input shrink-0 relative">
      <Field type="text" name="dropOffUserId" hidden />
      <input
        type="text"
        placeholder={formatMessage({
          id: 'USER.SEARCH.PLACEHOLDER',
          defaultMessage: 'Search users...'
        })}
        value={privateSearch}
        onChange={(e) => setPrivateSearch(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button
        className="btn btn-icon"
        type="button"
        onClick={() => {
          setFieldValue('dropOffUserId', '');
          setPrivateSearch('');
        }}
      >
        <KeenIcon icon="cross" />
      </button>
      {(focused || hovered) && (
        <div
          className="absolute top-[calc(100%+4px)] px-2 left-0 w-full max-h-96 card dark:border-gray-200 mt-1 z-50"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {!users ? (
            <div className="p-2">
              <FormattedMessage id="COMMON.LOADING" />
            </div>
          ) : (
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  className="scrollable-y !overflow-x-hidden"
                  height={384}
                  width={width}
                  rowCount={shownUsers.length}
                  rowHeight={44}
                  rowRenderer={({ key, index, style }) => {
                    const user = shownUsers[index];

                    if (!user) {
                      return <Skeleton key={key} style={style} />;
                    }

                    return (
                      <div key={key} style={style}>
                        <div
                          key={user.id}
                          className="p-2 hover:bg-gray-100 flex justify-between items-center gap-2 cursor-pointer"
                          onClick={() => {
                            setFieldValue('dropOffUserId', user.id);
                            setPrivateSearch(user.name);
                            setHovered(false);
                          }}
                        >
                          <span className="font-monospace">{user.name}</span>
                        </div>
                      </div>
                    );
                  }}
                />
              )}
            </AutoSizer>
          )}
        </div>
      )}
      <input type="hidden" {...field} />
    </div>
  );
};

const PickupUserHiddenField = () => {
  const { setFieldValue } = useFormikContext();
  const { data: currentUser } = useCurrentUser();

  React.useEffect(() => {
    // Set pickup user ID to current user's ID
    if (currentUser?.id) {
      setFieldValue('pickUpUserId', currentUser.id);
    }
  }, [currentUser, setFieldValue]);

  return <Field type="hidden" name="pickUpUserId" />;
};

const NumberOfPeriodsField = () => {
  const intl = useIntl();

  return (
    <Field name="typeOfRent">
      {({ field: typeOfRentField }: FieldProps) => {
        const typeOfRent = typeOfRentField.value;
        let periodLabel = 'periods';

        if (typeOfRent === 'DAILY') {
          periodLabel = intl.formatMessage(
            { id: 'RESERVATION.ADD.RENTAL_INFO.NUMBER_OF_DAYS' },
            { defaultMessage: 'days' }
          );
        } else if (typeOfRent === 'MONTHLY') {
          periodLabel = intl.formatMessage(
            { id: 'RESERVATION.ADD.RENTAL_INFO.NUMBER_OF_MONTHS' },
            { defaultMessage: 'months' }
          );
        } else if (typeOfRent === 'YEARLY') {
          periodLabel = intl.formatMessage(
            { id: 'RESERVATION.ADD.RENTAL_INFO.NUMBER_OF_YEARS' },
            { defaultMessage: 'years' }
          );
        }

        return (
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage
                id="RESERVATION.ADD.RENTAL_INFO.NUMBER_OF_PERIODS"
                values={{ period: periodLabel }}
                defaultMessage={`Number of ${periodLabel}`}
              />
            </label>
            <div className="flex items-center gap-2">
              <Field name="numberOfDays">
                {({ field, form }: FieldProps) => {
                  const isDaily = typeOfRent === 'DAILY';

                  // Calculate numberOfDays for DAILY based on pickup and dropoff dates
                  const calculateDaysFromDates = () => {
                    const pickupDate = form.values.pickUpDate;
                    const dropoffDate = form.values.dropOffDate;

                    if (pickupDate && dropoffDate) {
                      const pickup = new Date(pickupDate);
                      const dropoff = new Date(dropoffDate);
                      const diffTime = Math.abs(dropoff.getTime() - pickup.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays > 0 ? diffDays : 1;
                    }
                    return 1;
                  };

                  // Calculate dropoff date for MONTHLY and YEARLY
                  const calculateDropoffDate = (numberOfDays: number) => {
                    const pickupDate = form.values.pickUpDate;
                    if (!pickupDate) return '';

                    const pickup = new Date(pickupDate);

                    if (typeOfRent === 'MONTHLY') {
                      // Each month equals 30 days
                      const totalDays = numberOfDays * 30;
                      pickup.setDate(pickup.getDate() + totalDays);
                    } else if (typeOfRent === 'YEARLY') {
                      // Add years
                      pickup.setFullYear(pickup.getFullYear() + numberOfDays);
                    }

                    return pickup.toISOString().split('T')[0];
                  };

                  // For daily rental, calculate automatically from dates
                  let displayValue = field.value || '';
                  if (isDaily) {
                    displayValue = calculateDaysFromDates().toString();
                  }

                  return (
                    <input
                      type="number"
                      className={`input flex-1 ${isDaily ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      min="1"
                      placeholder="Enter number"
                      disabled={isDaily}
                      value={displayValue}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        form.setFieldValue('numberOfDays', value);

                        // Auto-calculate dropoff date for MONTHLY/YEARLY
                        if (!isDaily && form.values.pickUpDate) {
                          const calculatedDropoff = calculateDropoffDate(value);
                          form.setFieldValue('dropOffDate', calculatedDropoff);
                        }
                      }}
                    />
                  );
                }}
              </Field>
              <span className="text-gray-600 font-medium min-w-fit">
                {typeOfRent === 'DAILY' && 'Days'}
                {typeOfRent === 'MONTHLY' && 'Months'}
                {typeOfRent === 'YEARLY' && 'Years'}
                {!typeOfRent && 'Period'}
              </span>
            </div>
          </div>
        );
      }}
    </Field>
  );
};

const DailyRateField = () => {
  const intl = useIntl();
  const { values } = useFormikContext<any>();

  // Get vehicle data to access pricing and vehicle details
  const { data: vehiclesData } = useQuery({
    queryKey: ['search-vehicles', '', values.pickUpDate, values.dropOffDate],
    queryFn: () =>
      searchVehicles({
        page: 0,
        offset: 0,
        size: 50,
        search: '',
        pickUpDate: values.pickUpDate,
        dropOffDate: values.dropOffDate
      }),
    enabled: Boolean(values.pickUpDate && values.dropOffDate)
  });

  const availableVehicles = vehiclesData?.data || [];
  const selectedVehicle = availableVehicles.find(
    (vehicle) => vehicle.vehicleId === values.vehicleId
  );

  return (
    <Field name="typeOfRent">
      {({ field: typeOfRentField }: FieldProps) => {
        const typeOfRent = typeOfRentField.value;

        const dailyLabel =
          typeOfRent === 'DAILY'
            ? intl.formatMessage(
                { id: 'RESERVATION.ADD.RENTAL_INFO.DAILY' },
                { defaultMessage: 'Daily Rate' }
              )
            : typeOfRent === 'MONTHLY'
              ? intl.formatMessage(
                  { id: 'RESERVATION.ADD.RENTAL_INFO.MONTHLY' },
                  { defaultMessage: 'Monthly Rate' }
                )
              : intl.formatMessage(
                  { id: 'RESERVATION.ADD.RENTAL_INFO.YEARLY' },
                  { defaultMessage: 'Yearly Rate' }
                );

        const rateLabel = intl.formatMessage(
          {
            id: `RESERVATION.ADD.RENTAL_INFO.DAILY_RATE`,
            defaultMessage: 'Daily Rate'
          },
          { period: dailyLabel }
        );

        const placeholder = intl.formatMessage(
          {
            id: 'RESERVATION.ADD.RENTAL_INFO.DAILY_RATE.PLACEHOLDER',
            defaultMessage: 'Enter rate'
          },
          {
            period: dailyLabel
          }
        );

        // Get pricing info based on rental type
        let minPrice: number | undefined, maxPrice: number | undefined;
        if (selectedVehicle) {
          if (typeOfRent === 'DAILY') {
            minPrice = selectedVehicle.dailyMinimumPrice ?? undefined;
            maxPrice = selectedVehicle.dailyMaximumPrice ?? undefined;
          } else if (typeOfRent === 'MONTHLY') {
            minPrice = selectedVehicle.monthlyMinimumPrice ?? undefined;
            maxPrice = selectedVehicle.monthlyMaximumPrice ?? undefined;
          } else if (typeOfRent === 'YEARLY') {
            minPrice = selectedVehicle.yearlyMinimumPrice ?? undefined;
            maxPrice = selectedVehicle.yearlyMaximumPrice ?? undefined;
          }
        }

        return (
          <div className="grid gap-2.5">
            <label className="form-label">{rateLabel}</label>

            <Field name="dailyRate">
              {({ field, form }: FieldProps) => (
                <div>
                  <input
                    type="number"
                    className="input"
                    min={minPrice || 0}
                    max={maxPrice || undefined}
                    step="0.01"
                    placeholder={placeholder}
                    value={field.value || minPrice || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      form.setFieldValue('dailyRate', value);
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value);
                      // If field is empty or NaN, set to minimum price
                      if (!value || isNaN(value)) {
                        if (minPrice) {
                          form.setFieldValue('dailyRate', minPrice);
                        }
                        return;
                      }
                      // Enforce minimum price validation
                      if (minPrice && value < minPrice) {
                        form.setFieldValue('dailyRate', minPrice);
                      }
                      // Enforce maximum price validation
                      if (maxPrice && value > maxPrice) {
                        form.setFieldValue('dailyRate', maxPrice);
                      }
                    }}
                  />
                  {/* Show min/max price as small text below input */}
                  {selectedVehicle && (minPrice || maxPrice) && (
                    <div className="text-xs text-gray-500 mt-1">
                      {minPrice && maxPrice ? (
                        <>
                          Min: {minPrice} • Max: {maxPrice}
                        </>
                      ) : (
                        <>Price: {minPrice || maxPrice}</>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Field>
          </div>
        );
      }}
    </Field>
  );
};

const InsuranceSection = () => {
  const intl = useIntl();

  const { data: servicesData } = useQuery({
    queryKey: ['additional-services'],
    queryFn: () => getAdditionalServices({ size: 100 })
  });

  const availableServices = servicesData?.data || [];
  const insuranceServices = availableServices.filter(
    (service) => service.status && service.type.toLowerCase().includes('insurance')
  );

  const getServiceName = (service: AdditionalService, locale: string) => {
    switch (locale) {
      case 'ar':
        return service.nameAr;
      case 'tr':
        return service.nameTr;
      default:
        return service.nameEn;
    }
  };

  return (
    <div className="grid gap-2.5">
      <label className="form-label">
        <FormattedMessage id="RESERVATION.ADD.INSURANCE.TITLE" defaultMessage="Insurance" />
      </label>

      <Field name="selectedInsurance">
        {({ form }: FieldProps) => {
          const selectedInsurance: string = form.values.selectedInsurance || '';

          const selectInsurance = (serviceId: string, price?: number) => {
            const service = insuranceServices.find((s) => s.id === serviceId);
            if (service) {
              // Clear any existing insurance from additionalServices
              const currentServices: ReservationRequestItem[] =
                form.values.additionalServices || [];
              const nonInsuranceServices = currentServices.filter(
                (s) => !insuranceServices.some((ins) => ins.id === s.id)
              );

              // Add the selected insurance
              const insuranceItem = {
                id: serviceId,
                quantity: 1,
                price: price || service.defaultPrice,
                name: getServiceName(service, intl.locale)
              };

              form.setFieldValue('selectedInsurance', serviceId);
              form.setFieldValue('additionalServices', [...nonInsuranceServices, insuranceItem]);
            }
          };

          const updateInsurancePrice = (serviceId: string, price: number) => {
            const currentServices: ReservationRequestItem[] = form.values.additionalServices || [];
            const existingIndex = currentServices.findIndex((s) => s.id === serviceId);

            if (existingIndex >= 0) {
              const updatedServices = [...currentServices];
              updatedServices[existingIndex] = {
                ...updatedServices[existingIndex],
                price
              };
              form.setFieldValue('additionalServices', updatedServices);
            }
          };

          const clearInsurance = () => {
            const currentServices: ReservationRequestItem[] = form.values.additionalServices || [];
            const nonInsuranceServices = currentServices.filter(
              (s) => !insuranceServices.some((ins) => ins.id === s.id)
            );
            form.setFieldValue('selectedInsurance', '');
            form.setFieldValue('additionalServices', nonInsuranceServices);
          };

          return (
            <div className="space-y-3">
              {insuranceServices.map((service) => {
                const isSelected = selectedInsurance === service.id;
                const currentServices: ReservationRequestItem[] =
                  form.values.additionalServices || [];
                const currentInsurance = currentServices.find((s) => s.id === service.id);
                const currentPrice = currentInsurance?.price || service.defaultPrice;

                return (
                  <div key={service.id} className="grid grid-cols-12 gap-3 p-3 border rounded-lg">
                    {/* Service Name */}
                    <div className="col-span-4">
                      <label className="text-sm font-medium">
                        {getServiceName(service, intl.locale)}
                      </label>
                      <p className="text-xs text-gray-500">{service.unit}</p>
                    </div>

                    {/* Price */}
                    <div className="col-span-3">
                      <label className="text-xs text-gray-600">
                        <FormattedMessage
                          id="RESERVATION.ADD.INSURANCE.PRICE"
                          defaultMessage="Price"
                        />
                      </label>
                      <input
                        type="number"
                        className="input w-full"
                        min={service.specialPrice}
                        max={service.defaultPrice}
                        step="0.01"
                        value={currentPrice}
                        placeholder={service.defaultPrice.toString()}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (isSelected) {
                            updateInsurancePrice(service.id, value);
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value);
                          if (isSelected) {
                            // If field is empty or NaN, set to minimum price
                            if (!value || isNaN(value)) {
                              updateInsurancePrice(service.id, service.specialPrice);
                              return;
                            }
                            // Enforce minimum price validation
                            if (value < service.specialPrice) {
                              updateInsurancePrice(service.id, service.specialPrice);
                            }
                            // Enforce maximum price validation
                            if (value > service.defaultPrice) {
                              updateInsurancePrice(service.id, service.defaultPrice);
                            }
                          }
                        }}
                      />
                      {service.specialPrice !== service.defaultPrice && (
                        <p className="text-xs text-gray-500">
                          Min: {service.specialPrice} | Max: {service.defaultPrice}
                        </p>
                      )}
                    </div>

                    {/* Selection */}
                    <div className="col-span-3">
                      <label className="text-xs text-gray-600 text-center block">
                        <FormattedMessage
                          id="RESERVATION.ADD.INSURANCE.SELECTION"
                          defaultMessage="Selection"
                        />
                      </label>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-light'}`}
                          onClick={() => {
                            if (isSelected) {
                              clearInsurance();
                            } else {
                              selectInsurance(service.id, currentPrice);
                            }
                          }}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-2 flex items-center justify-center">
                      {isSelected && (
                        <button
                          type="button"
                          onClick={() => clearInsurance()}
                          className="btn btn-sm btn-icon btn-danger"
                          title={intl.formatMessage({
                            id: 'COMMON.REMOVE',
                            defaultMessage: 'Remove'
                          })}
                        >
                          <KeenIcon icon="trash" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {insuranceServices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FormattedMessage
                    id="RESERVATION.ADD.INSURANCE.NO_INSURANCE_AVAILABLE"
                    defaultMessage="No insurance options available"
                  />
                </div>
              )}
            </div>
          );
        }}
      </Field>
    </div>
  );
};

const AdditionalServicesSection = () => {
  const intl = useIntl();

  const { data: servicesData } = useQuery({
    queryKey: ['additional-services'],
    queryFn: () => getAdditionalServices({ size: 100 })
  });

  const availableServices = servicesData?.data || [];
  const additionalServices = availableServices.filter(
    (service) => service.status && !service.type.toLowerCase().includes('insurance')
  );

  const getServiceName = (service: AdditionalService, locale: string) => {
    switch (locale) {
      case 'ar':
        return service.nameAr;
      case 'tr':
        return service.nameTr;
      default:
        return service.nameEn;
    }
  };

  return (
    <div className="grid gap-2.5">
      <label className="form-label">
        <FormattedMessage
          id="RESERVATION.ADD.ADDITIONAL_SERVICES.TITLE"
          defaultMessage="Additional Services"
        />
      </label>

      <Field name="additionalServices">
        {({ form }: FieldProps) => {
          // Track service quantities in local state-like object
          const serviceQuantities: { [key: string]: { quantity: number; price: number } } = {};

          // Initialize with current form values (excluding insurance)
          const currentServices: ReservationRequestItem[] = form.values.additionalServices || [];
          const insuranceServices = availableServices.filter(
            (service) => service.status && service.type.toLowerCase().includes('insurance')
          );

          // Only track non-insurance services
          currentServices
            .filter((service) => !insuranceServices.some((ins) => ins.id === service.id))
            .forEach((service) => {
              serviceQuantities[service.id] = {
                quantity: service.quantity || 0,
                price: service.price || 0
              };
            });

          const updateServiceQuantity = (serviceId: string, quantity: number, price: number) => {
            const currentServices: ReservationRequestItem[] = form.values.additionalServices || [];

            if (quantity > 0) {
              // Add or update service
              const existingIndex = currentServices.findIndex((s) => s.id === serviceId);
              const service = additionalServices.find((s) => s.id === serviceId);

              if (service) {
                const serviceItem = {
                  id: serviceId,
                  quantity,
                  price,
                  name: getServiceName(service, intl.locale)
                };

                if (existingIndex >= 0) {
                  // Update existing
                  const updatedServices = [...currentServices];
                  updatedServices[existingIndex] = serviceItem;
                  form.setFieldValue('additionalServices', updatedServices);
                } else {
                  // Add new
                  form.setFieldValue('additionalServices', [...currentServices, serviceItem]);
                }
              }
            } else {
              // Remove service (quantity is 0)
              const updatedServices = currentServices.filter((s) => s.id !== serviceId);
              form.setFieldValue('additionalServices', updatedServices);
            }
          };

          return (
            <div className="space-y-3">
              {additionalServices.map((service) => {
                const currentServiceData = currentServices.find((s) => s.id === service.id);
                const quantity = currentServiceData?.quantity || 0;
                const price = currentServiceData?.price || service.defaultPrice;

                return (
                  <div key={service.id} className="grid grid-cols-12 gap-3 p-3 border rounded-lg">
                    {/* Service Name */}
                    <div className="col-span-4">
                      <label className="text-sm font-medium">
                        {getServiceName(service, intl.locale)}
                      </label>
                      <p className="text-xs text-gray-500">
                        Max: {service.maxQuantity} {service.unit}(s)
                      </p>
                    </div>

                    {/* Price */}
                    <div className="col-span-3">
                      <label className="text-xs text-gray-600">
                        <FormattedMessage
                          id="RESERVATION.ADD.ADDITIONAL_SERVICES.PRICE"
                          defaultMessage="Price"
                        />
                      </label>
                      <input
                        type="number"
                        className="input w-full"
                        min={service.specialPrice}
                        max={service.defaultPrice}
                        step="0.01"
                        value={price}
                        placeholder={service.defaultPrice.toString()}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          updateServiceQuantity(service.id, quantity, value);
                        }}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value);
                          // If field is empty or NaN, set to minimum price
                          if (!value || isNaN(value)) {
                            updateServiceQuantity(service.id, quantity, service.specialPrice);
                            return;
                          }
                          // Enforce minimum price validation
                          if (value < service.specialPrice) {
                            updateServiceQuantity(service.id, quantity, service.specialPrice);
                          }
                          // Enforce maximum price validation
                          if (value > service.defaultPrice) {
                            updateServiceQuantity(service.id, quantity, service.defaultPrice);
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500">
                        Min: {service.specialPrice} | Max: {service.defaultPrice}
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-3">
                      <label className="text-xs text-gray-600 text-center block">
                        <FormattedMessage
                          id="RESERVATION.ADD.ADDITIONAL_SERVICES.QUANTITY"
                          defaultMessage="Quantity"
                        />
                      </label>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-icon btn-light"
                          onClick={() => {
                            const newQuantity = Math.max(0, quantity - 1);
                            updateServiceQuantity(service.id, newQuantity, price);
                          }}
                          disabled={quantity <= 0}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="input w-16 text-center px-1"
                          min={1}
                          max={service.maxQuantity}
                          value={quantity || ''}
                          placeholder="1"
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 1 && value <= service.maxQuantity) {
                              updateServiceQuantity(service.id, value, price);
                            }
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value);
                            // If field is empty or NaN, set to minimum quantity (1)
                            if (!value || isNaN(value) || value < 1) {
                              updateServiceQuantity(service.id, 1, price);
                              return;
                            }
                            // Enforce maximum quantity validation
                            if (value > service.maxQuantity) {
                              updateServiceQuantity(service.id, service.maxQuantity, price);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-icon btn-light"
                          onClick={() => {
                            const newQuantity = Math.min(service.maxQuantity, quantity + 1);
                            updateServiceQuantity(service.id, newQuantity, price);
                          }}
                          disabled={quantity >= service.maxQuantity}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-2 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => updateServiceQuantity(service.id, 0, price)}
                        className="btn btn-sm btn-icon btn-danger"
                        title={intl.formatMessage({
                          id: 'COMMON.REMOVE',
                          defaultMessage: 'Remove'
                        })}
                      >
                        <KeenIcon icon="trash" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {additionalServices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FormattedMessage
                    id="RESERVATION.ADD.ADDITIONAL_SERVICES.NO_SERVICES_AVAILABLE"
                    defaultMessage="No additional services available"
                  />
                </div>
              )}

              {/* Total Price Component */}
              <TotalPriceComponent form={form} />
            </div>
          );
        }}
      </Field>
    </div>
  );
};

const TotalPriceComponent = ({ form }: { form: any }) => {
  // Calculate total price
  const calculateTotalPrice = () => {
    const dailyRate = parseFloat(form.values.dailyRate) || 0;
    const numberOfDays = parseFloat(form.values.numberOfDays) || 0;
    const additionalServices: ReservationRequestItem[] = form.values.additionalServices || [];

    // Calculate rental cost
    const rentalCost = dailyRate * numberOfDays;

    // Calculate additional services cost
    const servicesCost = additionalServices.reduce((total, service) => {
      const quantity = service.quantity || 0;
      const price = service.price || 0;
      return total + quantity * price;
    }, 0);

    return rentalCost + servicesCost;
  };

  const totalAmount = calculateTotalPrice();

  return (
    <div className="text-center">
      <div className="text-sm font-medium text-blue-600">
        <FormattedMessage id="RESERVATION.ADD.TOTAL_AMOUNT" defaultMessage="TOTAL AMOUNT" />
      </div>
      <div className="text-2xl font-bold">
        {totalAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </div>
    </div>
  );
};

const VehicleSelectionSection = () => {
  const { values } = useFormikContext<any>();

  // Get vehicle data to show inline info
  const { data: vehiclesData } = useQuery({
    queryKey: ['search-vehicles', '', values.pickUpDate, values.dropOffDate],
    queryFn: () =>
      searchVehicles({
        page: 0,
        offset: 0,
        size: 50,
        search: '',
        pickUpDate: values.pickUpDate,
        dropOffDate: values.dropOffDate
      }),
    enabled: Boolean(values.pickUpDate && values.dropOffDate)
  });

  const availableVehicles = vehiclesData?.data || [];
  const selectedVehicle = availableVehicles.find(
    (vehicle) => vehicle.vehicleId === values.vehicleId
  );

  // Get pricing info based on rental type
  const typeOfRent = values.typeOfRent;
  let minPrice: number | undefined, maxPrice: number | undefined, kilometers: number | undefined;

  if (selectedVehicle) {
    if (typeOfRent === 'DAILY') {
      minPrice = selectedVehicle.dailyMinimumPrice ?? undefined;
      maxPrice = selectedVehicle.dailyMaximumPrice ?? undefined;
      kilometers = selectedVehicle.dailyKilometers ?? undefined;
    } else if (typeOfRent === 'MONTHLY') {
      minPrice = selectedVehicle.monthlyMinimumPrice ?? undefined;
      maxPrice = selectedVehicle.monthlyMaximumPrice ?? undefined;
      kilometers = selectedVehicle.monthlyKilometers ?? undefined;
    } else if (typeOfRent === 'YEARLY') {
      minPrice = selectedVehicle.yearlyMinimumPrice ?? undefined;
      maxPrice = selectedVehicle.yearlyMaximumPrice ?? undefined;
      kilometers = selectedVehicle.yearlyKilometers ?? undefined;
    }
  }

  return (
    <div className="grid gap-2.5">
      <label className="form-label">
        <FormattedMessage id="RESERVATION.ADD.VEHICLE.TITLE" defaultMessage="Vehicle" />
      </label>

      {/* Vehicle search - full width when no vehicle selected */}
      <div className={selectedVehicle ? 'grid lg:grid-cols-2 gap-3' : 'w-full'}>
        <VehicleSearch idFieldName="vehicleId" place="bottom" required={true} />

        {/* Inline vehicle info when selected */}
        {selectedVehicle && (
          <div className="flex items-center text-sm text-gray-600 lg:pl-2">
            <CarPlate plate={selectedVehicle.plate} className="flex-shrink-0" />
            {selectedVehicle.brand ||
              (selectedVehicle.model && (
                <>
                  <span className="mx-2">•</span>
                  <span>
                    {selectedVehicle.brand} {selectedVehicle.model}
                  </span>
                </>
              ))}
            {kilometers && (
              <>
                <span className="mx-2">•</span>
                <span>
                  {kilometers} <FormattedMessage id="VEHICLE.KILOMETERS" defaultMessage="KM" />
                </span>
              </>
            )}
            {(minPrice || maxPrice) && (
              <>
                <span className="mx-2">•</span>
                <span>
                  {minPrice && maxPrice ? `${minPrice}-${maxPrice}` : minPrice || maxPrice}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RentalInfoBlock = (props: AddReservationPageProps) => {
  return (
    <div className="card pb-2.5">
      <RentalInfo {...props} />
    </div>
  );
};

export { AdditionalServicesSection, InsuranceSection, RentalInfo, RentalInfoBlock };
