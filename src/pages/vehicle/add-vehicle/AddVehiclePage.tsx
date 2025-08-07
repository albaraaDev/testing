import React, { useEffect, useRef, useState } from 'react';
import {
  Information,
  Registration,
  InspectionAndInsurance,
  AdditionalVehicleInfo as AdditionalVehicleInfoBlock
} from './blocks';
import { Form, Formik } from 'formik';
import PromoCarTypeIcon from '../blocks/svg/PromoCarTypeIcon';
import PickupCarTypeIcon from '../blocks/svg/PickupCarTypeIcon';
import ComfortCarTypeIcon from '../blocks/svg/ComfortCarTypeIcon';
import SuvCarTypeIcon from '../blocks/svg/SuvCarTypeIcon';
import BusCarTypeIcon from '../blocks/svg/BusCarTypeIcon';
import VanCarTypeIcon from '../blocks/svg/VanCarTypeIcon';
import ManualGearTypeIcon from '../blocks/svg/ManualGearTypeIcon';
import AutomaticGearTypeIcon from '../blocks/svg/AutomaticGearTypeIcon';
import IndividualTypeIcon from '../blocks/svg/IndividualTypeIcon';
import CompanyTypeIcon from '../blocks/svg/CompanyTypeIcon';
import { useParams } from 'react-router';
import { createVehicle, getVehicleDetails, updateVehicle, VehicleDTO } from '@/api/cars';
import { CircularProgress } from '@mui/material';
import clsx from 'clsx';
import { useSnackbar } from 'notistack';
import axios, { AxiosError } from 'axios';
import { ResponseModel, ResponseModelOrNull } from '@/api/response';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAppRouting } from '@/routing/useAppRouting';

type RadioOption<T> = {
  label: string;
  value: T;
  icon?: React.ReactNode;
};

type TabType = 'information' | 'registration' | 'inspectionAndInsurance';

interface AdditionalVehicleInfo {
  vehicleImage?: string;
  owner?: string;
  plate: string;
  status: string;
  hgsNumber: string;
  currentMileage: string;
  maintenanceMileage: string;
  fuelConsumption: number;
  licenseImageFile?: string;
  deviceIdent?: string;
  deviceId?: string;
  userId?: string;
}

export type FuelType = 'Hybrid' | 'Diesel' | 'Benzin' | 'LPG' | 'Kerosine' | 'Electric';
export const fuelOptions: Array<RadioOption<FuelType>> = [
  { label: 'VEHICLE.FORM.INFORMATION.FUEL_TYPE.HYBRID', value: 'Hybrid' },
  { label: 'VEHICLE.FORM.INFORMATION.FUEL_TYPE.DIESEL', value: 'Diesel' },
  { label: 'VEHICLE.FORM.INFORMATION.FUEL_TYPE.BENZIN', value: 'Benzin' },
  { label: 'VEHICLE.FORM.INFORMATION.FUEL_TYPE.LPG', value: 'LPG' },
  { label: 'VEHICLE.FORM.INFORMATION.FUEL_TYPE.KEROSINE', value: 'Kerosine' },
  { label: 'VEHICLE.FORM.INFORMATION.FUEL_TYPE.ELECTRIC', value: 'Electric' }
];

export type CarType = 'PROMO' | 'Pickup' | 'COMFORT' | 'SUV' | 'Bus' | 'Van';
export const carOptions: Array<RadioOption<CarType>> = [
  {
    label: 'VEHICLE.FORM.INFORMATION.CAR_TYPE.PROMO',
    value: 'PROMO',
    icon: <PromoCarTypeIcon />
  },
  {
    label: 'VEHICLE.FORM.INFORMATION.CAR_TYPE.PICKUP',
    value: 'Pickup',
    icon: <PickupCarTypeIcon />
  },
  {
    label: 'VEHICLE.FORM.INFORMATION.CAR_TYPE.COMFORT',
    value: 'COMFORT',
    icon: <ComfortCarTypeIcon />
  },
  {
    label: 'VEHICLE.FORM.INFORMATION.CAR_TYPE.SUV',
    value: 'SUV',
    icon: <SuvCarTypeIcon />
  },
  {
    label: 'VEHICLE.FORM.INFORMATION.CAR_TYPE.BUS',
    value: 'Bus',
    icon: <BusCarTypeIcon />
  },
  {
    label: 'VEHICLE.FORM.INFORMATION.CAR_TYPE.VAN',
    value: 'Van',
    icon: <VanCarTypeIcon />
  }
];

