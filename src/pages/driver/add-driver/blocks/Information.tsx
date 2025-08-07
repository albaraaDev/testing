import FileUpload from '@/components/FileUpload';
import { useState } from 'react';
import { AddDriverPageProps } from '../AddDriverPage';
import { VehicleSearch } from './VehicleSearch';
import { FormattedMessage, useIntl } from 'react-intl';

const Information = ({ driver }: AddDriverPageProps) => {
  const intl = useIntl();
  const [selectedType, setSelectedType] = useState(
    driver?.identityType === 'Passport' ? 'foreign' : 'turkish'
  );

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="general_settings">
        <h3 className="card-title">{intl.formatMessage({ id: 'DRIVER.ADD.TAB.INFORMATION' })}</h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DRIVER.ADD.FULL_NAME" />
            </label>
            <input
              required
              type="text"
              className="input"
              name="fullName"
              placeholder={intl.formatMessage({ id: 'DRIVER.ADD.FULL_NAME' })}
              defaultValue={driver?.driver.name}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="form-label">
              <FormattedMessage id="DRIVER.ADD.DATE_OF_BIRTH" />
            </label>
            <input
              required
              type="date"
              className="input w-full dark:[color-scheme:dark]"
              name="dateOfBirth"
              placeholder="DD/MM/YYYY"
              defaultValue={driver?.dateOfBirth}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <label className="form-label">
            <FormattedMessage id="DRIVER.ADD.IDENTITY_TYPE" />
          </label>
          <div className="grid md:grid-cols-2 gap-4 w-full">
            {['Turkish', 'Foreign'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type.toLowerCase())}
                className={`
              px-6 py-2 border border-dashed rounded-md dark:bg-light-active dark:light-active
              ${selectedType === type.toLowerCase() ? 'border-blue-500' : 'border-gray-300'}
              hover:bg-gray-100 bg-gray-50 transition-colors
              flex items-center gap-2
            `}
              >
                <div
                  className={`
                w-4 h-4 rounded-full bg-gray-200
                ${
                  selectedType === type.toLowerCase()
                    ? 'border-4 border-blue-500'
                    : 'border-2 border-gray-300'
                }
              `}
                />
                <FormattedMessage id={`DRIVER.ADD.${type.toUpperCase()}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            {selectedType === 'turkish' ? (
              <>
                <label className="form-label">
                  <FormattedMessage id="DRIVER.ADD.FRONT_NATIONAL_ID_PHOTO" />
                </label>
                <FileUpload
                  name="frontNationalIdPhotoFile"
                  isUploaded={!!driver?.frontNationalIdPhoto}
                />
              </>
            ) : (
              <>
                <label className="form-label">
                  <FormattedMessage id="DRIVER.ADD.PASSPORT_PHOTO" />
                </label>
                <FileUpload name="passportPhotoFile" isUploaded={!!driver?.passportPhoto} />
              </>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            {selectedType === 'turkish' ? (
              <>
                <label className="form-label">
                  <FormattedMessage id="DRIVER.ADD.BACK_NATIONAL_ID_PHOTO" />
                </label>
                <FileUpload
                  name="backNationalIdPhotoFile"
                  isUploaded={!!driver?.backNationalIdPhoto}
                />
              </>
            ) : (
              <>
                <label className="form-label">
                  <FormattedMessage id="DRIVER.ADD.LAST_ENTRY_PHOTO" />
                </label>
                <FileUpload name="lastEntryPhotoFile" isUploaded={!!driver?.lastEntryPhoto} />
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            {selectedType === 'turkish' ? (
              <>
                <label className="form-label">
                  <FormattedMessage id="DRIVER.ADD.ID_NUMBER" />
                </label>
                <input
                  required
                  type="text"
                  className="input"
                  name="idNumber"
                  placeholder={intl.formatMessage({ id: 'DRIVER.ADD.ID_NUMBER' })}
                  defaultValue={driver?.idNumber}
                />
              </>
            ) : (
              <>
                <label className="form-label">
                  <FormattedMessage id="DRIVER.ADD.PASSPORT_NUMBER" />
                </label>
                <input
                  required
                  type="text"
                  className="input"
                  name="passportNumber"
                  placeholder={intl.formatMessage({ id: 'DRIVER.ADD.PASSPORT_NUMBER' })}
                  defaultValue={driver?.passportNumber}
                />
              </>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="form-label">{intl.formatMessage({ id: 'DRIVER.ADD.VEHICLE' })}</label>
            <VehicleSearch
              initialSearch={
                driver?.vehicle && {
                  plate: driver?.vehicle?.plate,
                  id: driver?.vehicle?.id
                }
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Information };
