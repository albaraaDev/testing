import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Modal, Box, CircularProgress } from '@mui/material';
import { KeenIcon } from '@/components';
import { Paginated } from '@/api/common';
import { ResponseModelOrNull } from '@/api/response';
import { useSnackbar } from 'notistack';
import DebouncedSearchInput from '@/components/DebouncedInputField';
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import { useLinkUnlinkWorkingPeriodVehicles } from '@/api/hooks/vehicleHooks';
import { useQueryClient } from '@tanstack/react-query';
import {
  getLinkedVehiclesWorkingPeriod,
  getUnLinkedVehiclesWorkingPeriod,
  VehicleModelDto
} from '@/api/working-hours';

// Types and interfaces
interface VehicleLinkingModalProps {
  open: boolean;
  workingPeriodId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
}

interface VehicleListProps {
  vehicles?: Paginated<VehicleModelDto>;
  isLoading: boolean;
  selectedVehicleIds: string[];
  toggleSelection: (vehicleId: string) => void;
  loadMoreRows: (params: { startIndex: number; stopIndex: number }) => Promise<void>;
  selectionStyle: 'link' | 'unlink';
}

interface VehicleListItemProps {
  vehicle: VehicleModelDto;
  isSelected: boolean;
  onClick: () => void;
  selectionStyle: 'link' | 'unlink';
}

// Search Bar Component
const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder }) => {
  const intl = useIntl();

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center ps-3 pointer-events-none">
        <KeenIcon style="duotone" icon="magnifier" />
      </div>
      <DebouncedSearchInput
        type="search"
        className="w-full ps-10 pr-4 py-2 input text-sm border rounded-lg"
        placeholder={placeholder || intl.formatMessage({ id: 'COMMON.SEARCH' })}
        onDebounce={onSearch}
      />
    </div>
  );
};

// Vehicle List Item Component
const VehicleListItem: React.FC<VehicleListItemProps> = ({
  vehicle,
  isSelected,
  onClick,
  selectionStyle
}) => {
  return (
    <div className="p-4 border rounded-lg border-gray-200 flex items-center justify-between gap-4 h-full">
      <div className="flex flex-col gap-1">
        <CarPlate plate={vehicle.plate} />
        <div className="text-gray-600 text-2sm ps-2 font-monospace">{vehicle.deviceIdent}</div>
      </div>
      <button
        type="button"
        className={`btn btn-sm !size-7 btn-icon ${
          isSelected
            ? selectionStyle === 'link'
              ? 'btn-success'
              : 'btn-warning'
            : `btn-outline ${selectionStyle === 'link' ? 'btn-success' : 'btn-warning'}`
        }`}
        onClick={onClick}
      >
        <KeenIcon icon={selectionStyle === 'link' ? 'plus' : 'minus'} />
      </button>
    </div>
  );
};

// Vehicle List Component
const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  isLoading,
  selectedVehicleIds,
  toggleSelection,
  loadMoreRows,
  selectionStyle
}) => {
  if (isLoading && !vehicles) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isRowLoaded={({ index }) => !!vehicles?.data[index]}
            loadMoreRows={loadMoreRows}
            rowCount={vehicles?.totalCount || 0}
          >
            {({ onRowsRendered, registerChild }) => {
              return (
                <List
                  ref={registerChild}
                  height={height}
                  width={width}
                  rowCount={vehicles?.data.length || 0}
                  rowHeight={84}
                  onRowsRendered={onRowsRendered}
                  rowRenderer={({ key, index, style }) => {
                    const vehicle = vehicles?.data[index];
                    if (!vehicle) return null;

                    const isSelected = selectedVehicleIds.includes(vehicle.vehicleId);

                    return (
                      <div key={key + isSelected} style={style} className="px-4 py-1">
                        <VehicleListItem
                          vehicle={vehicle}
                          isSelected={isSelected}
                          onClick={() => toggleSelection(vehicle.vehicleId)}
                          selectionStyle={selectionStyle}
                        />
                      </div>
                    );
                  }}
                />
              );
            }}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </div>
  );
};