export type GearType = 'Automatic' | 'Manual';
export const gearOptions: Array<RadioOption<GearType>> = [
  {
    label: 'VEHICLE.FORM.INFORMATION.GEAR.AUTOMATIC',
    value: 'Automatic',
    icon: <AutomaticGearTypeIcon />
  },
  {
    label: 'VEHICLE.FORM.INFORMATION.GEAR.MANUAL',
    value: 'Manual',
    icon: <ManualGearTypeIcon />
  }
];

export const colorOptions = [
  'Black',
  'White',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Orange',
  'Purple',
  'Pink',
  'Brown',
  'Gray',
  'Silver',
  'Gold',
  'Beige'
];

export const numberOfSeatsOptions = [2, 3, 4, 5, 6, 7, 8];

export interface InformationFormField {
  brand: string;
  model: string;
  modelSeries: string;
  modelYear: number;
  volume: string;
  power: string;
  fuelType: FuelType;
  carType: CarType;
  gearType: GearType;
  color: string;
  numberOfSeats: number;
}

export type RegistrationType = 'Individual' | 'Company';
export const registrationTypeOptions: Array<RadioOption<RegistrationType>> = [
  { label: 'Individual', value: 'Individual', icon: <IndividualTypeIcon /> },
  { label: 'Company', value: 'Company', icon: <CompanyTypeIcon /> }
];

export interface RegistrationFormField {
  registrationType: RegistrationType;
  identifyNumber: string;
  chassisNumber: string;
  engineNumber: string;
  registrationNumber: string;
  registrationDate: string;
  firstRegistrationDate: string;
  licenseSerialNumber: string;
  price: number;
}

export interface InspectionAndInsuranceFormField {
  inspectionStartDate: string;
  inspectionEndDate: string;
  insuranceStartDate: string;
  insuranceEndDate: string;
  kaskoStartDate: string;
  kaskoEndDate: string;
  exhaustStartDate: string;
  exhaustEndDate: string;
}

export type AddVehicleForm = AdditionalVehicleInfo &
  InformationFormField &
  RegistrationFormField &
  InspectionAndInsuranceFormField;

