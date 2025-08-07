import { getCustomerDetails, CustomerDetails, identityTypeKey } from '@/api/customers';
import { Container } from '@/components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import FileList, { FileInfo } from '@/components/FileList';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAppRouting } from '@/routing/useAppRouting';
import Toolbar from './blocks/Toolbar';
import { CalendarIcon, MailIcon, MapIcon, PhoneIcon } from '@/assets/svg';
import { CustomerStatusDropdown } from '../blocks/CustomerStatusDropdown';
import ReservationsGridView from '@/pages/reservation/components/ReservationsGridView';

const CustomerDetailsPage = () => {
  const intl = useIntl();
  const { id } = useParams();
  const navigate = useAppRouting();
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);

  const refetchCustomer = useCallback(() => {
    if (!id) return;
    getCustomerDetails(id)
      .then((data) => {
        setCustomer(data);
      })
      .catch(() => {
        navigate('/error/404');
      });
  }, [id, navigate]);

  useEffect(() => {
    refetchCustomer();
  }, [refetchCustomer]);

  const files = useMemo(() => {
    if (!customer) return [];

    const files: FileInfo[] = [];

    if (customer.taxNumberPhoto) {
      files.push({
        name: intl.formatMessage({ id: 'CUSTOMER.ADD.DOCUMENTS.TAX_NUMBER_PHOTO' }),
        url: customer.taxNumberPhoto ?? undefined
      });
    }
    if (customer.companyLogoPhoto) {
      files.push({
        name: intl.formatMessage({ id: 'CUSTOMER.ADD.DOCUMENTS.COMPANY_LOGO_PHOTO' }),
        url: customer.companyLogoPhoto ?? undefined
      });
    }
    if (customer.frontNationalIdPhoto) {
      files.push({
        name: intl.formatMessage({ id: 'CUSTOMER.ADD.DOCUMENTS.FRONT_NATIONAL_ID_PHOTO' }),
        url: customer.frontNationalIdPhoto ?? undefined
      });
    }
    if (customer.backNationalIdPhoto) {
      files.push({
        name: intl.formatMessage({ id: 'CUSTOMER.ADD.DOCUMENTS.BACK_NATIONAL_ID_PHOTO' }),
        url: customer.backNationalIdPhoto ?? undefined
      });
    }
    if (customer.passportPhoto) {
      files.push({
        name: intl.formatMessage({ id: 'CUSTOMER.ADD.DOCUMENTS.PASSPORT_PHOTO' }),
        url: customer.passportPhoto ?? undefined
      });
    }
    if (customer.lastEntryPhoto) {
      files.push({
        name: intl.formatMessage({ id: 'CUSTOMER.ADD.DOCUMENTS.LAST_ENTRY_PHOTO' }),
        url: customer.lastEntryPhoto ?? undefined
      });
    }
    if (customer.frontDrivingLicensePhoto) {
      files.push({
        name: intl.formatMessage({ id: 'CUSTOMER.ADD.DOCUMENTS.FRONT_DRIVING_LICENSE_PHOTO' }),
        url: customer.frontDrivingLicensePhoto ?? undefined
      });
    }
    if (customer.backDrivingLicensePhoto) {
      files.push({
        name: intl.formatMessage({ id: 'CUSTOMER.ADD.DOCUMENTS.BACK_DRIVING_LICENSE_PHOTO' }),
        url: customer.backDrivingLicensePhoto ?? undefined
      });
    }

    return files;
  }, [customer, intl]);

  if (!id) {
    navigate('/error/404');
    return null;
  }

  if (!customer) {
    return null;
  }

  return (
    <Container className="mb-10 flex flex-col gap-6">
      <Toolbar />

      <div className="card shadow-md rounded-lg overflow-hidden">
        <div className="card-body p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{customer.fullName}</h2>
            {customer.identityType && (
              <p className="text-gray-400">
                <FormattedMessage id={identityTypeKey(customer.identityType)} />
              </p>
            )}
          </div>
          <CustomerStatusDropdown customer={customer} refetchCustomers={refetchCustomer} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4 mx-auto justify-center">
          <div className="flex items-center space-x-1 text-gray-600">
            <CalendarIcon />
            <span>{customer.dateOfBirth}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <MailIcon />
            <span>{customer.email}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <PhoneIcon />
            <span>
              {customer.firstPhoneCode} {customer.firstPhone}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <PhoneIcon />
            <span>
              {customer.secondPhoneCode} {customer.secondPhone}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <MapIcon />
            <span>{customer.country}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <MapIcon />
            <span>{customer.city}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <MapIcon />
            <span>{customer.address}</span>
          </div>
        </div>
      </div>

      <ReservationsGridView customerId={customer.id} searchQuery="" />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card shadow-md rounded-lg overflow-hidden">
          <div className="card-body p-8">
            <div className="flex gap-3 items-center"></div>
            <div className="flex flex-col space-y-4 md:space-y-0 md:space-x-4">
              <h2 className="text-xl font-semibold mb-4 text-dark dark:text-white/70">
                <FormattedMessage id="VEHICLE.DETAILS.DOCUMENTS" />
              </h2>
              <FileList files={files} />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CustomerDetailsPage;
