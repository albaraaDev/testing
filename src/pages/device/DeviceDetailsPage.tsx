import DeviceIcon from './svg/device.svg?react';
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { deleteDevice, DeviceDTO, getDeviceModelByImei } from '@/api/devices';
import { CarPlate } from '../dashboards/blocks/CarPlate';
import { useDeviceProvider } from '@/providers/DeviceProvider';
import {
  KeenIcon,
  Menu,
  MenuIcon,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuToggle,
  Report
} from '@/components';
import RoleComponent from '@/components/RoleComponent';
import { toAbsoluteUrl } from '@/utils';
import { useSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDialogs } from '@toolpad/core/useDialogs';
import { useMqttProvider } from '@/providers/MqttProvider';
import { Buffer } from 'buffer';
import Telemetry from './blocks/Telemetry';
import { format } from 'date-fns';
import { Notifications } from '../dashboards/blocks/Notifications';
import { DeviceUserModal } from '../management/blocks/DeviceUserModal';
import { useAppRouting } from '@/routing/useAppRouting';

const DeviceDetailsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dialogs = useDialogs();
  const { id } = useParams();
  const navigate = useAppRouting();
  const { getProtocolName, getTypeName } = useDeviceProvider();
  const intl = useIntl();
  const { mqttClient } = useMqttProvider();
  const [parameters, setParameters] = useState<
    Record<string, { data: any; timestamp: Date; latest: boolean }>
  >({});
  const [device, setDevice] = useState<DeviceDTO | null>(null);

  const topic = `user/monitoring/+/${device?.ident}`;

  const onMessage = (incomingTopic: string, message: Buffer) => {
    if (
      device &&
      !incomingTopic.startsWith('user/monitoring') &&
      !incomingTopic.includes(device.ident)
    )
      return;
    setParameters((prev) => {
      const device: Record<string, any> = JSON.parse(message.toString('utf-8'));
      const timestamp = new Date(device.server_timestamp * 1000);
      const newParameters = { ...prev };
      for (const key in prev) {
        newParameters[key].latest = false;
      }
      for (const key in device) {
        newParameters[key] = { data: device[key], timestamp, latest: true };
      }
      return newParameters;
    });
  };

  useEffect(() => {
    if (!id) return;
    getDeviceModelByImei(id)
      .then((data) => {
        setDevice(data);
      })
      .catch(() => {
        navigate('/error/404');
      });
  }, [id, navigate]);

  useEffect(() => {
    if (!mqttClient) return;
    if (!device) return;
    if (!topic) return;
    if (mqttClient.connected) {
      mqttClient.subscribeAsync(topic);
    } else {
      mqttClient.once('connect', () => {
        mqttClient.subscribeAsync(topic);
      });
    }

    mqttClient.on('message', onMessage);

    return () => {
      mqttClient.off('message', onMessage);
      mqttClient.unsubscribeAsync(topic);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device?.ident, mqttClient]);

  if (!id) {
    navigate('/error/404');
    return null;
  }

  if (!device) {
    return null;
  }

  return (
    <div className="flex flex-col mb-4 md:flex-row space-y-4 md:space-x-4 h-full p-5">
      <div className="p-4 w-full">
        <div className="space-y-4">
          <div className="card w-full p-2 space-y-4">
            <div className="w-full flex justify-between gap-6 items-center py-2">
              <div className="flex items-center gap-4">
                <DeviceIcon color="#5151F9" className="size-12 min-w-12" />
                <p className="text-lg text-gray-700">{device.ident}</p>
              </div>
              <CarPlate className="w-auto" plate={device.vehiclePlate} />
              <div className="flex flex-col gap-2">
                <span>
                  <FormattedMessage id="DEVICE.DETAILS.PROTOCOL" />:{' '}
                  {getProtocolName(device.protocolId)}
                </span>
                <span>
                  <FormattedMessage id="DEVICE.DETAILS.TYPE" />: {getTypeName(device.typeId)}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span>
                  <FormattedMessage id="COMMON.START" />: {device.subscriptionStartDate}
                </span>
                <span>
                  <FormattedMessage id="COMMON.END" />: {device.subscriptionEndDate}
                </span>
              </div>
              <div className="flex gap-3">
                <DeviceUserModal deviceIdent={device.ident} userId={device.userId} />
                <RoleComponent role={['ADMIN', 'SUPER_ADMIN', 'MANAGER']}>
                  <a href={`/devices/edit/${device.id}`}>
                    <img
                      src={toAbsoluteUrl('/media/icons/edit.svg')}
                      alt={intl.formatMessage({ id: 'COMMON.EDIT' })}
                    />
                  </a>
                  <Menu>
                    <MenuItem toggle="dropdown" trigger="click">
                      <MenuToggle>
                        <KeenIcon className="text-xl" icon="dots-vertical" />
                      </MenuToggle>
                      <MenuSub className="menu-default">
                        <MenuItem
                          onClick={async () => {
                            if (
                              !(await dialogs.confirm(
                                intl.formatMessage({
                                  id: 'DEVICE.DELETE.MODAL_MESSAGE'
                                }),
                                {
                                  title: intl.formatMessage({ id: 'DEVICE.DELETE.MODAL_TITLE' }),
                                  okText: intl.formatMessage({ id: 'COMMON.DELETE' }),
                                  cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
                                }
                              ))
                            )
                              return;
                            const deleteRes = await deleteDevice(device.id);
                            enqueueSnackbar(deleteRes.message, {
                              variant: 'success'
                            });
                            navigate('/devices/device');
                          }}
                        >
                          <MenuLink>
                            <MenuIcon>
                              <img src={toAbsoluteUrl('/media/icons/delete-light.svg')} />
                            </MenuIcon>
                            <MenuTitle>
                              <FormattedMessage id="COMMON.DELETE" />
                            </MenuTitle>
                          </MenuLink>
                        </MenuItem>
                      </MenuSub>
                    </MenuItem>
                  </Menu>
                </RoleComponent>
              </div>
            </div>

            <div className="flex w-full justify-between py-4 px-20 md:px-32 lg:px-56 gap-8 bg-gray-200 rounded-lg">
              {/* Timestamp */}
              <div className="flex gap-1 items-center">
                <img src={toAbsoluteUrl(`/media/icons/calendar.svg`)} className="size-8" />
                <div className="font-semibold">
                  <div className="text-[#A1A5B7] text-[10px]">
                    <FormattedMessage id="LOCATION.FIELD.TIME" />
                  </div>
                  <div className="text-[#2D3748] dark:text-gray-50 text-xs">
                    {!isNaN(+new Date(+parameters['timestamp']?.data * 1000)) &&
                      format(
                        new Date(+parameters['timestamp']?.data * 1000),
                        'yyyy/MM/dd HH:mm:ss'
                      )}
                  </div>
                </div>
              </div>

              {/* Battery */}
              <div className="flex gap-1 items-center">
                <img src={toAbsoluteUrl('/media/icons/battery-icon.svg')} className="size-8" />
                <div className="font-semibold">
                  <div className="text-[#A1A5B7] text-[10px]">
                    <FormattedMessage id="LOCATION.FIELD.BATTERY_LEVEL" />
                  </div>
                  <div className="text-[#2D3748] dark:text-gray-50 text-xs">
                    {parameters['battery_charging_status']?.data === true
                      ? 100
                      : (parameters['battery_level']?.data ?? '?')}
                    %
                  </div>
                </div>
              </div>

              {/* Engine Status */}
              <div className="flex gap-1 items-center">
                <img
                  src={toAbsoluteUrl(
                    `/media/icons/${parameters['engine_ignition_status']?.data === 'true' ? 'on' : 'off'}.svg`
                  )}
                  className="size-8"
                />
                <div className="font-semibold">
                  <div className="text-[#A1A5B7] text-[10px]">
                    <FormattedMessage id="LOCATION.FIELD.ENGINE_STATUS" />
                  </div>
                  <div className="text-[#2D3748] dark:text-gray-50 text-xs">
                    {intl.formatMessage({
                      id:
                        parameters['engine_ignition_status']?.data === 'UNKNOWN'
                          ? undefined
                          : parameters['engine_ignition_status']?.data === 'true'
                            ? 'STATUS.ON'
                            : 'STATUS.OFF'
                    })}
                  </div>
                </div>
              </div>

              {/* Engine Block Status */}
              <div className="flex gap-1 items-center">
                <img
                  src={toAbsoluteUrl(
                    `/media/icons/${parameters['engine_blocked_status']?.data ? 'engine-block-active' : 'engine-block-inactive'}.svg`
                  )}
                  className="size-8"
                />
                <div className="font-semibold">
                  <div className="text-[#A1A5B7] text-[10px]">
                    <FormattedMessage id="LOCATION.FIELD.ENGINE_BLOCKED_STATUS" />
                  </div>
                  <div className="text-[#2D3748] dark:text-gray-50 text-xs">
                    {intl.formatMessage({
                      id: parameters['engine_blocked_status']?.data
                        ? 'STATUS.ACTIVE'
                        : 'STATUS.INACTIVE'
                    })}
                  </div>
                </div>
              </div>

              {/* Speed Icon */}
              <div className="flex gap-1 items-center">
                <img
                  src={toAbsoluteUrl(
                    `/media/icons/${parameters['position_speed']?.data > 1 ? 'speed-moving' : 'speed-stop'}.svg`
                  )}
                  className="size-8"
                />
                <div className="font-semibold">
                  <div className="text-[#A1A5B7] text-[10px]">
                    <FormattedMessage id="LOCATION.FIELD.SPEED" />
                  </div>
                  <div className="text-[#2D3748] dark:text-gray-50 text-xs">{`${parameters['position_speed']?.data.toFixed(0) || '?'} kmh`}</div>
                </div>
              </div>

              {/* Satellites */}
              <div className="flex gap-1 items-center">
                <img src={toAbsoluteUrl('/media/icons/satellites.svg')} className="size-8" />
                <div className="font-semibold">
                  <div className="text-[#A1A5B7] text-[10px]">
                    <FormattedMessage id="LOCATION.FIELD.SATELLITES" />
                  </div>
                  <div className="text-[#2D3748] dark:text-gray-50 text-xs">
                    {parameters['position_satellites']?.data ?? '?'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Telemetry parameters={parameters} />
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-4 h-full">
              <Report ident={device.ident} type="device" />
            </div>
            <div className="col-span-2 h-[499px]">
              <Notifications ident={device.ident} withTypeFilter />
            </div>
          </div>
          {/* <ParameterList items={parameters} /> */}
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailsPage;
