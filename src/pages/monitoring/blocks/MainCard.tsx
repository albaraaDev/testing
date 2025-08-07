import { KeenIcon, Menu, MenuItem, MenuLink, MenuSub, MenuTitle, MenuToggle } from '@/components';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMonitoringProvider } from '../providers/MonitoringProvider';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { ChipRadioGroup } from '@/pages/dashboards/blocks/ChipRadioGroup';
import { AutoSizer, List } from 'react-virtualized';
import { toAbsoluteUrl } from '@/utils';
import { useSearchParams } from 'react-router-dom';
import { CarView } from '@/pages/dashboards/blocks/CarView';
import { useIntl } from 'react-intl';
import { useLanguage } from '@/i18n';
import MonitoringStatusOnlineIcon from '@/assets/svg/monitoring-icons/MonitoringStatusOnlineIcon';
import MonitoringStatusOfflineIcon from '@/assets/svg/monitoring-icons/MonitoringStatusOfflineIcon';
import MonitoringStatusMovingIcon from '@/assets/svg/monitoring-icons/MonitoringStatusMovingIcon';
import MonitoringStatusParkedIcon from '@/assets/svg/monitoring-icons/MonitoringStatusParkedIcon';

type VehicleFilterType = 'All' | 'Online' | 'Offline' | 'EngineOn' | 'EngineOff';

