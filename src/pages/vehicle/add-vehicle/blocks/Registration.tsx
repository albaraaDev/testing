import { CalendarIcon } from '@/assets/svg';
import { registrationTypeOptions } from '../AddVehiclePage';
import FormRadioButton from '../components/FormRadioButton';
import { Field } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';

const Registration = () => {
  const intl = useIntl();

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="company_settings">
        <h3 className="card-title">
          <FormattedMessage id="VEHICLE.FORM.REGISTRATION.TITLE" />
        </h3>
      </div>

      <div className="card-body grid gap-5">
        {/* Type Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.REGISTRATION.TYPE" />
            </label>
            <div className="flex w-full gap-4">
              {registrationTypeOptions.map((type, idx) => (
                <FormRadioButton
                  key={type.value + idx}
                  name="registrationType"
                  value={type.value}
                  label={intl.formatMessage({
                    id: `VEHICLE.FORM.REGISTRATION.TYPE.${type.value.toUpperCase()}`
                  })}
                  icon={type.icon}
                />
              ))}
            </div>
          </div>
          {/* Identify Number */}
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.REGISTRATION.IDENTIFY_NUMBER" />
            </label>
            <Field
              type="text"
              className="input"
              name="identifyNumber"
              placeholder={intl.formatMessage({
                id: 'VEHICLE.FORM.REGISTRATION.IDENTIFY_NUMBER.PLACEHOLDER'
              })}
            />
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.REGISTRATION.CHASSIS_NUMBER" />
            </label>
            <Field
              type="text"
              className="input"
              name="chassisNumber"
              placeholder={intl.formatMessage({
                id: 'VEHICLE.FORM.REGISTRATION.CHASSIS_NUMBER.PLACEHOLDER'
              })}
            />
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.REGISTRATION.ENGINE_NUMBER" />
            </label>
            <Field
              type="text"
              className="input"
              name="engineNumber"
              placeholder={intl.formatMessage({
                id: 'VEHICLE.FORM.REGISTRATION.ENGINE_NUMBER.PLACEHOLDER'
              })}
            />
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.REGISTRATION.REGISTRATION_NUMBER" />
            </label>
            <Field
              type="text"
              className="input"
              name="registrationNumber"
              placeholder={intl.formatMessage({
                id: 'VEHICLE.FORM.REGISTRATION.REGISTRATION_NUMBER.PLACEHOLDER'
              })}
            />
          </div>
        </div>

        {/* Registration Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.REGISTRATION.REGISTRATION_DATE" />
            </label>
            <div
              className="input"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                (e.currentTarget.children[0] as HTMLInputElement).showPicker();
              }}
            >
              <Field
                type="date"
                name="registrationDate"
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                placeholder="DD/MM/YYYY"
              />
              <CalendarIcon />
            </div>
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.REGISTRATION.FIRST_REGISTRATION_DATE" />
            </label>
            <div
              className="input"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                (e.currentTarget.children[0] as HTMLInputElement).showPicker();
              }}
            >
              <Field
                type="date"
                name="firstRegistrationDate"
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                placeholder="DD/MM/YYYY"
              />
              <CalendarIcon />
            </div>
          </div>
        </div>

        {/* License and Price */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.REGISTRATION.LICENSE_SERIAL_NUMBER" />
            </label>
            <Field
              type="text"
              className="input"
              name="licenseSerialNumber"
              placeholder={intl.formatMessage({
                id: 'VEHICLE.FORM.REGISTRATION.LICENSE_SERIAL_NUMBER.PLACEHOLDER'
              })}
            />
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.REGISTRATION.PRICE" />
            </label>
            <div className="input">
              <Field
                type="text"
                name="price"
                placeholder={intl.formatMessage({
                  id: 'VEHICLE.FORM.REGISTRATION.PRICE.PLACEHOLDER'
                })}
              />
              $
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Registration };