const AddVehiclePage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { id: carId } = useParams();
  const intl = useIntl();
  const [currentVehicle, setCurrentVehicle] = useState<VehicleDTO | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('information');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const navigate = useAppRouting();

  const currentVehicleInitialValues: AddVehicleForm = {
    ...currentVehicle,
    owner: currentVehicle?.owner || '',
    status: currentVehicle?.status || 'unavailable',
    fuelType: currentVehicle?.fuelType || 'Hybrid',
    carType: currentVehicle?.carType || 'PROMO',
    gearType: currentVehicle?.gear || 'Automatic',
    color: currentVehicle?.color || 'Black',
    numberOfSeats: currentVehicle?.numberOfSeats || 4,
    registrationType: currentVehicle?.type || 'Individual',
    price: currentVehicle?.price || 0,
    volume: currentVehicle?.volume || '',
    power: currentVehicle?.power || '',
    identifyNumber: currentVehicle?.identifyNumber || '',
    chassisNumber: currentVehicle?.chassisNumber || '',
    engineNumber: currentVehicle?.engineNumber || '',
    registrationNumber: currentVehicle?.registrationNumber || '',
    registrationDate: currentVehicle?.registrationDate || '',
    firstRegistrationDate: currentVehicle?.firstRegistrationDate || '',
    licenseSerialNumber: currentVehicle?.licenseSerialNumber || '',
    inspectionStartDate: currentVehicle?.inspectionStartDate || '',
    inspectionEndDate: currentVehicle?.inspectionEndDate || '',
    insuranceStartDate: currentVehicle?.insuranceStartDate || '',
    insuranceEndDate: currentVehicle?.insuranceEndDate || '',
    kaskoStartDate: currentVehicle?.kaskoInsuranceStartDate || '',
    kaskoEndDate: currentVehicle?.kaskoInsuranceEndDate || '',
    exhaustStartDate: currentVehicle?.exhaustStartDate || '',
    exhaustEndDate: currentVehicle?.exhaustEndDate || '',
    currentMileage: currentVehicle?.currentMileage || '',
    maintenanceMileage: currentVehicle?.maintenanceMileage || '',
    fuelConsumption: currentVehicle?.fuelConsumption || 0,
    hgsNumber: currentVehicle?.hgsNumber || '',
    plate: currentVehicle?.plate || '',
    vehicleImage: currentVehicle?.imageFile || undefined,
    licenseImageFile: currentVehicle?.licenseImageFile || undefined,
    brand: currentVehicle?.brand || '',
    model: currentVehicle?.model || '',
    modelSeries: currentVehicle?.modelSeries || '',
    modelYear: currentVehicle?.modelYear || 0
  };

  const additionalVehicleInfoInitialValues: AdditionalVehicleInfo = {
    currentMileage: '',
    fuelConsumption: 0,
    hgsNumber: '',
    maintenanceMileage: '',
    plate: '',
    licenseImageFile: undefined,
    vehicleImage: undefined,
    status: 'unavailable'
  };

  const informationInitialValues: InformationFormField = {
    brand: '',
    model: '',
    modelSeries: '',
    modelYear: 0,
    volume: '',
    power: '',
    fuelType: 'Hybrid',
    carType: 'PROMO',
    gearType: 'Automatic',
    color: 'Black',
    numberOfSeats: 4
  };

  const registrationInitialValues: RegistrationFormField = {
    registrationType: 'Individual',
    identifyNumber: '',
    chassisNumber: '',
    engineNumber: '',
    registrationNumber: '',
    registrationDate: '',
    firstRegistrationDate: '',
    licenseSerialNumber: '',
    price: 0
  };

  const inspectionAndInsuranceInitialValues: InspectionAndInsuranceFormField = {
    inspectionStartDate: '',
    inspectionEndDate: '',
    insuranceStartDate: '',
    insuranceEndDate: '',
    kaskoStartDate: '',
    kaskoEndDate: '',
    exhaustStartDate: '',
    exhaustEndDate: ''
  };

  const initialValues: AddVehicleForm = {
    ...informationInitialValues,
    ...registrationInitialValues,
    ...inspectionAndInsuranceInitialValues,
    ...additionalVehicleInfoInitialValues
  };

  const refs: Record<TabType, React.RefObject<HTMLDivElement | null>> = {
    information: useRef<HTMLDivElement>(null),
    registration: useRef<HTMLDivElement>(null),
    inspectionAndInsurance: useRef<HTMLDivElement>(null)
  };

  const tabConfig: Array<{
    id: TabType;
    label: string;
    ref: React.RefObject<HTMLDivElement | null>;
  }> = [
    {
      id: 'information',
      label: intl.formatMessage({ id: 'VEHICLE.FORM.INFORMATION' }),
      ref: refs.information
    },
    {
      id: 'registration',
      label: intl.formatMessage({ id: 'VEHICLE.FORM.REGISTRATION' }),
      ref: refs.registration
    },
    {
      id: 'inspectionAndInsurance',
      label: intl.formatMessage({ id: 'VEHICLE.FORM.INSPECTION_INSURANCE' }),
      ref: refs.inspectionAndInsurance
    }
  ] as const;

  const handleTabClick = (ref: React.RefObject<HTMLDivElement | null>, tab: TabType) => {
    setActiveTab(tab);

    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    const header = ref.current?.querySelector('h3');
    if (header) {
      header.setAttribute('tabindex', '-1');
      header.focus();
    }
  };

  const handleSaveClick = async (values: AddVehicleForm) => {
    const { ...vehicle } = values;

    setIsLoadingSave(true);
    try {
      let vehRes: ResponseModelOrNull<VehicleDTO>;
      if (carId && currentVehicle) {
        const updatedVehicle: VehicleDTO = {
          ...vehicle,
          owner: vehicle.owner || currentVehicle.owner,
          vehicleId: currentVehicle.vehicleId,
          id: currentVehicle.id,
          type: vehicle.registrationType,
          gear: vehicle.gearType,
          kaskoInsuranceEndDate: vehicle.kaskoEndDate,
          kaskoInsuranceStartDate: vehicle.kaskoStartDate,
          scratches: currentVehicle.scratches
        };

        if (vehicle.vehicleImage) {
          updatedVehicle.imageFile = vehicle.vehicleImage;
        }

        if (vehicle.licenseImageFile) {
          updatedVehicle.licenseImageFile = vehicle.licenseImageFile;
        }

        vehRes = await updateVehicle(updatedVehicle);
      } else {
        const vehicleData: Partial<VehicleDTO> = {
          ...vehicle,
          type: vehicle.registrationType,
          gear: vehicle.gearType,
          kaskoInsuranceEndDate: vehicle.kaskoEndDate,
          kaskoInsuranceStartDate: vehicle.kaskoStartDate,
          licenseImage: '',
          image: ''
        };

        if (vehicle.vehicleImage) {
          vehicleData.imageFile = vehicle.vehicleImage;
        }

        if (vehicle.licenseImageFile) {
          vehicleData.licenseImageFile = vehicle.licenseImageFile;
        }
        vehRes = await createVehicle(vehicleData);
      }
      const newId = vehRes.result?.vehicleId;
      if (newId) {
        navigate(`/vehicles/edit-scratches/${newId}`);
      }
      enqueueSnackbar(vehRes.message, {
        variant: 'success'
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ResponseModel<never>>;

        enqueueSnackbar(
          axiosError.response?.data.message ||
            intl.formatMessage({ id: 'VEHICLE.FORM.VALIDATION.ERROR' }),
          {
            variant: 'error'
          }
        );
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'VEHICLE.FORM.VALIDATION.ERROR' }), {
          variant: 'error'
        });
      }
    } finally {
      setIsLoadingSave(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (!carId) return;
      setIsLoading(true);
      try {
        const vehicle = (await getVehicleDetails(carId)) as any;
        for (const key in vehicle) {
          if (!vehicle[key]) {
            delete vehicle[key];
          }
        }
        setCurrentVehicle(vehicle);
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [carId]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <CircularProgress size={48} />
      </div>
    );
  }

  return (
    <Formik
      initialValues={carId ? currentVehicleInitialValues : initialValues}
      onSubmit={handleSaveClick}
    >
      {() => {
        return (
          <Form>
            <div className="grid grid-cols-4 gap-5">
              <div className="col-span-1">
                <AdditionalVehicleInfoBlock />
              </div>
              <div className="grid gap-5 lg:gap-7.5 mx-auto w-full col-span-3">
                <div className="flex">
                  <div className="w-full align-center">
                    <div className="tabs flex flex-wrap border-b mb-4" data-tabs="true">
                      {tabConfig.map(({ id, label, ref }) => (
                        <button
                          type="button"
                          key={id}
                          className={clsx(
                            'tab px-4 py-2 font-medium text-lg border-b-4 -mb-[1px]',
                            {
                              'text-primary border-primary': activeTab === id,
                              'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300':
                                activeTab !== id
                            }
                          )}
                          onClick={() => handleTabClick(ref, id)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col gap-6">
                      <div ref={refs.information}>
                        <Information />
                      </div>
                      <div ref={refs.registration}>
                        <Registration />
                      </div>
                      <div ref={refs.inspectionAndInsurance}>
                        <InspectionAndInsurance />
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end items-center gap-4">
                      <button
                        onClick={() => navigate(-1)}
                        type="button"
                        className="text-red-700 hover:text-white border bg-red-100 border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-5 py-2.5 text-center me-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                      >
                        <FormattedMessage id="VEHICLE.FORM.DISCARD" />
                      </button>
                      <button
                        className={clsx(
                          'px-4 py-2 bg-success text-white rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-3',
                          { 'w-32': isLoadingSave, 'w-auto': !isLoadingSave }
                        )}
                        type="submit"
                        disabled={isLoadingSave}
                      >
                        {isLoadingSave && <CircularProgress size={14} color="success" />}
                        <FormattedMessage id="VEHICLE.FORM.SAVE" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export { AddVehiclePage };
