import FileUpload from '@/components/FileUpload';
import { AddDriverPageProps } from '../AddDriverPage';
import { FormattedMessage, useIntl } from 'react-intl';

const Documents = ({ driver }: AddDriverPageProps) => {
  const intl = useIntl();

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="general_settings">
        <h3 className="card-title">
          <FormattedMessage id="DRIVER.ADD.TAB.DOCUMENTS" />
        </h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DRIVER.ADD.DOCUMENTS.LICENSE_NUMBER" />
            </label>
            <input
              required
              type="text"
              className="input"
              name="licenseSerialNumber"
              placeholder={intl.formatMessage({
                id: 'DRIVER.ADD.DOCUMENTS.LICENSE_NUMBER.PLACEHOLDER'
              })}
              defaultValue={driver?.licenseNumber}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DRIVER.ADD.DOCUMENTS.LICENSE_ISSUE_DATE" />
            </label>
            <input
              required
              type="date"
              className="input w-full dark:[color-scheme:dark]"
              name="licenseIssueDate"
              defaultValue={driver?.licenseIssueDate}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DRIVER.ADD.DOCUMENTS.LICENSE_EXPIRY_DATE" />
            </label>
            <input
              required
              type="date"
              className="input w-full dark:[color-scheme:dark]"
              name="licenseExpiryDate"
              defaultValue={driver?.licenseExpiry}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <label className="form-label">
            <FormattedMessage id="DRIVER.ADD.DOCUMENTS.LICENSE_PLACE" />
          </label>
          <input
            required
            type="text"
            className="input"
            placeholder={intl.formatMessage({
              id: 'DRIVER.ADD.DOCUMENTS.LICENSE_PLACE.PLACEHOLDER'
            })}
            name="licensePlace"
            defaultValue={driver?.licensePlace}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DRIVER.ADD.DOCUMENTS.FRONT_LICENSE_PHOTO" />
            </label>
            <FileUpload
              name="frontDrivingLicensePhotoFile"
              isUploaded={!!driver?.frontDrivingLicensePhoto}
            />
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DRIVER.ADD.DOCUMENTS.BACK_LICENSE_PHOTO" />
            </label>
            <FileUpload
              name="backDriverLicensePhotoFile"
              isUploaded={!!driver?.backDriverLicensePhoto}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Documents };
