import { deleteCustomer, CustomerDetails } from '@/api/customers';
import { toAbsoluteUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { useDialogs } from '@toolpad/core/useDialogs';
import { STATUS_OPTIONS } from '../constants';
import { CustomerStatusDropdown } from '../blocks/CustomerStatusDropdown';

type CustomerCardProps = {
  customer?: CustomerDetails;
  refetchCustomers: () => void;
  refetchStats?: () => void;
};

export default function CustomerCard({
  customer,
  refetchStats,
  refetchCustomers
}: CustomerCardProps) {
  const { enqueueSnackbar } = useSnackbar();
  const intl = useIntl();
  const dialogs = useDialogs();

  if (!customer) {
    return (
      <div className="m-2 flex hover:shadow-md h-full w-full flex-col flex-shrink-0 rounded-2xl border border-[#E7E8ED] dark:border-gray-200 overflow-hidden">
        <div className="h-1 w-full" style={{ backgroundColor: '#212121' }} />
      </div>
    );
  }
  return (
    <div
      key={customer.email}
      className="flex flex-col rounded-2xl border border-[#E7E8ED] overflow-hidden shadow-md"
    >
      <div
        className="h-1 w-full"
        style={{ backgroundColor: STATUS_OPTIONS[customer.status!.toString()].color }}
      />

      <div className="flex flex-col gap-3 px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="text-[#3F4254] font-bold text-[22px]">{customer.fullName}</div>
          <div className="flex justify-between items-center">
            <CustomerStatusDropdown
              customer={customer}
              refetchCustomers={refetchCustomers}
              refetchStats={refetchStats}
            />
          </div>
        </div>
        <div className="text-[#B5B5C3] font-medium">{customer.nationality}</div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 font-medium text-sm text-[#B5B5C3] text-nowrap">
          <div className="flex gap-1 w-36">
            <img src={toAbsoluteUrl('/media/icons/email.svg')} />
            <span className="overflow-hidden text-ellipsis">{customer.email}</span>
          </div>
          <div className="flex gap-1 w-36">
            <img src={toAbsoluteUrl('/media/icons/phone.svg')} />
            <span className="overflow-hidden text-ellipsis">{customer.firstPhone}</span>
          </div>
          <div className="flex gap-1 w-36">
            <img src={toAbsoluteUrl('/media/icons/city.svg')} />
            <span className="overflow-hidden text-ellipsis">{customer.country}</span>
          </div>
          <div className="flex gap-1 w-36">
            <img src={toAbsoluteUrl('/media/icons/city.svg')} />
            <span className="overflow-hidden text-ellipsis">{customer.city}</span>
          </div>
        </div>
      </div>
      <div className="text-xs border-t flex justify-center">
        <Link
          to={'/customers/customer/' + customer.id}
          className="px-5 py-2 flex gap-2 hover:bg-gray-50"
          title={intl.formatMessage({ id: 'CUSTOMER.GRID.ACTION.VIEW' })}
        >
          <img src={toAbsoluteUrl('/media/icons/view-light.svg')} />
          <span>{intl.formatMessage({ id: 'COMMON.VIEW' })}</span>
        </Link>
        <Link
          to={'/customers/edit/' + customer.id}
          className="px-5 py-2 border-x flex gap-2 hover:bg-gray-50"
          title={intl.formatMessage({ id: 'CUSTOMER.GRID.ACTION.EDIT' })}
        >
          <img src={toAbsoluteUrl('/media/icons/edit-light.svg')} />
          <span>{intl.formatMessage({ id: 'COMMON.EDIT' })}</span>
        </Link>
        <button
          onClick={async () => {
            if (
              !(await dialogs.confirm(
                intl.formatMessage({
                  id: 'CUSTOMER.DELETE.MODAL_MESSAGE'
                }),
                {
                  title: intl.formatMessage({ id: 'CUSTOMER.DELETE.MODAL_TITLE' }),
                  okText: intl.formatMessage({ id: 'COMMON.DELETE' }),
                  cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
                }
              ))
            )
              return;
            const delRes = await deleteCustomer(customer.id);
            enqueueSnackbar(delRes.message, {
              variant: 'success'
            });
            refetchCustomers();
            refetchStats?.();
          }}
          className="px-5 py-2 flex gap-2 hover:bg-gray-50"
          title={intl.formatMessage({ id: 'CUSTOMER.GRID.ACTION.DELETE' })}
        >
          <img src={toAbsoluteUrl('/media/icons/delete-light.svg')} />
          <span>{intl.formatMessage({ id: 'COMMON.DELETE' })}</span>
        </button>
      </div>
    </div>
  );
}
