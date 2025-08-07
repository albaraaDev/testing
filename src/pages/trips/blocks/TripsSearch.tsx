import React, { useEffect, useState, useCallback } from 'react';
import { MonitoringVehicleDTO } from '@/api/devices';
import { KeenIcon } from '@/components';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import { AutoSizer, List } from 'react-virtualized';
import { Skeleton } from '@mui/material';
import { useGetMonitoringVehicles } from '@/api/hooks/deviceHooks';

interface TripsSearchProps {
  search: string;
  setSearch: (value: string) => void;
  onSearch?: () => void;
  onSelectDevice?: (device: MonitoringVehicleDTO) => void;
  loading?: boolean;
}

export const TripsSearch = ({ search, setSearch, onSelectDevice, loading }: TripsSearchProps) => {
  const { data: devices } = useGetMonitoringVehicles();

  const [filteredDevices, setFilteredDevices] = useState<MonitoringVehicleDTO[]>([]);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!devices) return;

    if (!search) {
      setFilteredDevices(devices);
      return;
    }

    const lowerSearch = search.toLowerCase();
    const filtered = devices.filter(
      (device) =>
        device.ident.toLowerCase().includes(lowerSearch) ||
        (device.vehiclePlate ? device.vehiclePlate.toLowerCase().includes(lowerSearch) : false)
    );

    setFilteredDevices(filtered);
  }, [search, devices]);

  const handleDeviceSelect = useCallback(
    (device: MonitoringVehicleDTO) => {
      setSearch(device.ident);
      setHovered(false);
      setFocused(false);

      // Use RAF to ensure UI updates before callback
      window.requestAnimationFrame(() => {
        if (onSelectDevice) {
          onSelectDevice(device);
        }
      });
    },
    [setSearch, onSelectDevice]
  );

  return (
    <div className="input input-sm h-[34px] shrink-0 relative">
      <input
        type="text"
        placeholder="Search Devices"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          if (!hovered) {
            setFocused(false);
          }
        }}
      />
      <button className="btn btn-icon" onClick={() => setSearch('')} type="button">
        <KeenIcon icon="cross" />
      </button>
      {(focused || hovered) && (
        <div
          className="absolute top-full left-0 w-full max-h-96 card dark:border-gray-200 mt-1 z-50"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {!devices ? (
            <div className="p-2">Loading...</div>
          ) : filteredDevices.length === 0 ? (
            <div className="p-2">No devices found</div>
          ) : (
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  className="scrollable-y !overflow-x-hidden"
                  height={Math.min(384, filteredDevices.length * 44)} // Limit height based on items
                  width={width}
                  rowCount={filteredDevices.length}
                  rowHeight={44}
                  rowRenderer={({ key, index, style }) => {
                    const device = filteredDevices[index];

                    if (!device) {
                      return <Skeleton key={key} style={style} />;
                    }

                    return (
                      <div key={key} style={style}>
                        <div
                          className="p-2 hover:bg-gray-100 flex justify-between items-center gap-2 cursor-pointer"
                          onClick={() => handleDeviceSelect(device)}
                        >
                          <CarPlate plate={device.vehiclePlate ?? ''} />
                          <div>{device.ident}</div>
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
    </div>
  );
};
