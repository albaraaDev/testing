import { useEffect, useState } from 'react';
import { KeenIcon } from '@/components';
import { Paginated } from '@/api/common.ts';
import { Download, Filter, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { FormattedMessage, useIntl } from 'react-intl';
import DebouncedSearchInput from '@/components/DebouncedInputField';
import ReservationsGridView from '../components/ReservationsGridView';
import ReservationsCardsView from '../components/ReservationsCardsView';
import { useExportLoading } from '@/pages/reports/context/ExportLoadingHooks';
import { downloadFile } from '@/utils';
import { enqueueSnackbar } from 'notistack';
import { exportReservationReport, getReservations, ReservationDetails } from '@/api/reservations';

type ViewMode = 'grid' | 'card';

type ReservationListProps = {
  fetchReservationStats: () => void;
};

function ReservationList({ fetchReservationStats }: ReservationListProps) {
  const intl = useIntl();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [reservations, setReservations] = useState<Paginated<ReservationDetails>>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { isExporting, startExporting, stopExporting } = useExportLoading();

  useEffect(() => {
    (async () => {
      const reservations = await getReservations({
        pageIndex: 0,
        pageSize: 1,
        filters: [
          {
            id: '__any',
            value: searchQuery
          }
        ]
      });
      setReservations(reservations);
    })();
  }, [searchQuery]);

  const handleExport = async () => {
    try {
      startExporting('ReservationList');
      const response = await exportReservationReport({
        pageIndex: 0,
        pageSize: 100
      });
      downloadFile(response);

      enqueueSnackbar(
        intl.formatMessage(
          { id: 'COMMON.EXPORT_SUCCESS' },
          { defaultMessage: 'Export successful' }
        ),
        {
          variant: 'success'
        }
      );
    } catch (error) {
      console.error('Export error:', error);
      enqueueSnackbar(
        intl.formatMessage(
          { id: 'COMMON.EXPORT_ERROR' },
          { defaultMessage: 'Failed to export devices' }
        ),
        {
          variant: 'error'
        }
      );
    } finally {
      stopExporting();
    }
  };

  return (
    <div className="min-h-0 card">
      <div className="px-4 sm:px-7 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="card-title">
          <h3>
            <FormattedMessage id="RESERVATION.LIST.RESERVATION" />
          </h3>
          <h4 className="text-sm font-thin text-[#B5B5C3]">
            <FormattedMessage
              id="RESERVATION.LIST.COUNT"
              values={{ count: reservations?.totalCount ?? 0 }}
            />
          </h4>
        </div>
        <div className="flex items-center gap-4">
          {/* View Mode Buttons */}
          <button
            className={clsx(
              'p-3 transition-colors border rounded-lg flex items-center justify-center',
              viewMode === 'card' ? 'text-info' : 'hover:bg-gray-50'
            )}
            onClick={() => setViewMode('card')}
            title="Card View"
          >
            <KeenIcon
              style="duotone"
              icon="category"
              className={clsx(viewMode === 'card' ? 'text-info' : 'text-gray-400')}
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
          {/* Filters Button */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 rounded-lg border hover:bg-gray-50">
              <Filter size={16} />
              <span>
                <FormattedMessage id="RESERVATION.ACTIONS.FILTERS" />
              </span>
              <span className="flex items-center justify-center w-5 h-5 text-xs bg-gray-100 rounded-full">
                <FormattedMessage id="RESERVATION.ACTIONS.FILTERS.COUNT" values={{ count: 2 }} />
              </span>
            </button>
          </div>

          <button
            className={clsx(
              'flex items-center gap-2 px-3 py-2 text-gray-600 rounded-lg border',
              isExporting ? 'opacity-60 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50'
            )}
            onClick={handleExport}
            type="button"
            disabled={isExporting}
            title={isExporting ? 'Another report is being exported' : ''}
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>
              <FormattedMessage id="COMMON.EXPORT" />
            </span>
          </button>

          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <KeenIcon style="duotone" icon="magnifier" />
            </div>
            <DebouncedSearchInput
              type="search"
              className="w-64 pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-info focus:border-info input"
              placeholder={intl.formatMessage({ id: 'RESERVATION.ACTIONS.SEARCH.PLACEHOLDER' })}
              onDebounce={setSearchQuery}
            />
          </div>
        </div>
      </div>
      <div className="gap-cols responsive-card">
        <div className="card-body pt-2 px-2 sm:px-6 pb-7">
          {viewMode === 'grid' ? (
            <ReservationsGridView searchQuery={searchQuery} />
          ) : (
            <ReservationsCardsView searchQuery={searchQuery} refetchStats={fetchReservationStats} />
          )}
        </div>
      </div>
    </div>
  );
}

export { ReservationList };
