import { Paginated } from '@/api/common';
import { KeenIcon } from '@/components';
import { Skeleton } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import {
  getMaintenanceTypeTitle,
  IMaintenanceTypeTableData,
  searchMaintenanceTypes
} from '@/api/maintenance-type.ts';
import { useIntl } from 'react-intl';
import { useCurrentLanguage } from '@/providers';

interface MaintenanceTypeSearchProps {
  initialSearch?: {
    title: string;
    code: string;
  };
}

export const MaintenanceTypeDropdownSearch = ({ initialSearch }: MaintenanceTypeSearchProps) => {
  const intl = useIntl();
  const [privateSearch, setPrivateSearch] = useState(initialSearch?.title);
  const [selectedMaintenanceTypeId, setSelectedMaintenanceTypeId] = useState(initialSearch?.code);
  const [maintenanceTypes, setMaintenanceTypes] = useState<Paginated<IMaintenanceTypeTableData>>();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const remoteRowCount = useMemo(() => maintenanceTypes?.totalCount ?? 0, [maintenanceTypes]);
  const language = useCurrentLanguage();

  const isRowLoaded = ({ index }: { index: number }) => !!maintenanceTypes?.data[index];
  const loadMoreRows = async ({
    startIndex,
    stopIndex
  }: {
    startIndex: number;
    stopIndex: number;
  }) => {
    const remoteData = await searchMaintenanceTypes({ start: startIndex, end: stopIndex });
    setMaintenanceTypes((prev) => {
      const newData = prev?.data ?? [];
      remoteData.data.forEach((car, index) => {
        newData[startIndex + index] = car;
      });
      return {
        data: newData,
        totalCount: remoteData.totalCount
      };
    });
  };

  useEffect(() => {
    searchMaintenanceTypes({ start: 0, end: 10, search: privateSearch || '' }).then(
      setMaintenanceTypes
    );
  }, [privateSearch]);

  useEffect(() => {
    if (initialSearch) {
      setPrivateSearch(initialSearch.title);
      setSelectedMaintenanceTypeId(initialSearch.title);
    }
  }, [initialSearch]);

  return (
    <div className="input shrink-0 relative">
      <input
        type="text"
        placeholder={intl.formatMessage({ id: 'MAINTENANCE_TYPE.SEARCH.PLACEHOLDER' })}
        value={privateSearch}
        onChange={(e) => setPrivateSearch(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button
        className="btn btn-icon"
        type="button"
        onClick={() => {
          setPrivateSearch('');
          setSelectedMaintenanceTypeId(undefined);
        }}
      >
        <KeenIcon icon="cross" />
      </button>
      {(focused || hovered) && (
        <div
          className="absolute top-[calc(100%+4px)] left-0 w-full max-h-96 card dark:border-gray-200 mt-1 z-50 scrollable-y px-2"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {!maintenanceTypes && (
            <div className="p-2">{intl.formatMessage({ id: 'COMMON.LOADING' })}</div>
          )}
          <AutoSizer disableHeight>
            {({ width }) => (
              <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={loadMoreRows}
                rowCount={remoteRowCount}
              >
                {({ onRowsRendered, registerChild }) => (
                  <List
                    ref={registerChild}
                    className="scrollable-y !overflow-x-hidden"
                    height={384}
                    width={width}
                    rowCount={remoteRowCount}
                    rowHeight={44}
                    rowRenderer={({ key, index, style }) => {
                      const maintenanceType = maintenanceTypes?.data[index];

                      if (!maintenanceType) {
                        return <Skeleton key={key} style={style} />;
                      }

                      const title = getMaintenanceTypeTitle(maintenanceType, language.code);

                      return (
                        <div key={key} style={style}>
                          <div
                            key={maintenanceType.code}
                            className="p-2 hover:bg-gray-100 flex justify-between items-center gap-2 cursor-pointer"
                            onClick={() => {
                              setPrivateSearch(title);
                              setSelectedMaintenanceTypeId(maintenanceType.code);
                              setHovered(false);
                            }}
                          >
                            <span>{title}</span>
                          </div>
                        </div>
                      );
                    }}
                    onRowsRendered={onRowsRendered}
                  />
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
        </div>
      )}
      <input type="hidden" name="type" value={selectedMaintenanceTypeId} />
    </div>
  );
};
