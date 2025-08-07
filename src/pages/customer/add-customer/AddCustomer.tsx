import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { PageNavbar } from '@/pages/account';
import { AddCustomerPage } from '.';
import { useParams } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAppRouting } from '@/routing/useAppRouting';
import {
  createCustomer,
  CustomerDetails,
  getCustomerDetails,
  updateCustomer
} from '@/api/customers';
import { useEffect, useState } from 'react';
import { ResponseModel } from '@/api';
import { useSnackbar } from 'notistack';
import axios, { AxiosError } from 'axios';

const AddCustomer = () => {
  const intl = useIntl();
  const { id } = useParams();
  const navigate = useAppRouting();
  const [customer, setCustomer] = useState<CustomerDetails | undefined>(undefined);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (id) {
      getCustomerDetails(id).then(setCustomer);
    }
  }, [id]);

  const Actions = () => (
    <ToolbarActions>
      <button
        type="button"
        className="text-red-700 hover:text-white border bg-red-100 border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
        onClick={() => navigate(-1)}
      >
        <FormattedMessage id="COMMON.DISCARD" />
      </button>
      <button
        type="submit"
        className="focus:outline-none text-white bg-green-500 w-40 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-xs px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
      >
        {customer ? <FormattedMessage id="COMMON.SAVE" /> : <FormattedMessage id="COMMON.ADD" />}
      </button>
    </ToolbarActions>
  );

  return (
    <form
      className="pb-10"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        try {
          const response = customer
            ? await updateCustomer(customer.id, data)
            : await createCustomer(data);
          enqueueSnackbar(response.message, {
            variant: 'success'
          });

          const result = response.result;
          if (customer || !result) {
            navigate('/customers/customer');
          } else {
            navigate(`/customers/edit/${result.id}`);
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ResponseModel<never>>;
            enqueueSnackbar(
              axiosError.response?.data.message || <FormattedMessage id="COMMON.ERROR" />,
              {
                variant: 'error'
              }
            );
          } else {
            enqueueSnackbar(<FormattedMessage id="COMMON.ERROR" />, {
              variant: 'error'
            });
          }
        }
      }}
    >
      <PageNavbar />

      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle
              text={
                id
                  ? intl.formatMessage({ id: 'CUSTOMER.EDIT_CUSTOMER' })
                  : intl.formatMessage({ id: 'CUSTOMER.ADD_CUSTOMER' })
              }
            />
          </ToolbarHeading>
          <Actions />
        </Toolbar>

        <AddCustomerPage customer={customer} />
      </Container>
    </form>
  );
};

export { AddCustomer };
