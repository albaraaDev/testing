import { MaintenanceModel } from '@/api/maintenance';
import { VehicleSearch } from '@/pages/driver/add-driver/blocks/VehicleSearch';
import { MaintenanceTypeDropdownSearch } from '../components';
import { useState } from 'react';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router';
import { useIntl, FormattedMessage } from 'react-intl';

export interface AddMaintenancePageProps {
  maintenance?: MaintenanceModel;
}

const AddMaintenancePage = ({ maintenance }: AddMaintenancePageProps) => {
  const [selectedStatus, setSelectedStatus] = useState<'ongoing' | 'finished'>('ongoing');
  const [searchParams] = useSearchParams();
  const intl = useIntl();

  return (
    <div className="grid gap-5 lg:gap-7.5 xl:w-[60rem] mx-auto">
      <div className="card pb-2.5">
        <div className="card-header" id="maintenance_settings">
          <h3 className="card-title">
            <FormattedMessage id="SIDEBAR.MENU.MAINTENANCE.MAINTENANCE" />
          </h3>
        </div>

        <div className="card-body grid gap-5">
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2.5">
              <label className="form-label">
                <FormattedMessage id="MAINTENANCE.FORM.VEHICLE" />
              </label>
              <VehicleSearch
                initialSearch={
                  (maintenance && {
                    id: maintenance.vehicleId,
                    plate: maintenance.vehiclePlate
                  }) ||
                  (searchParams.get('vehicleId') &&
                    searchParams.get('plate') && {
                      id: searchParams.get('vehicleId') || '',
                      plate: searchParams.get('plate') || ''
                    }) ||
                  undefined
                }
                place="bottom"
                required
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="form-label">
                <FormattedMessage id="MAINTENANCE.FORM.TYPE" />
              </label>
              <MaintenanceTypeDropdownSearch
                initialSearch={{
                  title: maintenance?.type!,
                  code: maintenance?.type!
                }}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2.5">
              <label className="form-label">
                <FormattedMessage id="MAINTENANCE.FORM.START_DATE" />
              </label>
              <input
                required
                type="date"
                className="input w-full dark:[color-scheme:dark]"
                name="startDate"
                placeholder={intl.formatMessage({ id: 'COMMON.DATE.FORMAT' })}
                defaultValue={
                  maintenance?.startDate && format(new Date(maintenance.startDate), 'yyyy-MM-dd')
                }
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <label className="form-label">
                <FormattedMessage id="MAINTENANCE.FORM.END_DATE" />
              </label>
              <input
                required
                type="date"
                className="input w-full dark:[color-scheme:dark]"
                name="endDate"
                placeholder={intl.formatMessage({ id: 'COMMON.DATE.FORMAT' })}
                defaultValue={
                  maintenance?.endDate && format(new Date(maintenance.endDate), 'yyyy-MM-dd')
                }
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="grid gap-2.5">
              <label className="form-label">
                <FormattedMessage id="MAINTENANCE.FORM.SUPPLIER" />
              </label>
              <input
                required
                type="text"
                id="supplier"
                name="supplier"
                className="input"
                placeholder={intl.formatMessage({ id: 'MAINTENANCE.FORM.SUPPLIER.PLACEHOLDER' })}
                defaultValue={maintenance?.supplier}
              />
            </div>
            <div className="grid gap-2.5">
              <label className="form-label">
                <FormattedMessage id="MAINTENANCE.FORM.PRICE" />
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                className="input"
                placeholder={intl.formatMessage({ id: 'MAINTENANCE.FORM.PRICE.PLACEHOLDER' })}
                defaultValue={maintenance?.amount}
              />
            </div>
          </div>

          <div className="w-full grid gap-2.5">
            <div className="grid gap-2.5">
              <label className="form-label">
                <FormattedMessage id="MAINTENANCE.FORM.DESCRIPTION" />
              </label>
              <textarea
                id="description"
                name="description"
                className="input p-2 max-h-[100px] min-h-[50px]"
                placeholder={intl.formatMessage({ id: 'MAINTENANCE.FORM.DESCRIPTION.PLACEHOLDER' })}
                rows={4}
                defaultValue={maintenance?.description}
              ></textarea>
            </div>

            <div className="w-full grid gap-2.5">
              <label className="form-label col-span-6">
                <FormattedMessage id="MAINTENANCE.FORM.STATUS" />
              </label>
              <div
                className={`flex items-center gap-2 p-2 rounded-md border border-dashed hover:bg-gray-100 transition-colors
                    ${selectedStatus === 'ongoing' ? 'border-blue-500' : 'border-gray-300'}`}
              >
                <input
                  type="radio"
                  name="status"
                  value="ongoing"
                  checked={selectedStatus === 'ongoing'}
                  onChange={() => setSelectedStatus('ongoing')}
                  className="hidden"
                />
                <label htmlFor="ongoing" className="flex items-center gap-2 cursor-pointer w-full">
                  <div
                    className={`w-4 h-4 rounded-full bg-gray-200
                        ${selectedStatus === 'ongoing' ? 'border-4 border-blue-500' : 'border-2 border-gray-300'}`}
                  />
                  <span className="text-yellow-500">
                    <FormattedMessage id="MAINTENANCE.STATUS.ONGOING" />
                  </span>
                </label>
              </div>
              <div
                className={`flex items-center gap-2 p-2 rounded-md border border-dashed hover:bg-gray-100 transition-colors
                    ${selectedStatus === 'finished' ? 'border-blue-500' : 'border-gray-300'}`}
              >
                <input
                  type="radio"
                  name="status"
                  value="finished"
                  checked={selectedStatus === 'finished'}
                  onChange={() => setSelectedStatus('finished')}
                  className="hidden"
                />
                <label htmlFor="finished" className="flex items-center gap-2 cursor-pointer w-full">
                  <div
                    className={`w-4 h-4 rounded-full bg-gray-200
                        ${selectedStatus === 'finished' ? 'border-4 border-blue-500' : 'border-2 border-gray-300'}`}
                  />
                  <span className="text-green-500">
                    <FormattedMessage id="MAINTENANCE.STATUS.FINISHED" />
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AddMaintenancePage };
