import React from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { Form, Formik, Field } from 'formik';
import * as Yup from 'yup';
import { WorkingPeriodModel } from '@/api/working-hours';
import { CircularProgress } from '@mui/material';
import { TimePicker } from '@/components';
import { useAppRouting } from '@/routing/useAppRouting';

interface WorkingHoursFormProps {
  initialValues?: WorkingPeriodModel;
  onSubmit: (values: WorkingPeriodModel) => Promise<void>;
}

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'WORKING_HOURS.DAYS.MONDAY' },
  { value: 'TUESDAY', label: 'WORKING_HOURS.DAYS.TUESDAY' },
  { value: 'WEDNESDAY', label: 'WORKING_HOURS.DAYS.WEDNESDAY' },
  { value: 'THURSDAY', label: 'WORKING_HOURS.DAYS.THURSDAY' },
  { value: 'FRIDAY', label: 'WORKING_HOURS.DAYS.FRIDAY' },
  { value: 'SATURDAY', label: 'WORKING_HOURS.DAYS.SATURDAY' },
  { value: 'SUNDAY', label: 'WORKING_HOURS.DAYS.SUNDAY' }
];

const DEFAULT_INITIAL_VALUES: WorkingPeriodModel = {
  id: '',
  name: '',
  daysOfWeek: [],
  startTime: '08:00:00',
  endTime: '17:00:00',
  userId: ''
};

const WorkingHoursForm: React.FC<WorkingHoursFormProps> = ({ initialValues, onSubmit }) => {
  const navigate = useAppRouting();
  const intl = useIntl();

  const validationSchema = Yup.object({
    name: Yup.string().required(
      intl.formatMessage({ id: 'WORKING_HOURS.VALIDATION.NAME_REQUIRED' })
    ),
    daysOfWeek: Yup.array()
      .min(1, intl.formatMessage({ id: 'WORKING_HOURS.VALIDATION.DAYS_REQUIRED' }))
      .required(intl.formatMessage({ id: 'WORKING_HOURS.VALIDATION.DAYS_REQUIRED' })),
    startTime: Yup.string().required(
      intl.formatMessage({ id: 'WORKING_HOURS.VALIDATION.START_TIME_REQUIRED' })
    ),
    endTime: Yup.string().required(
      intl.formatMessage({ id: 'WORKING_HOURS.VALIDATION.END_TIME_REQUIRED' })
    )
  });

  return (
    <div className="card p-6 xl:w-[60rem] mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        <FormattedMessage id="WORKING_HOURS.INFORMATION.TITLE" />
      </h2>

      <Formik
        initialValues={initialValues || DEFAULT_INITIAL_VALUES}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form className="space-y-6">
            <div className="grid gap-4">
              <label className="form-label">
                <FormattedMessage id="WORKING_HOURS.FIELD.NAME" />
              </label>
              <Field
                name="name"
                className="input"
                placeholder={intl.formatMessage({ id: 'WORKING_HOURS.FIELD.NAME_PLACEHOLDER' })}
              />
              {errors.name && touched.name && (
                <div className="text-red-500 text-sm">{errors.name}</div>
              )}
            </div>

            <div className="grid gap-4">
              <label className="form-label">
                <FormattedMessage id="WORKING_HOURS.FIELD.DAYS" />
              </label>
              <div className="flex flex-wrap gap-3">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center">
                    <Field
                      type="checkbox"
                      name="daysOfWeek"
                      value={day.value}
                      id={`day-${day.value}`}
                      className="form-checkbox me-2"
                    />
                    <label htmlFor={`day-${day.value}`} className="cursor-pointer">
                      <FormattedMessage id={day.label} />
                    </label>
                  </div>
                ))}
              </div>
              {errors.daysOfWeek && touched.daysOfWeek && (
                <div className="text-red-500 text-sm">{errors.daysOfWeek}</div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-4">
                <label className="form-label">
                  <FormattedMessage id="WORKING_HOURS.FIELD.START_TIME" />
                </label>
                <TimePicker
                  value={values.startTime}
                  onChange={(newTime) => setFieldValue('startTime', newTime)}
                  className="input"
                />
                {errors.startTime && touched.startTime && (
                  <div className="text-red-500 text-sm">{errors.startTime}</div>
                )}
              </div>

              <div className="grid gap-4">
                <label className="form-label">
                  <FormattedMessage id="WORKING_HOURS.FIELD.END_TIME" />
                </label>
                <TimePicker
                  value={values.endTime}
                  onChange={(newTime) => setFieldValue('endTime', newTime)}
                  className="input"
                />
                {errors.endTime && touched.endTime && (
                  <div className="text-red-500 text-sm">{errors.endTime}</div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/working-hours/list')}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                <FormattedMessage id="COMMON.CANCEL" />
              </button>

              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting && <CircularProgress size={16} color="inherit" className="me-2" />}
                <FormattedMessage id="COMMON.ADD" />
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export { WorkingHoursForm };
