import { useCallback } from 'react';
import { NavigateOptions, useNavigate } from 'react-router';
type ID = `${number}` | string;

// Allow optional leading slash
type Prefix = '' | '/';

export type AppRoute =
  | `${Prefix}`
  | `${Prefix}monitoring`
  | `${Prefix}trips`
  | `${Prefix}replay`
  | `${Prefix}reports`
  | `${Prefix}management`
  | `${Prefix}management/devices`
  | `${Prefix}management/users`
  | `${Prefix}management/distributors`
  | `${Prefix}notifications`
  | `${Prefix}geofences/list`
  | `${Prefix}geofences/add`
  | `${Prefix}geofences/edit/${ID}`
  | `${Prefix}customers/customer`
  | `${Prefix}customers/customer/${ID}`
  | `${Prefix}customers/add-customer`
  | `${Prefix}customers/edit/${ID}`
  | `${Prefix}reservations/reservation`
  | `${Prefix}reservations/reservation/${ID}`
  | `${Prefix}reservations/add-reservation`
  | `${Prefix}reservations/edit/${ID}`
  | `${Prefix}reservations/handover/${ID}`
  | `${Prefix}vehicles/vehicle`
  | `${Prefix}vehicles/vehicle/${ID}`
  | `${Prefix}vehicles/add-vehicle`
  | `${Prefix}vehicles/edit/${ID}`
  | `${Prefix}vehicles/edit-scratches/${ID}`
  | `${Prefix}working-hours/list`
  | `${Prefix}working-hours/create`
  | `${Prefix}maintenance/maintenance`
  | `${Prefix}maintenance/add`
  | `${Prefix}maintenance/edit/${ID}`
  | `${Prefix}maintenance/view/${ID}`
  | `${Prefix}maintenance/maintenance-type/list`
  | `${Prefix}maintenance/maintenance-type/add`
  | `${Prefix}maintenance/maintenance-type/edit/${ID}`
  | `${Prefix}maintenance/maintenance-type/view/${ID}`
  | `${Prefix}modification-requests/list`
  | `${Prefix}devices/device`
  | `${Prefix}devices/device/${ID}`
  | `${Prefix}devices/add-device`
  | `${Prefix}devices/edit/${ID}`
  | `${Prefix}users/user`
  | `${Prefix}users/user/${ID}`
  | `${Prefix}users/add-user`
  | `${Prefix}users/edit/${ID}`
  | `${Prefix}drivers/driver`
  | `${Prefix}drivers/driver/${ID}`
  | `${Prefix}drivers/add-driver`
  | `${Prefix}drivers/edit/${ID}`
  | `${Prefix}roles/list`
  | `${Prefix}roles/${ID}/permissions`
  | `${Prefix}privacy-policy`
  | `${Prefix}hedef-privacy-policy`
  | `${Prefix}error/${string}`
  | `${Prefix}auth/${string}`
  | '*'
  | -1;

export const useAppRouting = () => {
  const navigate = useNavigate();

  const navigateTo = useCallback(
    (path: AppRoute, options?: NavigateOptions) => {
      if (path === -1) {
        navigate(-1);
        return;
      }
      navigate(path, options);
    },
    [navigate]
  );

  return navigateTo;
};
