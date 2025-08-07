import { useEffect, useState } from 'react';
import { OnMessageCallback } from 'mqtt';
import { useMqttProvider } from '@/providers/MqttProvider';
import { useGetTopics } from '@/api';
import logger from '@/utils/Logger';

const useMqttNotifications = (onMessage: OnMessageCallback) => {
  const [notificationsTopic, setNotificationsTopic] = useState<string | null>(null);
  const { mqttClient } = useMqttProvider();

  const topics = useGetTopics();

  useEffect(() => {
    if (!mqttClient) return;

    try {
      if (topics.data) {
        logger.debug('Fetched topics:', topics.data);
        const notificationsTopic = topics.data.notifications[0];
        setNotificationsTopic(notificationsTopic || null);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }

    return () => {
      setNotificationsTopic(null);
    };
  }, [mqttClient, topics.data]);

  useEffect(() => {
    if (!mqttClient || !notificationsTopic) return;

    if (mqttClient.connected) {
      mqttClient.subscribeAsync(notificationsTopic);
    } else {
      mqttClient.once('connect', async () => {
        mqttClient.subscribeAsync(notificationsTopic);
      });
    }

    mqttClient.on('message', onMessage);

    return () => {
      mqttClient.off('message', onMessage);
      mqttClient.unsubscribeAsync(notificationsTopic);
    };
  }, [mqttClient, notificationsTopic, onMessage]);
};

export { useMqttNotifications };
