import { KeenIcon } from '@/components';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ButtonRadioGroup } from '../ButtonRadioGroup';
import { MaintenanceTable } from './MaintenanceTable';
import { ViolationTable } from './ViolationTable';

export interface MaintenanceViolationTableProps {
  id?: string;
  context?: 'vehicle' | 'reservation';
}

const MaintenanceViolationTable = ({ id, context = 'vehicle' }: MaintenanceViolationTableProps) => {
  const intl = useIntl();
  const [selection, setSelection] = useState('Maintenance');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="card hover:shadow-md card-grid h-full min-w-full">
      <div className="card-header">
        <h3 className="card-title">
          <FormattedMessage id="DASHBOARD.VIOLATION_MAINTENANCE.TITLE" />
        </h3>
        <div className="flex gap-7 items-center">
          <ButtonRadioGroup
            selections={['Maintenance', 'Violation']}
            selection={selection}
            setSelection={setSelection}
            translations={{
              Maintenance: intl.formatMessage({
                id: 'DASHBOARD.VIOLATION_MAINTENANCE.MAINTENANCE'
              }),
              Violation: intl.formatMessage({ id: 'DASHBOARD.VIOLATION_MAINTENANCE.VIOLATION' })
            }}
          />
          <div className="input input-sm max-w-48">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder={intl.formatMessage({ id: 'COMMON.SEARCH' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="card-body h-full">
        {selection === 'Violation' && (
          <ViolationTable searchQuery={searchQuery} id={id} context={context} />
        )}
        {selection === 'Maintenance' && (
          <MaintenanceTable searchQuery={searchQuery} id={id} context={context} />
        )}
      </div>
    </div>
  );
};

export { MaintenanceViolationTable };
