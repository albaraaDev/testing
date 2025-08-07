import { ResponseModel } from '@/api';
import {
  dropoffReservation,
  DropoffReservationRequest,
  getReservationDetails,
  pickupReservation,
  PickupReservationRequest,
  ReservationDetails,
  ReservationRequestItem
} from '@/api/reservations';
import { Container } from '@/components/container';
import { PageNavbar } from '@/pages/account';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { useAppRouting } from '@/routing/useAppRouting';
import axios, { AxiosError } from 'axios';
import { Form, Formik } from 'formik';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router';
import * as Yup from 'yup';
import { HandOverPage } from '.';

interface HandOverForm {
  // Pickup fields
  mileageAtPickup?: string;
  fuelStatusAtPickup?: string;
  pickUpDate?: string;
  pickUpTime?: string;
  imageAtPickUpFile?: File[];
  videoAtPickUpFile?: File[];
  passportValidity?: boolean;
  licenceValidity?: boolean;
  fillInContractDetails?: boolean;
  receivingRentalAmount?: boolean;
  recipientsID?: boolean;
  deliveryOfContractToClient?: boolean;
  availabilityOfADriver?: boolean;
  selectedInsurance?: string;
  additionalServices?: ReservationRequestItem[];
  // Dropoff fields
  dropOffDate?: string;
  dropOffTime?: string;
  mileageAtDropOff?: string;
  fuelStatusAtDropOff?: string;
  imageAtDropOff?: File[];
  videoAtDropOff?: File[];
  fuelPrice?: string;
  hgsFees?: string;
  additionalMileageAtDropOff?: string;
  additionalMileagePrice?: string;
}

