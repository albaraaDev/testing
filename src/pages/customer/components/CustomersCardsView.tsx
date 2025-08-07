import { getCustomers, CustomerDetails } from '@/api/customers';
import { useEffect, useMemo, useState } from 'react';
import { AutoSizer, Grid, InfiniteLoader } from 'react-virtualized';
import { Paginated } from '@/api/common.ts';
import CustomerCard from './CustomerCard';

const COLUMN_COUNT = 3;
const SCROLLBAR_WIDTH = 20;
const PAGE_SIZE = 10;

type CustomersCardsViewProps = {
  searchQuery: string;
  refetchStats?: () => void;
  columnCount?: number;
};

export default function CustomersCardsView({
  searchQuery,
  refetchStats,
  columnCount = COLUMN_COUNT
}: CustomersCardsViewProps) {
  const [customers, setCustomers] = useState<Paginated<CustomerDetails>>();

  const [maxLoadedIndex, setMaxLoadedIndex] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);

  const viewRowCount = useMemo(() => {
    return allLoaded
      ? Math.ceil((customers?.totalCount ?? 0) / columnCount)
      : Math.ceil(maxLoadedIndex / columnCount) + PAGE_SIZE;
  }, [allLoaded, columnCount, customers?.totalCount, maxLoadedIndex]);

  const isRowLoaded = ({ index: rowIndex }: { index: number }) => {
    if (!customers?.data) return false;
    const baseIndex = rowIndex * columnCount;
    for (let i = 0; i < columnCount; i++) {
      if (!customers.data[baseIndex + i]) {
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

    const fetched = await getCustomers({
      start: itemStart,
      end: itemStop + 1,
      search: searchQuery
    });

    if (itemStop >= fetched.totalCount) {
      setAllLoaded(true);
    }

    setCustomers((prev) => {
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
    const fetched = await getCustomers({
      start: 0,
      end: maxLoadedIndex + 1,
      search: searchQuery
    });
    setCustomers(fetched);
  }

  useEffect(() => {
    (async () => {
      const fetched = await getCustomers({
        start: 0,
        end: 10,
        search: searchQuery
      });
      setCustomers(fetched);
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
                    const customer = customers?.data[itemIndex];

                    if (itemIndex >= (customers?.totalCount ?? 0)) {
                      return null;
                    }

                    return (
                      <div key={key} style={style} className="p-2">
                        <CustomerCard
                          customer={customer}
                          refetchCustomers={refetchAllLoadedRows}
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
