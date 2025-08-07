import { DriverDetails, updateDriverStatus } from '@/api/drivers';
import { StatusDropdown, StatusDropdownProps } from '../StatusDropdown';
import { toAbsoluteUrl } from '@/utils';
import { useIntl } from 'react-intl';
import { useLanguage } from '@/i18n';
import { Link } from 'react-router';

interface DriverCardProps {
  driver?: DriverDetails;
  onDelete: () => void;
  refetchStats?: () => void;
}

export const DriverCard = ({ driver, onDelete, refetchStats }: DriverCardProps) => {
  const intl = useIntl();
  const { isRTL } = useLanguage();
  const options: StatusDropdownProps['options'] = {
    'Under Review': {
      color: '#FFA800',
      backgroundColor: '#FFF8EA',
      nameKey: 'DRIVER.STATUS.UNDER_REVIEW'
    },
    Active: {
      color: '#50CD89',
      backgroundColor: '#EEFAF4',
      nameKey: 'DRIVER.STATUS.ACTIVE'
    }
  };

  if (!driver) {
    return (
      <div className="flex hover:shadow-md h-full w-[402px] flex-col flex-shrink-0 rounded-2xl border border-[#E7E8ED] dark:border-gray-200 overflow-hidden">
        <div className="h-1 w-full" style={{ backgroundColor: '#212121' }} />
      </div>
    );
  }

  return (
    <div
      className="flex hover:shadow-md flex-col flex-shrink-0 rounded-2xl border border-[#E7E8ED] dark:border-gray-200 overflow-hidden"
      style={{ direction: isRTL() ? 'rtl' : 'ltr' }}
    >
      <div
        className="h-1 w-full"
        style={{ backgroundColor: options[driver.status]?.color || '#212121' }}
      />
      <div className="flex flex-col gap-3 px-8 py-6 grow">
        <div className="flex justify-between items-center">
          <img
            src={driver.driver.avatar || toAbsoluteUrl('/media/avatars/avatar-placeholder.png')}
            className="size-12 rounded-[4px]"
          />
          <StatusDropdown
            selected={driver.status}
            setSelected={async (status) => {
              await updateDriverStatus(driver.id, status === 'Active');
              refetchStats?.();
            }}
            options={options}
          />
        </div>
        <div className="text-[#3F4254] dark:text-gray-50 font-bold text-[22px]">
          {driver.driver.name}
        </div>
        <div className="text-[#B5B5C3] font-medium">
          {driver.identityType === 'National ID'
            ? intl.formatMessage({ id: 'DRIVER.NATIONALITY.TURKISH' })
            : intl.formatMessage({ id: 'DRIVER.NATIONALITY.FOREIGN' })}
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 font-medium text-sm text-[#B5B5C3] text-nowrap">
          <div className="flex gap-1 w-36">
            <img src={toAbsoluteUrl('/media/icons/email.svg')} />
            <span className="overflow-hidden text-ellipsis">{driver.driver.email}</span>
          </div>
          <div className="flex gap-1 w-36">
            <img src={toAbsoluteUrl('/media/icons/phone.svg')} />
            <span className="overflow-hidden text-ellipsis [direction:ltr]">{driver.phone}</span>
          </div>
          <div className="flex gap-1 w-36">
            <img src={toAbsoluteUrl('/media/icons/city.svg')} />
            <span className="overflow-hidden text-ellipsis">{driver.country}</span>
          </div>
          <div className="flex gap-1 w-36">
            <img src={toAbsoluteUrl('/media/icons/city.svg')} />
            <span className="overflow-hidden text-ellipsis">{driver.city}</span>
          </div>
        </div>
      </div>
      <div className="text-xs border-t flex justify-center">
        <Link to={`/drivers/driver/${driver.id}`} className="px-5 py-2 flex gap-2">
          <img src={toAbsoluteUrl('/media/icons/view-light.svg')} />
          <span>{intl.formatMessage({ id: 'DRIVER.VIEW', defaultMessage: 'View' })}</span>
        </Link>
        <Link to={`/drivers/edit/${driver.id}`} className="px-5 py-2 border-x flex gap-2">
          <img src={toAbsoluteUrl('/media/icons/edit-light.svg')} />
          <span>{intl.formatMessage({ id: 'DRIVER.EDIT', defaultMessage: 'Edit' })}</span>
        </Link>
        <button
          className="px-5 py-2 flex gap-2"
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
        >
          <img src={toAbsoluteUrl('/media/icons/delete-light.svg')} />
          <span>{intl.formatMessage({ id: 'DRIVER.DELETE', defaultMessage: 'Delete' })}</span>
        </button>
      </div>
    </div>
  );
};
