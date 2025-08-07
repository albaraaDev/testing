import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { DistributorStats, getDistributorStats } from '@/api/distributor';

// Hook to fetch distributor stats
export const useDistributorStats = (): UseQueryResult<DistributorStats, Error> => {
  return useQuery({
    queryKey: ['distributorStats'],
    queryFn: async () => {
      return await getDistributorStats();
    }
  });
};
