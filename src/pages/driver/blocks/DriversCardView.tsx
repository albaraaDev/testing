import { Paginated } from '@/api/common';
import { deleteDriver, DriverDetails, getDrivers } from '@/api/drivers';
import { DriverCard } from '@/pages/dashboards/blocks/Drivers/DriverCard';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { AutoSizer, Grid, InfiniteLoader } from 'react-virtualized';

type DriversCardViewProps = {
  refetch?: () => void;
  searchQuery: string;
  columnCount?: number;
};

const COLUMN_COUNT = 3;
const SCROLLBAR_WIDTH = 20;
const PAGE_SIZE = 10;

export default function DriversCardView({
  refetch: refetchStats,
  searchQuery,
  columnCount = COLUMN_COUNT
}: DriversCardViewProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [drivers, setDrivers] = useState<Paginated<DriverDetails>>();

  const [maxLoadedIndex, setMaxLoadedIndex] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);

  const viewRowCount = useMemo(() => {
    return allLoaded
      ? Math.ceil((drivers?.totalCount ?? 0) / columnCount)
      : Math.ceil(maxLoadedIndex / columnCount) + PAGE_SIZE;
  }, [allLoaded, columnCount, drivers?.totalCount, maxLoadedIndex]);

  const isRowLoaded = ({ index: rowIndex }: { index: number }) => {
    if (!drivers?.data) return false;
    const baseIndex = rowIndex * columnCount;
    for (let i = 0; i < columnCount; i++) {
      if (!drivers.data[baseIndex + i]) {
        return false;
      }
    }
    return true;
  };

  const loadMoreRows = async ({
    startIndex,
    stopIndex
  }: {
    startIndex: number;
    stopIndex: number;
  }) => {
    if (allLoaded) return;

    const itemStart = startIndex * columnCount;
    const itemStop = stopIndex * columnCount + (columnCount - 1);

    const fetched = await getDrivers({
      start: itemStart,
      end: itemStop + 1,
      search: searchQuery
    });

    if (itemStop >= fetched.totalCount) {
      setAllLoaded(true);
    }

    setDrivers((prev) => {
      const oldData = prev?.data ?? [];
      const newData = [...oldData];
      fetched.data.forEach((item, idx) => {
        newData[itemStart + idx] = item;
      });
      return {
        data: newData,
        totalCount: fetched.totalCount
      };
    });

    setMaxLoadedIndex((prevMax) => Math.max(prevMax, itemStop));
  };

  async function refetchAllLoadedRows() {
    if (maxLoadedIndex < 0) return;
    const fetched = await getDrivers({
      start: 0,
      end: maxLoadedIndex + 1,
      search: searchQuery
    });
    setDrivers(fetched);
  }

  useEffect(() => {
    (async () => {
      const fetched = await getDrivers({
        start: 0,
        end: 10,
        search: searchQuery
      });
      setDrivers(fetched);
      setMaxLoadedIndex(10);
    })();
  }, [searchQuery]);

  if (!drivers?.data.length)
    return <div className="text-gray-600 text-center font-semibold">No Drivers Available</div>;

  return (
    <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreRows} rowCount={viewRowCount}>
      {({ onRowsRendered, registerChild }) => (
        <div style={{ width: '100%', height: '450px' }}>
          <AutoSizer>
            {({ width, height }) => {
              const widthWithoutScrollBar = width - SCROLLBAR_WIDTH;

              return (
                <Grid
                  ref={registerChild}
                  width={width}
                  height={height}
                  columnCount={columnCount}
                  columnWidth={widthWithoutScrollBar / columnCount}
                  rowCount={viewRowCount}
                  rowHeight={291}
                  overscanRowCount={2}
                  onSectionRendered={({ rowOverscanStartIndex, rowOverscanStopIndex }) =>
                    onRowsRendered({
                      startIndex: rowOverscanStartIndex,
                      stopIndex: rowOverscanStopIndex
                    })
                  }
                  cellRenderer={({ key, rowIndex, columnIndex, style }) => {
                    const itemIndex = rowIndex * columnCount + columnIndex;
                    const driver = drivers?.data[itemIndex];

                    if (itemIndex >= (drivers?.totalCount ?? 0)) {
                      return null;
                    }

                    return (
                      <div key={key} style={style} className="p-2">
                        <DriverCard
                          driver={driver}
                          refetchStats={async () => {
                            refetchStats?.();
                            await refetchAllLoadedRows();
                          }}
                          onDelete={async () => {
                            const delRes = await deleteDriver(drivers!.data[itemIndex].id);
                            enqueueSnackbar(delRes.message, { variant: 'success' });
                            await refetchAllLoadedRows();
                          }}
                        />
                      </div>
                    );
                  }}
                />
              );
            }}
          </AutoSizer>
        </div>
      )}
    </InfiniteLoader>
  );
}
