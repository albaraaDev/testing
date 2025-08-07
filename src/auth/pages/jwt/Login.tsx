import { type MouseEvent, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { KeenIcon } from '@/components';
import { useAuthContext } from '@/auth';
import { useLayout } from '@/providers';
import { Alert } from '@/components';
import { useIntl, FormattedMessage } from 'react-intl';
import { useAppRouting } from '@/routing/useAppRouting';

const Login = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useAppRouting();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [showPassword, setShowPassword] = useState(false);
  const { currentLayout } = useLayout();

  const loginSchema = Yup.object().shape({
    username: Yup.string()
      .min(3, intl.formatMessage({ id: 'LOGIN.VALIDATION.MIN_LENGTH' }))
      .max(50, intl.formatMessage({ id: 'LOGIN.VALIDATION.MAX_LENGTH' }))
      .required(intl.formatMessage({ id: 'LOGIN.VALIDATION.USERNAME_REQUIRED' })),
    password: Yup.string()
      .min(3, intl.formatMessage({ id: 'LOGIN.VALIDATION.MIN_LENGTH' }))
      .max(50, intl.formatMessage({ id: 'LOGIN.VALIDATION.MAX_LENGTH' }))
      .required(intl.formatMessage({ id: 'LOGIN.VALIDATION.PASSWORD_REQUIRED' })),
    remember: Yup.boolean()
  });

  const initialValues = {
    username: '',
    password: '',
    remember: false
  };

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);

      try {
        if (!login) {
          throw new Error('JWTProvider is required for this form.');
        }

        await login(values.username, values.password);

        if (values.remember) {
          localStorage.setItem('username', values.username);
        } else {
          localStorage.removeItem('username');
        }

        navigate(from, { replace: true });
      } catch {
        setStatus('The login details are incorrect');
        setSubmitting(false);
      }
      setLoading(false);
    }
  });

  const togglePassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className="card max-w-[390px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        onSubmit={formik.handleSubmit}
        noValidate
      >
        <div className="text-center mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">
            <FormattedMessage id="LOGIN.TITLE" />
          </h3>
          {/* <div className="flex items-center justify-center font-medium">
            <span className="text-2sm text-gray-600 me-1.5">
              <FormattedMessage id="LOGIN.NEED_ACCOUNT" />
            </span>
            <Link
              to={currentLayout?.name === 'auth-branded' ? '/auth/signup' : '/auth/classic/signup'}
              className="text-2sm link"
            >
              <FormattedMessage id="LOGIN.SIGN_UP" />
            </Link>
          </div> */}
        </div>

        {/* <div className="flex items-center gap-2">
          <span className="border-t border-gray-200 w-full"></span>
          <span className="text-2xs text-gray-500 font-medium uppercase">
            <FormattedMessage id="LOGIN.OR" />
          </span>
          <span className="border-t border-gray-200 w-full"></span>
        </div> */}

        {formik.status && <Alert variant="danger">{formik.status}</Alert>}

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">
            <FormattedMessage id="LOGIN.USERNAME" />
          </label>
          <label className="input">
            <input
              placeholder={intl.formatMessage({ id: 'LOGIN.USERNAME.PLACEHOLDER' })}
              autoComplete="off"
              {...formik.getFieldProps('username')}
              className={clsx('form-control', {
                'is-invalid': formik.touched.username && formik.errors.username
              })}
            />
          </label>
          {formik.touched.username && formik.errors.username && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.username}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          {/* <div className="flex items-center justify-between gap-1">
            <label className="form-label text-gray-900">
              <FormattedMessage id="LOGIN.PASSWORD" />
            </label>
            <Link
              to={
                currentLayout?.name === 'auth-branded'
                  ? '/auth/reset-password'
                  : '/auth/classic/reset-password'
              }
              className="text-2sm link shrink-0"
            >
              <FormattedMessage id="LOGIN.FORGOT_PASSWORD" />
            </Link>
          </div> */}
          <label className="input">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={intl.formatMessage({ id: 'LOGIN.PASSWORD.PLACEHOLDER' })}
              autoComplete="off"
              {...formik.getFieldProps('password')}
              className={clsx('form-control', {
                'is-invalid': formik.touched.password && formik.errors.password
              })}
            />
            <button className="btn btn-icon" onClick={togglePassword}>
              <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showPassword })} />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showPassword })}
              />
            </button>
          </label>
          {formik.touched.password && formik.errors.password && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.password}
            </span>
          )}
        </div>

        <label className="checkbox-group">
          <input
            className="checkbox checkbox-sm"
            type="checkbox"
            {...formik.getFieldProps('remember')}
          />
          <span className="checkbox-label">
            <FormattedMessage id="LOGIN.REMEMBER_ME" />
          </span>
        </label>

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? (
            <FormattedMessage id="LOGIN.PLEASE_WAIT" />
          ) : (
            <FormattedMessage id="LOGIN.SIGN_IN" />
          )}
        </button>
      </form>
    </div>
  );
};

export { Login };
