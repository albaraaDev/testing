import React, { useEffect, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { Form, Formik, Field } from 'formik';
import { useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import {
  WorkingPeriodModel,
  createWorkingPeriod,
  getWorkingPeriodDetails,
  updateWorkingPeriod
} from '@/api/working-hours';
import { CircularProgress } from '@mui/material';
import { TimePicker } from '@/components';
import { useAppRouting } from '@/routing/useAppRouting';

interface WorkingHoursFormProps {
  isEdit?: boolean;
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

const WorkingHoursForm: React.FC<WorkingHoursFormProps> = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useAppRouting();
  const { enqueueSnackbar } = useSnackbar();
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<WorkingPeriodModel>({
    id: '',
    name: '',
    daysOfWeek: [],
    startTime: '08:00:00',
    endTime: '17:00:00',
    userId: ''
  });

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

  useEffect(() => {
    const fetchWorkingPeriod = async () => {
      if (!isEdit || !id) return;

      setIsLoading(true);

      try {
        const response = await getWorkingPeriodDetails(id);

        const result = response.result;

        if (response.success === false || !result) {
          enqueueSnackbar(response.message, { variant: 'error' });
          return { data: [], totalCount: 0 };
        }

        setInitialValues(result);
      } catch (error) {
        console.error('Error fetching linked devices:', error);
        enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }), { variant: 'error' });
        return { data: [], totalCount: 0 };
      }
    };

    fetchWorkingPeriod();
  }, [isEdit, id, enqueueSnackbar, intl]);

  const handleSubmit = async (values: WorkingPeriodModel) => {
    try {
      if (isEdit && id) {
        const res = await updateWorkingPeriod({
          ...values,
          id
        });
        enqueueSnackbar(res.message, {
          variant: 'success'
        });
      } else {
        const res = await createWorkingPeriod(values);
        enqueueSnackbar(res.message, {
          variant: 'success'
        });
      }
      navigate('/working-hours/list');
    } catch (error) {
      console.error('Error saving working period:', error);
      enqueueSnackbar(intl.formatMessage({ id: 'WORKING_HOURS.SAVE_ERROR' }), { variant: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {isEdit ? (
          <FormattedMessage id="WORKING_HOURS.EDIT_TITLE" />
        ) : (
          <FormattedMessage id="WORKING_HOURS.CREATE_TITLE" />
        )}
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
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
                {isEdit ? (
                  <FormattedMessage id="COMMON.SAVE" />
                ) : (
                  <FormattedMessage id="COMMON.ADD" />
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export { WorkingHoursForm };
