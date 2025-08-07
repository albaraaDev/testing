import { Field } from 'formik';
import { STATUS_OPTIONS } from '../../constants';
import FormikFileUpload from '../components/FormikFileUpload';
import { useIntl, FormattedMessage } from 'react-intl';
import { DeviceSearch } from './DeviceSearch';

const AdditionalVehicleInfo = () => {
  const intl = useIntl();
  return (
    <div className="flex flex-col gap-5 p-3">
      <div className="p-4 card grid gap-2.5 overflow-auto">
        <label className="form-label card-title">
          <FormattedMessage id="VEHICLE.FORM.ADDITIONAL_INFO.VEHICLE_IMAGE" />
        </label>
        <FormikFileUpload name="vehicleImage" />
      </div>
      <div className="card p-4 gap-4">
        <label className="form-label card-title">
          <FormattedMessage id="VEHICLE.FORM.ADDITIONAL_INFO.DEVICE" />
        </label>
        <DeviceSearch place="bottom" />
      </div>
      <div className="card p-4 gap-4">
        <label className="form-label card-title">
          <FormattedMessage id="VEHICLE.FORM.ADDITIONAL_INFO.OWNER" />
        </label>
        <Field
          type="text"
          className="input"
          name="owner"
          placeholder={intl.formatMessage({ id: 'VEHICLE.FORM.ADDITIONAL_INFO.OWNER' })}
        />
      </div>
      <div className="card p-4 gap-4">
        <label className="form-label card-title">
          <FormattedMessage id="VEHICLE.FORM.ADDITIONAL_INFO.PLATE" />
        </label>

        <div className="flex font-medium [direction:ltr]">
          <div className="rounded-s-lg py-2 px-2 bg-[#5271FF] text-white">TR</div>
          <Field type="text" className="input rounded-s-none" name="plate" placeholder="56084684" />
        </div>
      </div>
      <div className="card p-4 gap-4">
        <h3 className="card-title">
          <FormattedMessage id="VEHICLE.FORM.ADDITIONAL_INFO.STATUS" />
        </h3>
        <Field as="select" name="status" className="select">
          {Object.entries(STATUS_OPTIONS).map(([key, value], idx) => (
            <option key={key + idx} value={key}>
              {intl.formatMessage({ id: value.nameKey, defaultMessage: key })}
            </option>
          ))}
        </Field>
      </div>

      <div className="card p-4 gap-4">
        <h3 className="card-title">
          <FormattedMessage id="VEHICLE.FORM.ADDITIONAL_INFO.HGS" />
        </h3>
        <Field
          type="text"
          className="input"
          name="hgsNumber"
          placeholder={intl.formatMessage({ id: 'VEHICLE.FORM.ADDITIONAL_INFO.HGS' })}
        />
      </div>

      <div className="card p-4 gap-4">
        <h3 className="card-title">
          <FormattedMessage id="VEHICLE.FORM.ADDITIONAL_INFO.PERFORMANCE" />
        </h3>
        <div className="grid gap-2.5">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.ADDITIONAL_INFO.CURRENT_MILEAGE" />
            </label>
            <Field
              type="number"
              className="input"
              name="currentMileage"
              placeholder={intl.formatMessage({
                id: 'VEHICLE.FORM.ADDITIONAL_INFO.CURRENT_MILEAGE'
              })}
            />
          </div>
          <div className="grid gap-2.5 mt-4">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.ADDITIONAL_INFO.MAINTENANCE_MILEAGE" />
            </label>
            <Field
              type="number"
              className="input"
              name="maintenanceMileage"
              placeholder={intl.formatMessage({
                id: 'VEHICLE.FORM.ADDITIONAL_INFO.MAINTENANCE_MILEAGE'
              })}
            />
          </div>
          <div className="grid gap-2.5 mt-4">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.ADDITIONAL_INFO.FUEL_CONSUMPTION" />
            </label>
            <Field
              type="number"
              className="input"
              name="fuelConsumption"
              placeholder={intl.formatMessage({
                id: 'VEHICLE.FORM.ADDITIONAL_INFO.FUEL_CONSUMPTION'
              })}
            />
          </div>
        </div>
      </div>
      <div className="card p-4 grid gap-2.5 overflow-auto">
        <label className="form-label card-title">
          <FormattedMessage id="VEHICLE.FORM.ADDITIONAL_INFO.DOCUMENTS" />
        </label>
        <FormikFileUpload name="licenseImageFile" />
      </div>
    </div>
  );
};

export { AdditionalVehicleInfo };
