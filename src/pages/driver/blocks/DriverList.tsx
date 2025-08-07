import React, { useState } from 'react';
import { KeenIcon } from '@/components';
import DebouncedSearchInput from '@/components/DebouncedInputField';
import { FormattedMessage, useIntl } from 'react-intl';
import { DriversGridView } from './DriversGridView';
import DriversCardView from './DriversCardView';
import clsx from 'clsx';

interface DriverListProps {
  refetch: () => void;
}

const DriverList: React.FC<DriverListProps> = ({ refetch }) => {
  const intl = useIntl();
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <div className="card">
      <div className="flex items-center justify-between p-6 ">
        <h2 className="text-xl font-semibold text-gray-800">
          <FormattedMessage id="DRIVER.LIST.TITLE" />
        </h2>

        <div className="flex items-center gap-4">
          {/* View Mode Buttons */}
          <div className="flex items-center gap-4">
            <button
              className={clsx(
                'p-3 transition-colors border rounded-lg flex items-center justify-center',
                viewMode === 'cards' ? 'text-info' : 'hover:bg-gray-50'
              )}
              onClick={() => setViewMode('cards')}
              title="Card View"
            >
              <KeenIcon
                style="duotone"
                icon="category"
                className={clsx(viewMode === 'cards' ? 'text-info' : 'text-gray-400')}
              />
            </button>
            <button
              className={clsx(
                'p-3 transition-colors border rounded-lg flex items-center justify-center',
                viewMode === 'grid' ? 'text-info' : 'hover:bg-gray-50'
              )}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <KeenIcon
                style="duotone"
                icon="row-horizontal"
                className={clsx(viewMode === 'grid' ? 'text-info' : 'text-gray-400')}
              />
            </button>
          </div>
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <KeenIcon style="duotone" icon="magnifier" />
            </div>
            <DebouncedSearchInput
              type="search"
              className="w-64 pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-info focus:border-info input"
              placeholder={intl.formatMessage({ id: 'COMMON.SEARCH' })}
              onDebounce={setSearchQuery}
            />
          </div>
        </div>
      </div>

      <div className="gap-cols responsive-card">
        <div className="card-body pt-2 px-2 sm:px-6 pb-7">
          {viewMode === 'grid' ? (
            <DriversGridView searchQuery={searchQuery} refetch={refetch} />
          ) : (
            <DriversCardView searchQuery={searchQuery} refetch={refetch} />
          )}
        </div>
      </div>
    </div>
  );
};

export { DriverList };
