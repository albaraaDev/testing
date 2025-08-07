import { useEffect, useMemo, useRef } from 'react';
import ApexChart from 'react-apexcharts';
import { ReplayPoint } from '@/api/replay';
import { formatInTimeZone } from 'date-fns-tz';
import { useAuthContext } from '@/auth';
import { ApexOptions } from 'apexcharts';

interface SpeedChartProps {
  points: ReplayPoint[];
  currentPointIndex: number;
}

const SpeedChart: React.FC<SpeedChartProps> = ({ points, currentPointIndex }) => {
  const chartRef = useRef<any>(null);
  const { currentUser } = useAuthContext();

  const chartData = useMemo(() => {
    if (!points || points.length === 0) return [];

    return [
      {
        name: 'Speed',
        data: points.map((point, index) => ({
          x: index,
          y: point.speed || 0,
          timestamp: point.timestamp * 1000
        }))
      }
    ];
  }, [points]);

  const chartOptions: ApexOptions = useMemo(() => {
    return {
      chart: {
        id: 'speed-chart',
        type: 'line',
        toolbar: {
          show: false
        },
        animations: {
          enabled: false
        }
      },
      colors: ['#5151F9'],
      stroke: {
        width: 2,
        curve: 'smooth'
      },
      grid: {
        borderColor: '#C4CADA',
        strokeDashArray: 4,
        yaxis: {
          lines: {
            show: true
          }
        }
      },
      xaxis: {
        type: 'numeric',
        tickAmount: Math.min(10, points.length - 1),
        labels: {
          formatter: function (value: string) {
            const index = parseInt(value);
            if (isNaN(index) || !points[index] || !currentUser?.timezone) return '';

            return formatInTimeZone(
              new Date(points[index].timestamp * 1000),
              currentUser.timezone,
              'HH:mm:ss'
            );
          },
          style: {
            colors: '#6C757D'
          }
        },
        axisTicks: {
          show: false
        },
        crosshairs: {
          show: true,
          width: 1,
          position: 'back',
          opacity: 0.9,
          stroke: {
            color: '#B6B6B6',
            width: 1,
            dashArray: 0
          }
        },
        tooltip: {
          enabled: false
        }
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: {
          formatter: (value: number) => `${Math.round(value)} km/h`,
          style: {
            colors: '#6C757D'
          }
        }
      },
      tooltip: {
        custom: function ({ seriesIndex, dataPointIndex, w }: any) {
          const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
          const timestamp = data.timestamp;

          const formattedTime = currentUser?.timezone
            ? formatInTimeZone(new Date(timestamp), currentUser.timezone, 'HH:mm:ss')
            : new Date(timestamp).toLocaleTimeString();

          return `
            <div class="custom-tooltip p-2 bg-white shadow-lg rounded-md">
              <div class="font-medium text-xs text-gray-800">
                ${formattedTime}
              </div>
              <div class="font-semibold text-sm">
                Speed: ${data.y.toFixed(0)} km/h
              </div>
            </div>
          `;
        }
      }
    };
  }, [points, currentUser]);

  // Effect to update chart markers for the current point
  useEffect(() => {
    if (currentPointIndex >= 0 && chartRef.current?.chart) {
      chartRef.current.chart.updateOptions(
        {
          markers: {
            discrete: [
              {
                seriesIndex: 0,
                dataPointIndex: currentPointIndex,
                size: 3,
                strokeColor: '#5151F9',
                fillColor: '#5151F9',
                strokeWidth: 2
              }
            ]
          }
        },
        false,
        true
      );
    }
  }, [currentPointIndex]);

  // Effect to force chart refresh when points data changes
  useEffect(() => {
    if (chartRef.current?.chart) {
      chartRef.current.chart.updateSeries(chartData, false);

      chartRef.current.chart.updateOptions({
        xaxis: {
          ...chartOptions.xaxis,
          tickAmount: Math.min(10, points.length - 1),
          labels: {
            ...chartOptions.xaxis?.labels,
            show: points.length > 0
          }
        }
      });
    }
  }, [points, chartData, chartOptions.xaxis]);

  if (!points || points.length === 0) {
    return (
      <div
        style={{ height: 130 }}
        className="flex items-center justify-center text-gray-500 bg-gray-100 rounded-md"
      >
        No speed data available
      </div>
    );
  }

  return (
    <div className="speed-chart-container">
      <ApexChart
        ref={chartRef}
        options={chartOptions}
        series={chartData}
        type="line"
        height={130}
        key={`speed-chart-${points[0].latitude}-${points[0].longitude}`}
      />
    </div>
  );
};

export default SpeedChart;
