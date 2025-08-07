import { Field } from 'formik';
import {
  carOptions,
  colorOptions,
  fuelOptions,
  gearOptions,
  numberOfSeatsOptions
} from '../AddVehiclePage';
import FormRadioButton from '../components/FormRadioButton';
import { useIntl, FormattedMessage } from 'react-intl';

const Information = () => {
  const intl = useIntl();

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="vehicle_information">
        <h3 className="card-title">
          <FormattedMessage id="VEHICLE.FORM.INFORMATION.TITLE" />
        </h3>
      </div>
      <div className="card-body grid gap-5">
        {/* Brand and Model Row */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INFORMATION.BRAND" />
            </label>
            <Field
              type="text"
              className="input"
              name="brand"
              placeholder={intl.formatMessage({ id: 'VEHICLE.FORM.INFORMATION.BRAND' })}
            />
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INFORMATION.MODEL" />
            </label>
            <Field
              type="text"
              className="input"
              name="model"
              placeholder={intl.formatMessage({ id: 'VEHICLE.FORM.INFORMATION.MODEL' })}
            />
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INFORMATION.MODEL_SERIES" />
            </label>
            <Field
              type="text"
              className="input"
              name="modelSeries"
              placeholder={intl.formatMessage({ id: 'VEHICLE.FORM.INFORMATION.MODEL_SERIES' })}
            />
          </div>
        </div>

        {/* Model Year, Volume, Power Row */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INFORMATION.MODEL_YEAR" />
            </label>
            <Field as="select" name="modelYear" className="select">
              {Array.from(
                { length: new Date().getFullYear() - 1990 + 1 },
                (_, i) => new Date().getFullYear() - i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Field>
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INFORMATION.VOLUME" />
            </label>
            <Field
              type="text"
              className="input"
              name="volume"
              placeholder={intl.formatMessage({ id: 'VEHICLE.FORM.INFORMATION.VOLUME' })}
            />
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INFORMATION.POWER" />
            </label>
            <Field
              type="text"
              className="input"
              name="power"
              placeholder={intl.formatMessage({ id: 'VEHICLE.FORM.INFORMATION.POWER' })}
            />
          </div>
        </div>

        {/* Fuel Type */}
        <div className="grid gap-2.5">
          <label className="form-label">
            <FormattedMessage id="VEHICLE.FORM.INFORMATION.FUEL_TYPE" />
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-col-6 gap-4 w-full">
            {fuelOptions.map((fuel, idx) => (
              <FormRadioButton
                key={fuel.value + idx}
                name={'fuelType'}
                value={fuel.value}
                label={intl.formatMessage({
                  id: `VEHICLE.FORM.INFORMATION.FUEL_TYPE.${fuel.value.toUpperCase()}`,
                  defaultMessage: fuel.label
                })}
              />
            ))}
          </div>
        </div>

        {/* Car Type */}
        <div className="grid gap-2.5">
          <label className="form-label">
            <FormattedMessage id="VEHICLE.FORM.INFORMATION.CAR_TYPE" />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 w-full">
            {carOptions.map((type, idx) => (
              <FormRadioButton
                key={type.value + idx}
                name={'carType'}
                value={type.value}
                label={intl.formatMessage({
                  id: `VEHICLE.FORM.INFORMATION.CAR_TYPE.${type.value.toUpperCase()}`,
                  defaultMessage: type.label
                })}
                icon={type.icon}
              />
            ))}
          </div>
        </div>

        {/* Gear, Color, and Number of Seats Row */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Gear */}
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INFORMATION.GEAR" />
            </label>
            <div className="grid md:grid-cols-2 gap-4 w-full">
              {gearOptions.map((gear, idx) => (
                <FormRadioButton
                  key={gear.value + idx}
                  name="gearType"
                  value={gear.value}
                  label={intl.formatMessage({
                    id: `VEHICLE.FORM.INFORMATION.GEAR.${gear.value.toUpperCase()}`,
                    defaultMessage: gear.label
                  })}
                  icon={gear.icon}
                />
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="grid gap-2.5 relative">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INFORMATION.COLOR" />
            </label>
            <Field as="select" name="color" className="select">
              {colorOptions.map((color, idx) => (
                <option key={color + idx} value={color}>
                  {intl.formatMessage({
                    id: `VEHICLE.FORM.INFORMATION.COLOR.${color.toUpperCase()}`,
                    defaultMessage: color
                  })}
                </option>
              ))}
            </Field>
          </div>

          {/* Number of Seats */}
          <div className="grid gap-2.5 relative">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INFORMATION.NUMBER_OF_SEATS" />
            </label>
            <Field as="select" name="numberOfSeats" className="select">
              {numberOfSeatsOptions.map((num, idx) => (
                <option key={num + idx} value={num}>
                  {num}
                </option>
              ))}
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Information };
