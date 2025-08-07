import { CustomerDetails, updateCustomerStatus } from '@/api/customers';
import { StatusDropdown } from '@/pages/dashboards/blocks/StatusDropdown';
import { STATUS_OPTIONS } from '../constants';

export const ReservationStatusDropdown = ({
  customer,
  refetchCustomers,
  refetchStats
}: {
  customer: CustomerDetails;
  refetchCustomers: () => void;
  refetchStats?: () => void;
}) => {
  return (
    <StatusDropdown
      selected={customer.status!.toString()}
      setSelected={async (value) => {
        await updateCustomerStatus(customer.id, value === 'true');
        refetchCustomers();
        refetchStats?.();
      }}
      options={STATUS_OPTIONS}
    />
  );
};
