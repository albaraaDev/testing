// filepath: /Users/adnanfahed/fletraxfrontend/src/pages/account/members/permissions-check/blocks/PermissionsCheck.tsx
import {
  assignPermissionsToRole,
  assignPermissionsWithApprovalToRole,
  removePermissionsFromRole,
  Role,
  getAllPermissions,
  Permission,
  updatePermission
} from '@/api/roles';
import { useMemo, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useSnackbar } from 'notistack';
import { KeenIcon } from '@/components';
import { ResponseModelOrNull } from '@/api';

interface PermissionsCheckProps {
  role: Role | null;
}

interface EditState {
  permissionId: string | null;
  name: string;
}

const PermissionsCheck = ({ role }: PermissionsCheckProps) => {
  const intl = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissionsMap, setPermissionsMap] = useState<Record<string, boolean>>({});
  const [initialPermissionsMap, setInitialPermissionsMap] = useState<Record<string, boolean>>({});
  const [approvalMap, setApprovalMap] = useState<Record<string, boolean>>({});
  const [initialApprovalMap, setInitialApprovalMap] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [editState, setEditState] = useState<EditState>({ permissionId: null, name: '' });
  const [updatingPermission, setUpdatingPermission] = useState(false);

  // Fetch all permissions when component mounts
  useEffect(() => {
    const fetchAllPermissions = async () => {
      try {
        setLoading(true);
        const permissions = await getAllPermissions();
        setAllPermissions(permissions);

        // Set the first tab as active if permissions exist
        if (permissions.length > 0) {
          const groups = [...new Set(permissions.map((p) => p.group))];
          if (groups.length > 0) {
            setActiveTab(groups[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
        enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }), {
          variant: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllPermissions();
  }, [enqueueSnackbar, intl]);

  // Initialize permissions map when role changes
  useEffect(() => {
    if (!role || !role.permissions) return;

    const initialPermMap: Record<string, boolean> = {};
    const initialApprMap: Record<string, boolean> = {};

    role.permissions.forEach((permission) => {
      initialPermMap[permission.id] = true; // Mark all permissions as enabled initially
      initialApprMap[permission.id] = !!permission.approval; // Track approval requirements
    });

    // Only set the permissions map once when role changes
    setPermissionsMap(initialPermMap);
    setInitialPermissionsMap(initialPermMap);
    setApprovalMap(initialApprMap);
    setInitialApprovalMap(initialApprMap);
  }, [role]);

  // Check for changes when permissions map or approval map changes
  useEffect(() => {
    if (!role) return;

    // Compare current permissions with initial permissions
    let changed = false;

    // Check permission changes
    for (const id of Object.keys({ ...permissionsMap, ...initialPermissionsMap })) {
      if (permissionsMap[id] !== initialPermissionsMap[id]) {
        changed = true;
        break;
      }
    }

    // Check approval changes if no permission changes were found
    if (!changed) {
      for (const id of Object.keys({ ...approvalMap, ...initialApprovalMap })) {
        if (approvalMap[id] !== initialApprovalMap[id]) {
          changed = true;
          break;
        }
      }
    }

    setHasChanges(changed);
  }, [permissionsMap, initialPermissionsMap, approvalMap, initialApprovalMap, role]);

  // Get all unique permission groups
  const permissionGroups = useMemo(() => {
    return [...new Set(allPermissions.map((p) => p.group))].sort();
  }, [allPermissions]);

  // Get all permissions for the active tab/group
  const activeGroupPermissions = useMemo(() => {
    return allPermissions
      .filter((p) => p.group === activeTab)
      .map((p) => ({
        id: p.id,
        name: p.name,
        enabled: permissionsMap[p.id] || false,
        requiresApproval: approvalMap[p.id] || false
      }));
  }, [allPermissions, activeTab, permissionsMap, approvalMap]);

  // Handle toggling a single permission
  const handleTogglePermission = (permissionId: string) => {
    const newEnabled = !permissionsMap[permissionId];

    setPermissionsMap((prev) => ({
      ...prev,
      [permissionId]: newEnabled
    }));

    // If permission is disabled, also disable approval requirement
    if (!newEnabled) {
      setApprovalMap((prev) => ({
        ...prev,
        [permissionId]: false
      }));
    }
  };

  // Handle toggling approval requirement for a permission
  const handleToggleApproval = (permissionId: string) => {
    // Only allow toggling if the permission is enabled
    if (!permissionsMap[permissionId]) return;

    setApprovalMap((prev) => ({
      ...prev,
      [permissionId]: !prev[permissionId]
    }));
  };

  // Reset permissions to initial state (cancel changes)
  const resetPermissions = () => {
    setPermissionsMap({ ...initialPermissionsMap });
    setApprovalMap({ ...initialApprovalMap });
  };

  const savePermissions = async () => {
    if (!role) return;

    try {
      setSaving(true);

      // Get all permission IDs
      const allPermIds = allPermissions.map((p) => p.id);

      // Get enabled permission IDs without approval
      const enabledWithoutApprovalIds = allPermIds.filter(
        (id) => permissionsMap[id] && !approvalMap[id]
      );

      // Get enabled permission IDs with approval
      const enabledWithApprovalIds = allPermIds.filter(
        (id) => permissionsMap[id] && approvalMap[id]
      );

      // Get disabled permission IDs
      const disabledPermissionIds = allPermIds.filter(
        (id) => !permissionsMap[id] && initialPermissionsMap[id]
      );

      let ress: (ResponseModelOrNull<void> | null)[] = [];

      // First add the enabled permissions without approval
      if (enabledWithoutApprovalIds.length > 0) {
        ress.push(await assignPermissionsToRole(role.id, enabledWithoutApprovalIds));
      }

      // Then add the enabled permissions with approval
      if (enabledWithApprovalIds.length > 0) {
        ress.push(await assignPermissionsWithApprovalToRole(role.id, enabledWithApprovalIds));
      }

      // Then remove disabled permissions
      if (disabledPermissionIds.length > 0) {
        ress.push(await removePermissionsFromRole(role.id, disabledPermissionIds));
      }

      // Update the initial permissions map to match current state
      setInitialPermissionsMap({ ...permissionsMap });
      setInitialApprovalMap({ ...approvalMap });
      setHasChanges(false);

      const resMsgs = [...new Set(ress.map((r) => r?.message).filter(Boolean))];
      resMsgs.forEach((msg) =>
        enqueueSnackbar(msg, {
          variant: 'success'
        })
      );
    } catch (error) {
      console.error('Error saving permissions:', error);
      enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }), {
        variant: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle starting edit mode for a permission
  const handleEditStart = (permission: { id: string; name: string }) => {
    setEditState({
      permissionId: permission.id,
      name: permission.name
    });
  };

  // Handle canceling edit mode
  const handleEditCancel = () => {
    setEditState({ permissionId: null, name: '' });
  };

  // Handle saving the edited permission name
  const handleSavePermissionName = async (permissionId: string, name: string) => {
    try {
      setUpdatingPermission(true);
      const res = await updatePermission({ id: permissionId, name, group: activeTab });

      // Update the permission name in the local state
      setAllPermissions((prevPermissions) =>
        prevPermissions.map((p) => (p.id === permissionId ? { ...p, name } : p))
      );

      enqueueSnackbar(res.message, {
        variant: 'success'
      });

      // Exit edit mode
      setEditState({ permissionId: null, name: '' });
    } catch (error) {
      console.error('Error updating permission name:', error);
      enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }), {
        variant: 'error'
      });
    } finally {
      setUpdatingPermission(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <a href="#" className="link">
            {role?.name || 'Loading...'}
          </a>
          &nbsp;{intl.formatMessage({ id: 'ROLES.PERMISSIONS.ROLE_PERMISSIONS' })}
        </h3>
      </div>

      {/* Tabs for permission groups */}
      {permissionGroups.length > 0 && (
        <div className="card-header border-top pt-3 pb-0">
          <div className="flex flex-wrap border-b">
            {permissionGroups.map((group) => (
              <div
                key={group}
                className={`p-2 mx-2 my-2 pb-1 cursor-pointer ${
                  activeTab === group
                    ? 'border-b-2 border-primary text-primary font-medium'
                    : 'text-gray-600'
                }`}
                onClick={() => setActiveTab(group)}
              >
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-table scrollable-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th className="text-start text-gray-300 font-normal min-w-[300px]">
                {intl.formatMessage({ id: 'ROLES.PERMISSIONS.PERMISSION' })}
              </th>
              <th className="min-w-24 text-gray-700 font-normal text-center">
                {intl.formatMessage({ id: 'ROLES.PERMISSIONS.ENABLED' })}
              </th>
              <th className="min-w-24 text-gray-700 font-normal text-center">
                {intl.formatMessage(
                  { id: 'ROLES.PERMISSIONS.REQUIRES_APPROVAL' },
                  { defaultMessage: 'Requires Approval' }
                )}
              </th>
              <th className="min-w-24 text-gray-700 font-normal text-center">
                {intl.formatMessage({ id: 'COMMON.ACTIONS' }, { defaultMessage: 'Actions' })}
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-900 font-medium">
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  {intl.formatMessage({ id: 'ROLES.PERMISSIONS.LOADING' })}
                </td>
              </tr>
            ) : activeGroupPermissions.length > 0 ? (
              activeGroupPermissions.map((permission, index) => {
                const namesNoApproval = ['READ_', 'IMPORT_', 'EXPORT_', 'SEND_'];
                const approvalDisabled =
                  !permission.enabled ||
                  namesNoApproval.some((name) => permission.name.startsWith(name));
                return (
                  <tr key={index}>
                    <td className="!py-5.5">
                      {editState.permissionId === permission.id ? (
                        <input
                          type="text"
                          className="input input-sm w-full"
                          value={editState.name}
                          onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                          autoFocus
                        />
                      ) : (
                        permission.name
                      )}
                    </td>
                    <td className="!py-5.5 text-center">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={permission.enabled}
                        onChange={() => handleTogglePermission(permission.id)}
                      />
                    </td>
                    <td className="!py-5.5 text-center">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={!approvalDisabled && permission.requiresApproval}
                        onChange={() => handleToggleApproval(permission.id)}
                        disabled={approvalDisabled}
                      />
                    </td>
                    <td className="!py-5.5 text-center">
                      {editState.permissionId === permission.id ? (
                        <div className="flex justify-center gap-2">
                          <button
                            className="btn btn-sm btn-primary !px-3"
                            onClick={() => handleSavePermissionName(permission.id, editState.name)}
                            disabled={updatingPermission || !editState.name.trim()}
                          >
                            {updatingPermission ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                              ></span>
                            ) : (
                              intl.formatMessage({ id: 'COMMON.SAVE' }, { defaultMessage: 'Save' })
                            )}
                          </button>
                          <button
                            className="btn btn-sm btn-light !px-3"
                            onClick={handleEditCancel}
                            disabled={updatingPermission}
                          >
                            {intl.formatMessage(
                              { id: 'COMMON.CANCEL' },
                              { defaultMessage: 'Cancel' }
                            )}
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary-light btn-icon btn-active-light"
                          onClick={() => handleEditStart(permission)}
                          title={intl.formatMessage(
                            { id: 'COMMON.EDIT' },
                            { defaultMessage: 'Edit' }
                          )}
                        >
                          <KeenIcon icon="pencil" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  {intl.formatMessage({ id: 'ROLES.PERMISSIONS.NO_PERMISSIONS' })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="card-footer justify-end py-7.5 gap-2.5">
        {role && hasChanges && (
          <button className="btn btn-secondary" onClick={resetPermissions} disabled={saving}>
            {intl.formatMessage({ id: 'COMMON.CANCEL' })}
          </button>
        )}
        {role && (
          <button
            className="btn btn-primary"
            onClick={savePermissions}
            disabled={saving || !hasChanges}
          >
            {saving
              ? intl.formatMessage({ id: 'COMMON.SAVING' })
              : intl.formatMessage({ id: 'ROLES.PERMISSIONS.SAVE' })}
          </button>
        )}
      </div>
    </div>
  );
};

export { PermissionsCheck };
