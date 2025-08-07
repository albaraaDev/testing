import { useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { KeenIcon } from '@/components';
import { ButtonRadioGroup } from '../ButtonRadioGroup';
import { ViolationTable } from './ViolationTable';
import { MaintenanceTable } from './MaintenanceTable';

export interface MaintenanceViolationTableProps {
  id?: string;
}

const MaintenanceViolationTable = ({ id }: MaintenanceViolationTableProps) => {
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
        {selection === 'Violation' && <ViolationTable searchQuery={searchQuery} id={id} />}
        {selection === 'Maintenance' && <MaintenanceTable searchQuery={searchQuery} id={id} />}
      </div>
    </div>
  );
};

export { MaintenanceViolationTable };
