import { axios } from './axios';
import { ResponseModel } from './response';

export interface DistributorStats {
  total: number;
  active: number;
  unactive: number;
}

export const getDistributorStats = async (): Promise<DistributorStats> => {
  // Try to fetch from the dedicated endpoint first
  const stats = await axios.get<ResponseModel<DistributorStats>>(
    '/api/users/stats?type=distributor'
  );
  return stats.data.result;
};
