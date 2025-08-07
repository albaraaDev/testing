import { Box, CircularProgress, Modal } from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import { TreeView } from '@/components';
import { FetchDataParams, FetchDataResponse, TreeItem } from '@/components/tree-view/types';
import { getUserHirarchy, UserModel } from '@/api/user';
import { FormattedMessage, useIntl } from 'react-intl';
import { Users } from 'lucide-react';
import { useSettings } from '@/providers';

interface DeviceUserModalProps {
  deviceIdent: string | null;
  userId: string | null;
}

export function DeviceUserModal({ deviceIdent, userId }: DeviceUserModalProps) {
  const intl = useIntl();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [hierarchyData, setHierarchyData] = useState<UserModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey] = useState(0);

  // Fetch data function for the new TreeView API
  const fetchHierarchyData = useCallback(
    async (_params: FetchDataParams): Promise<FetchDataResponse> => {
      // This is a static hierarchy display, so we ignore pagination params for now
      // and return the full hierarchy as tree items
      if (!hierarchyData.length) {
        return { items: [], total: 0 };
      }

      // For a static hierarchy, we'll just return all items at once
      // In a real paginated scenario, we'd use params.start and params.end
      const treeItems = buildTreeStructure(hierarchyData);
      return {
        items: treeItems,
        total: treeItems.length
      };
    },
    [hierarchyData]
  );

  const buildTreeStructure = (hierarchy: UserModel[]): TreeItem[] => {
    if (!hierarchy.length) return [];

    // The hierarchy is ordered from direct parent (index 0) to root (last index)
    // We need to build a nested structure where each user is a child of its parent

    // Start with the most nested user (direct parent)
    let currentNode: TreeItem = {
      id: hierarchy[0].id,
      label: hierarchy[0].name,
      hasChildren: false,
      userData: hierarchy[0]
    };

    // Loop through the rest of the hierarchy (from index 1 to the end)
    // Each iteration wraps the current node as a child of the next parent
    for (let i = 1; i < hierarchy.length; i++) {
      currentNode = {
        id: hierarchy[i].id,
        label: hierarchy[i].name,
        hasChildren: true,
        userData: hierarchy[i],
        children: [currentNode]
      };
    }

    // Return the fully constructed tree as an array with a single root
    return [currentNode];
  };

  const collectAllNodeIds = (items: TreeItem[]): string[] => {
    const ids: string[] = [];

    const traverse = (nodes: TreeItem[]) => {
      nodes.forEach((node) => {
        ids.push(node.id);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    traverse(items);
    return ids;
  };

  const fetchUserHierarchy = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const hierarchy = await getUserHirarchy(userId);
      setHierarchyData(hierarchy);
    } catch (error) {
      console.error('Error fetching user hierarchy:', error);
      setHierarchyData([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const openUserModal = () => setIsUserModalOpen(true);
  const closeUserModal = () => setIsUserModalOpen(false);

  useEffect(() => {
    if (deviceIdent && userId && isUserModalOpen) {
      fetchUserHierarchy();
    }
  }, [isUserModalOpen, deviceIdent, userId, fetchUserHierarchy]);

  const { settings } = useSettings();
  const isDarkMode = settings.themeMode === 'dark';

  const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: isDarkMode ? '#1c1c1e' : '#fff',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: '80vh',
    overflow: 'auto'
  };

  // Get all node IDs for pre-expansion (since it's a hierarchy display)
  const preExpandedIds =
    hierarchyData.length > 0 ? collectAllNodeIds(buildTreeStructure(hierarchyData)) : [];

  const renderContent = () => {
    if (!userId) {
      return (
        <div className="flex justify-center items-center h-full text-gray-500">
          <FormattedMessage
            id="DEVICE.NO_LINKED_USERS"
            defaultMessage="No linked users for this device"
          />
        </div>
      );
    }
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <CircularProgress />
        </div>
      );
    }

    return (
      <TreeView
        key={refreshKey}
        fetchData={fetchHierarchyData}
        onSelect={() => {}}
        noChildrenMessage={intl.formatMessage({
          id: 'USER.NO_CHILDREN',
          defaultMessage: 'No users under this item'
        })}
        preExpandedIds={preExpandedIds}
        selectedId={userId}
        pageSize={50}
      />
    );
  };

  return (
    <>
      <Modal
        open={isUserModalOpen}
        onClose={(_e, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            closeUserModal();
          }
        }}
        disableEscapeKeyDown
      >
        <Box sx={modalStyle}>
          <h2 className="text-xl font-semibold mb-4">
            <FormattedMessage id="USER.LINKED_USERS.TITLE" defaultMessage="Device User Hierarchy" />
          </h2>
          <p className="text-gray-500 mb-4">
            <FormattedMessage
              id="DEVICE.LINKED_USERS.DESCRIPTION"
              defaultMessage="This shows the user hierarchy for device {ident}. The highlighted user is linked to this device."
              values={{ ident: deviceIdent || '' }}
            />
          </p>
          <div className="border rounded-md h-[400px]">{renderContent()}</div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" className="btn btn-light" onClick={closeUserModal}>
              <FormattedMessage id="COMMON.CLOSE" defaultMessage="Close" />
            </button>
          </div>
        </Box>
      </Modal>
      <button
        type="button"
        className="p-2 w-8 h-8 flex items-center justify-center rounded-full bg-[#009EF7]/10"
        onClick={openUserModal}
      >
        <Users size={14} className="text-[#009EF7]" />
      </button>
    </>
  );
}