// Vehicle Section Component
const VehicleSection: React.FC<{
  title: React.ReactNode;
  count?: number;
  onSearch: (value: string) => void;
  vehicles?: Paginated<VehicleModelDto>;
  isLoading: boolean;
  selectedVehicleIds: string[];
  toggleSelection: (vehicleId: string) => void;
  loadMoreRows: (params: { startIndex: number; stopIndex: number }) => Promise<void>;
  selectionStyle: 'link' | 'unlink';
}> = ({
  title,
  count,
  onSearch,
  vehicles,
  isLoading,
  selectedVehicleIds,
  toggleSelection,
  loadMoreRows,
  selectionStyle
}) => {
  return (
    <div className="flex flex-col flex-1 card p-0">
      <div className="mb-4 p-4">
        <div className="flex justify-between">
          <h3 className="font-semibold mb-2">{title}</h3>

          <h5 className="text-sm text-gray-400">
            <FormattedMessage
              id="WORKING_HOURS.VEHICLES.VEHICLES_COUNT"
              values={{ count: count }}
            />
          </h5>
        </div>
        <SearchBar onSearch={onSearch} />
      </div>
      <VehicleList
        vehicles={vehicles}
        isLoading={isLoading}
        selectedVehicleIds={selectedVehicleIds}
        toggleSelection={toggleSelection}
        loadMoreRows={loadMoreRows}
        selectionStyle={selectionStyle}
      />
    </div>
  );
};

// Modal Footer Component
const ModalFooter: React.FC<{
  onClose: () => void;
  onSave: () => void;
  isSaveDisabled: boolean;
  isSubmitting: boolean;
}> = ({ onClose, onSave, isSaveDisabled, isSubmitting }) => {
  return (
    <div className="flex justify-end gap-3 mt-6">
      <button type="button" className="btn btn-light" onClick={onClose} disabled={isSubmitting}>
        <FormattedMessage id="COMMON.CANCEL" />
      </button>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onSave}
        disabled={isSubmitting || isSaveDisabled}
      >
        {isSubmitting && <CircularProgress size={16} color="inherit" className="me-2" />}
        <FormattedMessage id="COMMON.SAVE" />
      </button>
    </div>
  );
};

