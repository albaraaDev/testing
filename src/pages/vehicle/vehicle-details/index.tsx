import Toolbar from './components/Toolbar.tsx';
import {
  ModelIcon,
  ModelSeriesIcon,
  ModelYearIcon,
  FuelTypeIcon,
  GearIcon,
  VolumeIcon,
  PowerIcon,
  ColorIcon,
  TypeIcon
} from '../blocks/svg/index.ts';
import FileList from '@/components/FileList.tsx';
import VehicleMetrics from '../blocks/details-components/VehicleMetrics.tsx';
// import GeofenceList from '../blocks/details-components/GeofenceList.tsx';
import TripList from '../blocks/details-components/TripList.tsx';
import VehicleWorkingPeriods from '../blocks/details-components/VehicleWorkingPeriods.tsx';
import { useParams } from 'react-router-dom';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate.tsx';
import { useEffect, useMemo, useState } from 'react';
import VehicleInfoCard from './components/VehicleInfoCard.tsx';
import { getVehicleDetails, VehicleDTO } from '@/api/cars.ts';
import { MaintenanceViolationTable } from '@/pages/dashboards/blocks/maintenance/MaintenanceViolation.tsx';
import VehicleCurrentLocation from './components/VehicleCurrentLocation.tsx';
import VehicleScratchesDisplay from '../add-vehicle/blocks/VehicleScratchesDisplay.tsx';
import VehicleInsuranceIcon from '../blocks/svg/VehicleInsuranceIcon.tsx';
import { useIntl, FormattedMessage } from 'react-intl';
import { Report } from '@/components';
import { Notifications } from '@/pages/dashboards/blocks/Notifications.tsx';

// const geofences = [
//   'ISTANBUL',
//   'ANKARA',
//   'IZMIR',
//   'ANTALYA',
//   'ANKARA',
//   'IZMIR',
//   'ANTALYA',
//   'ANKARA',
//   'IZMIR',
//   'ANTALYA'
// ];

