import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { AddCustomerPageProps } from '../AddCustomerPage';

const InformationAccount = ({ customer }: AddCustomerPageProps) => {
  const intl = useIntl();

  const existingEmail = useMemo(() => {
    return customer?.email || '';
  }, [customer]);

  return (
    <>
      <div className="card-header" id="company_settings">
        <h3 className="card-title">
          <FormattedMessage id="USER.ADD.ACCOUNT.TITLE" />
        </h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="flex flex-col gap-2.5">
          <label className="form-label">
            <FormattedMessage id="USER.ADD.ACCOUNT.USERNAME" />
          </label>
          <input
            required
            type="text"
            autoComplete="email"
            className="input w-1/2"
            placeholder={intl.formatMessage({ id: 'USER.ADD.ACCOUNT.USERNAME.PLACEHOLDER' })}
            name="username"
            // we don't want the username to be an email address
            pattern="^[^@]+$"
            title={intl.formatMessage({ id: 'USER.ADD.ACCOUNT.USERNAME.PATTERN.TITLE' })}
            defaultValue={customer?.email || undefined}
            disabled={!!existingEmail}
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <label className="form-label">
            <FormattedMessage id="USER.ADD.ACCOUNT.PASSWORD" />
          </label>
          <input
            required={!customer}
            type="password"
            autoComplete="new-password"
            className="input w-1/2"
            placeholder={intl.formatMessage({ id: 'USER.ADD.ACCOUNT.PASSWORD.PLACEHOLDER' })}
            name="password"
          />
        </div>
        <div className="grid gap-2.5 mb-2.5"></div>
      </div>
    </>
  );
};

const InformationAccountBlock = ({ customer }: AddCustomerPageProps) => {
  return (
    <div className="card pb-2.5">
      <InformationAccount customer={customer} />
    </div>
  );
};

export { InformationAccount, InformationAccountBlock };
