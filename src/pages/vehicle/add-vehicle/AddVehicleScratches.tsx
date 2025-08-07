import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { PageNavbar } from '@/pages/account';
import { CarScratches } from '.';
import { useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { useAppRouting } from '@/routing/useAppRouting';

const AddVehicleScratches = () => {
  const navigate = useAppRouting();
  const { id } = useParams();

  const Actions = () => (
    <ToolbarActions>
      <button
        onClick={() => navigate(-1)}
        type="button"
        className="text-red-700 hover:text-white border bg-red-100 border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
      >
        <FormattedMessage id="COMMON.DISCARD" />
      </button>
      <button
        onClick={() => navigate(`/vehicles/vehicle/${id}`)}
        type="button"
        className="focus:outline-none text-white bg-green-500 w-40 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-xs px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
      >
        <FormattedMessage id="VEHICLE.SCRATCHES.GOTO_VEHICLE" />
      </button>
    </ToolbarActions>
  );

  return (
    <div className="pb-10">
      <PageNavbar />

      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
          </ToolbarHeading>
          <Actions />
        </Toolbar>

        <CarScratches />

        <div className="flex justify-end pt-6">
          <Actions />
        </div>
      </Container>
    </div>
  );
};

export { AddVehicleScratches };
