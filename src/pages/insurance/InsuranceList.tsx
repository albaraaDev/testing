import {
  AdditionalService,
  createAdditionalService,
  CreateAdditionalServiceRequest,
  getAdditionalServices,
  updateAdditionalService,
  UpdateAdditionalServiceRequest
} from '@/api/reservations.ts';
import { ResponseModel } from '@/api/response.ts';
import {
  DataGrid,
  KeenIcon,
  Menu,
  MenuItem,
  MenuToggle,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader
} from '@/components';
import DebouncedSearchInput from '@/components/DebouncedInputField.tsx';
import { useCurrentLanguage } from '@/providers/index.ts';
import { toAbsoluteUrl } from '@/utils';
import { ColumnDef } from '@tanstack/react-table';
import { useDialogs } from '@toolpad/core/useDialogs';
import axios, { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import React, { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface InsuranceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingInsurance?: AdditionalService | null;
}

const InsuranceModal = ({ open, onClose, onSuccess, editingInsurance }: InsuranceModalProps) => {
  const intl = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const language = useCurrentLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: editingInsurance?.nameEn || '',
    nameAr: editingInsurance?.nameAr || '',
    nameTr: editingInsurance?.nameTr || '',
    descriptionEn: editingInsurance?.descriptionEn || '',
    descriptionAr: editingInsurance?.descriptionAr || '',
    descriptionTr: editingInsurance?.descriptionTr || '',
    defaultPrice: editingInsurance?.defaultPrice || 0,
    maxQuantity: editingInsurance?.maxQuantity || 1,
    image: null as File | null
  });

  const isEditing = Boolean(editingInsurance);

  React.useEffect(() => {
    if (editingInsurance) {
      setFormData({
        nameEn: editingInsurance.nameEn || '',
        nameAr: editingInsurance.nameAr || '',
        nameTr: editingInsurance.nameTr || '',
        descriptionEn: editingInsurance.descriptionEn || '',
        descriptionAr: editingInsurance.descriptionAr || '',
        descriptionTr: editingInsurance.descriptionTr || '',
        defaultPrice: editingInsurance.defaultPrice || 0,
        maxQuantity: editingInsurance.maxQuantity || 1,
        image: null
      });
    } else {
      setFormData({
        nameEn: '',
        nameAr: '',
        nameTr: '',
        descriptionEn: '',
        descriptionAr: '',
        descriptionTr: '',
        defaultPrice: 0,
        maxQuantity: 1,
        image: null
      });
    }
  }, [editingInsurance, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing && editingInsurance) {
        const updateRequest: UpdateAdditionalServiceRequest = {
          id: editingInsurance.id,
          type: 'insurance',
          nameEn: formData.nameEn,
          nameAr: formData.nameAr || formData.nameEn,
          nameTr: formData.nameTr || formData.nameEn,
          descriptionEn: formData.descriptionEn,
          descriptionAr: formData.descriptionAr || formData.descriptionEn,
          descriptionTr: formData.descriptionTr || formData.descriptionEn,
          unit: 'piece',
          defaultPrice: formData.defaultPrice,
          specialPrice: formData.defaultPrice * 0.9,
          maxQuantity: formData.maxQuantity,
          imageFile: formData.image || undefined
        };

        const response = await updateAdditionalService(updateRequest);

        enqueueSnackbar(
          response.message ||
            intl.formatMessage({
              id: 'INSURANCE.UPDATE_SUCCESS',
              defaultMessage: 'Insurance updated successfully'
            }),
          { variant: 'success' }
        );
      } else {
        const createRequest: CreateAdditionalServiceRequest = {
          type: 'insurance',
          nameEn: formData.nameEn,
          nameAr: formData.nameAr || formData.nameEn,
          nameTr: formData.nameTr || formData.nameEn,
          descriptionEn: formData.descriptionEn,
          descriptionAr: formData.descriptionAr || formData.descriptionEn,
          descriptionTr: formData.descriptionTr || formData.descriptionEn,
          unit: 'piece',
          defaultPrice: formData.defaultPrice,
          specialPrice: formData.defaultPrice * 0.9,
          maxQuantity: formData.maxQuantity,
          status: true,
          imageFile: formData.image || undefined
        };

        const response = await createAdditionalService(createRequest);

        enqueueSnackbar(
          response.message ||
            intl.formatMessage({
              id: 'INSURANCE.CREATE_SUCCESS',
              defaultMessage: 'Insurance added successfully'
            }),
          { variant: 'success' }
        );
      }

      setFormData({
        nameEn: '',
        nameAr: '',
        nameTr: '',
        descriptionEn: '',
        descriptionAr: '',
        descriptionTr: '',
        defaultPrice: 0,
        maxQuantity: 1,
        image: null
      });

      onSuccess();
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ResponseModel<never>>;
        enqueueSnackbar(
          axiosError.response?.data.message ||
            intl.formatMessage({
              id: isEditing ? 'INSURANCE.UPDATE_ERROR' : 'INSURANCE.CREATE_ERROR',
              defaultMessage: isEditing ? 'Error updating insurance' : 'Error adding insurance'
            }),
          { variant: 'error' }
        );
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'SNACKBAR.DEFAULT_ERROR' }), {
          variant: 'error'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentName = () => {
    switch (language.code) {
      case 'ar':
        return formData.nameAr;
      case 'tr':
        return formData.nameTr;
      default:
        return formData.nameEn;
    }
  };

  const getCurrentDescription = () => {
    switch (language.code) {
      case 'ar':
        return formData.descriptionAr;
      case 'tr':
        return formData.descriptionTr;
      default:
        return formData.descriptionEn;
    }
  };

  const updateCurrentName = (value: string) => {
    const field = language.code === 'ar' ? 'nameAr' : language.code === 'tr' ? 'nameTr' : 'nameEn';
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateCurrentDescription = (value: string) => {
    const field =
      language.code === 'ar'
        ? 'descriptionAr'
        : language.code === 'tr'
          ? 'descriptionTr'
          : 'descriptionEn';
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="modal-center w-full max-w-[600px]">
        <ModalHeader className="justify-between border-b">
          <h2 className="modal-title">
            {isEditing ? (
              <FormattedMessage id="INSURANCE.EDIT" defaultMessage="Edit Insurance" />
            ) : (
              <FormattedMessage id="INSURANCE.ADD_NEW" defaultMessage="Add New Insurance" />
            )}
          </h2>
          <button className="btn btn-sm btn-icon btn-light btn-clear" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5">
              <div>
                <label className="form-label">
                  <FormattedMessage id="INSURANCE.FORM.NAME" defaultMessage="Insurance Name" />
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={getCurrentName()}
                  onChange={(e) => updateCurrentName(e.target.value)}
                  placeholder={intl.formatMessage({
                    id: 'INSURANCE.FORM.NAME_PLACEHOLDER',
                    defaultMessage: 'Enter insurance name'
                  })}
                />
              </div>

              <div>
                <label className="form-label">
                  <FormattedMessage
                    id="INSURANCE.FORM.DESCRIPTION"
                    defaultMessage="Insurance Description"
                  />
                </label>
                <textarea
                  className="input min-h-20 py-3"
                  rows={3}
                  value={getCurrentDescription()}
                  onChange={(e) => updateCurrentDescription(e.target.value)}
                  placeholder={intl.formatMessage({
                    id: 'INSURANCE.FORM.DESCRIPTION_PLACEHOLDER',
                    defaultMessage: 'Enter insurance description'
                  })}
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">
                    <FormattedMessage
                      id="INSURANCE.FORM.PRICE_PER_DAY"
                      defaultMessage="Price Per Day"
                    />
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                      $
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      className="input pl-8"
                      value={formData.defaultPrice}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          defaultPrice: parseFloat(e.target.value) || 0
                        }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    <FormattedMessage
                      id="INSURANCE.FORM.MAX_QUANTITY"
                      defaultMessage="Maximum Number"
                    />
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="input"
                    value={formData.maxQuantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxQuantity: parseInt(e.target.value) || 1
                      }))
                    }
                    placeholder="1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-light"
                disabled={isLoading}
              >
                <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 w-40 py-2 rounded-lg font-medium text-sm"
                disabled={!formData.nameEn || formData.defaultPrice <= 0 || isLoading}
              >
                {isLoading && <KeenIcon icon="loading" className="animate-spin mr-2" />}
                {isEditing ? (
                  <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
                ) : (
                  <FormattedMessage id="COMMON.ADD" defaultMessage="Add" />
                )}
              </button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const InsuranceList = () => {
  const intl = useIntl();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<AdditionalService | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const language = useCurrentLanguage();

  const getServiceName = useCallback((service: AdditionalService, locale: string) => {
    switch (locale) {
      case 'ar':
        return service.nameAr;
      case 'tr':
        return service.nameTr;
      default:
        return service.nameEn;
    }
  }, []);

  const getServiceDescription = useCallback((service: AdditionalService, locale: string) => {
    switch (locale) {
      case 'ar':
        return service.descriptionAr;
      case 'tr':
        return service.descriptionTr;
      default:
        return service.descriptionEn;
    }
  }, []);

  const handleEdit = useCallback((insurance: AdditionalService) => {
    setEditingInsurance(insurance);
    setShowAddModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowAddModal(false);
    setEditingInsurance(null);
  }, []);

  const columns = useMemo<ColumnDef<AdditionalService>[]>(
    () => [
      {
        accessorFn: (row) => getServiceName(row, language.code),
        id: 'name',
        header: () => (
          <FormattedMessage id="INSURANCE.TABLE.NAME" defaultMessage="Name Insurance" />
        ),
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-800 font-medium">
            {getServiceName(info.row.original, language.code)}
          </span>
        ),
        meta: {
          className: 'min-w-48'
        }
      },
      {
        accessorFn: (row) => getServiceDescription(row, language.code),
        id: 'description',
        header: () => (
          <FormattedMessage
            id="INSURANCE.TABLE.DESCRIPTION"
            defaultMessage="Insurance Description"
          />
        ),
        enableSorting: false,
        cell: (info) => (
          <span className="text-gray-600 text-sm">
            {getServiceDescription(info.row.original, language.code)}
          </span>
        ),
        meta: {
          className: 'min-w-64'
        }
      },
      {
        accessorFn: (row) => row.defaultPrice,
        id: 'price',
        header: () => (
          <FormattedMessage id="INSURANCE.TABLE.PRICE_PER_DAY" defaultMessage="Price Day" />
        ),
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center">
            <span className="text-gray-600 mr-1">$</span>
            <span className="text-gray-800 font-medium">
              {new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(info.row.original.defaultPrice)}
            </span>
          </div>
        ),
        meta: {
          className: 'min-w-24'
        }
      },
      {
        accessorFn: (row) => row.maxQuantity,
        id: 'maxQuantity',
        header: () => (
          <FormattedMessage id="INSURANCE.TABLE.MAX_QUANTITY" defaultMessage="Maximum number" />
        ),
        enableSorting: true,
        cell: (info) => <span className="text-gray-800">{info.row.original.maxQuantity}</span>,
        meta: {
          className: 'min-w-32'
        }
      },
      {
        id: 'actions',
        header: () => <FormattedMessage id="COMMON.ACTION" defaultMessage="Action" />,
        enableSorting: false,
        cell: (info) => (
          <div className="flex gap-3">
            <button className="size-7.5">
              <img
                src={toAbsoluteUrl('/media/icons/view.svg')}
                alt={intl.formatMessage({ id: 'COMMON.VIEW' })}
              />
            </button>
            <button className="size-7.5" onClick={() => handleEdit(info.row.original)}>
              <img
                src={toAbsoluteUrl('/media/icons/edit.svg')}
                alt={intl.formatMessage({ id: 'COMMON.EDIT' })}
              />
            </button>
          </div>
        ),
        meta: {
          className: 'min-w-32'
        }
      }
    ],
    [intl, language.code, getServiceName, getServiceDescription, handleEdit]
  );

  const filters = useMemo(
    () => (searchQuery.trim().length > 2 ? [{ id: '__any', value: searchQuery }] : []),
    [searchQuery]
  );

  const onFetchData = useCallback((params: any) => {
    return getAdditionalServices({
      type: 'insurance',
      page: params.pageIndex,
      size: params.pageSize,
      search: params.filters?.[0]?.value || '',
      sort: params.sorting?.[0]
        ? `${params.sorting[0].id},${params.sorting[0].desc ? 'desc' : 'asc'}`
        : 'updatedAt,asc'
    });
  }, []);

  const handleAddSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-semibold text-gray-800">
            <FormattedMessage id="INSURANCE.LIST.TITLE" defaultMessage="Insurance List" />
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <KeenIcon style="duotone" icon="magnifier" />
              </div>
              <DebouncedSearchInput
                type="search"
                className="w-64 pl-10 pr-4 py-2 input text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-info focus:border-info"
                placeholder={intl.formatMessage({
                  id: 'COMMON.SEARCH_INSURANCE',
                  defaultMessage: 'Search Insurance'
                })}
                onDebounce={setSearchQuery}
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 w-40 py-2 rounded-lg font-medium text-sm"
            >
              <FormattedMessage id="INSURANCE.ADD" defaultMessage="Add" />
            </button>
          </div>
        </div>

        <DataGrid
          key={refreshTrigger}
          data={[]}
          columns={columns}
          serverSide={true}
          onFetchData={onFetchData}
          filters={filters}
        />
      </div>

      <InsuranceModal
        open={showAddModal}
        onClose={handleModalClose}
        onSuccess={handleAddSuccess}
        editingInsurance={editingInsurance}
      />
    </>
  );
};

export { InsuranceList };