const HandOver = () => {
  const intl = useIntl();
  const { id } = useParams();
  const navigate = useAppRouting();
  const [reservation, setReservation] = useState<ReservationDetails | undefined>(undefined);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (id) {
      getReservationDetails(id).then(setReservation);
    }
  }, [id]);

  // Determine if this is pickup or dropoff based on fuelStatusAtPickup
  const isPickupDone = reservation?.fuelStatusAtPickup != null;
  const isDropoffFlow = isPickupDone;

  // Pickup validation schema
  const pickupValidationSchema = useMemo(
    () =>
      Yup.object({
        mileageAtPickup: Yup.string().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.MILEAGE_PICKUP_REQUIRED' })
        ),
        fuelStatusAtPickup: Yup.string().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.FUEL_STATUS_PICKUP_REQUIRED' })
        ),
        pickUpDate: Yup.date().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.PICKUP_DATE_REQUIRED' })
        ),
        pickUpTime: Yup.string().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.PICKUP_TIME_REQUIRED' })
        ),
        passportValidity: Yup.boolean().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.PASSPORT_VALIDITY_REQUIRED' })
        ),
        licenceValidity: Yup.boolean().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.LICENCE_VALIDITY_REQUIRED' })
        ),
        fillInContractDetails: Yup.boolean().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.FILL_CONTRACT_REQUIRED' })
        ),
        receivingRentalAmount: Yup.boolean().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.RECEIVING_RENTAL_AMOUNT_REQUIRED' })
        ),
        recipientsID: Yup.boolean().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.RECIPIENTS_ID_REQUIRED' })
        ),
        deliveryOfContractToClient: Yup.boolean().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.DELIVERY_CONTRACT_REQUIRED' })
        ),
        availabilityOfADriver: Yup.boolean().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.AVAILABILITY_DRIVER_REQUIRED' })
        ),
        additionalServices: Yup.array()
      }),
    [intl]
  );

  // Dropoff validation schema
  const dropoffValidationSchema = useMemo(
    () =>
      Yup.object({
        dropOffDate: Yup.date().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.DROPOFF_DATE_REQUIRED' })
        ),
        dropOffTime: Yup.string().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.DROPOFF_TIME_REQUIRED' })
        ),
        passportValidity: Yup.boolean().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.PASSPORT_VALIDITY_REQUIRED' })
        ),
        licenceValidity: Yup.boolean().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.LICENCE_VALIDITY_REQUIRED' })
        ),
        fillInContractDetails: Yup.boolean().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.FILL_CONTRACT_REQUIRED' })
        ),
        receivingRentalAmount: Yup.boolean().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.RECEIVING_RENTAL_AMOUNT_REQUIRED' })
        ),
        recipientsID: Yup.boolean().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.RECIPIENTS_ID_REQUIRED' })
        ),
        deliveryOfContractToClient: Yup.boolean().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.DELIVERY_CONTRACT_REQUIRED' })
        ),
        availabilityOfADriver: Yup.boolean().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.AVAILABILITY_DRIVER_REQUIRED' })
        ),
        mileageAtDropOff: Yup.string().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.MILEAGE_DROPOFF_REQUIRED' })
        ),
        additionalMileageAtDropOff: Yup.string().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.ADDITIONAL_MILEAGE_DROPOFF_REQUIRED' })
        ),
        additionalMileagePrice: Yup.string().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.ADDITIONAL_MILEAGE_PRICE_REQUIRED' })
        ),
        fuelStatusAtDropOff: Yup.string().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.FUEL_STATUS_DROPOFF_REQUIRED' })
        ),
        fuelPrice: Yup.string().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.FUEL_PRICE_REQUIRED' })
        ),
        hgsFees: Yup.string().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.HGS_FEES_REQUIRED' })
        )
      }),
    [intl]
  );

  // Choose validation schema based on flow
  const validationSchema = isDropoffFlow ? dropoffValidationSchema : pickupValidationSchema;

  const Actions = () => (
    <ToolbarActions>
      <button
        type="button"
        className="text-red-700 hover:text-white border bg-red-100 border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
        onClick={() => navigate(-1)}
      >
        <FormattedMessage id="COMMON.DISCARD" />
      </button>
      <button
        type="submit"
        className="focus:outline-none text-white bg-green-500 w-40 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-xs px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
      >
        {isDropoffFlow ? (
          <FormattedMessage
            id="RESERVATION.HANDOVER.COMPLETE_DROPOFF"
            defaultMessage="Complete Dropoff"
          />
        ) : (
          <FormattedMessage
            id="RESERVATION.HANDOVER.COMPLETE_PICKUP"
            defaultMessage="Complete Pickup"
          />
        )}
      </button>
    </ToolbarActions>
  );

  const initialValues: HandOverForm = useMemo((): HandOverForm => {
    return {
      // Pickup fields
      mileageAtPickup: '',
      fuelStatusAtPickup: '',
      pickUpDate: new Date().toISOString().split('T')[0],
      pickUpTime: '12:00',
      imageAtPickUpFile: [],
      videoAtPickUpFile: [],
      passportValidity: true,
      licenceValidity: true,
      fillInContractDetails: true,
      receivingRentalAmount: true,
      recipientsID: false,
      deliveryOfContractToClient: false,
      availabilityOfADriver: true,
      selectedInsurance: '',
      additionalServices: [],
      // Dropoff fields
      dropOffDate: new Date().toISOString().split('T')[0],
      dropOffTime: '12:00',
      mileageAtDropOff: '',
      fuelStatusAtDropOff: '',
      imageAtDropOff: [],
      videoAtDropOff: [],
      fuelPrice: '',
      hgsFees: '',
      additionalMileageAtDropOff: '',
      additionalMileagePrice: ''
    };
  }, []);

  const currentReservationInitialValues: HandOverForm = useMemo(
    () => ({
      // Pickup fields from reservation
      mileageAtPickup: reservation?.mileageAtPickup?.toString() || initialValues.mileageAtPickup,
      fuelStatusAtPickup:
        reservation?.fuelStatusAtPickup?.toString() || initialValues.fuelStatusAtPickup,
      pickUpDate: reservation?.pickUpDate || initialValues.pickUpDate,
      pickUpTime: reservation?.pickUpTime || initialValues.pickUpTime,
      imageAtPickUpFile: initialValues.imageAtPickUpFile,
      videoAtPickUpFile: initialValues.videoAtPickUpFile,
      passportValidity: reservation?.passportValidity || initialValues.passportValidity,
      licenceValidity: reservation?.licenceValidity || initialValues.licenceValidity,
      fillInContractDetails:
        reservation?.fillInContractDetails || initialValues.fillInContractDetails,
      receivingRentalAmount:
        reservation?.receivingRentalAmount || initialValues.receivingRentalAmount,
      recipientsID: reservation?.recipientsID || initialValues.recipientsID,
      deliveryOfContractToClient:
        reservation?.deliveryOfContractToClient || initialValues.deliveryOfContractToClient,
      availabilityOfADriver:
        reservation?.availabilityOfADriver || initialValues.availabilityOfADriver,
      // Dropoff fields from reservation
      dropOffDate: reservation?.dropOffDate || initialValues.dropOffDate,
      dropOffTime: reservation?.dropOffTime || initialValues.dropOffTime,
      mileageAtDropOff: reservation?.mileageAtDropOff?.toString() || initialValues.mileageAtDropOff,
      fuelStatusAtDropOff:
        reservation?.fuelStatusAtDropOff?.toString() || initialValues.fuelStatusAtDropOff,
      imageAtDropOff: initialValues.imageAtDropOff,
      videoAtDropOff: initialValues.videoAtDropOff,
      fuelPrice: reservation?.fuelPrice?.toString() || initialValues.fuelPrice,
      hgsFees: reservation?.hgsFees?.toString() || initialValues.hgsFees,
      additionalMileageAtDropOff:
        reservation?.additionalMileageAtDropOff?.toString() ||
        initialValues.additionalMileageAtDropOff,
      additionalMileagePrice:
        reservation?.additionalMileagePrice?.toString() || initialValues.additionalMileagePrice
    }),
    [reservation, initialValues]
  );

  return (
    <Formik
      key={reservation?.id || 'add-reservation-form'}
      initialValues={id ? currentReservationInitialValues : initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        const { ...formData } = values;

        try {
          let response;

          if (id && isDropoffFlow) {
            // Handle dropoff operation
            const dropoffRequest: DropoffReservationRequest = {
              dropOffDate: formData.dropOffDate || '',
              dropOffTime: formData.dropOffTime || '',
              imageAtDropOff: formData.imageAtDropOff || [],
              videoAtDropOff: formData.videoAtDropOff || [],
              passportValidity: formData.passportValidity || false,
              licenceValidity: formData.licenceValidity || false,
              fillInContractDetails: formData.fillInContractDetails || false,
              receivingRentalAmount: formData.receivingRentalAmount || false,
              recipientsID: formData.recipientsID || false,
              deliveryOfContractToClient: formData.deliveryOfContractToClient || false,
              availabilityOfADriver: formData.availabilityOfADriver || false,
              mileageAtDropOff: formData.mileageAtDropOff || '',
              additionalMileageAtDropOff: formData.additionalMileageAtDropOff || '',
              additionalMileagePrice: formData.additionalMileagePrice || '',
              fuelStatusAtDropOff: formData.fuelStatusAtDropOff || '',
              fuelPrice: formData.fuelPrice || '',
              hgsFees: formData.hgsFees || ''
            };

            response = await dropoffReservation(id, dropoffRequest);
          } else if (id && !isDropoffFlow) {
            // Handle pickup operation
            const pickupRequest: PickupReservationRequest = {
              mileageAtPickup: formData.mileageAtPickup || '',
              fuelStatusAtPickup: formData.fuelStatusAtPickup || '',
              pickUpDate: formData.pickUpDate || '',
              pickUpTime: formData.pickUpTime || '',
              imageAtPickUpFile: formData.imageAtPickUpFile || [],
              videoAtPickUpFile: formData.videoAtPickUpFile || [],
              passportValidity: formData.passportValidity || false,
              licenceValidity: formData.licenceValidity || false,
              fillInContractDetails: formData.fillInContractDetails || false,
              receivingRentalAmount: formData.receivingRentalAmount || false,
              recipientsID: formData.recipientsID || false,
              deliveryOfContractToClient: formData.deliveryOfContractToClient || false,
              availabilityOfADriver: formData.availabilityOfADriver || false,
              additionalServices: formData.additionalServices || []
            };

            response = await pickupReservation(id, pickupRequest);
          } else {
            // No reservation ID provided - this shouldn't happen in handover flow
            enqueueSnackbar('No reservation found for handover', {
              variant: 'error'
            });
            return;
          }

          enqueueSnackbar(response.message, {
            variant: 'success'
          });

          // Navigate back to reservations list
          navigate('/reservations/reservation');
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ResponseModel<never>>;
            enqueueSnackbar(
              axiosError.response?.data.message || <FormattedMessage id="COMMON.ERROR" />,
              {
                variant: 'error'
              }
            );
          } else {
            enqueueSnackbar(<FormattedMessage id="COMMON.ERROR" />, {
              variant: 'error'
            });
          }
        }
      }}
    >
      {() => {
        return (
          <Form className="pb-10">
            <PageNavbar />

            <Container>
              <Toolbar>
                <ToolbarHeading>
                  <ToolbarPageTitle
                    text={
                      isDropoffFlow
                        ? intl.formatMessage({
                            id: 'RESERVATION.HANDOVER.DROPOFF_TITLE',
                            defaultMessage: 'Vehicle Dropoff'
                          })
                        : intl.formatMessage({
                            id: 'RESERVATION.HANDOVER.PICKUP_TITLE',
                            defaultMessage: 'Vehicle Pickup'
                          })
                    }
                  />
                </ToolbarHeading>
                <Actions />
              </Toolbar>

              <HandOverPage reservation={reservation} />
            </Container>
          </Form>
        );
      }}
    </Formik>
  );
};

export { HandOver };
