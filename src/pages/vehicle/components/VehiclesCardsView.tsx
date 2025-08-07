import { getVehicles, VehicleDetails } from '@/api/cars';
import { useEffect, useMemo, useState } from 'react';
import { AutoSizer, Grid, InfiniteLoader } from 'react-virtualized';
import { Paginated } from '@/api/common.ts';
import VehicleCard from './VehicleCard';

const COLUMN_COUNT = 3;
const SCROLLBAR_WIDTH = 20;
const PAGE_SIZE = 10;

type VehiclesCardsViewProps = {
  searchQuery: string;
  refetchStats?: () => void;
  columnCount?: number;
};

export default function VehiclesCardsView({
  searchQuery,
  refetchStats,
  columnCount = COLUMN_COUNT
}: VehiclesCardsViewProps) {
  const [vehicles, setVehicles] = useState<Paginated<VehicleDetails>>();

  const [maxLoadedIndex, setMaxLoadedIndex] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);

  const viewRowCount = useMemo(() => {
    return allLoaded
      ? Math.ceil((vehicles?.totalCount ?? 0) / columnCount)
      : Math.ceil(maxLoadedIndex / columnCount) + PAGE_SIZE;
  }, [allLoaded, columnCount, vehicles?.totalCount, maxLoadedIndex]);

  const isRowLoaded = ({ index: rowIndex }: { index: number }) => {
    if (!vehicles?.data) return false;
    const baseIndex = rowIndex * columnCount;
    for (let i = 0; i < columnCount; i++) {
      if (!vehicles.data[baseIndex + i]) {
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

    const fetched = await getVehicles({
      start: itemStart,
      end: itemStop + 1,
      search: searchQuery
    });

    if (itemStop >= fetched.totalCount) {
      setAllLoaded(true);
    }

    setVehicles((prev) => {
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
    const fetched = await getVehicles({
      start: 0,
      end: maxLoadedIndex + 1,
      search: searchQuery
    });
    setVehicles(fetched);
  }

  useEffect(() => {
    (async () => {
      const fetched = await getVehicles({
        start: 0,
        end: 10,
        search: searchQuery
      });
      setVehicles(fetched);
      setMaxLoadedIndex(10);
    })();
  }, [searchQuery]);

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
                  rowHeight={275}
                  overscanRowCount={2}
                  onSectionRendered={({ rowOverscanStartIndex, rowOverscanStopIndex }) =>
                    onRowsRendered({
                      startIndex: rowOverscanStartIndex,
                      stopIndex: rowOverscanStopIndex
                    })
                  }
                  cellRenderer={({ key, rowIndex, columnIndex, style }) => {
                    const itemIndex = rowIndex * columnCount + columnIndex;
                    const vehicle = vehicles?.data[itemIndex];

                    if (itemIndex >= (vehicles?.totalCount ?? 0)) {
                      return null;
                    }

                    return (
                      <div key={key} style={style} className="p-2">
                        <VehicleCard
                          vehicle={vehicle}
                          refetchVehicles={refetchAllLoadedRows}
                          refetchStats={refetchStats}
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
