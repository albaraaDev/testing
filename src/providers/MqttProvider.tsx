import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import mqtt from 'mqtt';
import { useAuthContext } from '@/auth';
import * as authHelper from '../auth/_helpers';
import { Topics } from '@/api/user';
import { useGetTopics } from '@/api';

interface MqttContextProps {
  mqttClient?: mqtt.MqttClient;
  topics?: Topics;
}

const MqttContext = createContext<MqttContextProps>({});

export const MqttProvider = ({ children }: PropsWithChildren) => {
  const auth = useAuthContext();
  const [mqttClient, setMqttClient] = useState<mqtt.MqttClient | undefined>();

  const topics = useGetTopics();

  useEffect(() => {
    if (!localStorage.getItem('mqtt-suffix')) {
      localStorage.setItem('mqtt-suffix', (Math.random() * 1000).toFixed(0));
    }
    const suffix = localStorage.getItem('mqtt-suffix') ?? '';
    if (!auth.currentUser) {
      setMqttClient(undefined);
      return;
    }

    /**
     * Retrieves or creates a unique tab ID for MQTT client identification.
     * We add this unique tab ID to the end of the client ID so that each browser tab maintains its own
     * unique MQTT connection. Without this, multiple tabs would conflict with the same client ID,
     * causing an endless loop of disconnect and reconnect as they compete for the same connection.
     */
    const tabId = sessionStorage.tabID
      ? sessionStorage.tabID
      : (sessionStorage.tabID = Math.random());

    const token = authHelper.getAuth()?.access_token;
    const mqttClient = mqtt.connect(import.meta.env.VITE_APP_MQTT_API, {
      clientId: `${auth.currentUser.username}-${suffix}-${tabId}`,
      username: auth.currentUser.username,
      password: token,
      clean: true,
      keepalive: 60,
      protocolVersion: 5,
      properties: {
        sessionExpiryInterval: 600
      }
    });
    setMqttClient((prev) => {
      if (prev) {
        if (!prev.disconnecting) {
          prev.endAsync();
        }
      }
      return mqttClient;
    });

    return () => {
      mqttClient?.endAsync();
    };
  }, [auth.currentUser]);

  return (
    <MqttContext.Provider
      value={{
        mqttClient,
        topics: topics.data
      }}
    >
      {children}
    </MqttContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMqttProvider = () => {
  return useContext(MqttContext);
};
