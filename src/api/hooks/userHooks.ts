import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { axios } from '@/api/axios';
import { ResponseModel, ResponseModelOrNull } from '@/api/response';
import { getTopics, getUsers, UserModel } from '@/api/user';
import { OffsetBounds, Paginated } from '@/api/common';
import { cacheDur } from './invalidateCoreDataHooks';

// API endpoints
const USER_API = {
  CURRENT: '/api/users/find-current-user',
  UPDATE: '/api/users/update',
  CHANGE_PASSWORD: '/api/users/change-password'
};

// Types
interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Hook to fetch current user
export const useCurrentUser = (): UseQueryResult<UserModel, Error> => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await axios.get<ResponseModel<UserModel>>(USER_API.CURRENT);
      return response.data.result;
    },
    staleTime: cacheDur,
    gcTime: cacheDur
  });
};

// Hook to update user profile
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Partial<UserModel>) => {
      const response = await axios.put<ResponseModelOrNull<UserModel>>(USER_API.UPDATE, userData);
      return response.data;
    },
    onSuccess: (data) => {
      // Update the cache with new user data
      queryClient.setQueryData(['currentUser'], data.result);
      // Invalidate any queries that might be affected
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });
};

// Hook to change password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await axios.post<ResponseModel<any>>(USER_API.CHANGE_PASSWORD, data);
      return response.data;
    }
  });
};

export const useGetTopics = () => {
  return useQuery({
    queryKey: ['topics'],
    queryFn: getTopics,
    staleTime: cacheDur,
    gcTime: cacheDur
  });
};

// Hook to fetch users
export const useUsers = (
  params: OffsetBounds = { start: 0, end: 50 }
): UseQueryResult<Paginated<UserModel>, Error> => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      return await getUsers(params);
    }
  });
};
