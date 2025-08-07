import Map from '@/pages/device/Map';
import { useMqttProvider } from '@/providers/MqttProvider';
import { useCallback, useEffect, useState } from 'react';
import { Buffer } from 'buffer';

export default function VehicleCurrentLocation({ deviceIdent }: { deviceIdent?: string | null }) {
  const { mqttClient } = useMqttProvider();
  const topic = `user/monitoring/+/${deviceIdent}`;

  const [parameters, setParameters] = useState<
    Record<string, { data: any; timestamp: Date; latest: boolean }>
  >({});

  const onMessage = useCallback(
    (incomingTopic: string, message: Buffer) => {
      if (
        !incomingTopic.startsWith('user/monitoring') &&
        deviceIdent &&
        !incomingTopic.includes(deviceIdent)
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
    },
    [deviceIdent]
  );

  useEffect(() => {
    if (!mqttClient) return;

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
  }, [deviceIdent, mqttClient]);

  return (
    <Map
      location={
        parameters['position_latitude']?.data &&
        parameters['position_longitude']?.data && {
          lat: parameters['position_latitude']?.data,
          lng: parameters['position_longitude']?.data
        }
      }
      direction={parameters['position_direction']?.data}
      engineStatus={parameters['engine_ignition_status']?.data}
      online={parameters['status']?.data === 'online'}
      hidden
    />
  );
}
