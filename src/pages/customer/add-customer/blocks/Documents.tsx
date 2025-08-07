import FileUpload from '@/components/FileUpload';
import { AddCustomerPageProps } from '../AddCustomerPage';
import { FormattedMessage, useIntl } from 'react-intl';

const Documents = (props: AddCustomerPageProps) => {
  const { customer } = props;

  const intl = useIntl();

  return (
    <>
      <div className="card-header" id="general_settings">
        <h3 className="card-title">
          <FormattedMessage id="CUSTOMER.ADD.DOCUMENTS.TITLE" />
        </h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="CUSTOMER.ADD.DOCUMENTS.ID_NUMBER" />
            </label>
            <input
              required
              type="text"
              className="input"
              name="idNumber"
              placeholder={intl.formatMessage({
                id: 'CUSTOMER.ADD.DOCUMENTS.ID_NUMBER.PLACEHOLDER'
              })}
              defaultValue={customer?.idNumber || undefined}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="CUSTOMER.ADD.DOCUMENTS.LICENSE_ISSUE_DATE" />
            </label>
            <input
              required
              type="date"
              className="input w-full dark:[color-scheme:dark]"
              name="licenseIssueDate"
              placeholder={intl.formatMessage({ id: 'COMMON.DATE.FORMAT' })}
              defaultValue={customer?.licenseIssueDate || undefined}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="CUSTOMER.ADD.DOCUMENTS.LICENSE_EXPIRY_DATE" />
            </label>
            <input
              required
              type="date"
              className="input w-full dark:[color-scheme:dark]"
              name="licenseExpiryDate"
              placeholder={intl.formatMessage({ id: 'COMMON.DATE.FORMAT' })}
              defaultValue={customer?.licenseExpiryDate || undefined}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <label className="form-label">
            <FormattedMessage id="CUSTOMER.ADD.DOCUMENTS.LICENSE_PLACE_OF_ISSURANCE" />
          </label>
          <input
            required
            className="input w-full dark:[color-scheme:dark]"
            name="licensePlace"
            placeholder={intl.formatMessage({
              id: 'CUSTOMER.ADD.DOCUMENTS.LICENSE_PLACE_OF_ISSURANCE.PLACEHOLDER'
            })}
            defaultValue={customer?.licensePlace || undefined}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="CUSTOMER.ADD.DOCUMENTS.FRONT_LICENSE_PHOTO" />
            </label>
            <FileUpload
              name="frontDrivingLicensePhotoFile"
              isUploaded={!!customer?.frontDrivingLicensePhoto}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="CUSTOMER.ADD.DOCUMENTS.BACK_LICENSE_PHOTO" />
            </label>
            <FileUpload
              name="backDrivingLicensePhotoFile"
              isUploaded={!!customer?.backDrivingLicensePhoto}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const DocumentsBlock = (props: AddCustomerPageProps) => {
  return (
    <div className="card pb-2.5">
      <Documents {...props} />
    </div>
  );
};

export { Documents, DocumentsBlock };
