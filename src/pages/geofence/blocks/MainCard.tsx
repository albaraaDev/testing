import { useGeofenceContext } from '../providers/GeofenceContext';
import 'react-resizable/css/styles.css';
import { toAbsoluteUrl } from '@/utils';
import { deleteGeofence } from '@/api/geofence';
import { useState } from 'react';
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import { useLanguage } from '@/i18n';
import { CircularProgress, Skeleton } from '@mui/material';
import { KeenIcon } from '@/components';
import { Link } from 'react-router';
import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { useDialogs } from '@toolpad/core/useDialogs';

export const MainCard = () => {
  const intl = useIntl();
  const dialogs = useDialogs();
  const {
    search,
    refetch,
    geofences,
    selectedGeofence,
    setSelectedGeofence,
    isRowLoaded,
    loadMoreRows,
    remoteRowCount
  } = useGeofenceContext();
  const { isRTL } = useLanguage();
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <div className="card-body md:w-[411px] flex flex-col gap-2 px-3 py-3 h-full">
      <form
        className="flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          search(searchQuery);
        }}
      >
        <div className="input input-sm h-[34px]">
          <input
            type="text"
            placeholder={intl.formatMessage({ id: 'COMMON.SEARCH' })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="btn btn-icon my-auto"
            type="button"
            onClick={() => {
              search('');
            }}
          >
            <KeenIcon icon="cross" />
          </button>
        </div>
        <button className="btn btn-info btn-icon size-[34px]" type="submit">
          <img src={toAbsoluteUrl('/media/icons/search.svg')} />
        </button>
      </form>
      <div className="w-full h-full">
        {geofences ? (
          <AutoSizer>
            {({ height, width }) => (
              <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={loadMoreRows}
                rowCount={remoteRowCount}
              >
                {({ onRowsRendered, registerChild }) => (
                  <List
                    ref={registerChild}
                    className="scrollable-y !overflow-x-hidden"
                    height={height}
                    width={width}
                    style={{ direction: isRTL() ? 'rtl' : 'ltr' }}
                    rowCount={remoteRowCount}
                    rowHeight={80}
                    rowRenderer={({ key, index, style }) => {
                      const geofence = geofences[index];

                      if (!geofence) {
                        return <Skeleton key={key} style={style} />;
                      }

                      return (
                        <div key={key} style={style}>
                          <div
                            key={geofence.id}
                            data-selected={geofence.id === selectedGeofence?.id}
                            onClick={() => setSelectedGeofence(geofence)}
                            className="flex gap-2 justify-between items-center p-[14px] rounded-[10px] border border-[#E7E8ED] dark:border-gray-300 dark.data-[selected=true]:border-[#5151F9] data-[selected=true]:border-[#5151F9] data-[selected=true]:bg-[#5151F90A]"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="text-sm font-semibold">{geofence.name}</div>
                              <div className="text-xs text-gray-400">{geofence.type}</div>
                            </div>
                            <div className="flex gap-2">
                              <Link
                                to={`/geofences/edit/${geofence.id}`}
                                className="btn btn-icon btn-clean btn-lg !size-[18px]"
                                title={intl.formatMessage({ id: 'GEOFENCE.CARD.EDIT' })}
                              >
                                <img
                                  src={toAbsoluteUrl('/media/icons/edit-light.svg')}
                                  className="size-3"
                                />
                              </Link>
                              <a
                                href="#"
                                className="btn btn-icon btn-clean btn-lg !size-[18px]"
                                title={intl.formatMessage({ id: 'GEOFENCE.CARD.DELETE' })}
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  if (
                                    !(await dialogs.confirm(
                                      intl.formatMessage({
                                        id: 'GEOFENCE.DELETE.MODAL_MESSAGE'
                                      }),
                                      {
                                        title: intl.formatMessage({
                                          id: 'GEOFENCE.DELETE.MODAL_TITLE'
                                        }),
                                        okText: intl.formatMessage({ id: 'COMMON.DELETE' }),
                                        cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
                                      }
                                    ))
                                  )
                                    return;
                                  const delRes = await deleteGeofence(geofence.id);
                                  enqueueSnackbar(delRes.message, { variant: 'success' });
                                  refetch();

                                  if (selectedGeofence?.id === geofence.id) {
                                    setSelectedGeofence(undefined);
                                  }
                                }}
                              >
                                <img
                                  src={toAbsoluteUrl('/media/icons/delete-light.svg')}
                                  className="size-3"
                                />
                              </a>
                            </div>
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
        ) : (
          <div className="flex items-center justify-center h-full">
            <CircularProgress />
          </div>
        )}
      </div>
    </div>
  );
};
