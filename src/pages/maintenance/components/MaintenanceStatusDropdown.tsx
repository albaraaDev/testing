import { CellContext } from '@tanstack/react-table';
import { useSettings } from '@/providers';
import { useDataGrid } from '@/components';
import { IMaintenanceTableData, updateMaintenanceStatus } from '@/api/maintenance.ts';
import { StatusDropdown } from '@/pages/dashboards/blocks/StatusDropdown.tsx';
import { useIntl } from 'react-intl';

export const MaintenanceStatusDropdown = (
  info: CellContext<IMaintenanceTableData, unknown> & {
    refetch: () => void;
  }
) => {
  const { settings } = useSettings();
  const intl = useIntl();
  const reload = useDataGrid().fetchServerSideData;

  return (
    <StatusDropdown
      selected={info.row.original.status.toString()}
      setSelected={async (status) => {
        await updateMaintenanceStatus(info.row.original.id, status);
        reload();
        info.refetch();
      }}
      options={{
        ongoing: {
          color: '#F1416C',
          backgroundColor: settings.themeMode == 'dark' ? '#15171c' : '#ffffff',
          name: intl.formatMessage({ id: 'MAINTENANCE.STATUS.ONGOING' })
        },
        finished: {
          color: '#50CD89',
          backgroundColor: settings.themeMode == 'dark' ? '#15171c' : '#ffffff',
          name: intl.formatMessage({ id: 'MAINTENANCE.STATUS.FINISHED' })
        }
      }}
    />
  );
};
