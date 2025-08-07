import { getCustomerDetails } from '@/api/customers';
import { getReservations, ReservationDetails } from '@/api/reservations';
import { KeenIcon } from '@/components';
import { Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { AutoSizer, List } from 'react-virtualized';

interface ReservationSearchProps {
  initialSearch?: {
    id: string;
    customerId: string;
    vehiclePlate: string;
  };
  required?: boolean;
  place?: 'top' | 'bottom';
}

export const ReservationSearch = ({
  initialSearch,
  required = false,
  place = 'bottom'
}: ReservationSearchProps) => {
  const { formatMessage } = useIntl();
  const [privateSearch, setPrivateSearch] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<
    | {
        id: string;
        customerId: string;
        vehiclePlate: string;
      }
    | undefined
  >(undefined);

  const [shownReservations, setShownReservations] = useState<ReservationDetails[]>([]);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Query reservations with search
  const { data: reservationsData, isLoading } = useQuery({
    queryKey: ['reservations-search', privateSearch],
    queryFn: () =>
      getReservations({
        pageIndex: 0,
        pageSize: 50,
        filters: privateSearch ? [{ id: '__any', value: privateSearch }] : [],
        sorting: [{ id: 'createdAt', desc: true }]
      }),
    enabled: true // Always enabled for search functionality
  });

  const availableReservations = reservationsData?.data || [];

  const { data: customerDetails } = useQuery({
    queryKey: ['customer-details', initialSearch?.customerId],
    queryFn: () => getCustomerDetails(initialSearch?.customerId!),
    enabled: Boolean(initialSearch?.customerId)
  });

  // Filter reservations based on search (additional client-side filtering)
  useEffect(() => {
    if (privateSearch) {
      const filtered = availableReservations.filter(
        (reservation) =>
          reservation.customerFullName?.toLowerCase().includes(privateSearch.toLowerCase()) ||
          reservation.vehiclePlate?.toLowerCase().includes(privateSearch.toLowerCase()) ||
          reservation.id?.toLowerCase().includes(privateSearch.toLowerCase())
      );
      setShownReservations(filtered);
    } else {
      setShownReservations(availableReservations);
    }
  }, [privateSearch, availableReservations]);

  // Update search display when reservation is selected
  useEffect(() => {
    if (selectedReservation) {
      const displayText = `#${selectedReservation.id.slice(-12)} - ${customerDetails?.fullName} - ${selectedReservation.vehiclePlate}`;
      setPrivateSearch(displayText);
    }
  }, [selectedReservation]);

  // Set initial values from props in edit mode
  useEffect(() => {
    if (initialSearch && customerDetails?.fullName) {
      const displayText = `#${initialSearch.id.slice(-12)} - ${customerDetails.fullName} - ${initialSearch.vehiclePlate}`;
      setPrivateSearch(displayText);
      setSelectedReservation({
        id: initialSearch.id,
        customerId: initialSearch.customerId || '',
        vehiclePlate: initialSearch.vehiclePlate
      });
    }
  }, [initialSearch, customerDetails]);

  return (
    <>
      <div className="grid gap-2.5">
        <label className="form-label">
          <FormattedMessage
            id="MAINTENANCE.FORM.RESERVATION"
            defaultMessage="Related Reservation"
          />
        </label>
        <div className="input shrink-0 relative">
          <input
            type="text"
            placeholder={formatMessage({
              id: 'RESERVATION.SEARCH.PLACEHOLDER',
              defaultMessage: 'Search by customer name, vehicle plate, or reservation ID...'
            })}
            value={privateSearch}
            onChange={(e) => setPrivateSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            required={required}
          />
          <button
            className="btn btn-icon"
            type="button"
            onClick={() => {
              setPrivateSearch('');
              setSelectedReservation(undefined);
            }}
          >
            <KeenIcon icon="cross" />
          </button>
          {(focused || hovered) && (
            <div
              className={`absolute ${place === 'top' ? 'bottom' : 'top'}-[calc(100%+4px)] px-2 left-0 w-full max-h-96 card dark:border-gray-200 mt-1 z-50`}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {isLoading ? (
                <div className="p-2">
                  <FormattedMessage id="COMMON.LOADING" />
                </div>
              ) : shownReservations.length > 0 ? (
                <AutoSizer disableHeight>
                  {({ width }) => (
                    <List
                      className="scrollable-y !overflow-x-hidden"
                      height={Math.min(384, shownReservations.length * 60)} // Dynamic height
                      width={width}
                      rowCount={shownReservations.length}
                      rowHeight={60} // Increased for two-line display
                      rowRenderer={({ key, index, style }) => {
                        const reservation = shownReservations[index];

                        if (!reservation) {
                          return <Skeleton key={key} style={style} height={60} />;
                        }

                        const formatStatus = (status: string) => {
                          return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
                        };

                        const getStatusColor = (status: string) => {
                          switch (status.toUpperCase()) {
                            case 'COMPLETED':
                              return 'text-green-600';
                            case 'CONFIRMED':
                              return 'text-blue-600';
                            case 'INPROGRESS':
                              return 'text-yellow-600';
                            case 'CANCELED':
                              return 'text-red-600';
                            default:
                              return 'text-gray-600';
                          }
                        };

                        return (
                          <div key={key} style={style}>
                            <div
                              className="p-3 hover:bg-gray-50 flex flex-col gap-1 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                              onClick={() => {
                                const reservationData = {
                                  id: reservation.id,
                                  customerId: reservation.customerId,
                                  customerName: reservation.customerFullName || 'Unknown Customer',
                                  vehiclePlate: reservation.vehiclePlate || 'No Plate'
                                };
                                setSelectedReservation(reservationData);
                                setHovered(false);
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-sm text-gray-800">
                                  #{reservation.id.slice(-8)} - {reservation.customerFullName}
                                </span>
                                <span
                                  className={`text-xs font-medium ${getStatusColor(reservation.status)}`}
                                >
                                  {formatStatus(reservation.status)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-600">
                                <span className="font-mono">{reservation.vehiclePlate}</span>
                                <span>
                                  {reservation.pickUpDate} → {reservation.dropOffDate}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                  )}
                </AutoSizer>
              ) : privateSearch ? (
                <div className="p-3 text-gray-500 text-sm text-center">
                  <FormattedMessage
                    id="RESERVATION.SEARCH.NO_RESULTS"
                    defaultMessage="No reservations found matching your search"
                  />
                </div>
              ) : (
                <div className="p-3 text-gray-500 text-sm text-center">
                  <FormattedMessage
                    id="RESERVATION.SEARCH.TYPE_TO_SEARCH"
                    defaultMessage="Type to search reservations..."
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden inputs for form submission */}
      <input type="hidden" name="reservationId" value={selectedReservation?.id || ''} />
      <input type="hidden" name="customerId" value={selectedReservation?.customerId || ''} />
    </>
  );
};
