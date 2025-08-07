import { KeenIcon } from '@/components';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import { Skeleton } from '@mui/material';
import { useEffect, useState } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { FormattedMessage, useIntl } from 'react-intl';
import { MonitoringVehicleDTO } from '@/api/devices';
import { useGetMonitoringVehicles } from '@/api/hooks/deviceHooks';

interface VehicleSearchProps {
  initialSearch?: {
    id: string;
    plate?: string;
    ident?: string;
  };
  place?: 'top' | 'bottom';
  required?: boolean;
}
export const VehicleSearch = ({
  initialSearch,
  place = 'top',
  required = false
}: VehicleSearchProps) => {
  const { formatMessage } = useIntl();
  const [privateSearch, setPrivateSearch] = useState(initialSearch?.plate);
  const [selectedVehicle, setSelectedVehicle] = useState<
    | {
        id: string;
        plate?: string;
        ident?: string;
      }
    | undefined
  >(initialSearch);
  const { data: vehicles } = useGetMonitoringVehicles();
  const [shownVehicles, setShownVehicles] = useState<MonitoringVehicleDTO[]>([]);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const vhcls = vehicles || [];
    if (privateSearch) {
      const filteredVehicles = vhcls.filter(
        (vehicle) =>
          vehicle.vehiclePlate?.toLowerCase().includes(privateSearch.toLowerCase()) ||
          vehicle.ident.toLowerCase().includes(privateSearch.toLowerCase())
      );
      setShownVehicles(filteredVehicles || []);
    } else {
      setShownVehicles(vhcls);
    }
  }, [privateSearch, vehicles]);

  useEffect(() => {
    if (initialSearch) setPrivateSearch(initialSearch.plate);
  }, [initialSearch]);

  return (
    <div className="input shrink-0 relative">
      <input
        type="text"
        placeholder={formatMessage({ id: 'VEHICLE.SEARCH.PLACEHOLDER' })}
        value={privateSearch}
        onChange={(e) => setPrivateSearch(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
      />
      <button
        className="btn btn-icon"
        type="button"
        onClick={() => {
          setPrivateSearch('');
          setSelectedVehicle(undefined);
        }}
      >
        <KeenIcon icon="cross" />
      </button>
      {(focused || hovered) && (
        <div
          className={`absolute ${place === 'top' ? 'bottom' : 'top'}-[calc(100%+4px)] px-2 left-0 w-full max-h-96 card dark:border-gray-200 mt-1 z-50`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {!vehicles ? (
            <div className="p-2">
              <FormattedMessage id="COMMON.LOADING" />
            </div>
          ) : (
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  className="scrollable-y !overflow-x-hidden"
                  height={384}
                  width={width}
                  rowCount={shownVehicles.length}
                  rowHeight={44}
                  rowRenderer={({ key, index, style }) => {
                    const vehicle = shownVehicles[index];

                    if (!vehicle) {
                      return <Skeleton key={key} style={style} />;
                    }

                    return (
                      <div key={key} style={style}>
                        <div
                          key={vehicle.ident}
                          className="p-2 hover:bg-gray-100 flex justify-between items-center gap-2 cursor-pointer"
                          onClick={() => {
                            if (vehicle.vehiclePlate) setPrivateSearch(vehicle.vehiclePlate);
                            setSelectedVehicle({
                              id: vehicle.vehicleId,
                              ident: vehicle.ident,
                              plate: vehicle.vehiclePlate || undefined
                            });
                            setHovered(false);
                          }}
                        >
                          <CarPlate plate={vehicle.vehiclePlate || ''} />{' '}
                          <span className="font-monospace">{vehicle.ident}</span>
                        </div>
                      </div>
                    );
                  }}
                />
              )}
            </AutoSizer>
          )}
        </div>
      )}
      <input type="hidden" name="vehicleId" value={selectedVehicle?.id || ''} />
      <input type="hidden" name="ident" value={selectedVehicle?.ident || ''} />
      <input type="hidden" name="plate" value={selectedVehicle?.plate || ''} />
    </div>
  );
};
