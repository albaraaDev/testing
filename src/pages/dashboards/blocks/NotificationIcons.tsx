import {
  BatteryAlarmNotificationIcon,
  EngineOffNotificationIcon,
  EngineOnNotificationIcon,
  EnterGeofenceNotificationIcon,
  ExceedSpeedNotificationIcon,
  ExitGeofenceNotificationIcon,
  PowerCutAlarmNotificationIcon,
  SharpTurnNotificationIcon,
  VibrationAlarmNotificationIcon
} from '@/assets/svg';

export const NOTIFICATION_ICONS = {
  battery_alarm: <BatteryAlarmNotificationIcon />,
  engine_off: <EngineOffNotificationIcon />,
  engine_on: <EngineOnNotificationIcon />,
  exit_gps_dead_zone_alarm: <EnterGeofenceNotificationIcon />,
  enter_gps_dead_zone_alarm: <ExitGeofenceNotificationIcon />,
  speeding_alarm: <ExceedSpeedNotificationIcon />,
  unplug: <PowerCutAlarmNotificationIcon />,
  sharp_turn_alarm: <SharpTurnNotificationIcon />,
  vibration_alarm: <VibrationAlarmNotificationIcon />
} as const;
