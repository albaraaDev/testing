import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading } from '@/partials/toolbar';
import { DataGrid, KeenIcon, TDataGridRequestParams } from '@/components';
import { FormattedMessage, useIntl } from 'react-intl';
import { ColumnDef } from '@tanstack/react-table';
import {
  getModificationRequests,
  ModificationRequestDTO,
  updateModificationRequest,
  getModificationRequestDetails
} from '@/api/modification-requests';
import { useSnackbar } from 'notistack';
import { Modal, Box, CircularProgress } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { useSettings } from '@/providers';

// Format datetime string to a more readable format
const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '-';
  try {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (_e) {
    return dateTimeString;
  }
};

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  requestId: string | null;
  onApprove: ((id: string, comment: string) => Promise<void>) | null;
  onReject: ((id: string, comment: string) => Promise<void>) | null;
}

const DetailModal: React.FC<DetailModalProps> = ({
  open,
  onClose,
  requestId,
  onApprove,
  onReject
}) => {
  const intl = useIntl();
  const { settings } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const isDarkMode = settings.themeMode === 'dark';
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<ModificationRequestDTO | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (open && requestId) {
        setLoading(true);
        try {
          const data = await getModificationRequestDetails(requestId);
          setRequest(data);
        } catch (err) {
          console.error('Error fetching request details:', err);
          enqueueSnackbar(
            intl.formatMessage({
              id: 'MODIFICATION_REQUESTS.NOTIFICATION.DETAIL_ERROR',
              defaultMessage: 'Failed to load request details'
            }),
            { variant: 'error' }
          );
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDetails();
  }, [open, requestId, intl, enqueueSnackbar]);

  const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    maxWidth: '90%',
    bgcolor: isDarkMode ? '#1c1c1e' : '#fff',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: '90vh',
    overflow: 'auto'
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="request-detail-modal"
      aria-describedby="request-detail-description"
    >
      <Box sx={modalStyle}>
        <h2 className="text-xl font-semibold mb-4">
          <FormattedMessage
            id="MODIFICATION_REQUESTS.DETAIL_MODAL.TITLE"
            defaultMessage="Request Details"
          />
        </h2>

        {loading ? (
          <div className="flex justify-center items-center p-6">
            <CircularProgress />
          </div>
        ) : request ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  <FormattedMessage
                    id="MODIFICATION_REQUESTS.COLUMN.SERVICE_NAME"
                    defaultMessage="Service Name"
                  />
                </p>
                <p className="font-semibold">{request.serviceName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  <FormattedMessage
                    id="MODIFICATION_REQUESTS.COLUMN.EVENT_TYPE"
                    defaultMessage="Event Type"
                  />
                </p>
                <p className="font-semibold">{request.eventType}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                <FormattedMessage
                  id="MODIFICATION_REQUESTS.DETAIL.ENTITY_TYPE"
                  defaultMessage="Entity Type"
                />
              </p>
              <p>{request.entityType}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                <FormattedMessage
                  id="MODIFICATION_REQUESTS.DETAIL.ENTITY_ID"
                  defaultMessage="Entity ID"
                />
              </p>
              <p className="break-all">{request.entityId}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                <FormattedMessage
                  id="MODIFICATION_REQUESTS.COLUMN.CHANGES"
                  defaultMessage="Changes"
                />
              </p>
              <ChangeComparison
                originalData={request.originalData}
                modifiedData={request.modifiedData}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                <FormattedMessage
                  id="MODIFICATION_REQUESTS.DETAIL.QUERY_STRING"
                  defaultMessage="Query String"
                />
              </p>
              <p className="break-all">{request.queryString || '-'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  <FormattedMessage
                    id="MODIFICATION_REQUESTS.DETAIL.REQUESTED_BY"
                    defaultMessage="Requested By"
                  />
                </p>
                <p>{request.requestedBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  <FormattedMessage
                    id="MODIFICATION_REQUESTS.DETAIL.REQUEST_DATE"
                    defaultMessage="Request Date"
                  />
                </p>
                <p>{formatDateTime(request.requestDate)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  <FormattedMessage
                    id="MODIFICATION_REQUESTS.COLUMN.STATUS"
                    defaultMessage="Status"
                  />
                </p>
                <p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      request.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {request.status}
                  </span>
                </p>
              </div>
            </div>

            {request.status !== 'PENDING' && (
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      <FormattedMessage
                        id="MODIFICATION_REQUESTS.DETAIL.REVIEWED_BY"
                        defaultMessage="Reviewed By"
                      />
                    </p>
                    <p>{request.reviewedBy || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      <FormattedMessage
                        id="MODIFICATION_REQUESTS.DETAIL.REVIEWED_DATE"
                        defaultMessage="Reviewed Date"
                      />
                    </p>
                    <p>{request.reviewedDate ? formatDateTime(request.reviewedDate) : '-'}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    <FormattedMessage
                      id="MODIFICATION_REQUESTS.COMMENTS"
                      defaultMessage="Comments:"
                    />
                  </p>
                  <p className="italic">{request.comments || '-'}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-4">
            <p>
              <FormattedMessage
                id="MODIFICATION_REQUESTS.DETAIL.NOT_FOUND"
                defaultMessage="Request details not found"
              />
            </p>
          </div>
        )}

        {onApprove !== null && onReject !== null && request !== null ? (
          <>
            <Formik initialValues={{ comments: '' }} onSubmit={() => {}} enableReinitialize>
              {({ values, errors, touched, isSubmitting, setSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <div className="grid gap-3">
                      <label htmlFor="comments" className="form-label">
                        <FormattedMessage
                          id="MODIFICATION_REQUESTS.MODAL.COMMENTS"
                          defaultMessage="Review Comments"
                        />
                      </label>
                      <Field
                        as="textarea"
                        id="comments"
                        name="comments"
                        rows={3}
                        className="input"
                        placeholder={intl.formatMessage({
                          id: 'MODIFICATION_REQUESTS.MODAL.COMMENTS_PLACEHOLDER',
                          defaultMessage: 'Add your review comments here...'
                        })}
                      />
                      {errors.comments && touched.comments && (
                        <div className="text-red-500 text-sm">{errors.comments}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      disabled={isSubmitting}
                      onClick={async () => {
                        setSubmitting(true);
                        try {
                          await onReject(request.id, values.comments);
                          onClose();
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                    >
                      {isSubmitting && (
                        <CircularProgress size={16} color="inherit" className="me-2" />
                      )}
                      <FormattedMessage
                        id="MODIFICATION_REQUESTS.MODAL.REJECT"
                        defaultMessage="Reject"
                      />
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      disabled={isSubmitting}
                      onClick={async () => {
                        setSubmitting(true);
                        try {
                          await onApprove(request.id, values.comments);
                          onClose();
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                    >
                      {isSubmitting && (
                        <CircularProgress size={16} color="inherit" className="me-2" />
                      )}
                      <FormattedMessage
                        id="MODIFICATION_REQUESTS.MODAL.APPROVE"
                        defaultMessage="Approve"
                      />
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </>
        ) : (
          <>
            <div className="flex justify-end mt-6">
              <button type="button" className="btn btn-light" onClick={onClose}>
                <FormattedMessage id="COMMON.CLOSE" defaultMessage="Close" />
              </button>
            </div>
          </>
        )}
      </Box>
    </Modal>
  );
};

const ModificationRequests: React.FC = () => {
  const intl = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ModificationRequestDTO | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to trigger re-fetching

  const handleApproveRequest = async (id: string, comments: string) => {
    try {
      const res = await updateModificationRequest({
        id,
        status: 'APPROVED',
        comments: comments || 'NO COMMENT'
      });
      enqueueSnackbar(res.message, { variant: 'success' });
      setRefreshTrigger((prev) => prev + 1); // Trigger a refresh
    } catch (error) {
      console.error('Error approving request:', error);
      enqueueSnackbar(
        intl.formatMessage({
          id: 'MODIFICATION_REQUESTS.NOTIFICATION.ERROR',
          defaultMessage: 'An error occurred while updating the request'
        }),
        { variant: 'error' }
      );
    }
  };

  const handleRejectRequest = async (id: string, comments: string) => {
    try {
      const res = await updateModificationRequest({
        id,
        status: 'REJECTED',
        comments: comments || 'NO COMMENT'
      });
      enqueueSnackbar(res.message, { variant: 'success' });
      setRefreshTrigger((prev) => prev + 1); // Trigger a refresh
    } catch (error) {
      console.error('Error rejecting request:', error);
      enqueueSnackbar(
        intl.formatMessage({
          id: 'MODIFICATION_REQUESTS.NOTIFICATION.ERROR',
          defaultMessage: 'An error occurred while updating the request'
        }),
        { variant: 'error' }
      );
    }
  };

  const openStatusModal = (request: ModificationRequestDTO) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  // The detail icon click handler
  const handleDetailClick = (request: ModificationRequestDTO, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRequest(request);
    setDetailModalOpen(true);
  };

  const columns = useMemo<ColumnDef<ModificationRequestDTO>[]>(
    () => [
      {
        accessorKey: 'serviceName',
        header: intl.formatMessage({
          id: 'MODIFICATION_REQUESTS.COLUMN.SERVICE_NAME',
          defaultMessage: 'Service Name'
        }),
        enableSorting: true,
        cell: ({ row }) => <div>{row.original.serviceName}</div>
      },
      {
        accessorKey: 'originalData',
        header: intl.formatMessage({
          id: 'MODIFICATION_REQUESTS.COLUMN.ORIGINAL_DATA',
          defaultMessage: 'Original Data'
        }),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="max-w-48 truncate" title={row.original.originalData}>
            {row.original.originalData}
          </div>
        )
      },
      {
        accessorKey: 'modifiedData',
        header: intl.formatMessage({
          id: 'MODIFICATION_REQUESTS.COLUMN.MODIFIED_DATA',
          defaultMessage: 'Modified Data'
        }),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="max-w-48 truncate" title={row.original.modifiedData}>
            {row.original.modifiedData}
          </div>
        )
      },
      {
        accessorKey: 'eventType',
        header: intl.formatMessage({
          id: 'MODIFICATION_REQUESTS.COLUMN.EVENT_TYPE',
          defaultMessage: 'Event Type'
        }),
        enableSorting: true,
        cell: ({ row }) => <div>{row.original.eventType}</div>
      },
      {
        accessorKey: 'requestDate',
        header: intl.formatMessage({
          id: 'MODIFICATION_REQUESTS.COLUMN.REQUEST_DATE',
          defaultMessage: 'Request Date'
        }),
        enableSorting: true,
        cell: ({ row }) => <div>{formatDateTime(row.original.requestDate)}</div>
      },
      {
        accessorKey: 'status',
        header: intl.formatMessage({
          id: 'MODIFICATION_REQUESTS.COLUMN.STATUS',
          defaultMessage: 'Status'
        }),
        enableSorting: true,
        cell: ({ row }) => {
          const request = row.original;
          const status = request.status;
          let statusColor = '';

          switch (status) {
            case 'PENDING':
              statusColor = 'bg-yellow-100 text-yellow-800';
              break;
            case 'APPROVED':
              statusColor = 'bg-green-100 text-green-800';
              break;
            case 'REJECTED':
              statusColor = 'bg-red-100 text-red-800';
              break;
          }

          return (
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full ${statusColor}`}>{status}</span>
              {status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => openStatusModal(request)}
                    className="btn btn-sm btn-light"
                    title={intl.formatMessage({
                      id: 'MODIFICATION_REQUESTS.ACTION.UPDATE_STATUS',
                      defaultMessage: 'Update Status'
                    })}
                  >
                    <FormattedMessage
                      id="MODIFICATION_REQUESTS.ACTION.UPDATE"
                      defaultMessage="Update"
                    />
                  </button>
                </div>
              )}
            </div>
          );
        }
      },
      {
        id: 'reviewInfo',
        header: intl.formatMessage({
          id: 'MODIFICATION_REQUESTS.COLUMN.REVIEW_INFO',
          defaultMessage: 'Review Info'
        }),
        enableSorting: false,
        cell: ({ row }) => {
          const request = row.original;
          if (request.status === 'PENDING') {
            return (
              <div className="text-gray-500 italic">
                <FormattedMessage
                  id="MODIFICATION_REQUESTS.REVIEW_PENDING"
                  defaultMessage="Not reviewed yet"
                />
              </div>
            );
          }

          return (
            <div className="text-sm">
              <div>
                <span className="font-semibold">
                  <FormattedMessage
                    id="MODIFICATION_REQUESTS.REVIEWER"
                    defaultMessage="Reviewer:"
                  />
                </span>{' '}
                {request.reviewedBy || '-'}
              </div>
              <div>
                <span className="font-semibold">
                  <FormattedMessage
                    id="MODIFICATION_REQUESTS.REVIEW_DATE"
                    defaultMessage="Review Date:"
                  />
                </span>{' '}
                {request.reviewedDate ? formatDateTime(request.reviewedDate) : '-'}
              </div>
              <div>
                <span className="font-semibold">
                  <FormattedMessage
                    id="MODIFICATION_REQUESTS.COMMENTS"
                    defaultMessage="Comments:"
                  />
                </span>{' '}
                <span className="italic">{request.comments || '-'}</span>
              </div>
            </div>
          );
        }
      },
      {
        id: 'actions',
        header: intl.formatMessage({
          id: 'MODIFICATION_REQUESTS.COLUMN.ACTIONS',
          defaultMessage: 'Actions'
        }),
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <button
              onClick={(e) => handleDetailClick(row.original, e)}
              className="text-gray-500 hover:text-blue-600 focus:outline-none ms-2 flex-shrink-0"
              title={intl.formatMessage({
                id: 'MODIFICATION_REQUESTS.ACTION.VIEW_DETAILS',
                defaultMessage: 'View Details'
              })}
            >
              <KeenIcon icon="eye" />
            </button>
          );
        }
      }
    ],
    [intl]
  );
  const handleFetchData = useCallback(
    async (params: TDataGridRequestParams) => {
      return await getModificationRequests({
        ...params,
        filters: searchQuery ? [{ id: 'search', value: searchQuery }] : []
      });
    },
    [searchQuery]
  );

  return (
    <div className="flex flex-col gap-5 lg:gap-7.5 h-full">
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <h1 className="text-xl font-medium leading-none text-gray-900 dark:text-gray-100">
              <FormattedMessage
                id="MODIFICATION_REQUESTS.TITLE"
                defaultMessage="Modification Requests"
              />
            </h1>
          </ToolbarHeading>
          <div className="flex items-center gap-2 ms-auto">
            <div className="position-relative">
              <span className="position-absolute start-0 top-0 h-100 w-9 d-flex align-items-center justify-content-center">
                <i className="icon-lg mdi mdi-magnify text-gray-500"></i>
              </span>
              <input
                type="text"
                className="w-64 pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-info focus:border-info input"
                placeholder={intl.formatMessage({
                  id: 'MODIFICATION_REQUESTS.SEARCH.PLACEHOLDER',
                  defaultMessage: 'Search...'
                })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </Toolbar>

        <div className="card mt-5">
          <div className="card-body">
            <DataGrid
              columns={columns}
              serverSide
              onFetchData={handleFetchData}
              pagination={{
                size: 10,
                sizes: [10, 20, 50]
              }}
              key={`modification-requests-${refreshTrigger}`} // Force refresh when this changes
            />
          </div>
        </div>
      </Container>

      {/* Detail modal */}
      <DetailModal
        open={detailModalOpen || modalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setModalOpen(false);
        }}
        requestId={selectedRequest?.id || null}
        onApprove={modalOpen ? handleApproveRequest : null}
        onReject={modalOpen ? handleRejectRequest : null}
      />
    </div>
  );
};

export default ModificationRequests;

const tryParseJSON = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return null; // Return null if parsing fails
  }
};
// This function was removed as it's no longer needed

const ChangeComparison = ({
  originalData,
  modifiedData
}: {
  originalData: string;
  modifiedData: string;
}) => {
  const { settings } = useSettings();
  const isDarkMode = settings.themeMode === 'dark';

  // Parse the JSON data
  const originalJson = tryParseJSON(originalData) || {};
  const modifiedJson = tryParseJSON(modifiedData) || {};

  // Get all keys from both objects
  const allKeys = [...new Set([...Object.keys(originalJson), ...Object.keys(modifiedJson)])].sort();

  // Check if a value has changed
  const hasChanged = (key: string) => {
    const originalValue = originalJson[key];
    const modifiedValue = modifiedJson[key];

    if (originalValue === undefined) return true;
    if (modifiedValue === undefined) return true;

    if (typeof originalValue !== typeof modifiedValue) return true;

    // For objects, compare stringified versions
    if (typeof originalValue === 'object' && originalValue !== null) {
      return JSON.stringify(originalValue) !== JSON.stringify(modifiedValue);
    }

    return originalValue !== modifiedValue;
  };

  // Format a value for display
  const formatValue = (value: any) => {
    if (value === undefined) return <span className="text-gray-400 italic">undefined</span>;
    if (value === null) return <span className="text-gray-400 italic">null</span>;

    if (typeof value === 'object') {
      return <span className="font-mono text-xs">{JSON.stringify(value)}</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-purple-600">{value ? 'true' : 'false'}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-blue-600">{value}</span>;
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div className="border rounded overflow-auto" style={{ maxHeight: '400px' }}>
      <div className="grid grid-cols-3 divide-x">
        <div className="px-4 py-2 text-sm font-bold bg-gray-100 dark:bg-gray-800">
          <FormattedMessage
            id="MODIFICATION_REQUESTS.CHANGE_COMPARISON.FIELD"
            defaultMessage="Field"
          />
        </div>
        <div className="px-4 py-2 text-sm font-bold bg-gray-100 dark:bg-gray-800">
          <FormattedMessage
            id="MODIFICATION_REQUESTS.CHANGE_COMPARISON.ORIGINAL_VALUE"
            defaultMessage="Original Value"
          />
        </div>
        <div className="px-4 py-2 text-sm font-bold bg-gray-100 dark:bg-gray-800">
          <FormattedMessage
            id="MODIFICATION_REQUESTS.CHANGE_COMPARISON.MODIFIED_VALUE"
            defaultMessage="Modified Value"
          />
        </div>
      </div>

      {allKeys.map((key) => {
        const changed = hasChanged(key);
        const bgColor = changed ? (isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50') : '';

        return (
          <div key={key} className={`grid grid-cols-3 divide-x border-t ${bgColor}`}>
            <div className="px-4 py-2 text-sm font-medium">{key}</div>
            <div className="px-4 py-2 text-sm">{formatValue(originalJson[key])}</div>
            <div className="px-4 py-2 text-sm">{formatValue(modifiedJson[key])}</div>
          </div>
        );
      })}
    </div>
  );
};
