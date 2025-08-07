import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getUserStats, UserStats } from '../user';

// Hook to fetch distributor stats
export const useUserStats = (): UseQueryResult<UserStats, Error> => {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      return await getUserStats();
    }
  });
};
