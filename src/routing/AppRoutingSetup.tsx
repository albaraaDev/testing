import { DashboardPage } from '@/pages/dashboards';
import { User } from '@/pages/user';
import { Vehicles } from '@/pages/vehicle';
import { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { Driver } from '@/pages/driver';
import { MaintenancePage } from '@/pages/maintenance';

import { AddDriver } from '@/pages/driver/add-driver';
import { AddUser } from '@/pages/user/add-user';
import { AddVehicle } from '@/pages/vehicle/add-vehicle';

import { AuthPage } from '@/auth';
import { RequireAuth } from '@/auth/RequireAuth';
import { RequireRole } from '@/auth/RequireRole';
import { ErrorsRouting } from '@/errors';
import { Demo1Layout } from '@/layouts/demo1';
import { Device } from '@/pages/device';
import DeviceDetailsPage from '@/pages/device/DeviceDetailsPage';
import { AddDevice } from '@/pages/device/add-device';
import DriverDetailsPage from '@/pages/driver/DriverDetailsPage';
import { GeofencePage } from '@/pages/geofence/GeofencePage';
import MaintenanceDetailsPage from '@/pages/maintenance/view-maintenance/MaintenanceDetailsPage';
import { MonitoringPage } from '@/pages/monitoring/MonitoringPage';
import PrivacyPolicyPage from '@/pages/privacy-policy';
import { TripsPage } from '@/pages/trips/TripsPage';
import UserDetailsPage from '@/pages/user/blocks/UserDetailsPage';
import { AddVehicleScratches } from '@/pages/vehicle/add-vehicle/AddVehicleScratches';
import VehicleDetailsPage from '@/pages/vehicle/vehicle-details';

import { isAppRentACar } from '@/config/apptype';
import { AccountPermissionsCheckPage, AccountRolesPage } from '@/pages/account';
import { AdditionalServicesPage } from '@/pages/additional-services';
import { Customers } from '@/pages/customer';
import { AddCustomer } from '@/pages/customer/add-customer';
import CustomerDetailsPage from '@/pages/customer/customer-details/CustomerDetailsPage';
import { AddGeofence } from '@/pages/geofence/add-geofence';
import { InsurancePage } from '@/pages/insurance';
import { MaintenanceTypeDetailsPage, MaintenanceTypePage } from '@/pages/maintenance-types';
import { AddMaintenanceType } from '@/pages/maintenance-types/add-maintenance-type/AddMaintenanceType';
import { AddMaintenance } from '@/pages/maintenance/add-maintenance/AddMaintenance';
import ManageDevices from '@/pages/management/manage-devices';
import ManageDistributors from '@/pages/management/manage-distributors';
import ManageNotifications from '@/pages/management/manage-notifications';
import ManageUsersAndDevices from '@/pages/management/manage-users-and-devices';
import ManageUsers from '@/pages/management/manage-users/index';
import { ModificationRequests } from '@/pages/modification-requests';
import { ReplayPage } from '@/pages/replay/ReplayPage';
import ReportsPage from '@/pages/reports/ReportsPage';
import { Reservations } from '@/pages/reservation';
import { AddReservation } from '@/pages/reservation/add-reservation';
import ReservationDetailsPage from '@/pages/reservation/customer-details/ReservationDetailsPage';
import { HandOver } from '@/pages/reservation/handover';
import { WorkingHours } from '@/pages/working-hours';
import { AddWorkingHours } from '@/pages/working-hours/add-working-hours';

const AppRoutingSetup = (): ReactElement => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<Demo1Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/monitoring" element={<MonitoringPage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/replay" element={<ReplayPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route element={<RequireRole role={['ADMIN', 'SUPER_ADMIN', 'MANAGER']} />}>
            <Route path="/management" element={<ManageUsersAndDevices />}>
              <Route path="/management/devices" element={<ManageDevices />} />
              <Route path="/management/users" element={<ManageUsers />} />
              <Route path="/management/distributors" element={<ManageDistributors />} />
            </Route>
            <Route path="/notifications" element={<ManageNotifications />} />
          </Route>
          <Route path="/geofences/list" element={<GeofencePage />} />
          <Route path="/geofences/add" element={<AddGeofence />} />
          <Route path="/geofences/edit/:id" element={<AddGeofence />} />
          <Route path="/vehicles/vehicle" element={<Vehicles />} />
          <Route path="/vehicles/vehicle/:id" element={<VehicleDetailsPage />} />
          <Route path="/vehicles/add-vehicle" element={<AddVehicle />} />
          <Route path="/vehicles/edit/:id" element={<AddVehicle />} />

          {/* customers */}
          {isAppRentACar && <Route path="/customers/customer" element={<Customers />} />}
          <Route path="/customers/customer/:id" element={<CustomerDetailsPage />} />
          {isAppRentACar && <Route path="/customers/add-customer" element={<AddCustomer />} />}
          {isAppRentACar && <Route path="/customers/edit/:id" element={<AddCustomer />} />}

          {/* reservations */}
          {isAppRentACar && <Route path="/reservations/reservation" element={<Reservations />} />}
          <Route path="/reservations/reservation/:id" element={<ReservationDetailsPage />} />
          {isAppRentACar && (
            <Route path="/reservations/add-reservation" element={<AddReservation />} />
          )}
          {isAppRentACar && <Route path="/reservations/edit/:id" element={<AddReservation />} />}
          {isAppRentACar && <Route path="/reservations/handover/:id" element={<HandOver />} />}
          {isAppRentACar && (
            <Route path="/reservations/additional-services" element={<AdditionalServicesPage />} />
          )}
          {isAppRentACar && <Route path="/reservations/insurance" element={<InsurancePage />} />}
          <Route path="/vehicles/edit-scratches/:id" element={<AddVehicleScratches />} />
          <Route path="/working-hours/list" element={<WorkingHours />} />
          <Route path="/working-hours/create" element={<AddWorkingHours />} />
          <Route path="/maintenance/maintenance" element={<MaintenancePage />} />
          <Route path="/maintenance/add" element={<AddMaintenance />} />
          <Route path="/maintenance/edit/:id" element={<AddMaintenance />} />
          <Route path="/maintenance/view/:id" element={<MaintenanceDetailsPage />} />
          <Route element={<RequireRole role={['ADMIN', 'SUPER_ADMIN', 'MANAGER']} />}>
            <Route path="/maintenance/maintenance-type/list" element={<MaintenanceTypePage />} />
            <Route path="/maintenance/maintenance-type/add" element={<AddMaintenanceType />} />
            <Route path="/maintenance/maintenance-type/edit/:id" element={<AddMaintenanceType />} />
            <Route
              path="/maintenance/maintenance-type/view/:id"
              element={<MaintenanceTypeDetailsPage />}
            />
          </Route>
          <Route element={<RequireRole role={['ADMIN', 'SUPER_ADMIN']} />}>
            <Route path="/modification-requests/list" element={<ModificationRequests />} />
          </Route>
          <Route path="/devices/device/" element={<Device />} />
          <Route path="/devices/device/:id" element={<DeviceDetailsPage />} />
          <Route element={<RequireRole role={['ADMIN', 'SUPER_ADMIN', 'MANAGER']} />}>
            <Route path="/devices/add-device" element={<AddDevice />} />
            <Route path="/devices/edit/:id" element={<AddDevice />} />
          </Route>
          <Route path="/users/user/" element={<User />} />
          <Route path="/users/user/:id" element={<UserDetailsPage />} />
          <Route path="/users/add-user" element={<AddUser />} />
          <Route path="/users/edit/:id" element={<AddUser />} />
          <Route path="/drivers/driver" element={<Driver />} />
          <Route path="/drivers/driver/:id" element={<DriverDetailsPage />} />
          <Route path="/drivers/add-driver" element={<AddDriver />} />
          <Route path="/drivers/edit/:id" element={<AddDriver />} />
          <Route element={<RequireRole role={['SUPER_ADMIN']} />}>
            <Route path="/roles/list" element={<AccountRolesPage />} />
            <Route path="/roles/:id/permissions" element={<AccountPermissionsCheckPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/hedef-privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};

export { AppRoutingSetup };
