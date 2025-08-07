import { axios } from './axios';
import { ResponseModel, ResponseModelOrNull } from './response';

interface RolePermission {
  id: string;
  name: string;
  group: string;
  approval?: boolean;
}

export interface Permission {
  id: string;
  name: string;
  group: string;
  approval?: boolean;
}

export interface Role {
  id: string;
  name: string;
  permissions: RolePermission[];
}

export const getRoles = async (): Promise<Role[]> => {
  const response = await axios.get<ResponseModel<Role[]>>('/api/users/roles/index');
  return response.data.result;
};

export const getRole = async (id: string): Promise<Role> => {
  const response = await axios.get<ResponseModel<Role>>(`/api/users/roles/show/${id}`);
  return response.data.result;
};

export const getAllPermissions = async (): Promise<Permission[]> => {
  const response = await axios.get<ResponseModel<Permission[]>>('/api/users/permissions/index');
  return response.data.result;
};

export interface UpdatePermissionPayload {
  id: string;
  name: string;
  group: string;
}

export const updatePermission = async (
  payload: UpdatePermissionPayload
): Promise<ResponseModelOrNull<Permission>> => {
  const response = await axios.put<ResponseModelOrNull<Permission>>(
    '/api/users/permissions/update',
    payload
  );
  return response.data;
};

export interface CreateRolePayload {
  name?: string;
}

export const createRole = async (
  payload: CreateRolePayload
): Promise<ResponseModelOrNull<Role>> => {
  const response = await axios.post<ResponseModelOrNull<Role>>('/api/users/roles/create', {
    ...payload
  });
  return response.data;
};

export const deleteRole = async (id: string): Promise<ResponseModelOrNull<Role>> => {
  const response = await axios.get<ResponseModelOrNull<Role>>(`/api/users/roles/delete/${id}`);

  return response.data;
};

export const assignPermissionsToRole = async (
  roleId: string,
  permissionIds: string[]
): Promise<ResponseModelOrNull<void>> => {
  const res = await axios.post<ResponseModelOrNull<void>>(
    `/api/users/roles/assign-permissions/${roleId}`,
    permissionIds
  );

  return res.data;
};

export const assignPermissionsWithApprovalToRole = async (
  roleId: string,
  permissionIds: string[]
): Promise<ResponseModelOrNull<void>> => {
  const res = await axios.post<ResponseModelOrNull<void>>(
    `/api/users/roles/assign-permissions-with-approval/${roleId}`,
    permissionIds
  );

  return res.data;
};

export const removePermissionsFromRole = async (
  roleId: string,
  permissionIds: string[]
): Promise<ResponseModelOrNull<void>> => {
  const res = await axios.post<ResponseModelOrNull<void>>(
    `/api/users/roles/remove-permissions/${roleId}`,
    permissionIds
  );

  return res.data;
};

export interface UpdateRolePayload {
  id: string;
  name: string;
}

export const updateRole = async (
  payload: UpdateRolePayload
): Promise<ResponseModelOrNull<Role>> => {
  const response = await axios.put<ResponseModelOrNull<Role>>('/api/users/roles/update', payload);
  return response.data;
};
