import { Modal, Box, CircularProgress } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { WorkingPeriodModel, updateWorkingPeriod } from '@/api/working-hours';
import { FormattedMessage, useIntl } from 'react-intl';
import axios, { AxiosError } from 'axios';
import { ResponseModel } from '@/api/response';
import { enqueueSnackbar } from 'notistack';
import { Form, Formik, Field } from 'formik';
import * as Yup from 'yup';
import { TimePicker } from '@/components';
import { useSettings } from '@/providers';

interface EditWorkingHoursModalProps {
  open: boolean;
  workingPeriod: WorkingPeriodModel;
  onClose: () => void;
  onSuccess: () => void;
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

export function EditWorkingHoursModal({
  open,
  workingPeriod,
  onClose,
  onSuccess
}: EditWorkingHoursModalProps) {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<WorkingPeriodModel>({
    id: '',
    name: '',
    daysOfWeek: [],
    startTime: '08:00:00',
    endTime: '17:00:00',
    userId: ''
  });

  const { settings } = useSettings();
  const isDarkMode = settings.themeMode === 'dark';

  const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: isDarkMode ? '#1c1c1e' : '#fff',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: '90vh',
    overflow: 'auto'
  };

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
    if (workingPeriod) {
      setInitialValues(workingPeriod);
    } else {
      setInitialValues({
        id: '',
        name: '',
        daysOfWeek: [],
        startTime: '08:00:00',
        endTime: '17:00:00',
        userId: ''
      });
    }
  }, [workingPeriod]);

  const handleSubmit = async (values: WorkingPeriodModel) => {
    setLoading(true);
    try {
      const res = await updateWorkingPeriod({
        ...values,
        id: workingPeriod.id
      });
      enqueueSnackbar(res.message, {
        variant: 'success'
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving working period:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ResponseModel<never>>;
        enqueueSnackbar(
          axiosError.response?.data.message || intl.formatMessage({ id: 'COMMON.ERROR' }),
          { variant: 'error' }
        );
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'WORKING_HOURS.SAVE_ERROR' }), {
          variant: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={(_e, reason) => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
          onClose();
        }
      }}
      disableEscapeKeyDown
    >
      <Box sx={modalStyle}>
        <h2 className="text-xl font-semibold mb-4">
          {workingPeriod?.id ? (
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
            <Form className="space-y-4">
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

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={onClose}
                  disabled={loading || isSubmitting}
                >
                  <FormattedMessage id="COMMON.CANCEL" />
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || isSubmitting}
                >
                  {(loading || isSubmitting) && (
                    <CircularProgress size={16} color="inherit" className="me-2" />
                  )}
                  {<FormattedMessage id="COMMON.SAVE" />}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  );
}
