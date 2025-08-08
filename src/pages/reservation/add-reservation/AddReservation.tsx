import { ResponseModel } from '@/api';
import { useCurrentUser } from '@/api/hooks/userHooks';
import {
  createReservation,
  getReservationDetails,
  PickUpLocationType,
  ReservationDetails,
  ReservationRequest,
  ReservationRequestItem,
  ReservationTypeOfRent,
  updateReservation
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
import { AddReservationPage } from '.';

interface AddReservationForm {
  id?: string;
  customerId?: string;
  customerFullName?: string;
  initialCustomer?: {
    id: string;
    name: string;
  };
  vehicleId?: string;
  pickUpDate?: string;
  pickUpTime?: string;
  dropOffDate?: string;
  dropOffTime?: string;
  typeOfRent?: ReservationTypeOfRent;
  numberOfDays?: number;
  pickupLocation?: PickUpLocationType;
  pickUpAddress?: string;
  dropoffLocation?: PickUpLocationType;
  dropOffAddress?: string;
  pickUpUserId?: string;
  dropOffUserId?: string;
  dailyRate?: number;
  selectedInsurance?: string;
  additionalServices?: ReservationRequestItem[];
}

const reservationPropsToReservationDetails = (props: AddReservationForm): ReservationRequest => ({
  id: props.id || '',
  status: 'UNCONFIRMED',
  typeOfRent: props.typeOfRent || 'DAILY',
  pickUpDate: props.pickUpDate || '',
  pickUpTime: props.pickUpTime || '',
  pickUpUserId: props.pickUpUserId || '',
  dropOffDate: props.dropOffDate || '',
  dropOffTime: props.dropOffTime || '',
  dropOffUserId: props.dropOffUserId || '',
  pickUpFullAddress: props.pickupLocation === 'IN_ANOTHER_ADDRESS' ? props.pickUpAddress : null,
  dropOffFullAddress: props.dropoffLocation === 'IN_ANOTHER_ADDRESS' ? props.dropOffAddress : null,
  customerId: props.customerId || '',
  customerFullName: props.customerFullName || null,
  virtualInsurance: null,
  vehicleId: props.vehicleId || '',
  dailyRate: props.dailyRate || 0,
  numberOfDays: props.numberOfDays || 1,
  discount: null,
  totalAmount: 0,
  mileageAtPickup: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  additionalServices: props.additionalServices || []
});

const AddReservation = () => {
  const intl = useIntl();
  const { id } = useParams();
  const navigate = useAppRouting();
  const [reservation, setReservation] = useState<ReservationDetails | undefined>(undefined);
  const { enqueueSnackbar } = useSnackbar();
  const { data: currentUser } = useCurrentUser();

  // Validation schema
  const validationSchema = useMemo(
    () =>
      Yup.object({
        customerId: Yup.string().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.CUSTOMER_REQUIRED' })
        ),
        vehicleId: Yup.string().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.VEHICLE_REQUIRED' })
        ),
        pickUpDate: Yup.date().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.PICKUP_DATE_REQUIRED' })
        ),
        pickUpTime: Yup.string().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.PICKUP_TIME_REQUIRED' })
        ),
        dropOffDate: Yup.date().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.DROPOFF_DATE_REQUIRED' })
        ),
        dropOffTime: Yup.string().required(
          intl.formatMessage({ id: 'RESERVATION.VALIDATION.DROPOFF_TIME_REQUIRED' })
        )
      }),
    [intl]
  );

  useEffect(() => {
    if (id) {
      getReservationDetails(id).then(setReservation);
    }
  }, [id]);

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
        {reservation ? <FormattedMessage id="COMMON.SAVE" /> : <FormattedMessage id="COMMON.ADD" />}
      </button>
    </ToolbarActions>
  );

  const initialValues: AddReservationForm = useMemo((): AddReservationForm => {
    const today = new Date();
    const fourDaysLater = new Date();
    fourDaysLater.setDate(today.getDate() + 4);

    return {
      id: '',
      customerId: '',
      customerFullName: '',
      initialCustomer: undefined,
      vehicleId: '',
      dropOffDate: fourDaysLater.toISOString().split('T')[0],
      pickUpDate: today.toISOString().split('T')[0],
      pickUpTime: '10:00',
      dropOffTime: '10:00',
      typeOfRent: 'DAILY',
      numberOfDays: 4,
      dailyRate: 0,
      pickupLocation: 'IN_OFFICE',
      dropoffLocation: 'IN_OFFICE',
      pickUpUserId: '',
      dropOffUserId: currentUser?.id,
      selectedInsurance: '',
      additionalServices: []
    };
  }, []);

  const currentReservationInitialValues: AddReservationForm = useMemo(
    () => ({
      id: reservation?.id || initialValues.id,
      customerId: reservation?.customerId || initialValues.customerId,
      customerFullName: reservation?.customerFullName || initialValues.customerFullName,
      initialCustomer:
        reservation?.customerId && reservation?.customerFullName
          ? {
              id: reservation.customerId,
              name: reservation.customerFullName
            }
          : initialValues.initialCustomer,
      vehicleId: reservation?.vehicleId || initialValues.vehicleId,
      pickUpDate: reservation?.pickUpDate || initialValues.pickUpDate,
      pickUpTime: reservation?.pickUpTime || initialValues.pickUpTime,
      dropOffDate: reservation?.dropOffDate || initialValues.dropOffDate,
      dropOffTime: reservation?.dropOffTime || initialValues.dropOffTime,
      typeOfRent: reservation?.typeOfRent || initialValues.typeOfRent,
      numberOfDays: reservation?.numberOfDays || initialValues.numberOfDays,
      dailyRate: reservation?.dailyRate || initialValues.dailyRate,
      pickupLocation: initialValues.pickupLocation,
      dropoffLocation: reservation?.dropOffFullAddress ? 'IN_ANOTHER_ADDRESS' : 'IN_OFFICE',
      pickUpUserId: reservation?.pickUpUserId || initialValues.pickUpUserId,
      dropOffUserId: reservation?.dropOffUserId || initialValues.dropOffUserId,
      selectedInsurance: initialValues.selectedInsurance,
      additionalServices: initialValues.additionalServices
    }),
    [reservation, initialValues]
  );

  return (
    <Formik
      key={reservation?.id || 'add-reservation-form'}
      initialValues={id ? currentReservationInitialValues : initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        const { ...reservation } = values;

        // If dropOffUserId is not selected, set it to current user's ID
        if (!reservation.dropOffUserId && currentUser?.id) {
          reservation.dropOffUserId = currentUser.id;
        }

        try {
          const response = id
            ? await updateReservation(reservationPropsToReservationDetails(reservation))
            : await createReservation(reservationPropsToReservationDetails(reservation));
          enqueueSnackbar(response.message, {
            variant: 'success'
          });

          const result = response.result;
          if (reservation || !result) {
            navigate('/reservations/reservation');
          } else {
            navigate(`/reservations/edit/${result.id}`);
          }
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
                      id
                        ? intl.formatMessage({ id: 'RESERVATION.EDIT_RESERVATION' })
                        : intl.formatMessage({ id: 'RESERVATION.ADD_RESERVATION' })
                    }
                  />
                </ToolbarHeading>
                <Actions />
              </Toolbar>

              <AddReservationPage reservation={reservation} />
            </Container>
          </Form>
        );
      }}
    </Formik>
  );
};

export { AddReservation };
