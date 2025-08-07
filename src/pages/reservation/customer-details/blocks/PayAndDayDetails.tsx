import { ReservationDetails } from '@/api/reservations';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

const PayAndDayDetails = ({ reservation }: { reservation: ReservationDetails }) => {
  const intl = useIntl();

  // collect day details
  const dayDetails = useMemo(() => {
    if (!reservation) return null;

    const currentDate = new Date();
    const pickupDate = new Date(reservation.pickUpDate);

    // Basic Period
    const basicPeriod = reservation.numberOfDays;

    // Used Period
    let usedPeriod = 0;
    if (currentDate >= pickupDate) {
      const usedDays = Math.floor(
        (currentDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      usedPeriod = Math.min(usedDays, basicPeriod);
    }

    // Remaining Period
    const remainingPeriod = Math.max(0, basicPeriod - usedPeriod);

    return {
      basicPeriod,
      usedPeriod,
      remainingPeriod
    };
  }, [reservation]);

  // collect payment details
  const payDetails = useMemo(() => {
    if (!reservation) return null;

    const items = [];

    // Daily Rate
    items.push({
      name: intl.formatMessage({ id: 'RESERVATION.PAY_DETAILS.DAILY_PRICE' }),
      amount: reservation.dailyRate * reservation.numberOfDays
    });

    // Additional Services
    const additionalServices =
      reservation.reservationItems?.filter((item) => item.additionalServiceType === 'service') ||
      [];

    additionalServices.forEach((service) => {
      items.push({
        name: service.name,
        amount: service.total
      });
    });

    // Insurance
    if (reservation.virtualInsurance) {
      items.push({
        name: intl.formatMessage({ id: 'RESERVATION.PAY_DETAILS.INSURANCE' }),
        amount: 0
      });
    }

    // Discount
    if (reservation.discount) {
      items.push({
        name: intl.formatMessage({ id: 'RESERVATION.PAY_DETAILS.DISCOUNT' }),
        amount: -reservation.discount
      });
    }

    return {
      items,
      total: reservation.totalAmount
    };
  }, [reservation, intl]);

  if (!reservation || !dayDetails || !payDetails) {
    return null;
  }

  return (
    <div className="mt-5 grid xl:grid-cols-2 gap-5">
      {/* Pay Details */}
      <div className="border border-dashed border-gray-300 rounded-lg p-4">
        <h2 className="font-semibold mb-4 text-dark dark:text-white/70">
          <FormattedMessage id="RESERVATION.PAY_DETAILS.TITLE" />
        </h2>
        <div className="space-y-3">
          {payDetails.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="">{item.name}</span>
              <span className="font-medium">${item.amount.toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-indigo-600 font-semibold text-lg">
                <FormattedMessage id="RESERVATION.PAY_DETAILS.TOTAL" />
              </span>
              <span className="font-bold text-indigo-600 text-lg">
                ${payDetails.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Day Details */}
      <div className="border border-dashed border-gray-300 rounded-lg p-4">
        <h2 className="font-semibold mb-4 text-dark dark:text-white/70">
          <FormattedMessage id="RESERVATION.DAY_DETAILS.TITLE" />
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              <FormattedMessage id="RESERVATION.DAY_DETAILS.BASIC_PERIOD" />
            </span>
            <span className="font-bold text-lg">
              {dayDetails.basicPeriod} <FormattedMessage id="COMMON.DAY" />
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              <FormattedMessage id="RESERVATION.DAY_DETAILS.USED_PERIOD" />
            </span>
            <span className="font-bold text-lg">
              {dayDetails.usedPeriod} <FormattedMessage id="COMMON.DAY" />
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              <FormattedMessage id="RESERVATION.DAY_DETAILS.REMAINING_PERIOD" />
            </span>
            <span className="font-bold text-lg">
              {dayDetails.remainingPeriod} <FormattedMessage id="COMMON.DAY" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayAndDayDetails;
