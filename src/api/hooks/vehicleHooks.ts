import { useMutation, QueryClient } from '@tanstack/react-query';
import { axios } from '../axios';
import { ResponseModelOrNull } from '../response';

// Link/unlink devices to a distributor
export const useLinkUnlinkWorkingPeriodVehicles = (queryClient: QueryClient) => {
  return useMutation({
    mutationFn: async ({
      periodId,
      vehicleIds,
      isUnlink = false
    }: {
      periodId: string | null;
      vehicleIds: string[];
      isUnlink?: boolean;
    }) => {
      const url = isUnlink
        ? `/api/vehicles/working-periods/unlink-vehicles/${periodId}`
        : `/api/vehicles/working-periods/link-vehicles/${periodId}`;
      const res = await axios.post<ResponseModelOrNull<void>>(url, vehicleIds);

      return res.data;
    },
    onSuccess: (_1, variables) => {
      if (variables.isUnlink == null || variables.isUnlink === true) {
        queryClient.invalidateQueries({ queryKey: ['unlinkedWorkingPeriodVehicles'] });
      }
      queryClient.invalidateQueries({ queryKey: ['linkedWorkingPeriodVehicles'] });
    }
  });
};
