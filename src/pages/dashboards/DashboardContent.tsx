import { DriverList } from './blocks/Drivers';
import { MaintenanceViolationTable } from './blocks/maintenance';
import { MileageEngineGraph } from './blocks/MileageEngineGraph';
import { MovingDeviceChart } from './blocks/MovingDeviceChart';
import { Notifications } from './blocks/Notifications';
import { VehicleList } from './blocks/Vehicles';

const DashboardContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5 max-w-[calc(100vw-3rem)]">
      <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-1 h-full">
          <MovingDeviceChart />
        </div>

        <div className="lg:col-span-2 min-h-[460px] max-h-[500px]">
          <MileageEngineGraph />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-1 h-[499px]">
          <Notifications withSearch />
        </div>

        <div className="lg:col-span-2 h-[499px] max-w-[calc(100vw-3rem)]">
          <MaintenanceViolationTable />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-3">
          <VehicleList />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-3">
          <DriverList />
        </div>
      </div>
    </div>
  );
};

export { DashboardContent };
