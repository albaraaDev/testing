import {
  AdditionalService,
  getAdditionalServices,
  ReservationRequestItem
} from '@/api/reservations';

import { KeenIcon } from '@/components';

import { useQuery } from '@tanstack/react-query';
import { Field, FieldProps } from 'formik';

import { FormattedMessage, useIntl } from 'react-intl';

const InsuranceSection = () => {
  const intl = useIntl();

  const { data: servicesData } = useQuery({
    queryKey: ['additional-services'],
    queryFn: () => getAdditionalServices({ size: 100 })
  });

  const availableServices = servicesData?.data || [];
  const insuranceServices = availableServices.filter(
    (service) => service.status && service.type.toLowerCase().includes('insurance')
  );

  const getServiceName = (service: AdditionalService, locale: string) => {
    switch (locale) {
      case 'ar':
        return service.nameAr;
      case 'tr':
        return service.nameTr;
      default:
        return service.nameEn;
    }
  };

  return (
    <div className="grid gap-2.5">
      <label className="form-label">
        <FormattedMessage id="RESERVATION.ADD.INSURANCE.TITLE" defaultMessage="Insurance" />
      </label>

      <Field name="selectedInsurance">
        {({ form }: FieldProps) => {
          const selectedInsurance: string = form.values.selectedInsurance || '';

          const selectInsurance = (serviceId: string, price?: number) => {
            const service = insuranceServices.find((s) => s.id === serviceId);
            if (service) {
              // Clear any existing insurance from additionalServices
              const currentServices: ReservationRequestItem[] =
                form.values.additionalServices || [];
              const nonInsuranceServices = currentServices.filter(
                (s) => !insuranceServices.some((ins) => ins.id === s.id)
              );

              // Add the selected insurance
              const insuranceItem = {
                id: serviceId,
                quantity: 1,
                price: price || service.defaultPrice,
                name: getServiceName(service, intl.locale)
              };

              form.setFieldValue('selectedInsurance', serviceId);
              form.setFieldValue('additionalServices', [...nonInsuranceServices, insuranceItem]);
            }
          };

          const updateInsurancePrice = (serviceId: string, price: number) => {
            const currentServices: ReservationRequestItem[] = form.values.additionalServices || [];
            const existingIndex = currentServices.findIndex((s) => s.id === serviceId);

            if (existingIndex >= 0) {
              const updatedServices = [...currentServices];
              updatedServices[existingIndex] = {
                ...updatedServices[existingIndex],
                price
              };
              form.setFieldValue('additionalServices', updatedServices);
            }
          };

          const clearInsurance = () => {
            const currentServices: ReservationRequestItem[] = form.values.additionalServices || [];
            const nonInsuranceServices = currentServices.filter(
              (s) => !insuranceServices.some((ins) => ins.id === s.id)
            );
            form.setFieldValue('selectedInsurance', '');
            form.setFieldValue('additionalServices', nonInsuranceServices);
          };

          return (
            <div className="space-y-3">
              {insuranceServices.map((service) => {
                const isSelected = selectedInsurance === service.id;
                const currentServices: ReservationRequestItem[] =
                  form.values.additionalServices || [];
                const currentInsurance = currentServices.find((s) => s.id === service.id);
                const currentPrice = currentInsurance?.price || service.defaultPrice;

                return (
                  <div key={service.id} className="grid grid-cols-12 gap-3 p-3 border rounded-lg">
                    {/* Service Name */}
                    <div className="col-span-4">
                      <label className="text-sm font-medium">
                        {getServiceName(service, intl.locale)}
                      </label>
                      <p className="text-xs text-gray-500">{service.unit}</p>
                    </div>

                    {/* Price */}
                    <div className="col-span-3">
                      <label className="text-xs text-gray-600">
                        <FormattedMessage
                          id="RESERVATION.ADD.INSURANCE.PRICE"
                          defaultMessage="Price"
                        />
                      </label>
                      <input
                        type="number"
                        className="input w-full"
                        min={service.specialPrice}
                        max={service.defaultPrice}
                        step="0.01"
                        value={currentPrice}
                        placeholder={service.defaultPrice.toString()}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (isSelected) {
                            updateInsurancePrice(service.id, value);
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value);
                          if (isSelected) {
                            // If field is empty or NaN, set to minimum price
                            if (!value || isNaN(value)) {
                              updateInsurancePrice(service.id, service.specialPrice);
                              return;
                            }
                            // Enforce minimum price validation
                            if (value < service.specialPrice) {
                              updateInsurancePrice(service.id, service.specialPrice);
                            }
                            // Enforce maximum price validation
                            if (value > service.defaultPrice) {
                              updateInsurancePrice(service.id, service.defaultPrice);
                            }
                          }
                        }}
                      />
                      {service.specialPrice !== service.defaultPrice && (
                        <p className="text-xs text-gray-500">
                          Min: {service.specialPrice} | Max: {service.defaultPrice}
                        </p>
                      )}
                    </div>

                    {/* Selection */}
                    <div className="col-span-3">
                      <label className="text-xs text-gray-600 text-center block">
                        <FormattedMessage
                          id="RESERVATION.ADD.INSURANCE.SELECTION"
                          defaultMessage="Selection"
                        />
                      </label>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-light'}`}
                          onClick={() => {
                            if (isSelected) {
                              clearInsurance();
                            } else {
                              selectInsurance(service.id, currentPrice);
                            }
                          }}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-2 flex items-center justify-center">
                      {isSelected && (
                        <button
                          type="button"
                          onClick={() => clearInsurance()}
                          className="btn btn-sm btn-icon btn-danger"
                          title={intl.formatMessage({
                            id: 'COMMON.REMOVE',
                            defaultMessage: 'Remove'
                          })}
                        >
                          <KeenIcon icon="trash" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {insuranceServices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FormattedMessage
                    id="RESERVATION.ADD.INSURANCE.NO_INSURANCE_AVAILABLE"
                    defaultMessage="No insurance options available"
                  />
                </div>
              )}
            </div>
          );
        }}
      </Field>
    </div>
  );
};

const AdditionalServicesSection = () => {
  const intl = useIntl();

  const { data: servicesData } = useQuery({
    queryKey: ['additional-services'],
    queryFn: () => getAdditionalServices({ size: 100 })
  });

  const availableServices = servicesData?.data || [];
  const additionalServices = availableServices.filter(
    (service) => service.status && !service.type.toLowerCase().includes('insurance')
  );

  const getServiceName = (service: AdditionalService, locale: string) => {
    switch (locale) {
      case 'ar':
        return service.nameAr;
      case 'tr':
        return service.nameTr;
      default:
        return service.nameEn;
    }
  };

  return (
    <div className="grid gap-2.5">
      <label className="form-label">
        <FormattedMessage
          id="RESERVATION.ADD.ADDITIONAL_SERVICES.TITLE"
          defaultMessage="Additional Services"
        />
      </label>

      <Field name="additionalServices">
        {({ form }: FieldProps) => {
          // Track service quantities in local state-like object
          const serviceQuantities: { [key: string]: { quantity: number; price: number } } = {};

          // Initialize with current form values (excluding insurance)
          const currentServices: ReservationRequestItem[] = form.values.additionalServices || [];
          const insuranceServices = availableServices.filter(
            (service) => service.status && service.type.toLowerCase().includes('insurance')
          );

          // Only track non-insurance services
          currentServices
            .filter((service) => !insuranceServices.some((ins) => ins.id === service.id))
            .forEach((service) => {
              serviceQuantities[service.id] = {
                quantity: service.quantity || 0,
                price: service.price || 0
              };
            });

          const updateServiceQuantity = (serviceId: string, quantity: number, price: number) => {
            const currentServices: ReservationRequestItem[] = form.values.additionalServices || [];

            if (quantity > 0) {
              // Add or update service
              const existingIndex = currentServices.findIndex((s) => s.id === serviceId);
              const service = additionalServices.find((s) => s.id === serviceId);

              if (service) {
                const serviceItem = {
                  id: serviceId,
                  quantity,
                  price,
                  name: getServiceName(service, intl.locale)
                };

                if (existingIndex >= 0) {
                  // Update existing
                  const updatedServices = [...currentServices];
                  updatedServices[existingIndex] = serviceItem;
                  form.setFieldValue('additionalServices', updatedServices);
                } else {
                  // Add new
                  form.setFieldValue('additionalServices', [...currentServices, serviceItem]);
                }
              }
            } else {
              // Remove service (quantity is 0)
              const updatedServices = currentServices.filter((s) => s.id !== serviceId);
              form.setFieldValue('additionalServices', updatedServices);
            }
          };

          return (
            <div className="space-y-3">
              {additionalServices.map((service) => {
                const currentServiceData = currentServices.find((s) => s.id === service.id);
                const quantity = currentServiceData?.quantity || 0;
                const price = currentServiceData?.price || service.defaultPrice;

                return (
                  <div key={service.id} className="grid grid-cols-12 gap-3 p-3 border rounded-lg">
                    {/* Service Name */}
                    <div className="col-span-4">
                      <label className="text-sm font-medium">
                        {getServiceName(service, intl.locale)}
                      </label>
                      <p className="text-xs text-gray-500">
                        Max: {service.maxQuantity} {service.unit}(s)
                      </p>
                    </div>

                    {/* Price */}
                    <div className="col-span-3">
                      <label className="text-xs text-gray-600">
                        <FormattedMessage
                          id="RESERVATION.ADD.ADDITIONAL_SERVICES.PRICE"
                          defaultMessage="Price"
                        />
                      </label>
                      <input
                        type="number"
                        className="input w-full"
                        min={service.specialPrice}
                        max={service.defaultPrice}
                        step="0.01"
                        value={price}
                        placeholder={service.defaultPrice.toString()}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          updateServiceQuantity(service.id, quantity, value);
                        }}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value);
                          // If field is empty or NaN, set to minimum price
                          if (!value || isNaN(value)) {
                            updateServiceQuantity(service.id, quantity, service.specialPrice);
                            return;
                          }
                          // Enforce minimum price validation
                          if (value < service.specialPrice) {
                            updateServiceQuantity(service.id, quantity, service.specialPrice);
                          }
                          // Enforce maximum price validation
                          if (value > service.defaultPrice) {
                            updateServiceQuantity(service.id, quantity, service.defaultPrice);
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500">
                        Min: {service.specialPrice} | Max: {service.defaultPrice}
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-3">
                      <label className="text-xs text-gray-600 text-center block">
                        <FormattedMessage
                          id="RESERVATION.ADD.ADDITIONAL_SERVICES.QUANTITY"
                          defaultMessage="Quantity"
                        />
                      </label>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-icon btn-light"
                          onClick={() => {
                            const newQuantity = Math.max(0, quantity - 1);
                            updateServiceQuantity(service.id, newQuantity, price);
                          }}
                          disabled={quantity <= 0}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="input w-16 text-center px-1"
                          min={1}
                          max={service.maxQuantity}
                          value={quantity || ''}
                          placeholder="1"
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 1 && value <= service.maxQuantity) {
                              updateServiceQuantity(service.id, value, price);
                            }
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value);
                            // If field is empty or NaN, set to minimum quantity (1)
                            if (!value || isNaN(value) || value < 1) {
                              updateServiceQuantity(service.id, 1, price);
                              return;
                            }
                            // Enforce maximum quantity validation
                            if (value > service.maxQuantity) {
                              updateServiceQuantity(service.id, service.maxQuantity, price);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-icon btn-light"
                          onClick={() => {
                            const newQuantity = Math.min(service.maxQuantity, quantity + 1);
                            updateServiceQuantity(service.id, newQuantity, price);
                          }}
                          disabled={quantity >= service.maxQuantity}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-2 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => updateServiceQuantity(service.id, 0, price)}
                        className="btn btn-sm btn-icon btn-danger"
                        title={intl.formatMessage({
                          id: 'COMMON.REMOVE',
                          defaultMessage: 'Remove'
                        })}
                      >
                        <KeenIcon icon="trash" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {additionalServices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FormattedMessage
                    id="RESERVATION.ADD.ADDITIONAL_SERVICES.NO_SERVICES_AVAILABLE"
                    defaultMessage="No additional services available"
                  />
                </div>
              )}

              {/* Total Price Component */}
              <TotalPriceComponent form={form} />
            </div>
          );
        }}
      </Field>
    </div>
  );
};

const TotalPriceComponent = ({ form }: { form: any }) => {
  // Calculate total price
  const calculateTotalPrice = () => {
    const dailyRate = parseFloat(form.values.dailyRate) || 0;
    const numberOfDays = parseFloat(form.values.numberOfDays) || 0;
    const additionalServices: ReservationRequestItem[] = form.values.additionalServices || [];

    // Calculate rental cost
    const rentalCost = dailyRate * numberOfDays;

    // Calculate additional services cost
    const servicesCost = additionalServices.reduce((total, service) => {
      const quantity = service.quantity || 0;
      const price = service.price || 0;
      return total + quantity * price;
    }, 0);

    return rentalCost + servicesCost;
  };

  const totalAmount = calculateTotalPrice();

  return (
    <div className="text-center">
      <div className="text-sm font-medium text-blue-600">
        <FormattedMessage id="RESERVATION.ADD.TOTAL_AMOUNT" defaultMessage="TOTAL AMOUNT" />
      </div>
      <div className="text-2xl font-bold">
        {totalAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </div>
    </div>
  );
};

export { AdditionalServicesSection, InsuranceSection };

