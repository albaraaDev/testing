import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/partials/toolbar';
import { AddWorkingHoursPage } from '.';
import { WorkingPeriodModel, createWorkingPeriod } from '@/api/working-hours';
import { useSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { useAppRouting } from '@/routing/useAppRouting';

const AddWorkingHours = () => {
  const navigate = useAppRouting();
  const { enqueueSnackbar } = useSnackbar();
  const intl = useIntl();

  const handleSubmit = async (values: WorkingPeriodModel) => {
    try {
      const res = await createWorkingPeriod(values);
      enqueueSnackbar(res.message, {
        variant: 'success'
      });
      navigate('/working-hours/list');
    } catch (error) {
      console.error('Error saving working period:', error);
      enqueueSnackbar(intl.formatMessage({ id: 'WORKING_HOURS.SAVE_ERROR' }), {
        variant: 'error'
      });
    }
  };

  return (
    <Container>
      <Toolbar>
        <ToolbarHeading>
          <h1 className="text-2xl font-bold">
            <FormattedMessage id="WORKING_HOURS.CREATE_TITLE" />
          </h1>
        </ToolbarHeading>
        <ToolbarActions>
          <Link to="/working-hours" className="btn btn-secondary">
            <FormattedMessage id="COMMON.BACK" />
          </Link>
        </ToolbarActions>
      </Toolbar>

      <div className="grid gap-5 lg:gap-7.5">
        <AddWorkingHoursPage onSubmit={handleSubmit} />
      </div>
    </Container>
  );
};

export { AddWorkingHours };
