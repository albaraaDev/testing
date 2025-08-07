import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/toolbar';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import MileageReport from './blocks/MileageReport';
import EngineHoursReport from './blocks/EngineHoursReport';
import TripsAndParkingReport from './blocks/TripsAndParkingReport';
import AlarmReport from './blocks/AlarmReport';
import clsx from 'clsx';
import MaxSpeedReport from './blocks/MaxSpeedReport';
import SubscriptionExpirtyReport from './blocks/SubscriptionExpiryReport';
import MessagesReport from './blocks/MessagesReport';
import { ExportLoadingProvider } from './context/ExportLoadingContext';
import { useSearchParams } from 'react-router';
import WorkingHourReport from './blocks/WorkingHourReport';

type ReportTabType = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  report: React.ReactNode;
};

const ReportTypes: ReportTabType[] = [
  {
    id: 'mileage',
    label: <FormattedMessage id="REPORTS.TITLE.MILEAGE" />,
    description: <FormattedMessage id="REPORTS.DESCRIPTION.MILEAGE" />,
    report: <MileageReport />
  },
  {
    id: 'engineHours',
    label: <FormattedMessage id="REPORTS.TITLE.ENGINE_HOURS" />,
    description: <FormattedMessage id="REPORTS.DESCRIPTION.ENGINE_HOURS" />,
    report: <EngineHoursReport />
  },
  {
    id: 'tripsAndParking',
    label: <FormattedMessage id="REPORTS.TITLE.TRIPS_AND_PARKING" />,
    description: <FormattedMessage id="REPORTS.DESCRIPTION.TRIPS_AND_PARKING" />,
    report: <TripsAndParkingReport />
  },
  {
    id: 'alarm',
    label: <FormattedMessage id="REPORTS.TITLE.ALARMS" />,
    description: <FormattedMessage id="REPORTS.DESCRIPTION.ALARMS" />,
    report: <AlarmReport />
  },
  {
    id: 'maxSpeed',
    label: <FormattedMessage id="REPORTS.TITLE.MAX_SPEED" />,
    description: <FormattedMessage id="REPORTS.DESCRIPTION.MAX_SPEED" />,
    report: <MaxSpeedReport />
  },
  {
    id: 'workingHour',
    label: <FormattedMessage id="REPORTS.TITLE.WORKING_HOUR" />,
    description: <FormattedMessage id="REPORTS.DESCRIPTION.WORKING_HOUR" />,
    report: <WorkingHourReport />
  },
  {
    id: 'subscriptionExpiry',
    label: <FormattedMessage id="REPORTS.TITLE.SUBSCRIPTION_EXPIRATION" />,
    description: <FormattedMessage id="REPORTS.DESCRIPTION.SUBSCRIPTION_EXPIRATION" />,
    report: <SubscriptionExpirtyReport />
  },
  {
    id: 'messages',
    label: <FormattedMessage id="REPORTS.TITLE.MESSAGES" />,
    description: <FormattedMessage id="REPORTS.DESCRIPTION.MESSAGES" />,
    report: <MessagesReport />
  }
];

export default function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabId = searchParams.get('tab') || ReportTypes[0].id;
  const activeReportTab = ReportTypes.find((report) => report.id === activeTabId) || ReportTypes[0];

  const handleTabClick = (report: ReportTabType) => {
    // Preserve existing search params when setting the new tab
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', report.id);
    setSearchParams(newSearchParams);
  };

  return (
    <ExportLoadingProvider>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title={<FormattedMessage id="SIDEBAR.MENU.REPORTS" />}
            description={activeReportTab.label}
          />
        </Toolbar>

        <div className="grid gap-4 grid-cols-4 lg:grid-cols-8 mb-4">
          {ReportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => handleTabClick(report)}
              className={clsx(
                'items-center btn btn-info h-full justify-center p-2 text-sm rounded-lg border-2',
                report.id !== activeReportTab.id && 'btn-light text-info hover:text-info'
              )}
            >
              {report.label}
            </button>
          ))}
        </div>

        <div className="card">{activeReportTab.report}</div>
      </Container>
    </ExportLoadingProvider>
  );
}