export const MainCard = () => {
  const intl = useIntl();
  const { isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const {
    clients,
    setSelectedClient,
    selectedClient,
    locations,
    selectedLocation,
    setSelectedLocation,
    search
  } = useMonitoringProvider();
  const [searchTarget, setSearchTarget] = useState(searchParams.get('target') ?? 'Vehicle');
  const targetTranslation: Record<string, string> = useMemo(
    () => ({
      User: intl.formatMessage({ id: 'MONITORING.USER' }),
      Vehicle: intl.formatMessage({ id: 'MONITORING.VEHICLE' })
    }),
    [intl]
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [selection, setSelection] = useState<VehicleFilterType>('All');
  const [resizableHeight, setResizableHeight] = useState(200);
  const onlineLocations = useMemo(() => locations.filter((loc) => loc.online), [locations]);
  const offlineLocations = useMemo(() => locations.filter((loc) => !loc.online), [locations]);
  const engineOnLocations = useMemo(
    () => locations.filter((loc) => loc.status.engineStatus),
    [locations]
  );
  const engineOffLocations = useMemo(
    () => locations.filter((loc) => !loc.status.engineStatus),
    [locations]
  );
  const activeLocations = useMemo(() => {
    switch (selection) {
      case 'All':
        return locations;
      case 'Online':
        return onlineLocations;
      case 'Offline':
        return offlineLocations;
      case 'EngineOn':
        return engineOnLocations;
      case 'EngineOff':
        return engineOffLocations;
      default:
        return locations;
    }
  }, [
    locations,
    offlineLocations,
    onlineLocations,
    engineOnLocations,
    engineOffLocations,
    selection
  ]);
  const locationsListRef = useRef<List>(null);

  useEffect(() => {
    if (!selectedLocation) return;

    locationsListRef.current?.scrollToRow(
      activeLocations.findIndex((v) => v.vehicle.imei === selectedLocation?.vehicle.imei)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation]);

  const getBatteryIcon = (batteryLevel: number) => {
    // Available options are 5, 3, 1, 0
    if (batteryLevel >= 70) return 'battery-5';
    if (batteryLevel >= 30) return 'battery-3';
    if (batteryLevel > 0) return 'battery-1';
    return 'battery-0';
  };

  return (
    <div className="card-body md:w-[420px] flex flex-col gap-4 px-3 py-3 h-full">
      <form
        className="flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          search(searchTarget, searchQuery);
        }}
      >
        <div className="input input-sm h-[34px] ps-0">
          <Menu>
            <MenuItem
              toggle="dropdown"
              trigger="click"
              dropdownProps={{
                placement: isRTL() ? 'bottom-end' : 'bottom-start',
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 0] // [skid, distance]
                    }
                  }
                ]
              }}
            >
              <MenuToggle className="btn btn-clear font-semibold text-xs h-fit px-3 py-[6px] border-0 rounded-none border-e-2 border-dashed border-[#E4E6EF] dark:border-gray-400">
                {targetTranslation[searchTarget]}
                <KeenIcon icon="down" className="!text-inherit !text-xs" />
              </MenuToggle>
              <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
                {['User', 'Vehicle'].map((target) => (
                  <MenuItem
                    key={target}
                    onClick={() => {
                      setSearchTarget(target);
                    }}
                  >
                    <MenuLink>
                      <MenuTitle>{targetTranslation[target]}</MenuTitle>
                    </MenuLink>
                  </MenuItem>
                ))}
              </MenuSub>
            </MenuItem>
          </Menu>
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
              setSearchQuery('');
              search(searchTarget, '');
            }}
          >
            <KeenIcon icon="cross" />
          </button>
        </div>
        <button className="btn btn-info btn-icon size-[34px]" type="submit">
          <img src={toAbsoluteUrl('/media/icons/search.svg')} />
        </button>
      </form>
      <div className="flex-1">
        <AutoSizer>
          {({ width, height }) => (
            <div className="flex flex-col gap-2" style={{ width, height }}>
              <Resizable
                height={resizableHeight}
                onResize={(_, data) => {
                  setResizableHeight(data.size.height);
                }}
                minConstraints={[width, 60]}
                maxConstraints={[width, height]}
                axis="y"
                className="w-full relative"
                resizeHandles={['s']}
                handle={(_, ref) => (
                  <div
                    className="flex flex-col items-center gap-1 py-1 bg-[#F5F5FC] dark:bg-gray-300 w-full absolute bottom-0 cursor-ns-resize"
                    ref={ref}
                  >
                    <div className="h-[1px] bg-[#5E6278] dark:bg-[#F5F5FC] w-12" />
                    <div className="h-[1px] bg-[#5E6278] dark:bg-[#F5F5FC] w-8" />
                  </div>
                )}
              >
                <div>
                  <List
                    rowRenderer={({ index, key, style }) => {
                      const client = clients[index];
                      return (
                        <div key={key} style={style}>
                          <div
                            data-selected={selectedClient?.name === client.name}
                            className="flex p-[10px] gap-4 justify-between text-[#3F4254] dark:text-gray-700 font-roboto data-[selected=true]:border border-[#5151F9] rounded-md cursor-pointer"
                            onClick={() => {
                              if (selectedClient?.name === client.name) {
                                setSelectedClient(undefined);
                                return;
                              }
                              setSelectedClient(client);
                            }}
                          >
                            <div className="flex gap-2 items-center font-medium">
                              <img
                                src={
                                  client.avatar ||
                                  toAbsoluteUrl('/media/avatars/avatar-placeholder.png')
                                }
                                className="size-8 rounded-md object-contain"
                              />
                              <span>{client.name}</span>
                            </div>
                            <div className="font-semibold">
                              <div className="flex items-center gap-[10px]">
                                <div className="rounded-full border-2 border-[red] size-2" />
                                <span>{client.offlineDevices}</span>
                              </div>
                              <div className="flex items-center gap-[10px]">
                                <div className="rounded-full border-2 border-[#50CD89] size-2" />
                                <span>{client.onlineDevices}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                    rowCount={clients.length}
                    rowHeight={58}
                    height={resizableHeight}
                    width={width}
                    className="scrollable-y pb-4"
                    style={{
                      direction: isRTL() ? 'rtl' : 'ltr'
                    }}
                  />
                </div>
              </Resizable>
              <div className="bg-[#F5F8FA] dark:bg-gray-200 rounded-lg py-2 px-2 w-full">
                <ChipRadioGroup
                  selection={selection}
                  selections={['All', 'Offline', 'Online', 'EngineOn', 'EngineOff']}
                  translations={{
                    All: intl.formatMessage({ id: 'BUTTON_RADIO_GROUP.ALL' }),
                    Offline: intl.formatMessage({ id: 'BUTTON_RADIO_GROUP.OFFLINE' }),
                    Online: intl.formatMessage({ id: 'BUTTON_RADIO_GROUP.ONLINE' }),
                    EngineOn: intl.formatMessage({ id: 'BUTTON_RADIO_GROUP.ENGINEON' }),
                    EngineOff: intl.formatMessage({ id: 'BUTTON_RADIO_GROUP.ENGINEOFF' })
                  }}
                  prefix={{
                    Offline: (
                      <div className="flex flex-row items-center gap-1">
                        <MonitoringStatusOfflineIcon size={12} />
                        {offlineLocations.length}
                      </div>
                    ),
                    Online: (
                      <div className="flex flex-row items-center gap-1">
                        <MonitoringStatusOnlineIcon size={12} /> {onlineLocations.length}
                      </div>
                    ),
                    EngineOn: (
                      <div className="flex flex-row items-center gap-1">
                        <MonitoringStatusMovingIcon size={12} />
                        {engineOnLocations.length}
                      </div>
                    ),
                    EngineOff: (
                      <div className="flex flex-row items-center gap-1">
                        <MonitoringStatusParkedIcon size={12} />
                        {engineOffLocations.length}
                      </div>
                    )
                  }}
                  suffix={{
                    All: <div>({locations.length})</div>
                  }}
                  setSelection={setSelection}
                  className="btn btn-light data-[selected=false]:btn-clear uppercase border-0"
                  gap={1}
                />
              </div>
              <List
                ref={locationsListRef}
                rowRenderer={({ index, key, style }) => {
                  const location = activeLocations[index];
                  return (
                    <div key={key} style={style} className="pb-2">
                      <div
                        data-selected={selectedLocation?.vehicle.imei === location.vehicle.imei}
                        className="flex flex-col p-[15px] border data-[selected=true]:border-[#5151F9] dark:data-[selected=true]:border-[#5151F9] data-[selected=true]:bg-[#5151F9]/5 border-[#E7E8ED] dark:border-gray-300 rounded-[10px] gap-[10px] cursor-pointer"
                        onClick={() => {
                          if (selectedLocation?.vehicle.imei === location.vehicle.imei) {
                            setSelectedLocation(undefined);
                            return;
                          }
                          setSelectedLocation(location);
                        }}
                      >
                        <div className="flex justify-between">
                          <CarView vehicle={location.vehicle} showBrand={false} />
                          <img
                            src={toAbsoluteUrl(
                              `/media/icons/${getBatteryIcon(location.status.batteryLevel)}.svg`
                            )}
                          />
                          <div
                            data-online={location.online}
                            className="rounded-md font-medium text-xs bg-[#F1416C]/10 text-[#F1416C] data-[online=true]:bg-[#50CD89]/10 data-[online=true]:text-[#50CD89] px-[10px] py-[6px] self-center"
                          >
                            {location.online
                              ? intl.formatMessage({ id: 'DASHBOARD.MOVING_DEVICE.ONLINE' })
                              : intl.formatMessage({ id: 'DASHBOARD.MOVING_DEVICE.OFFLINE' })}
                          </div>
                        </div>
                        <div className="border-b-2 border-[#E4E6EF] dark:border-gray-400 border-dashed" />
                        <div className="flex gap-[10px] text-[10px] font-semibold justify-evenly">
                          <div className="flex flex-col gap-0.5 items-start">
                            <img
                              src={toAbsoluteUrl(
                                `/media/icons/${location.status.engineStatus ? 'on' : 'off'}.svg`
                              )}
                            />
                            <div>
                              {intl.formatMessage({
                                id: location.status.engineStatus ? 'STATUS.ON' : 'STATUS.OFF'
                              })}
                            </div>
                          </div>
                          <div className="flex flex-col gap-0.5 items-start">
                            <img
                              src={toAbsoluteUrl(
                                `/media/icons/${location.status.speed > 1 ? 'speed-moving' : 'speed-stop'}.svg`
                              )}
                            />
                            <div>{`${location.status.speed.toFixed(0)}kmh`}</div>
                          </div>
                          <div className="flex flex-col gap-0.5 items-start">
                            <img src={toAbsoluteUrl('/media/icons/satellites.svg')} />
                            <div>{location.status.satellietes}</div>
                          </div>
                          <div className="flex flex-col gap-0.5 items-start">
                            <img
                              src={toAbsoluteUrl(
                                `/media/icons/${location.status.signalLevel >= 50 ? 'signal-good' : 'signal-medium'}.svg`
                              )}
                            />
                            <div>{`${location.status.signalLevel}%`}</div>
                          </div>
                          <div className="flex flex-col gap-0.5 items-start">
                            <img
                              src={toAbsoluteUrl(
                                `/media/icons/${location.status.defenseStatus ? 'defense-active' : 'defense-inactive'}.svg`
                              )}
                            />
                            <div>
                              {intl.formatMessage({
                                id: location.status.defenseStatus
                                  ? 'STATUS.ACTIVE'
                                  : 'STATUS.INACTIVE'
                              })}
                            </div>
                          </div>
                          <div className="flex flex-col gap-0.5 items-start">
                            <img
                              src={toAbsoluteUrl(
                                `/media/icons/${location.status.engineBlocked ? 'engine-block-active' : 'engine-block-inactive'}.svg`
                              )}
                            />
                            <div>
                              {intl.formatMessage({
                                id: location.status.engineBlocked
                                  ? 'STATUS.ACTIVE'
                                  : 'STATUS.INACTIVE'
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
                rowCount={activeLocations.length}
                rowHeight={164}
                height={height - resizableHeight - 50}
                width={width}
                className="scrollable-y"
                style={{
                  direction: isRTL() ? 'rtl' : 'ltr'
                }}
              />
            </div>
          )}
        </AutoSizer>
      </div>
    </div>
  );
};
