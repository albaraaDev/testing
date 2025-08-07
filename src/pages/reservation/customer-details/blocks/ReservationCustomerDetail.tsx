import { CustomerDetails } from '@/api/customers';
import { ReservationDetails } from '@/api/reservations';
import { MailIcon, MapIcon, PhoneIcon } from '@/assets/svg';
import CarBrandImage from '@/components/CarBrandsImage';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import { FormattedMessage, useIntl } from 'react-intl';

interface ReservationCustomerDetailProps {
  reservation: ReservationDetails;
  customer?: CustomerDetails | null;
}

const ReservationCustomerDetail = ({ reservation, customer }: ReservationCustomerDetailProps) => {
  const intl = useIntl();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const DurationCard = ({
    duration,
    typeOfRent,
    color
  }: {
    duration: number;
    typeOfRent: string;
    color: string;
  }) => {
    const getPeriodLabel = () => {
      switch (typeOfRent) {
        case 'DAILY':
          return duration === 1 ? 'day' : 'days';
        case 'MONTHLY':
          return duration === 1 ? 'month' : 'months';
        case 'YEARLY':
          return duration === 1 ? 'year' : 'years';
        default:
          return 'days';
      }
    };

    const getSubtitleKey = () => {
      switch (typeOfRent) {
        case 'DAILY':
          return 'RESERVATION.DURATION.NUMBER_OF_RENTAL_DAYS';
        case 'MONTHLY':
          return 'RESERVATION.DURATION.NUMBER_OF_RENTAL_MONTHS';
        case 'YEARLY':
          return 'RESERVATION.DURATION.NUMBER_OF_RENTAL_YEARS';
        default:
          return 'RESERVATION.DURATION.NUMBER_OF_RENTAL_DAYS';
      }
    };

    return (
      <div className="border border-dashed border-[#E4E6EF] rounded-md p-4 w-64">
        <div className="text-2xl font-bold text-gray-800 mb-1">
          {duration} {getPeriodLabel()}
        </div>
        <div className="text-s text-gray-600 mb-2">N/A</div>
        <div className="text-m font-semibold" style={{ color }}>
          <FormattedMessage id={getSubtitleKey()} />
        </div>
      </div>
    );
  };

  const DateCard = ({
    date,
    time,
    typeKey,
    color
  }: {
    date: string;
    time?: string;
    typeKey: string;
    color: string;
  }) => (
    <div className="border border-dashed border-[#E4E6EF] rounded-md p-4 w-64">
      <div className="text-2xl font-bold text-gray-800 mb-1">{formatDate(date)}</div>
      <div className="text-s text-gray-600 mb-2">{time || 'N/A'}</div>
      <div className="text-m font-semibold" style={{ color }}>
        <FormattedMessage id={typeKey} />
      </div>
    </div>
  );

  const getBrandChip = () => {
    return <CarBrandImage brandName="generic" className="w-10 h-10" />;
  };

  const getCustomerTypeChip = () => {
    if (!customer) return null;

    const type = customer.identityType || 'foreign';
    let chipText = '';

    switch (type) {
      case 'turkish':
        chipText = intl.formatMessage({ id: 'CUSTOMER.TYPE.TURKISH' });
        break;
      case 'foreign':
        chipText = intl.formatMessage({ id: 'CUSTOMER.TYPE.FOREIGN' });
        break;
      case 'company':
        chipText = intl.formatMessage({ id: 'CUSTOMER.TYPE.COMPANY' });
        break;
      default:
        chipText = intl.formatMessage({ id: 'CUSTOMER.TYPE.UNKNOWN' });
    }

    return (
      <span
        className="inline-flex items-center justify-center px-6 py-3 rounded-md text-xs font-bold border"
        style={{
          backgroundColor: '#A1A5B70D',
          borderColor: '#A1A5B7',
          color: '#A1A5B7',
          minWidth: '88px',
          height: '42px'
        }}
      >
        {chipText}
      </span>
    );
  };

  const getRentTypeChip = () => {
    return (
      <span
        className="inline-flex items-center justify-center px-6 py-3 rounded-md text-xs font-bold border"
        style={{
          backgroundColor: '#A1A5B70D',
          borderColor: '#A1A5B7',
          color: '#A1A5B7',
          minWidth: '88px',
          height: '42px'
        }}
      >
        <FormattedMessage id={`RESERVATIONS.TYPE_OF_RENT.${reservation.typeOfRent}`} />
      </span>
    );
  };

  const getNationalityDisplay = () => {
    if (!customer) return null;

    const nationality = customer.nationality || customer.country || 'Unknown';

    return (
      <div
        style={{
          width: '145px',
          height: '21px',
          fontFamily: 'Poppins',
          fontStyle: 'normal',
          fontWeight: 500,
          fontSize: '14px',
          lineHeight: '21px',
          color: '#B5B5C3',
          flex: 'none',
          order: 1,
          flexGrow: 0
        }}
      >
        {nationality}
      </div>
    );
  };

  return (
    <div className="card shadow-md rounded-lg overflow-hidden">
      <div className="card-body p-6 grid xl:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {reservation.customerFullName || customer?.fullName}
          </h2>
          {getNationalityDisplay()}

          {/* First line: email, phone1, phone2 */}
          <div className="grid grid-cols-3 gap-4 my-4">
            <div className="flex items-center space-x-1 text-gray-600">
              <MailIcon />
              <span
                style={{
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '21px',
                  color: '#B5B5C3'
                }}
              >
                {customer?.email || 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <PhoneIcon />
              <span
                style={{
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '21px',
                  color: '#B5B5C3'
                }}
              >
                {customer?.firstPhoneCode} {customer?.firstPhone}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <PhoneIcon />
              <span
                style={{
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '21px',
                  color: '#B5B5C3'
                }}
              >
                {customer?.secondPhoneCode} {customer?.secondPhone}
              </span>
            </div>
          </div>

          {/* Second line: address country, address city, address text */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-1 text-gray-600">
              <MapIcon />
              <span
                style={{
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '21px',
                  color: '#B5B5C3'
                }}
              >
                {customer?.country || 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <MapIcon />
              <span
                style={{
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '21px',
                  color: '#B5B5C3'
                }}
              >
                {customer?.city || 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <MapIcon />
              <span
                style={{
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '21px',
                  color: '#B5B5C3'
                }}
              >
                {customer?.address || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-start xl:justify-end gap-4 flex-wrap">
          <CarPlate plate="34 JYT 456" />
          {getBrandChip()}
          {getCustomerTypeChip()}
          {getRentTypeChip()}
        </div>
      </div>

      {/* Date Cards Section */}
      <div className="card-body pt-0 px-6 pb-6">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:max-w-fit">
          <DateCard
            date={reservation.createdAt}
            time={formatTime(reservation.createdAt)}
            typeKey="RESERVATION.DATE_TYPE.RENTAL"
            color="#B5B5C3"
          />
          <DateCard
            date={reservation.pickUpDate}
            time={reservation.pickUpTime}
            typeKey="RESERVATION.DATE_TYPE.PICKUP"
            color="#50CD89"
          />
          <DateCard
            date={reservation.dropOffDate}
            time={reservation.dropOffTime}
            typeKey="RESERVATION.DATE_TYPE.DROPOFF"
            color="#FF0000"
          />
          <DurationCard
            duration={reservation.numberOfDays}
            typeOfRent={reservation.typeOfRent}
            color="#B5B5C3"
          />
        </div>
      </div>
    </div>
  );
};

export default ReservationCustomerDetail;