const VehicleInfo = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<VehicleDTO | null>();
  const intl = useIntl();

  useEffect(() => {
    (async () => {
      try {
        if (id) {
          const res = await getVehicleDetails(id);
          setVehicle(res);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);

  const vehicleInfo = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.MODEL' }),
        value: vehicle?.model || 'NA',
        icon: <ModelIcon />
      },
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.MODEL_SERIES' }),
        value: vehicle?.modelSeries || 'NA',
        icon: <ModelSeriesIcon />
      },
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.MODEL_YEAR' }),
        value: vehicle?.modelYear?.toString() || 'NA',
        icon: <ModelYearIcon />
      },
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.FUEL_TYPE' }),
        value: vehicle?.fuelType || 'NA',
        icon: <FuelTypeIcon />
      },
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.GEAR' }),
        value: vehicle?.gear || 'NA',
        icon: <GearIcon />
      },
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.VOLUME' }),
        value: vehicle?.volume || 'NA',
        icon: <VolumeIcon />
      },
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.POWER' }),
        value: vehicle?.power || 'NA',
        icon: <PowerIcon />
      },
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.COLOR' }),
        value: vehicle?.color || 'NA',
        icon: <ColorIcon />
      },
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.TYPE' }),
        value: vehicle?.carType || 'NA',
        icon: <TypeIcon />
      }
    ],
    [vehicle, intl]
  );

  const details = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.TYPE' }),
        value: vehicle?.type || 'NA'
      },
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.IDENTIFY_NUMBER' }),
        value: vehicle?.identifyNumber || 'NA'
      },
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.CHASSIS_NUMBER' }),
        value: vehicle?.chassisNumber || 'NA'
      },
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.ENGINE_NUMBER' }),
        value: vehicle?.engineNumber || 'NA'
      },
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.REGISTRATION_NUMBER' }),
        value: vehicle?.registrationNumber || 'NA'
      },
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.REGISTRATION_DATE' }),
        value: vehicle?.registrationDate || 'NA'
      },
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.FIRST_REGISTRATION_DATE' }),
        value: vehicle?.firstRegistrationDate || 'NA'
      },
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.LICENSE_SERIAL_NUMBER' }),
        value: vehicle?.licenseSerialNumber || 'NA'
      },
      {
        label: intl.formatMessage({ id: 'VEHICLE.DETAILS.PRICE' }),
        value: vehicle?.price || 'NA'
      }
    ],
    [vehicle, intl]
  );

  const items = useMemo(
    () => [
      {
        title: intl.formatMessage({ id: 'VEHICLE.DETAILS.INSURANCE.TYPES.INSPECTION' }),
        startDate: vehicle?.inspectionStartDate || 'NA',
        endDate: vehicle?.inspectionEndDate || 'NA'
      },
      {
        title: intl.formatMessage({ id: 'VEHICLE.DETAILS.INSURANCE.TYPES.INSURANCE' }),
        startDate: vehicle?.insuranceStartDate || 'NA',
        endDate: vehicle?.insuranceEndDate || 'NA'
      },
      {
        title: intl.formatMessage({ id: 'VEHICLE.DETAILS.INSURANCE.TYPES.KASKO' }),
        startDate: vehicle?.kaskoInsuranceStartDate || 'NA',
        endDate: vehicle?.kaskoInsuranceEndDate || 'NA'
      },
      {
        title: intl.formatMessage({ id: 'VEHICLE.DETAILS.INSURANCE.TYPES.EXHAUST' }),
        startDate: vehicle?.exhaustStartDate || 'NA',
        endDate: vehicle?.exhaustEndDate || 'NA'
      }
    ],
    [vehicle, intl]
  );

  const files = useMemo(() => {
    if (!vehicle) return [];

    return [
      {
        name: intl.formatMessage({ id: 'VEHICLE.DETAILS.DOCUMENTS.IMAGE' }),
        url: (vehicle?.image as string) ?? undefined
      },
      {
        name: intl.formatMessage({ id: 'VEHICLE.DETAILS.DOCUMENTS.LICENSE' }),
        url: (vehicle?.licenseImage as string) ?? undefined
      }
    ];
  }, [vehicle, intl]);

  return (
    <>
      <Toolbar carId={vehicle?.id} plate={vehicle?.plate} />
      <div className="px-10">
        <div className="flex flex-col lg:flex-row">
          <div className="card hover:shadow-md w-full lg:w-1/2 grid grid-cols-1 mb-2 p-4">
            <div className="flex justify-between">
              {/* Car Plate */}
              <div className="flex items-center justify-center mb-4">
                <CarPlate plate={vehicle?.plate || 'NA'} />
              </div>

              {/* Device Section */}
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-4 rounded-full"></div>
                <div>
                  <span className="text-lg font-medium">{vehicle?.deviceIdent || 'NA'}</span>
                  <p className="text-sm text-gray-500">
                    <FormattedMessage id="VEHICLE.DETAILS.DEVICE" />
                  </p>
                </div>
              </div>
            </div>
            {/* Image Section */}
            <VehicleScratchesDisplay vehicleId={id} />
          </div>
          <div className="container px-2 mx-auto pl-5 grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
            {/* Vehicle Info Section */}
            <div className="flex flex-col lg:flex-row h-full">
              {/* Vehicle Info Cards */}
              <div className="flex-grow me-0 lg:me-4 h-full">
                <div className="grid grid-cols-3 lg:grid-cols-3 gap-[11px] h-full">
                  {vehicleInfo.map(({ label, value, icon }, index) => (
                    <VehicleInfoCard key={index} label={label} value={value} icon={icon} />
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="flex-grow lg:w-1/3 mb-4 card hover:shadow-md overflow-hidden p-4 flex flex-col gap-4 h-full">
                <VehicleCurrentLocation deviceIdent={vehicle?.deviceIdent} />
                <div className="flex-grow">
                  {details.map(({ label, value }, index) => (
                    <div key={index} className="flex items-start mb-2">
                      <span className="text-gray-600 me-1">{label}:</span>
                      <span className="text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inspection and Insurance Section */}
            <div className="card hover:shadow-md mb-2 p-4 mt-[11px]">
              <h2 className="text-xl font-semibold mb-2 border-b-2 pb-2">
                <FormattedMessage id="VEHICLE.DETAILS.INSURANCE.TITLE" />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-[26px]">
                {items.map((item) => (
                  <div key={item.title} className="flex items-start space-x-3 rounded-lg gap-6">
                    <div className="rounded-lg p-[10px] bg-gray-200">
                      <VehicleInsuranceIcon />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[14px]">{item.title}</h3>
                      <div className="mt-1 flex text-[13px]">
                        <div>
                          <span className="font-semibold">
                            <FormattedMessage id="VEHICLE.DETAILS.INSURANCE.START" />
                          </span>
                          :<span>{item.startDate}</span>
                        </div>
                        <div className="ms-4">
                          <span className="font-semibold">
                            <FormattedMessage id="VEHICLE.DETAILS.INSURANCE.END" />
                          </span>
                          :<span>{item.endDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <TripList vehicleId={vehicle?.vehicleId} ident={vehicle?.deviceIdent} />
        <div className="flex flex-grow mb-4 flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="w-1/3">
            <h2 className="text-xl font-semibold mb-4 ps-4">
              <FormattedMessage id="VEHICLE.DETAILS.DOCUMENTS" />
            </h2>
            <FileList files={files} />
          </div>
          <VehicleMetrics
            metrics={{
              engineHours: vehicle?.formatedEngineHours || '0 min',
              mileage: ((vehicle?.mileage || 0) + +(vehicle?.currentMileage || '0')).toFixed(0),
              fuelConsumption: vehicle?.fuelConsumption?.toString() || '0'
            }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4 h-[500px]">
          {vehicle?.vehicleId && vehicle.deviceIdent && (
            <Notifications
              vehicleId={vehicle.vehicleId}
              ident={vehicle.deviceIdent}
              withTypeFilter
            />
          )}
          <div className="col-span-2">
            <Report
              vehicleId={vehicle?.vehicleId || ''}
              ident={vehicle?.deviceIdent || ''}
              type="vehicle"
            />
          </div>
        </div>
        <div className="w-full">
          {vehicle && <MaintenanceViolationTable id={vehicle?.vehicleId} />}
        </div>

        <div className="mt-4 mb-4">
          <VehicleWorkingPeriods vehicleId={vehicle?.vehicleId} />
        </div>

        {/* <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="w-1/3">
            <GeofenceList
              items={geofences}
              title="Geofences"
              className="mx-2"
              onItemClick={(item) => console.log(`Selected: ${item}`)}
              searchPlaceholder="Search..."
            />
          </div>
        </div> */}
      </div>
    </>
  );
};

export default VehicleInfo;
