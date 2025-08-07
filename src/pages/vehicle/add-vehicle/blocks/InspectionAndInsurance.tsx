import { CalendarIcon } from '@/assets/svg';
import { Field } from 'formik';
import { FormattedMessage } from 'react-intl';

const InspectionAndInsurance = () => {
  return (
    <div className="card pb-2.5">
      <div className="card-header" id="company_settings">
        <h3 className="card-title">
          <FormattedMessage id="VEHICLE.FORM.INSPECTION_INSURANCE.TITLE" />
        </h3>
      </div>
      <div className="card-body grid gap-5">
        {/* Inspection Dates */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INSPECTION_INSURANCE.INSPECTION_START_DATE" />
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
                name="inspectionStartDate"
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                placeholder="DD/MM/YYYY"
              />
              <CalendarIcon />
            </div>
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INSPECTION_INSURANCE.INSPECTION_END_DATE" />
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
                name="inspectionEndDate"
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                placeholder="DD/MM/YYYY"
              />
              <CalendarIcon />
            </div>
          </div>
        </div>

        {/* Insurance Dates */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INSPECTION_INSURANCE.INSURANCE_START_DATE" />
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
                name="insuranceStartDate"
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                placeholder="DD/MM/YYYY"
              />
              <CalendarIcon />
            </div>
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INSPECTION_INSURANCE.INSURANCE_END_DATE" />
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
                name="insuranceEndDate"
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                placeholder="DD/MM/YYYY"
              />
              <CalendarIcon />
            </div>
          </div>
        </div>

        {/* Kasko Dates */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INSPECTION_INSURANCE.KASKO_START_DATE" />
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
                name="kaskoStartDate"
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                placeholder="DD/MM/YYYY"
              />
              <CalendarIcon />
            </div>
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INSPECTION_INSURANCE.KASKO_END_DATE" />
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
                name="kaskoEndDate"
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                placeholder="DD/MM/YYYY"
              />
              <CalendarIcon />
            </div>
          </div>
        </div>

        {/* Exhaust Dates */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INSPECTION_INSURANCE.EXHAUST_START_DATE" />
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
                name="exhaustStartDate"
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                placeholder="DD/MM/YYYY"
              />
              <CalendarIcon />
            </div>
          </div>
          <div className="grid gap-2.5">
            <label className="form-label">
              <FormattedMessage id="VEHICLE.FORM.INSPECTION_INSURANCE.EXHAUST_END_DATE" />
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
                name="exhaustEndDate"
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                placeholder="DD/MM/YYYY"
              />
              <CalendarIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { InspectionAndInsurance };
