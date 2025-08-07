import { IntlShape } from 'react-intl';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const formatIsoDate = (isoDate: string, intl: IntlShape) => {
  const date = new Date(isoDate);
  const monthNames = [
    intl.formatMessage({ id: 'DATE.MONTH.JAN' }),
    intl.formatMessage({ id: 'DATE.MONTH.FEB' }),
    intl.formatMessage({ id: 'DATE.MONTH.MAR' }),
    intl.formatMessage({ id: 'DATE.MONTH.APR' }),
    intl.formatMessage({ id: 'DATE.MONTH.MAY' }),
    intl.formatMessage({ id: 'DATE.MONTH.JUN' }),
    intl.formatMessage({ id: 'DATE.MONTH.JUL' }),
    intl.formatMessage({ id: 'DATE.MONTH.AUG' }),
    intl.formatMessage({ id: 'DATE.MONTH.SEP' }),
    intl.formatMessage({ id: 'DATE.MONTH.OCT' }),
    intl.formatMessage({ id: 'DATE.MONTH.NOV' }),
    intl.formatMessage({ id: 'DATE.MONTH.DEC' })
  ];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
};

export const formatTimeAgo = (timestamp: number, intl: IntlShape): string => {
  const now = new Date();
  const date = new Date(timestamp * 1000);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const secondsInMinute = 60;
  const secondsInHour = 60 * 60;
  const secondsInDay = 60 * 60 * 24;
  const secondsInWeek = 60 * 60 * 24 * 7;

  if (diffInSeconds < secondsInMinute) {
    return intl.formatMessage({ id: 'DATE.TIME.FEW_SECONDS_AGO' });
  } else if (diffInSeconds < secondsInHour) {
    const minutes = Math.floor(diffInSeconds / secondsInMinute);
    return intl.formatMessage(
      { id: 'DATE.TIME.MINUTES_AGO' },
      { minutes, s: minutes !== 1 ? 's' : '' }
    );
  } else if (diffInSeconds < secondsInDay) {
    const hours = Math.floor(diffInSeconds / secondsInHour);
    return intl.formatMessage({ id: 'DATE.TIME.HOURS_AGO' }, { hours, s: hours !== 1 ? 's' : '' });
  } else if (diffInSeconds < secondsInDay * 2) {
    return intl.formatMessage({ id: 'DATE.YESTERDAY' });
  } else if (diffInSeconds < secondsInWeek) {
    const days = Math.floor(diffInSeconds / secondsInDay);
    return intl.formatMessage({ id: 'DATE.TIME.DAYS_AGO' }, { days, s: days !== 1 ? 's' : '' });
  } else {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm =
      hours >= 12
        ? intl.formatMessage({ id: 'DATE.TIME.PM' })
        : intl.formatMessage({ id: 'DATE.TIME.AM' });
    const formattedHours = hours % 12 || 12;

    return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
  }
};

export const getFormattedDate = (dateModifier = (d: Date) => d, timezone: string | undefined) => {
  const now = new Date();
  const tzDate = timezone ? toZonedTime(now, timezone) : now;
  return format(dateModifier(tzDate), 'yyyy-MM-dd');
};
