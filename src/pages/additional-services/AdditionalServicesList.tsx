import {
  AdditionalService,
  createAdditionalService,
  CreateAdditionalServiceRequest,
  deleteAdditionalService,
  getAdditionalServices,
  updateAdditionalService,
  UpdateAdditionalServiceRequest
} from '@/api/reservations.ts';
import { ResponseModel } from '@/api/response.ts';
import { DataGrid, KeenIcon } from '@/components';
import DebouncedSearchInput from '@/components/DebouncedInputField.tsx';
import { DownloadableImage } from '@/components/DownloadableImage';
import { useCurrentLanguage } from '@/providers/index.ts';
import { toAbsoluteUrl } from '@/utils';
import { ColumnDef } from '@tanstack/react-table';
import { useDialogs } from '@toolpad/core/useDialogs';
import axios, { AxiosError } from 'axios';
import { Cloud, CloudUpload } from 'lucide-react';
import { useSnackbar } from 'notistack';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface AdditionalServiceFormData {
  nameEn: string;
  nameAr: string;
  nameTr: string;
  descriptionEn: string;
  descriptionAr: string;
  descriptionTr: string;
  defaultPrice: number;
  maxQuantity: number;
  image: File | null;
}

const AdditionalServicesList = () => {
  const intl = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const dialogs = useDialogs();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<AdditionalService | null>(null);
  const language = useCurrentLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newServiceData, setNewServiceData] = useState<AdditionalServiceFormData>({
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

  const getCurrentName = useCallback(() => {
    switch (language.code) {
      case 'ar':
        return newServiceData.nameAr;
      case 'tr':
        return newServiceData.nameTr;
      default:
        return newServiceData.nameEn;
    }
  }, [language.code, newServiceData]);

  const getCurrentDescription = useCallback(() => {
    switch (language.code) {
      case 'ar':
        return newServiceData.descriptionAr;
      case 'tr':
        return newServiceData.descriptionTr;
      default:
        return newServiceData.descriptionEn;
    }
  }, [language.code, newServiceData]);

  const updateCurrentName = useCallback(
    (value: string) => {
      const field =
        language.code === 'ar' ? 'nameAr' : language.code === 'tr' ? 'nameTr' : 'nameEn';
      setNewServiceData((prev) => ({ ...prev, [field]: value }));
    },
    [language.code]
  );

  const updateCurrentDescription = useCallback(
    (value: string) => {
      const field =
        language.code === 'ar'
          ? 'descriptionAr'
          : language.code === 'tr'
            ? 'descriptionTr'
            : 'descriptionEn';
      setNewServiceData((prev) => ({ ...prev, [field]: value }));
    },
    [language.code]
  );

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewServiceData((prev) => ({ ...prev, image: file }));
    }
  }, []);

  const handleAddNew = useCallback(async () => {
    setIsAddingService(true);

    try {
      if (editingService) {
        const updateRequest: UpdateAdditionalServiceRequest = {
          id: editingService.id,
          type: 'service',
          nameEn: newServiceData.nameEn,
          nameAr: newServiceData.nameAr || newServiceData.nameEn,
          nameTr: newServiceData.nameTr || newServiceData.nameEn,
          descriptionEn: newServiceData.descriptionEn,
          descriptionAr: newServiceData.descriptionAr || newServiceData.descriptionEn,
          descriptionTr: newServiceData.descriptionTr || newServiceData.descriptionEn,
          unit: 'piece',
          defaultPrice: newServiceData.defaultPrice,
          specialPrice: newServiceData.defaultPrice * 0.9,
          maxQuantity: newServiceData.maxQuantity,
          status: true,
          imageFile: newServiceData.image || undefined
        };

        console.log(newServiceData.image);

        const response = await updateAdditionalService(updateRequest);
        enqueueSnackbar(
          response.message ||
            intl.formatMessage({
              id: 'ADDITIONAL_SERVICES.UPDATE_SUCCESS',
              defaultMessage: 'Service updated successfully'
            }),
          { variant: 'success' }
        );
      } else {
        const serviceRequest: CreateAdditionalServiceRequest = {
          type: 'service',
          nameEn: newServiceData.nameEn,
          nameAr: newServiceData.nameAr || newServiceData.nameEn,
          nameTr: newServiceData.nameTr || newServiceData.nameEn,
          descriptionEn: newServiceData.descriptionEn,
          descriptionAr: newServiceData.descriptionAr || newServiceData.descriptionEn,
          descriptionTr: newServiceData.descriptionTr || newServiceData.descriptionEn,
          unit: 'piece',
          defaultPrice: newServiceData.defaultPrice,
          specialPrice: newServiceData.defaultPrice * 0.9,
          maxQuantity: newServiceData.maxQuantity,
          status: true,
          imageFile: newServiceData.image || undefined
        };

        const response = await createAdditionalService(serviceRequest);

        enqueueSnackbar(
          response.message ||
            intl.formatMessage({
              id: 'ADDITIONAL_SERVICES.CREATE_SUCCESS',
              defaultMessage: 'Service added successfully'
            }),
          { variant: 'success' }
        );
      }
      // Reset form
      setNewServiceData({
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

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Trigger data refresh
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ResponseModel<never>>;
        enqueueSnackbar(
          axiosError.response?.data.message ||
            intl.formatMessage({
              id: 'ADDITIONAL_SERVICES.CREATE_ERROR',
              defaultMessage: 'Error adding service'
            }),
          { variant: 'error' }
        );
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'SNACKBAR.DEFAULT_ERROR' }), {
          variant: 'error'
        });
      }
    } finally {
      setIsAddingService(false);
      setEditingService(null);
    }
  }, [newServiceData, enqueueSnackbar, intl]);

  const handleEdit = useCallback((service: AdditionalService) => {
    setNewServiceData({
      nameEn: service.nameEn,
      nameAr: service.nameAr,
      nameTr: service.nameTr,
      descriptionEn: service.descriptionEn,
      descriptionAr: service.descriptionAr,
      descriptionTr: service.descriptionTr,
      defaultPrice: service.defaultPrice,
      maxQuantity: service.maxQuantity,
      image: null
    });

    setEditingService(service);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (
        !(await dialogs.confirm(
          intl.formatMessage({
            id: 'ADDITIONAL_SERVICES.DELETE.MODAL_MESSAGE',
            defaultMessage:
              'Are you sure you want to delete this service? This action cannot be undone.'
          }),
          {
            title: intl.formatMessage({
              id: 'ADDITIONAL_SERVICES.DELETE.MODAL_TITLE',
              defaultMessage: 'Delete Service'
            }),
            okText: intl.formatMessage({ id: 'COMMON.DELETE' }),
            cancelText: intl.formatMessage({ id: 'COMMON.CANCEL' })
          }
        ))
      ) {
        return;
      }

      try {
        const response = await deleteAdditionalService(id);
        enqueueSnackbar(
          response.message ||
            intl.formatMessage({
              id: 'ADDITIONAL_SERVICES.DELETE_SUCCESS',
              defaultMessage: 'Service deleted successfully'
            }),
          { variant: 'success' }
        );

        // Trigger data refresh
        setRefreshTrigger((prev) => prev + 1);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<ResponseModel<never>>;
          enqueueSnackbar(
            axiosError.response?.data.message ||
              intl.formatMessage({
                id: 'ADDITIONAL_SERVICES.DELETE_ERROR',
                defaultMessage: 'Error deleting service'
              }),
            { variant: 'error' }
          );
        } else {
          enqueueSnackbar(intl.formatMessage({ id: 'SNACKBAR.DEFAULT_ERROR' }), {
            variant: 'error'
          });
        }
      }
    },
    [dialogs, enqueueSnackbar, intl]
  );

  const customFirstRow = useMemo(
    () => (
      <>
        <td className="p-4">
          <div className="flex items-center justify-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors text-gray-400 hover:text-blue-500"
            >
              {newServiceData.image ? (
                <img
                  src={URL.createObjectURL(newServiceData.image)}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <CloudUpload />
              )}
            </button>
          </div>
        </td>
        <td className="p-4">
          <input
            type="text"
            value={getCurrentName()}
            onChange={(e) => updateCurrentName(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={intl.formatMessage({
              id: 'ADDITIONAL_SERVICES.FORM.NAME_PLACEHOLDER',
              defaultMessage: 'Enter service name'
            })}
          />
        </td>
        <td className="p-4">
          <input
            type="text"
            value={getCurrentDescription()}
            onChange={(e) => updateCurrentDescription(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={intl.formatMessage({
              id: 'ADDITIONAL_SERVICES.FORM.DESCRIPTION_PLACEHOLDER',
              defaultMessage: 'Enter service description'
            })}
          />
        </td>
        <td className="p-4">
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">$</span>
            <input
              type="number"
              min="0"
              value={newServiceData.defaultPrice || ''}
              onChange={(e) =>
                setNewServiceData((prev) => ({
                  ...prev,
                  defaultPrice: parseFloat(e.target.value) || 0
                }))
              }
              className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </td>
        <td className="p-4">
          <input
            type="number"
            min="1"
            value={newServiceData.maxQuantity || ''}
            onChange={(e) =>
              setNewServiceData((prev) => ({
                ...prev,
                maxQuantity: parseInt(e.target.value) || 1
              }))
            }
            className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1"
          />
        </td>
        <td className="p-4">
          <div className="flex gap-2">
            <button
              onClick={handleAddNew}
              disabled={
                !newServiceData.nameEn || newServiceData.defaultPrice <= 0 || isAddingService
              }
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium min-w-16 flex items-center justify-center"
            >
              {isAddingService ? (
                <>
                  <KeenIcon icon="loading" className="animate-spin mr-1 w-4 h-4" />
                  {editingService ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <FormattedMessage
                  id={editingService ? 'COMMON.UPDATE' : 'COMMON.ADD'}
                  defaultMessage={editingService ? 'Update' : 'Add'}
                />
              )}
            </button>

            {editingService && (
              <button
                onClick={() => {
                  setEditingService(null);
                  setNewServiceData({
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
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-medium"
              >
                <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
              </button>
            )}
          </div>
        </td>
      </>
    ),
    [
      newServiceData,
      editingService,
      getCurrentName,
      getCurrentDescription,
      updateCurrentName,
      updateCurrentDescription,
      handleImageUpload,
      handleAddNew,
      isAddingService,
      intl
    ]
  );

  const columns = useMemo<ColumnDef<AdditionalService>[]>(
    () => [
      {
        accessorFn: (row) => row.image,
        id: 'image',
        header: () => (
          <FormattedMessage id="ADDITIONAL_SERVICES.TABLE.IMAGE" defaultMessage="Image / Icon" />
        ),
        enableSorting: false,
        cell: (info) => (
          <div className="flex items-center justify-center">
            {info.row.original.image ? (
              <DownloadableImage
                src={info.row.original.image}
                alt="Service"
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <KeenIcon icon="picture" className="text-gray-400" />
              </div>
            )}
          </div>
        ),
        meta: {
          className: 'min-w-20 text-center'
        }
      },
      {
        accessorFn: (row) => getServiceName(row, language.code),
        id: 'name',
        header: () => (
          <FormattedMessage id="ADDITIONAL_SERVICES.TABLE.NAME" defaultMessage="Name Services" />
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
            id="ADDITIONAL_SERVICES.TABLE.DESCRIPTION"
            defaultMessage="Service Description"
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
          <FormattedMessage id="ADDITIONAL_SERVICES.TABLE.PRICE" defaultMessage="Price" />
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
          <FormattedMessage
            id="ADDITIONAL_SERVICES.TABLE.MAX_QUANTITY"
            defaultMessage="Maximum number"
          />
        ),
        enableSorting: true,
        cell: (info) => <span className="text-gray-800">{info.row.original.maxQuantity}</span>,
        meta: {
          className: 'min-w-32'
        }
      },
      {
        id: 'actions',
        header: () => <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
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
    [intl, language.code, getServiceName, getServiceDescription, handleDelete]
  );

  const filters = useMemo(
    () => (searchQuery.trim().length > 2 ? [{ id: '__any', value: searchQuery }] : []),
    [searchQuery]
  );

  const onFetchData = useCallback((params: any) => {
    return getAdditionalServices({
      page: params.pageIndex,
      size: params.pageSize,
      search: params.filters?.[0]?.value || '',
      sort: params.sorting?.[0]
        ? `${params.sorting[0].id},${params.sorting[0].desc ? 'desc' : 'asc'}`
        : 'updatedAt,asc'
    });
  }, []);

  return (
    <div className="card">
      <div className="flex items-center justify-between p-6">
        <h2 className="text-xl font-semibold text-gray-800">
          <FormattedMessage
            id="ADDITIONAL_SERVICES.LIST.TITLE"
            defaultMessage="Additional Services List"
          />
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <KeenIcon style="duotone" icon="magnifier" />
          </div>
          <DebouncedSearchInput
            type="search"
            className="w-64 pl-10 pr-4 py-2 input text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-info focus:border-info"
            placeholder={intl.formatMessage({ id: 'COMMON.SEARCH' })}
            onDebounce={setSearchQuery}
          />
        </div>
      </div>

      <DataGrid
        key={refreshTrigger}
        data={[]}
        columns={columns}
        serverSide={true}
        onFetchData={onFetchData}
        filters={filters}
        customFirstRow={customFirstRow}
      />
    </div>
  );
};

export { AdditionalServicesList };
