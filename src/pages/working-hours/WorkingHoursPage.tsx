import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { WorkingHoursList } from './blocks/WorkingHoursList';
import { Link } from 'react-router-dom';
import { KeenIcon } from '@/components';

const WorkingHoursPage: React.FC = () => {
  const [, setRefreshTrigger] = useState(0);

  const refetch = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="grid gap-5 lg:gap-7.5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xl text-gray-800">
          <FormattedMessage id="WORKING_HOURS.TITLE" />
        </h3>
        <div>
          <Link to="/working-hours/create" className="btn btn-primary btn-sm">
            <KeenIcon icon="plus" className="me-1" /> <FormattedMessage id="WORKING_HOURS.CREATE" />
          </Link>
        </div>
      </div>

      <WorkingHoursList refetch={refetch} />
    </div>
  );
};

export { WorkingHoursPage };
