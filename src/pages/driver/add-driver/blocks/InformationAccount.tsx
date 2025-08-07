import { FormattedMessage, useIntl } from 'react-intl';
import { AddDriverPageProps } from '../AddDriverPage';

const InformationAccount = ({ driver }: AddDriverPageProps) => {
  const intl = useIntl();

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="account_settings">
        <h3 className="card-title">{intl.formatMessage({ id: 'DRIVER.ADD.TAB.ACCOUNT' })}</h3>
      </div>
      <div className="card-body grid gap-5">
        <div className="flex flex-col gap-2.5">
          <label className="form-label">
            <FormattedMessage id="USER.ADD.ACCOUNT.USERNAME" />
          </label>
          <input
            required
            type="text"
            autoComplete="username"
            className="input w-1/2"
            placeholder={intl.formatMessage({ id: 'USER.ADD.ACCOUNT.USERNAME.PLACEHOLDER' })}
            name="username"
            defaultValue={driver?.username}
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <label className="form-label">
            <FormattedMessage id="USER.ADD.ACCOUNT.PASSWORD" />
          </label>
          <input
            required={!driver}
            type="password"
            autoComplete="new-password"
            className="input w-1/2"
            placeholder={intl.formatMessage({ id: 'USER.ADD.ACCOUNT.PASSWORD.PLACEHOLDER' })}
            name="password"
          />
        </div>
        <div className="grid gap-2.5 mb-2.5"></div>
      </div>
    </div>
  );
};

export { InformationAccount };
