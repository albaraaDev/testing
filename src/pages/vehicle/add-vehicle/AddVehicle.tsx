import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { PageNavbar } from '@/pages/account';
import { AddVehiclePage } from '.';
import { useParams } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAppRouting } from '@/routing/useAppRouting';

const AddVehicle = () => {
  const intl = useIntl();
  const { id } = useParams();
  const navigate = useAppRouting();
  const Actions = () => (
    <ToolbarActions>
      <button
        onClick={() => navigate(-1)}
        type="button"
        className="text-red-700 hover:text-white border bg-red-100 border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
      >
        <FormattedMessage id="COMMON.DISCARD" />
      </button>
    </ToolbarActions>
  );

  return (
    <div className="pb-10">
      <PageNavbar />

      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle
              text={
                id
                  ? intl.formatMessage({ id: 'VEHICLE.EDIT_VEHICLE' })
                  : intl.formatMessage({ id: 'VEHICLE.ADD_VEHICLE' })
              }
            />
          </ToolbarHeading>
          <Actions />
        </Toolbar>

        <AddVehiclePage />
      </Container>
    </div>
  );
};

export { AddVehicle };
