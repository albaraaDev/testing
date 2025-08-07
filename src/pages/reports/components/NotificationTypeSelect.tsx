import { getNotificationTypes } from '@/api/notifications';
import { Paginated } from '@/api/common';
import { KeenIcon } from '@/components';
import { Skeleton } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import { FormattedMessage, useIntl } from 'react-intl';

interface NotificationTypeSelectProps {
  initialValue?: {
    code: string;
    label: string;
  };
  onTypeChange?: (type: { code: string; label: string } | undefined) => void;
}

export const NotificationTypeSelect = ({
  initialValue,
  onTypeChange
}: NotificationTypeSelectProps) => {
  const { formatMessage } = useIntl();
  const [selectedType, setSelectedType] = useState<{ code: string; label: string } | undefined>(
    initialValue
  );
  const [types, setTypes] = useState<Paginated<{ code: string; label: string }>>();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const remoteRowCount = useMemo(() => types?.totalCount ?? 0, [types]);

  const isRowLoaded = ({ index }: { index: number }) => !!types?.data[index];
  const loadMoreRows = async ({
    startIndex,
    stopIndex
  }: {
    startIndex: number;
    stopIndex: number;
  }) => {
    const remoteData = await getNotificationTypes({ start: startIndex, end: stopIndex });
    setTypes((prev) => {
      const newData = prev?.data ?? [];
      remoteData.data.forEach((type, index) => {
        newData[startIndex + index] = { code: type.code, label: type.label };
      });
      return {
        data: newData,
        totalCount: remoteData.totalCount
      };
    });
  };

  useEffect(() => {
    getNotificationTypes({ start: 0, end: 10 }).then(setTypes);
  }, []);

  const handleTypeSelect = (type: { code: string; label: string } | undefined) => {
    setSelectedType(type);
    onTypeChange?.(type);
  };

  return (
    <div className="input shrink-0 relative">
      <input
        type="text"
        readOnly
        placeholder={formatMessage({ id: 'NOTIFICATION_TYPE_SELECT.PLACEHOLDER' })}
        value={selectedType?.label || ''}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button
        className="btn btn-icon"
        type="button"
        onClick={() => {
          handleTypeSelect(undefined);
        }}
      >
        <KeenIcon icon="cross" />
      </button>
      {(focused || hovered) && (
        <div
          className="absolute top-[calc(100%+4px)] px-2 left-0 max-h-96 w-full card dark:border-gray-200 mt-1 z-50 scrollable-y overflow-hidden"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {!types && (
            <div className="p-2">
              <FormattedMessage id="COMMON.LOADING" />
            </div>
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
                    height={290}
                    width={width}
                    rowCount={remoteRowCount}
                    rowHeight={35}
                    rowRenderer={({ key, index, style }) => {
                      const type = types?.data[index];

                      if (!type) {
                        return <Skeleton key={key} style={style} />;
                      }

                      return (
                        <div key={key} style={style}>
                          <div
                            className="hover:bg-gray-100 cursor-pointer h-full flex items-center"
                            onClick={() => {
                              handleTypeSelect(type);
                              setHovered(false);
                            }}
                          >
                            <span className="truncate p-2" title={type.label}>
                              {type.label}
                            </span>
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
      <input type="hidden" name="alarmCode" value={selectedType?.code || ''} />
    </div>
  );
};
