import ApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useEffect, useMemo, useState } from 'react';
import { getCarCount } from '@/api/cars';
import { CircularProgress } from '@mui/material';
import { ButtonRadioGroup } from '../ButtonRadioGroup';
import { toAbsoluteUrl } from '@/utils';
import { FormattedMessage, useIntl } from 'react-intl';
import './style.css';
import { KeenIcon } from '@/components';

const MovingDeviceChart = () => {
  const intl = useIntl();
  const [selection, setSelection] = useState('Device');
  const [allData, setAllData] = useState<Record<string, number>>();
  const [isLoading, setIsLoading] = useState(false);

  const data = useMemo(() => {
    if (allData) {
      return selection === 'Moving'
        ? [allData.Moving, allData.Parked]
        : [allData.Online, allData.Offline];
    }
    return null;
  }, [allData, selection]);

  const labels = useMemo(() => {
    if (allData) {
      return selection === 'Moving'
        ? [
            intl.formatMessage({ id: 'DASHBOARD.MOVING_DEVICE.MOVING' }),
            intl.formatMessage({ id: 'DASHBOARD.MOVING_DEVICE.PARKED' })
          ]
        : [
            intl.formatMessage({ id: 'DASHBOARD.MOVING_DEVICE.ONLINE' }),
            intl.formatMessage({ id: 'DASHBOARD.MOVING_DEVICE.OFFLINE' })
          ];
    }
    return null;
  }, [allData, selection, intl]);

  const colors: string[] = ['var(--tw-success)', 'var(--tw-danger)'];

  const options: ApexOptions = {
    series: data ?? [],
    labels: labels ?? [],
    colors: colors,
    fill: {
      colors: colors
    },
    chart: {
      type: 'donut'
    },
    stroke: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    plotOptions: {
      pie: {
        startAngle: -120,
        endAngle: 360 - 120,
        donut: {
          size: '80%'
        }
      }
    },
    legend: {
      show: false
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ]
  };

  const fetchData = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const data = await getCarCount();
      setAllData(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!data || !labels) {
    return <CircularProgress />;
  }

  return (
    <div
      className="card hover:shadow-md h-full"
      style={{
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100%'
      }}
    >
      <div className="px-7 py-6 flex items-center justify-between">
        <div className="card-title">
          <h3>
            <FormattedMessage id="DASHBOARD.MOVING_DEVICE.TITLE" />
          </h3>
          <h4 className="text-sm font-thin text-[#B5B5C3]">
            <FormattedMessage id="DASHBOARD.MOVING_DEVICE.STATUS" />
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-light flex items-center justify-center size-10 text-dark rounded-lg"
            onClick={fetchData}
            disabled={isLoading}
          >
            <KeenIcon icon={'arrows-circle'} className={isLoading ? 'animate-spin' : undefined} />
          </button>
          <ButtonRadioGroup
            selection={selection}
            setSelection={setSelection}
            selections={['Moving', 'Device']}
            translations={{
              Moving: intl.formatMessage({ id: 'DASHBOARD.MOVING_DEVICE.MOVING' }),
              Device: intl.formatMessage({ id: 'DASHBOARD.MOVING_DEVICE.DEVICE' })
            }}
          />
        </div>
      </div>

      <div className="card-body flex flex-col gap-4 justify-center items-center px-3 py-1 pb-6">
        <div className="relative">
          <div className="absolute flex justify-center items-center size-full top-0 text-4xl font-bold">
            {data && data.reduce((acc, val) => acc + val)}
          </div>
          <ApexChart
            id="contributions_chart"
            options={options}
            series={options.series}
            type="donut"
            width="100%"
          />
        </div>
        <div className="grid grid-cols-2 w-full px-6 gap-10">
          <div className="flex gap-3">
            <img src={toAbsoluteUrl('/media/icons/online.svg')} />
            <div className="flex flex-col">
              <div className="text-lg font-semibold">{data[0]}</div>
              <div className="text-xs font-medium text-gray-600">{labels[0]}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <img src={toAbsoluteUrl('/media/icons/offline.svg')} />
            <div className="flex flex-col">
              <div className="text-lg font-semibold">{data[1]}</div>
              <div className="text-xs font-medium text-gray-600">{labels[1]}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <img src={toAbsoluteUrl('/media/icons/total.svg')} />
            <div className="flex flex-col">
              <div className="text-lg font-semibold">{data.reduce((acc, val) => acc + val)}</div>
              <div className="text-xs font-medium text-gray-600">
                <FormattedMessage id="DASHBOARD.MOVING_DEVICE.TOTAL" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MovingDeviceChart };
