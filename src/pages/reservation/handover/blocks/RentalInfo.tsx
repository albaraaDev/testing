import FormikFileUpload from '@/pages/vehicle/add-vehicle/components/FormikFileUpload';
import { Field, FieldProps } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';

import { AdditionalServicesSection, InsuranceSection } from '../../blocks/AdditionalServices';
import { AddReservationPageProps } from '../HandOverPage';

const RentalInfo = (props: AddReservationPageProps) => {
  const { reservation: _reservation, isPickupFlow, isDropoffFlow } = props;
  return (
    <>
      <div className="card-header" id="general_settings">
        <h3 className="card-title">
          {isPickupFlow && (
            <FormattedMessage
              id="RESERVATION.PICKUP.TITLE"
              defaultMessage="Vehicle Pickup Information"
            />
          )}
          {isDropoffFlow && (
            <FormattedMessage
              id="RESERVATION.DROPOFF.TITLE"
              defaultMessage="Vehicle Dropoff Information"
            />
          )}
        </h3>
      </div>
      <div className="card-body grid gap-5">
        {_reservation && (
          <>
            {isPickupFlow && <PickupFormSection />}
            {isDropoffFlow && <DropoffFormSection />}
          </>
        )}
      </div>
    </>
  );
};

// Pickup Form Section Component
const PickupFormSection = () => {
  const intl = useIntl();

  return (
    <div className="grid gap-5">
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Mileage at Pickup */}
        <div className="grid gap-2.5">
          <label className="form-label">
            <FormattedMessage id="RESERVATION.PICKUP.MILEAGE" defaultMessage="Mileage at Pickup" />
          </label>
          <Field
            type="number"
            name="mileageAtPickup"
            className="input"
            placeholder={intl.formatMessage({
              id: 'RESERVATION.PICKUP.MILEAGE.PLACEHOLDER',
              defaultMessage: 'Enter mileage'
            })}
          />
        </div>

        {/* Fuel Status at Pickup */}
        <div className="grid gap-2.5">
          <label className="form-label">
            <FormattedMessage
              id="RESERVATION.PICKUP.FUEL_STATUS"
              defaultMessage="Fuel Status at Pickup (%)"
            />
          </label>
          <Field
            type="number"
            name="fuelStatusAtPickup"
            className="input"
            min="0"
            max="100"
            placeholder={intl.formatMessage({
              id: 'RESERVATION.PICKUP.FUEL_STATUS.PLACEHOLDER',
              defaultMessage: 'Enter fuel percentage'
            })}
          />
        </div>
      </div>

      {/* Pickup Date and Time */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Pickup Date */}
        <div className="grid gap-2.5">
          <label className="form-label">
            <FormattedMessage id="RESERVATION.PICKUP.DATE" defaultMessage="Pickup Date" />
          </label>
          <Field type="date" name="pickUpDate" className="input" />
        </div>

        {/* Pickup Time */}
        <div className="grid gap-2.5">
          <label className="form-label">
            <FormattedMessage id="RESERVATION.PICKUP.TIME" defaultMessage="Pickup Time" />
          </label>
          <Field type="time" name="pickUpTime" className="input" />
        </div>
      </div>

      {/* File Uploads */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Image Upload */}
        <div className="card p-4 grid gap-2.5 overflow-auto">
          <label className="form-label card-title">
            <FormattedMessage id="RESERVATION.PICKUP.IMAGE" defaultMessage="Pickup Image" />
          </label>
          <FormikFileUpload name="imageAtPickUpFile" />
        </div>

        {/* Video Upload */}
        <div className="card p-4 grid gap-2.5 overflow-auto">
          <label className="form-label card-title">
            <FormattedMessage id="RESERVATION.PICKUP.VIDEO" defaultMessage="Pickup Video" />
          </label>
          <FormikFileUpload name="videoAtPickUpFile" />
        </div>
      </div>

      {/* Validation Checkboxes */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="grid gap-2.5">
          <label className="form-label flex items-center">
            <Field name="passportValidity">
              {({ field, form }: FieldProps) => (
                <div className="switch switch-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  />
                </div>
              )}
            </Field>
            <span className="ml-3">
              <FormattedMessage
                id="RESERVATION.PICKUP.PASSPORT_VALIDITY"
                defaultMessage="Passport is Valid"
              />
            </span>
          </label>
        </div>

        <div className="grid gap-2.5">
          <label className="form-label flex items-center">
            <Field name="licenceValidity">
              {({ field, form }: FieldProps) => (
                <div className="switch switch-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  />
                </div>
              )}
            </Field>
            <span className="ml-3">
              <FormattedMessage
                id="RESERVATION.PICKUP.LICENCE_VALIDITY"
                defaultMessage="Licence is Valid"
              />
            </span>
          </label>
        </div>
      </div>

      {/* Process Checkboxes */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="grid gap-2.5">
          <label className="form-label flex items-center">
            <Field name="fillInContractDetails">
              {({ field, form }: FieldProps) => (
                <div className="switch switch-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  />
                </div>
              )}
            </Field>
            <span className="ml-3">
              <FormattedMessage
                id="RESERVATION.PICKUP.FILL_CONTRACT"
                defaultMessage="Contract Details Filled"
              />
            </span>
          </label>
        </div>

        <div className="grid gap-2.5">
          <label className="form-label flex items-center">
            <Field name="receivingRentalAmount">
              {({ field, form }: FieldProps) => (
                <div className="switch switch-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  />
                </div>
              )}
            </Field>
            <span className="ml-3">
              <FormattedMessage
                id="RESERVATION.PICKUP.RECEIVING_RENTAL_AMOUNT"
                defaultMessage="Rental Amount Received"
              />
            </span>
          </label>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="grid gap-2.5">
          <label className="form-label flex items-center">
            <Field name="recipientsID">
              {({ field, form }: FieldProps) => (
                <div className="switch switch-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  />
                </div>
              )}
            </Field>
            <span className="ml-3">
              <FormattedMessage
                id="RESERVATION.PICKUP.RECIPIENTS_ID"
                defaultMessage="Recipient ID Checked"
              />
            </span>
          </label>
        </div>

        <div className="grid gap-2.5">
          <label className="form-label flex items-center">
            <Field name="deliveryOfContractToClient">
              {({ field, form }: FieldProps) => (
                <div className="switch switch-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  />
                </div>
              )}
            </Field>
            <span className="ml-3">
              <FormattedMessage
                id="RESERVATION.PICKUP.DELIVERY_CONTRACT"
                defaultMessage="Contract Delivered to Client"
              />
            </span>
          </label>
        </div>
      </div>

      <div className="grid gap-2.5">
        <label className="form-label flex items-center">
          <Field name="availabilityOfADriver">
            {({ field, form }: FieldProps) => (
              <div className="switch switch-sm">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                />
              </div>
            )}
          </Field>
          <span className="ml-3">
            <FormattedMessage
              id="RESERVATION.PICKUP.AVAILABILITY_DRIVER"
              defaultMessage="Driver is Available"
            />
          </span>
        </label>
      </div>

      <InsuranceSection />
      <AdditionalServicesSection />
    </div>
  );
};

// Dropoff Form Section Component
const DropoffFormSection = () => {
  const intl = useIntl();

  return (
    <div className="grid gap-5">
      {/* Dropoff Date and Time */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Dropoff Date */}
        <div className="grid gap-2.5">
          <label className="form-label">
            <FormattedMessage id="RESERVATION.DROPOFF.DATE" defaultMessage="Dropoff Date" />
          </label>
          <Field type="date" name="dropOffDate" className="input" />
        </div>

        {/* Dropoff Time */}
        <div className="grid gap-2.5">
          <label className="form-label">
            <FormattedMessage id="RESERVATION.DROPOFF.TIME" defaultMessage="Dropoff Time" />
          </label>
          <Field type="time" name="dropOffTime" className="input" />
        </div>
      </div>

      {/* Mileage and Fuel Status */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Mileage at Dropoff */}
        <div className="grid gap-2.5">
          <label className="form-label">
            <FormattedMessage
              id="RESERVATION.DROPOFF.MILEAGE"
              defaultMessage="Mileage at Dropoff"
            />
          </label>
          <Field
            type="number"
            name="mileageAtDropOff"
            className="input"
            placeholder={intl.formatMessage({
              id: 'RESERVATION.DROPOFF.MILEAGE.PLACEHOLDER',
              defaultMessage: 'Enter mileage'
            })}
          />
        </div>

        {/* Fuel Status at Dropoff */}
        <div className="grid gap-2.5">
          <label className="form-label">
            <FormattedMessage
              id="RESERVATION.DROPOFF.FUEL_STATUS"
              defaultMessage="Fuel Status at Dropoff (%)"
            />
          </label>
          <Field
            type="number"
            name="fuelStatusAtDropOff"
            className="input"
            min="0"
            max="100"
            placeholder={intl.formatMessage({
              id: 'RESERVATION.DROPOFF.FUEL_STATUS.PLACEHOLDER',
              defaultMessage: 'Enter fuel percentage'
            })}
          />
        </div>
      </div>

      {/* Additional Mileage and Pricing */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Additional Mileage */}
        <div className="grid gap-2.5">
          <label className="form-label">
            <FormattedMessage
              id="RESERVATION.DROPOFF.ADDITIONAL_MILEAGE"
              defaultMessage="Additional Mileage"
            />
          </label>
          <Field
            type="number"
            name="additionalMileageAtDropOff"
            className="input"
            placeholder={intl.formatMessage({
              id: 'RESERVATION.DROPOFF.ADDITIONAL_MILEAGE.PLACEHOLDER',
              defaultMessage: 'Enter additional mileage'
            })}
          />
        </div>

        {/* Additional Mileage Price */}
        <div className="grid gap-2.5">
          <label className="form-label">
            <FormattedMessage
              id="RESERVATION.DROPOFF.ADDITIONAL_MILEAGE_PRICE"
              defaultMessage="Additional Mileage Price"
            />
          </label>
          <Field
            type="number"
            name="additionalMileagePrice"
            className="input"
            placeholder={intl.formatMessage({
              id: 'RESERVATION.DROPOFF.ADDITIONAL_MILEAGE_PRICE.PLACEHOLDER',
              defaultMessage: 'Enter price'
            })}
          />
        </div>
      </div>

      {/* Fuel Price and HGS Fees */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Fuel Price */}
        <div className="grid gap-2.5">
          <label className="form-label">
            <FormattedMessage id="RESERVATION.DROPOFF.FUEL_PRICE" defaultMessage="Fuel Price" />
          </label>
          <Field
            type="number"
            name="fuelPrice"
            className="input"
            placeholder={intl.formatMessage({
              id: 'RESERVATION.DROPOFF.FUEL_PRICE.PLACEHOLDER',
              defaultMessage: 'Enter fuel price'
            })}
          />
        </div>

        {/* HGS Fees */}
        <div className="grid gap-2.5">
          <label className="form-label">
            <FormattedMessage id="RESERVATION.DROPOFF.HGS_FEES" defaultMessage="HGS Fees" />
          </label>
          <Field
            type="number"
            name="hgsFees"
            className="input"
            placeholder={intl.formatMessage({
              id: 'RESERVATION.DROPOFF.HGS_FEES.PLACEHOLDER',
              defaultMessage: 'Enter HGS fees'
            })}
          />
        </div>
      </div>

      {/* File Uploads */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Image Upload */}
        <div className="card p-4 grid gap-2.5 overflow-auto">
          <label className="form-label card-title">
            <FormattedMessage id="RESERVATION.DROPOFF.IMAGE" defaultMessage="Dropoff Image" />
          </label>
          <FormikFileUpload name="imageAtDropOff" />
        </div>

        {/* Video Upload */}
        <div className="card p-4 grid gap-2.5 overflow-auto">
          <label className="form-label card-title">
            <FormattedMessage id="RESERVATION.DROPOFF.VIDEO" defaultMessage="Dropoff Video" />
          </label>
          <FormikFileUpload name="videoAtDropOff" />
        </div>
      </div>

      {/* Validation Checkboxes */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="grid gap-2.5">
          <label className="form-label flex items-center">
            <Field name="passportValidity">
              {({ field, form }: FieldProps) => (
                <div className="switch switch-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  />
                </div>
              )}
            </Field>
            <span className="ml-3">
              <FormattedMessage
                id="RESERVATION.DROPOFF.PASSPORT_VALIDITY"
                defaultMessage="Passport is Valid"
              />
            </span>
          </label>
        </div>

        <div className="grid gap-2.5">
          <label className="form-label flex items-center">
            <Field name="licenceValidity">
              {({ field, form }: FieldProps) => (
                <div className="switch switch-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  />
                </div>
              )}
            </Field>
            <span className="ml-3">
              <FormattedMessage
                id="RESERVATION.DROPOFF.LICENCE_VALIDITY"
                defaultMessage="Licence is Valid"
              />
            </span>
          </label>
        </div>
      </div>

      {/* Process Checkboxes */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="grid gap-2.5">
          <label className="form-label flex items-center">
            <Field name="fillInContractDetails">
              {({ field, form }: FieldProps) => (
                <div className="switch switch-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  />
                </div>
              )}
            </Field>
            <span className="ml-3">
              <FormattedMessage
                id="RESERVATION.DROPOFF.FILL_CONTRACT"
                defaultMessage="Contract Details Filled"
              />
            </span>
          </label>
        </div>

        <div className="grid gap-2.5">
          <label className="form-label flex items-center">
            <Field name="receivingRentalAmount">
              {({ field, form }: FieldProps) => (
                <div className="switch switch-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  />
                </div>
              )}
            </Field>
            <span className="ml-3">
              <FormattedMessage
                id="RESERVATION.DROPOFF.RECEIVING_RENTAL_AMOUNT"
                defaultMessage="Rental Amount Received"
              />
            </span>
          </label>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="grid gap-2.5">
          <label className="form-label flex items-center">
            <Field name="recipientsID">
              {({ field, form }: FieldProps) => (
                <div className="switch switch-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  />
                </div>
              )}
            </Field>
            <span className="ml-3">
              <FormattedMessage
                id="RESERVATION.DROPOFF.RECIPIENTS_ID"
                defaultMessage="Recipient ID Checked"
              />
            </span>
          </label>
        </div>

        <div className="grid gap-2.5">
          <label className="form-label flex items-center">
            <Field name="deliveryOfContractToClient">
              {({ field, form }: FieldProps) => (
                <div className="switch switch-sm">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                  />
                </div>
              )}
            </Field>
            <span className="ml-3">
              <FormattedMessage
                id="RESERVATION.DROPOFF.DELIVERY_CONTRACT"
                defaultMessage="Contract Delivered to Client"
              />
            </span>
          </label>
        </div>
      </div>

      <div className="grid gap-2.5">
        <label className="form-label flex items-center">
          <Field name="availabilityOfADriver">
            {({ field, form }: FieldProps) => (
              <div className="switch switch-sm">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
                />
              </div>
            )}
          </Field>
          <span className="ml-3">
            <FormattedMessage
              id="RESERVATION.DROPOFF.AVAILABILITY_DRIVER"
              defaultMessage="Driver is Available"
            />
          </span>
        </label>
      </div>
    </div>
  );
};

const RentalInfoBlock = (props: AddReservationPageProps) => {
  return (
    <div className="card pb-2.5">
      <RentalInfo {...props} />
    </div>
  );
};

export { RentalInfo, RentalInfoBlock };
