import { useGetMonitoring, useGetProtocols, useGetTypes } from './deviceHooks';
import { useCurrentUser, useGetTopics } from './userHooks';

// we dont want cache to ever expire. for the expiration logic, we rely on the useInvalidateCoreData hook, which is called on the base of the router, so whenever a new tab is opened or current tab is refreshed, the core data is refetched.
// we dont really care about the user's current session having the latest data.
export const cacheDur = Infinity;

export const useInvalidateCoreData = () => {
  const { refetch: refetchProtocols } = useGetProtocols();
  const { refetch: refetchTypes } = useGetTypes();
  const { refetch: refetchTopics } = useGetTopics();
  const { refetch: refetchCurrentUser } = useCurrentUser();

  const { refetch: refetchMonitoring } = useGetMonitoring();

  return {
    invalidate: () => {
      refetchProtocols();
      refetchTypes();
      refetchTopics();
      refetchCurrentUser();
      refetchMonitoring();
    }
  };
};
