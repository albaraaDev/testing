import { useIntl } from 'react-intl';

export function SubscriptionExpiryPeriodSelect() {
  const intl = useIntl();

  return (
    <select name="period" className="select">
      <option value="">
        {intl.formatMessage({
          id: 'REPORTS.SELECT_PERIOD.PLACEHOLDER'
        })}
      </option>
      <option value="today">
        {intl.formatMessage({
          id: 'REPORTS.SELECT_PERIOD.TODAY'
        })}
      </option>
      <option value="this_week">
        {intl.formatMessage({
          id: 'REPORTS.SELECT_PERIOD.THIS_WEEK'
        })}
      </option>
      <option value="this_month">
        {intl.formatMessage({
          id: 'REPORTS.SELECT_PERIOD.THIS_MONTH'
        })}
      </option>
      <option value="this_year">
        {intl.formatMessage({
          id: 'REPORTS.SELECT_PERIOD.THIS_YEAR'
        })}
      </option>
    </select>
  );
}
