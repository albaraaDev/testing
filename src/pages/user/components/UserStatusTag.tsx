import clsx from 'clsx';
import { FormattedMessage } from 'react-intl';

export default function UserStatusTag({ status }: { status: boolean }) {
  return (
    <div
      className={clsx('px-4 py-2 rounded-md font-semibold text-lg', {
        'bg-green-500/10 border border-success text-success': status,
        'bg-red-500/10 border border-danger text-danger': !status
      })}
    >
      <FormattedMessage id={status ? 'STATUS.ACTIVE' : 'STATUS.INACTIVE'} />
    </div>
  );
}
