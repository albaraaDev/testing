import { CustomerDetails, getCustomers } from '@/api/customers';
import { KeenIcon } from '@/components';
import { Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Field, useField, useFormikContext } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { AutoSizer, List } from 'react-virtualized';

interface CustomerSearchProps {
  idFieldName: string;
  place?: 'top' | 'bottom';
  required?: boolean;
}

export const CustomerSearch = ({
  idFieldName,
  place = 'top',
  required = false
}: CustomerSearchProps) => {
  const { formatMessage } = useIntl();
  const [field] = useField(idFieldName);
  const { setFieldValue, errors, touched } = useFormikContext<any>();

  const [customerInitialIdField] = useField('initialCustomer.id');
  const [customerInitialNameField] = useField('initialCustomer.name');
  const initialCustomer = useMemo(
    () => ({
      id: customerInitialIdField.value,
      name: customerInitialNameField.value
    }),
    [customerInitialIdField.value, customerInitialNameField.value]
  );

  const [shownCustomers, setShownCustomers] = useState<CustomerDetails[]>([]);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const [privateSearch, setPrivateSearch] = useState('');

  useEffect(() => {
    if (initialCustomer.id) {
      setPrivateSearch(initialCustomer.name || '');
    }
  }, [initialCustomer]);

  useEffect(() => {
    if (field.value) {
      setPrivateSearch(shownCustomers.find((x) => x.id === field.value)?.fullName || '');
    }
  }, [field.value, shownCustomers]);

  const { data: customers } = useQuery({
    queryKey: ['customers', privateSearch],
    queryFn: async () => (await getCustomers({ start: 0, end: 10, search: privateSearch })).data
  });

  useEffect(() => {
    if (initialCustomer?.id) {
      setFieldValue(idFieldName, initialCustomer.id);
    }
  }, [initialCustomer, idFieldName, setFieldValue]);

  useEffect(() => {
    const cstmrs = customers || [];
    if (privateSearch) {
      const filtered = cstmrs.filter(
        (cstmr) =>
          cstmr.fullName?.toLowerCase().includes(privateSearch.toLowerCase()) ||
          cstmr.companyName?.toLowerCase().includes(privateSearch.toLowerCase())
      );
      setShownCustomers(filtered);
    } else {
      setShownCustomers(cstmrs);
    }
  }, [privateSearch, customers]);

  return (
    <>
      <div className="input shrink-0 relative">
        <Field type="text" name={idFieldName} hidden />
        <input
          type="text"
          placeholder={formatMessage({ id: 'CUSTOMER.SEARCH.PLACEHOLDER' })}
          value={privateSearch}
          onChange={(e) => setPrivateSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          className={errors[idFieldName] && touched[idFieldName] ? 'border-red-500' : ''}
        />
        <button
          className="btn btn-icon"
          type="button"
          onClick={() => {
            setFieldValue(idFieldName, '');
            setPrivateSearch('');
          }}
        >
          <KeenIcon icon="cross" />
        </button>
        {(focused || hovered) && (
          <div
            className={`absolute ${place === 'top' ? 'bottom' : 'top'}-[calc(100%+4px)] px-2 left-0 w-full max-h-96 card dark:border-gray-200 mt-1 z-50`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {!customers ? (
              <div className="p-2">
                <FormattedMessage id="COMMON.LOADING" />
              </div>
            ) : (
              <AutoSizer disableHeight>
                {({ width }) => (
                  <List
                    className="scrollable-y !overflow-x-hidden"
                    height={384}
                    width={width}
                    rowCount={shownCustomers.length}
                    rowHeight={44}
                    rowRenderer={({ key, index, style }) => {
                      const customer = shownCustomers[index];

                      if (!customer) {
                        return <Skeleton key={key} style={style} />;
                      }

                      return (
                        <div key={key} style={style}>
                          <div
                            key={customer.id}
                            className="p-2 hover:bg-gray-100 flex justify-between items-center gap-2 cursor-pointer"
                            onClick={() => {
                              setFieldValue(idFieldName, customer.id);
                              setHovered(false);
                            }}
                          >
                            <span className="font-monospace">{customer.fullName}</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                )}
              </AutoSizer>
            )}
          </div>
        )}
        <input type="hidden" {...field} />
      </div>
      {errors[idFieldName] && touched[idFieldName] && typeof errors[idFieldName] === 'string' && (
        <div className="text-red-500 text-xs mt-1">{errors[idFieldName]}</div>
      )}
    </>
  );
};