// Main Modal Component
export function VehicleLinkingModal({
  open,
  workingPeriodId,
  onClose,
  onSuccess
}: VehicleLinkingModalProps) {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search states
  const [linkedVehiclesSearch, setLinkedVehiclesSearch] = useState<string>('');
  const [unlinkedVehiclesSearch, setUnlinkedVehiclesSearch] = useState<string>('');

  // Vehicle data states
  const [linkedVehicles, setLinkedVehicles] = useState<Paginated<VehicleModelDto>>();
  const [unlinkedVehicles, setUnlinkedVehicles] = useState<Paginated<VehicleModelDto>>();

  // Tracking pagination
  const [lastLinkedVehicles, setLastLinkedVehicles] = useState(10);
  const [lastUnlinkedVehicles, setLastUnlinkedVehicles] = useState(10);

  // Tracking selected vehicles for linking/unlinking
  const [vehiclesToLink, setVehiclesToLink] = useState<string[]>([]);
  const [vehiclesToUnlink, setVehiclesToUnlink] = useState<string[]>([]);

  const useLinkUnlinkVehicles = useLinkUnlinkWorkingPeriodVehicles(queryClient);

  // Fetch linked vehicles
  const getLinkedVehiclesCB = useCallback(
    async (
      workingPeriodId: string,
      offset: number,
      size: number,
      search: string
    ): Promise<Paginated<VehicleModelDto>> => {
      const requestParams = {
        offset,
        size,
        search: search || '',
        page: 0,
        sort: 'createdAt,desc'
      };

      try {
        const response = await getLinkedVehiclesWorkingPeriod(workingPeriodId, requestParams);

        const result = response.result;

        if (response.success === false || !result) {
          enqueueSnackbar(response.message, { variant: 'error' });
          return { data: [], totalCount: 0 };
        }

        return {
          data: result.content,
          totalCount: result.totalElements
        };
      } catch (error) {
        console.error('Error fetching unlinked devices:', error);
        enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }), { variant: 'error' });
        return { data: [], totalCount: 0 };
      }
    },
    [intl, enqueueSnackbar]
  );

  // Fetch unlinked vehicles
  const getUnlinkedVehiclesCB = useCallback(
    async (
      workingPeriodId: string,
      offset: number,
      size: number,
      search: string
    ): Promise<Paginated<VehicleModelDto>> => {
      const requestParams = {
        offset,
        size,
        search: search || '',
        page: 0,
        sort: 'createdAt,desc'
      };

      try {
        const response = await getUnLinkedVehiclesWorkingPeriod(workingPeriodId, requestParams);

        const result = response.result;

        if (response.success === false || !result) {
          enqueueSnackbar(response.message, { variant: 'error' });
          return { data: [], totalCount: 0 };
        }

        return {
          data: result.content,
          totalCount: result.totalElements
        };
      } catch (error) {
        console.error('Error fetching unlinked devices:', error);
        enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }), { variant: 'error' });
        return { data: [], totalCount: 0 };
      }
    },
    [intl, enqueueSnackbar]
  );

  // Load initial data when modal opens
  useEffect(() => {
    if (!open || !workingPeriodId) return;

    setIsLoading(true);
    Promise.all([
      getLinkedVehiclesCB(workingPeriodId, 0, 10, linkedVehiclesSearch),
      getUnlinkedVehiclesCB(workingPeriodId, 0, 10, unlinkedVehiclesSearch)
    ]).then(([linked, unlinked]) => {
      setLinkedVehicles(linked);
      setUnlinkedVehicles(unlinked);
      setIsLoading(false);
    });
  }, [
    open,
    workingPeriodId,
    getLinkedVehiclesCB,
    getUnlinkedVehiclesCB,
    linkedVehiclesSearch,
    unlinkedVehiclesSearch
  ]);

  // Handle linked vehicles search
  useEffect(() => {
    if (!open || !workingPeriodId) return;

    setIsLoading(true);
    getLinkedVehiclesCB(workingPeriodId, 0, lastLinkedVehicles, linkedVehiclesSearch)
      .then(setLinkedVehicles)
      .finally(() => setIsLoading(false));
  }, [workingPeriodId, getLinkedVehiclesCB, linkedVehiclesSearch, open, lastLinkedVehicles]);

  // Handle unlinked vehicles search
  useEffect(() => {
    if (!open || !workingPeriodId) return;

    setIsLoading(true);
    getUnlinkedVehiclesCB(workingPeriodId, 0, lastUnlinkedVehicles, unlinkedVehiclesSearch)
      .then(setUnlinkedVehicles)
      .finally(() => setIsLoading(false));
  }, [workingPeriodId, getUnlinkedVehiclesCB, unlinkedVehiclesSearch, open, lastUnlinkedVehicles]);

  const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '800px',
    // bgcolor: isDarkMode ? '#1c1c1e' : '#fff',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: '90vh',
    height: '90vh',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column' as const
  };

  // Toggle vehicle selection for linking
  const toggleLinkVehicle = useCallback((vehicleId: string) => {
    setVehiclesToLink((prev) => {
      const isAlreadySelected = prev.includes(vehicleId);
      return isAlreadySelected ? prev.filter((id) => id !== vehicleId) : [...prev, vehicleId];
    });
  }, []);

  // Toggle vehicle selection for unlinking
  const toggleUnlinkVehicle = useCallback((vehicleId: string) => {
    setVehiclesToUnlink((prev) => {
      const isAlreadySelected = prev.includes(vehicleId);
      return isAlreadySelected ? prev.filter((id) => id !== vehicleId) : [...prev, vehicleId];
    });
  }, []);

  // Load more unlinked vehicles
  const loadMoreUnlinkedVehicles = async ({
    startIndex,
    stopIndex
  }: {
    startIndex: number;
    stopIndex: number;
  }) => {
    const data = await getUnlinkedVehiclesCB(
      workingPeriodId,
      startIndex,
      stopIndex - startIndex + 1,
      unlinkedVehiclesSearch
    );
    setUnlinkedVehicles((prev) => ({
      data: [...(prev?.data || []), ...data.data],
      totalCount: data.totalCount
    }));
    setLastUnlinkedVehicles(Math.max(lastUnlinkedVehicles, stopIndex + 1));
  };

  // Load more linked vehicles
  const loadMoreLinkedVehicles = async ({
    startIndex,
    stopIndex
  }: {
    startIndex: number;
    stopIndex: number;
  }) => {
    const data = await getLinkedVehiclesCB(
      workingPeriodId,
      startIndex,
      stopIndex - startIndex + 1,
      linkedVehiclesSearch
    );
    setLinkedVehicles((prev) => ({
      data: [...(prev?.data || []), ...data.data],
      totalCount: data.totalCount
    }));
    setLastLinkedVehicles(Math.max(lastLinkedVehicles, stopIndex + 1));
  };

  // Save changes
  const handleSaveChanges = async () => {
    if (!workingPeriodId || (vehiclesToLink.length === 0 && vehiclesToUnlink.length === 0)) {
      return;
    }

    setIsSubmitting(true);
    try {
      let res1: ResponseModelOrNull<void> | null = null;
      let res2: ResponseModelOrNull<void> | null = null;

      if (vehiclesToLink.length > 0) {
        res1 = await useLinkUnlinkVehicles.mutateAsync({
          periodId: workingPeriodId,
          vehicleIds: vehiclesToLink,
          isUnlink: false
        });
      }

      if (vehiclesToUnlink.length > 0) {
        res2 = await useLinkUnlinkVehicles.mutateAsync({
          periodId: workingPeriodId,
          vehicleIds: vehiclesToUnlink,
          isUnlink: true
        });
      }

      const msgs = [
        ...new Set(
          [res1, res2]
            .map((r) => r?.message)
            // only keep non-null messages
            .filter(Boolean)
        )
      ];

      msgs.forEach((msg) => {
        enqueueSnackbar(msg, {
          variant: 'success'
        });
      });

      // Reset selections
      setVehiclesToLink([]);
      setVehiclesToUnlink([]);

      // Refresh data
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating vehicle links:', error);
      enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }), {
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleModalClose = (_e: any, reason: string) => {
    if (!isSubmitting && reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
      // Reset selections on close
      setVehiclesToLink([]);
      setVehiclesToUnlink([]);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleModalClose} disableEscapeKeyDown>
      <Box sx={modalStyle} className="bg-[--tw-page-bg] dark:bg-[--tw-page-bg-dark]">
        <h2 className="text-xl font-semibold mb-4">
          <FormattedMessage
            id="WORKING_HOURS.VEHICLES.MANAGE_VEHICLES"
            defaultMessage="Manage Linked Vehicles"
          />
        </h2>

        <div className="flex flex-col md:flex-row gap-6 flex-1">
          {/* Unlinked Vehicles */}
          <VehicleSection
            title={
              <FormattedMessage
                id="WORKING_HOURS.VEHICLES.UNLINKED_VEHICLES"
                defaultMessage="Unlinked Vehicles"
              />
            }
            count={unlinkedVehicles?.totalCount}
            onSearch={setUnlinkedVehiclesSearch}
            vehicles={unlinkedVehicles}
            isLoading={isLoading}
            selectedVehicleIds={vehiclesToLink}
            toggleSelection={toggleLinkVehicle}
            loadMoreRows={loadMoreUnlinkedVehicles}
            selectionStyle="link"
          />

          {/* Linked Vehicles */}
          <VehicleSection
            title={
              <FormattedMessage
                id="WORKING_HOURS.VEHICLES.LINKED_VEHICLES"
                defaultMessage="Linked Vehicles"
              />
            }
            count={linkedVehicles?.totalCount}
            onSearch={setLinkedVehiclesSearch}
            vehicles={linkedVehicles}
            isLoading={isLoading}
            selectedVehicleIds={vehiclesToUnlink}
            toggleSelection={toggleUnlinkVehicle}
            loadMoreRows={loadMoreLinkedVehicles}
            selectionStyle="unlink"
          />
        </div>

        <ModalFooter
          onClose={onClose}
          onSave={handleSaveChanges}
          isSaveDisabled={vehiclesToLink.length === 0 && vehiclesToUnlink.length === 0}
          isSubmitting={isSubmitting}
        />
      </Box>
    </Modal>
  );
}
