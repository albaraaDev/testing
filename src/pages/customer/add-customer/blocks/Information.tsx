import FileUpload from '@/components/FileUpload';
import { AddCustomerPageProps } from '../AddCustomerPage';
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/auth';
import RoleComponent from '@/components/RoleComponent';
import { FormattedMessage, useIntl } from 'react-intl';
import { getFormattedDate } from '@/utils';

const Information = (props: AddCustomerPageProps) => {
  const { customer, customerIdentityType } = props;

  const { currentUser } = useAuthContext();
  const [status, setStatus] = useState<boolean>(true);
  const intl = useIntl();

  useEffect(() => {
    if (customer?.status) {
      setStatus(customer.status);
    }
  }, [customer]);

  return (
    <>
      <div className="card-header" id="general_settings">
        <h3 className="card-title">
          <FormattedMessage id="CUSTOMER.ADD.INFORMATION.TITLE" />
        </h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="grid lg:grid-cols-2 gap-5">
          {(customerIdentityType === 'turkish' || customerIdentityType === 'foreign') && (
            <div className="flex flex-col gap-2.5">
              <label className="form-label">
                <FormattedMessage id="CUSTOMER.ADD.INFORMATION.NAME" />
              </label>
              <input
                required
                type="text"
                className="input"
                name="fullName"
                placeholder={intl.formatMessage({
                  id: 'CUSTOMER.ADD.INFORMATION.NAME.PLACEHOLDER'
                })}
                defaultValue={customer?.fullName || undefined}
              />
            </div>
          )}
          {customerIdentityType === 'company' && (
            <>
              <div className="flex flex-col gap-2.5">
                <label className="form-label">
                  <FormattedMessage id="CUSTOMER.ADD.INFORMATION.COMPANY_NAME" />
                </label>
                <input
                  required
                  type="text"
                  className="input"
                  name="companyName"
                  placeholder={intl.formatMessage({
                    id: 'CUSTOMER.ADD.INFORMATION.COMPANY_NAME.PLACEHOLDER'
                  })}
                  defaultValue={customer?.companyName || undefined}
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="form-label">
                  <FormattedMessage id="CUSTOMER.ADD.INFORMATION.COMPANY_OWNER_NAME" />
                </label>
                <input
                  required
                  type="text"
                  className="input"
                  name="fullName"
                  placeholder={intl.formatMessage({
                    id: 'CUSTOMER.ADD.INFORMATION.COMPANY_OWNER_NAME.PLACEHOLDER'
                  })}
                  defaultValue={customer?.fullName || undefined}
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="form-label">
                  <FormattedMessage id="CUSTOMER.ADD.INFORMATION.COMPANY_TAX_NUMBER" />
                </label>
                <input
                  required
                  type="text"
                  className="input"
                  name="idNumber"
                  placeholder={intl.formatMessage({
                    id: 'CUSTOMER.ADD.INFORMATION.COMPANY_TAX_NUMBER.PLACEHOLDER'
                  })}
                  defaultValue={customer?.idNumber || undefined}
                />
              </div>
            </>
          )}
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="CUSTOMER.ADD.INFORMATION.DATE_OF_BIRTH" />
            </label>
            <input
              required
              type="date"
              className="input w-full dark:[color-scheme:dark]"
              name="dateOfBirth"
              placeholder={intl.formatMessage({ id: 'COMMON.DATE.FORMAT' })}
              defaultValue={
                customer?.dateOfBirth ||
                getFormattedDate(undefined, currentUser?.timezone || undefined)
              }
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              {customerIdentityType === 'turkish' && (
                <FormattedMessage id="CUSTOMER.ADD.INFORMATION.TURKISH.FRONT_PHOTO" />
              )}
              {customerIdentityType === 'foreign' && (
                <FormattedMessage id="CUSTOMER.ADD.INFORMATION.FOREIGN.FRONT_PHOTO" />
              )}
              {customerIdentityType === 'company' && (
                <FormattedMessage id="CUSTOMER.ADD.INFORMATION.COMPANY.FRONT_PHOTO" />
              )}
            </label>
            <FileUpload
              name="frontPhotoNationalIdFile"
              isUploaded={!!customer?.frontNationalIdPhoto}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              {customerIdentityType === 'turkish' && (
                <FormattedMessage id="CUSTOMER.ADD.INFORMATION.TURKISH.BACK_PHOTO" />
              )}
              {customerIdentityType === 'foreign' && (
                <FormattedMessage id="CUSTOMER.ADD.INFORMATION.FOREIGN.BACK_PHOTO" />
              )}
              {customerIdentityType === 'company' && (
                <FormattedMessage id="CUSTOMER.ADD.INFORMATION.COMPANY.BACK_PHOTO" />
              )}
            </label>
            <FileUpload
              name="backPhotoNationalIdFile"
              isUploaded={!!customer?.backNationalIdPhoto}
            />
          </div>
        </div>
        {customerIdentityType === 'foreign' && (
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="CUSTOMER.ADD.INFORMATION.PASSPORT_NUMBER" />
            </label>
            <input
              required
              type="text"
              className="input"
              name="passportNumber"
              placeholder={intl.formatMessage({
                id: 'CUSTOMER.ADD.INFORMATION.PASSPORT_NUMBER.PLACEHOLDER'
              })}
              defaultValue={customer?.passportNumber || undefined}
            />
          </div>
        )}
        <RoleComponent role={['ADMIN', 'SUPER_ADMIN', 'MANAGER']}>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="CUSTOMER.ADD.INFORMATION.STATUS" />
            </label>
            <div className="flex items-center">
              <div className="flex items-center gap-2.5">
                <div className="switch switch-sm">
                  <input
                    name="status"
                    type="checkbox"
                    value="true"
                    checked={status}
                    onChange={() => setStatus((s) => !s)}
                  />
                </div>
              </div>
            </div>
          </div>
        </RoleComponent>
        <RoleComponent role="user">
          <input type="hidden" name="status" value={`${customer?.status || false}`} />
        </RoleComponent>
      </div>
    </>
  );
};

const InformationBlock = (props: AddCustomerPageProps) => {
  return (
    <div className="card pb-2.5">
      <Information {...props} />
    </div>
  );
};

export { Information, InformationBlock };
