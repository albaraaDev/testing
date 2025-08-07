import { KeenIcon, Menu, MenuItem, MenuLink, MenuSub, MenuTitle, MenuToggle } from '@/components';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import ApexCharts from 'react-apexcharts';
import { useSettings } from '@/providers';
import { Modal } from '@mui/material';
import { getStatistics, Statistics, StatisticsParams } from '@/api/statistics';
import { ButtonRadioGroup } from '@/pages/dashboards/blocks/ButtonRadioGroup';

type ReportProps = {
  ident: string;
  vehicleId?: string;
  type: 'vehicle' | 'device';
};

type FilterOption =
  | 'lastWeek'
  | 'lastMonth'
  | 'lastYear'
  | 'customDay'
  | 'customMonth'
  | 'customYear';

const options: Record<
  FilterOption,
  {
    name: string;
    nameKey?: string;
  }
> = {
  lastWeek: {
    name: 'Last 7 days',
    nameKey: 'DEVICE.REPORT.LAST_7_DAYS'
  },
  lastMonth: {
    name: 'Last Month',
    nameKey: 'DEVICE.REPORT.LAST_MONTH'
  },
  lastYear: {
    name: 'Last Year',
    nameKey: 'DEVICE.REPORT.LAST_YEAR'
  },
  customDay: {
    name: 'Custom Day',
    nameKey: 'DEVICE.REPORT.CUSTOM_DAYS'
  },
  customMonth: {
    name: 'Custom Month',
    nameKey: 'DEVICE.REPORT.CUSTOM_MONTHS'
  },
  customYear: {
    name: 'Custom Year',
    nameKey: 'DEVICE.REPORT.CUSTOM_YEARS'
  }
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
};

const formatHoursAndMinutes = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

const safeParseFloat = (value: string): number => {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const safeParseEngineHours = (engineHours: string): number => {
  if (!engineHours) return 0;
  try {
    const [hoursStr = '0', minutesStr = '0'] = engineHours.split(' h , ');
    const hours = parseInt(hoursStr.replace(/[^\d]/g, '')) || 0;
    const minutes = parseInt(minutesStr.replace(/[^\d]/g, '')) || 0;
    return Number((hours + minutes / 60).toFixed(2));
  } catch (error) {
    console.error('Error parsing engine hours:', error);
    return 0;
  }
};

export default function Report({ vehicleId, ident, type }: ReportProps) {
  const intl = useIntl();
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('lastWeek');
  const [pendingFilter, setPendingFilter] = useState<FilterOption | null>(null);
  const [metricType, setMetricType] = useState('Mileage');
  const [statistics, setStatistics] = useState<Statistics[] | null>(null);
  const { settings } = useSettings();
  const isDarkMode = settings.themeMode === 'dark';
  const [rangeFilter, setRangeFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [isCustomDateRangeModalOpen, setIsCustomDateRangeModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = getQueryParams(selectedFilter);
        if (
          selectedFilter !== 'customDay' &&
          selectedFilter !== 'customMonth' &&
          selectedFilter !== 'customYear'
        ) {
          setRangeFilter({ startDate: queryParams.startDate, endDate: queryParams.endDate });
        }
        const data = await getStatistics({
          ...queryParams,
          vehicleId,
          ident,
          type
        });
        setStatistics(data);
      } catch (error) {
        console.error('Error fetching device statistics:', error);
      }
    };

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ident, vehicleId, selectedFilter]);

  const getQueryParams = (
    selected: FilterOption
  ): Omit<StatisticsParams, 'ident' | 'vehicleId' | 'type'> => {
    switch (selected) {
      case 'lastWeek': {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
        const endDate = new Date();
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          groupedBy: 'daily'
        };
      }
      case 'lastMonth': {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(startDate.getDate() + 1);
        const endDate = new Date();
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          groupedBy: 'daily'
        };
      }
      case 'lastYear': {
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        const endDate = new Date();
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          groupedBy: 'monthly'
        };
      }
      case 'customDay': {
        return {
          startDate: rangeFilter.startDate,
          endDate: rangeFilter.endDate,
          groupedBy: 'daily'
        };
      }
      case 'customMonth': {
        return {
          startDate: rangeFilter.startDate,
          endDate: rangeFilter.endDate,
          groupedBy: 'monthly'
        };
      }
      case 'customYear': {
        return {
          startDate: rangeFilter.startDate,
          endDate: rangeFilter.endDate,
          groupedBy: 'yearly'
        };
      }
      default: {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
        const endDate = new Date();
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          groupedBy: 'daily'
        };
      }
    }
  };

  const getChartData = (statistics?: Statistics[] | null) => {
    if (!statistics) return { name: '', data: [] };
    if (metricType === 'Mileage') {
      return {
        name: 'Daily Kilometers',
        data: statistics?.map((stat) => safeParseFloat(stat.existingKilometers))
      };
    }
    return {
      name: 'Engine Hours',
      data: statistics?.map((stat) => safeParseEngineHours(stat.engineHours))
    };
  };

  const getTooltipContent = (dataPointIndex: number) => {
    const data = statistics?.[dataPointIndex];
    if (!data) return '';

    const date = data.date;
    const value = metricType === 'Mileage' ? data.existingKilometers : data.engineHours;

    return `
      <div class="p-2 text-xs bg-white rounded shadow-md">
        <div class="font-semibold">${date}</div>
        <hr class="my-1" />
        <div class="font-semibold">${value}</div>
      </div>
    `;
  };

  const handleCancelDateRange = () => {
    setIsCustomDateRangeModalOpen(false);
    setPendingFilter(null);
  };

  const handleApplyDateRange = ({ startDate, endDate }: { startDate: string; endDate: string }) => {
    setRangeFilter({ startDate, endDate });
    if (pendingFilter) {
      setSelectedFilter(pendingFilter);
    }
    setIsCustomDateRangeModalOpen(false);
    setPendingFilter(null);
  };

  return (
    <div className="card h-full p-4 flex flex-col justify-between">
      <div className="flex justify-between">
        <div>
          <h2 className="card-title">
            <FormattedMessage id="DEVICE.REPORT.TITLE" />
          </h2>
          <h3 className="text-sm font-thin text-[#B5B5C3]">
            <FormattedMessage id="DASHBOARD.MILEAGE_ENGINE.TITLE" />
          </h3>
        </div>
        <div className="flex gap-5 items-center">
          <ButtonRadioGroup
            selection={metricType}
            setSelection={setMetricType}
            selections={['Mileage', 'Engine']}
            translations={{
              Engine: intl.formatMessage({ id: 'DASHBOARD.MILEAGE_ENGINE.ENGINE' }),
              Mileage: intl.formatMessage({ id: 'DASHBOARD.MILEAGE_ENGINE.MILEAGE' })
            }}
            disabled={!statistics}
          />
          <ReportFilterDropdown
            selected={selectedFilter}
            setSelected={(key) => {
              if (key === 'customDay' || key === 'customMonth' || key === 'customYear') {
                setPendingFilter(key);
                setIsCustomDateRangeModalOpen(true);
              } else {
                setSelectedFilter(key);
              }
            }}
            options={options}
          />
          <Modal
            open={
              (selectedFilter === 'customDay' ||
                selectedFilter === 'customMonth' ||
                selectedFilter === 'customYear' ||
                pendingFilter === 'customDay' ||
                pendingFilter === 'customMonth' ||
                pendingFilter === 'customYear') &&
              isCustomDateRangeModalOpen
            }
          >
            <div className="card absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-dark rounded-lg shadow-lg p-4 flex justify-center items-center">
              <FilterDateRange
                selectedFilter={pendingFilter || selectedFilter}
                onApply={handleApplyDateRange}
                onCancel={handleCancelDateRange}
              />
            </div>
          </Modal>
        </div>
      </div>
      <div>
        <ApexCharts
          id="contributions_chart"
          options={{
            chart: {
              type: 'bar',
              toolbar: { show: false }
            },
            title: {
              text: intl.formatMessage(
                { id: 'DEVICE.REPORT.CHART.TITLE' },
                {
                  type: intl.formatMessage({
                    id:
                      metricType === 'Mileage'
                        ? 'DASHBOARD.MILEAGE_ENGINE.MILEAGE'
                        : 'DASHBOARD.MILEAGE_ENGINE.ENGINE'
                  }),
                  startDate: rangeFilter.startDate,
                  endDate: rangeFilter.endDate
                }
              ),
              align: 'center',
              style: {
                fontSize: '12px',
                fontWeight: 'bold',
                color: isDarkMode ? '#dad1d1' : '#252525'
              }
            },
            xaxis: {
              categories: statistics?.map((stat) => stat.date) || [],
              labels: {
                style: { fontSize: '12px', colors: '#B5B5C3' },
                formatter: (val) => {
                  if (selectedFilter === 'lastYear') {
                    const d = new Date(val);
                    return d.toLocaleString('default', { month: 'short' });
                  }
                  if (selectedFilter === 'customYear') {
                    return val.split('-')[0];
                  }
                  return formatDate(val);
                }
              },
              axisBorder: { show: true, color: '#ccc' }
            },
            yaxis: {
              labels: {
                style: { fontSize: '12px', colors: '#B5B5C3' },
                formatter: (val) => {
                  if (metricType === 'Mileage') {
                    return `${val} km`;
                  }
                  return formatHoursAndMinutes(val);
                }
              }
            },
            plotOptions: {
              bar: {
                borderRadius: 6,
                columnWidth: 22,
                dataLabels: { position: 'top' },
                distributed: true
              }
            },
            legend: {
              show: false
            },
            colors: ['#545FAB'],
            grid: {
              show: true,
              borderColor: isDarkMode ? '#dddddd53' : '#ddd',
              strokeDashArray: 4
            },
            tooltip: {
              enabled: true,
              shared: false,
              custom: ({ dataPointIndex }: { dataPointIndex: number }) =>
                getTooltipContent(dataPointIndex)
            },
            dataLabels: {
              enabled: true,
              formatter: (val: number) => {
                if (typeof val !== 'number' || val === 0) return '';
                if (metricType === 'Mileage') {
                  return `${val} km`;
                }
                return formatHoursAndMinutes(val);
              },
              style: {
                fontSize: '12px',
                colors: [isDarkMode ? '#dad1d1' : '#252525']
              },
              offsetY: -30,
              textAnchor: 'middle'
            }
          }}
          series={[getChartData(statistics)]}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );
}

type FilterDateRangeProps = {
  selectedFilter: FilterOption;
  // eslint-disable-next-line no-unused-vars
  onApply: ({ startDate, endDate }: { startDate: string; endDate: string }) => void;
  onCancel: () => void;
};

function FilterDateRange({ selectedFilter, onApply, onCancel }: FilterDateRangeProps) {
  const intl = useIntl();
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');

  const getMaxDay = (startDate: string) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  let errorMessage = '';
  if (start && end) {
    if (selectedFilter === 'customYear') {
      if (Number(start) > Number(end)) {
        errorMessage = 'Start year cannot be after end year.';
      }
    } else {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (startDate > endDate) {
        errorMessage = 'Start date cannot be after end date.';
      }
      if (selectedFilter === 'customDay') {
        const diffInDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffInDays > 30) {
          errorMessage = 'Range of days cannot exceed 30 days.';
        }
      }
    }
  }

  const isApplyDisabled = !start || !end || !!errorMessage;

  const handleApply = () => {
    if (isApplyDisabled) return;
    switch (selectedFilter) {
      case 'customDay':
        onApply({ startDate: start, endDate: end });
        break;
      case 'customMonth':
        onApply({ startDate: `${start}-01`, endDate: `${end}-01` });
        break;
      case 'customYear':
        onApply({ startDate: `${start}-01-01`, endDate: `${end}-12-31` });
        break;
      default:
        return;
    }
  };

  return (
    <>
      <div className="card-header w-full">
        <h3 className="card-title">
          {selectedFilter === 'customDay' ? (
            <FormattedMessage id="DEVICE.REPORT.CUSTOM_DAYS" />
          ) : selectedFilter === 'customMonth' ? (
            <FormattedMessage id="DEVICE.REPORT.CUSTOM_MONTHS" />
          ) : (
            <FormattedMessage id="DEVICE.REPORT.CUSTOM_YEARS" />
          )}
        </h3>
      </div>
      <div className="card-body">
        <div className="flex gap-4 flex-col">
          {selectedFilter === 'customDay' && (
            <div className="flex gap-4">
              <label htmlFor="startDate">
                <span className="mr-2 form-label">
                  <span className="mr-2 form-label">
                    <FormattedMessage id="COMMON.FROM" />
                  </span>
                </span>
                <input
                  type="date"
                  id="startDate"
                  className="input"
                  placeholder={intl.formatMessage({ id: 'COMMON.DATE.FORMAT' })}
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>
              <label htmlFor="endDate">
                <span className="mr-2 form-label">
                  <FormattedMessage id="COMMON.TO" />
                </span>
                <input
                  type="date"
                  id="endDate"
                  className="input"
                  placeholder={intl.formatMessage({ id: 'COMMON.DATE.FORMAT' })}
                  value={end}
                  min={start || undefined}
                  max={start ? getMaxDay(start) : undefined}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
            </div>
          )}
          {selectedFilter === 'customMonth' && (
            <div className="flex gap-4">
              <label htmlFor="startDate">
                <span className="mr-2 form-label">
                  {' '}
                  <span className="mr-2 form-label">
                    <FormattedMessage id="COMMON.FROM" />
                  </span>
                </span>
                <input
                  type="month"
                  id="startDate"
                  className="input"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>
              <label htmlFor="endDate">
                <span className="mr-2 form-label">
                  <FormattedMessage id="COMMON.TO" />
                </span>
                <input
                  type="month"
                  id="endDate"
                  className="input"
                  value={end}
                  min={start || undefined}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
            </div>
          )}
          {selectedFilter === 'customYear' && (
            <div className="flex gap-4">
              <label htmlFor="startDate">
                <span className="mr-2 form-label">
                  <FormattedMessage id="COMMON.FROM" />
                </span>
                <input
                  type="number"
                  id="startDate"
                  className="input"
                  placeholder="YYYY"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>
              <label htmlFor="endDate">
                <span className="mr-2 form-label">
                  <FormattedMessage id="COMMON.TO" />
                </span>
                <input
                  type="number"
                  id="endDate"
                  className="input"
                  placeholder="YYYY"
                  value={end}
                  min={start || undefined}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
            </div>
          )}
          {errorMessage && <p className="text-red-500 text-xs mt-1">{errorMessage}</p>}
        </div>
      </div>
      <div className="flex items-center w-full justify-end gap-4 mt-4">
        <button className="btn btn-light" onClick={onCancel}>
          <FormattedMessage id="COMMON.CANCEL" />
        </button>
        <button className="btn btn-primary" onClick={handleApply} disabled={isApplyDisabled}>
          <FormattedMessage id="COMMON.APPLY" />
        </button>
      </div>
    </>
  );
}

export interface ReportFilterDropdownProps {
  selected: FilterOption;
  // eslint-disable-next-line no-unused-vars
  setSelected: (value: FilterOption) => void;
  readOnly?: boolean;
  options: Record<
    FilterOption,
    {
      name: string;
      nameKey?: string;
    }
  >;
}

export const ReportFilterDropdown = ({
  selected,
  setSelected,
  options,
  readOnly = false
}: ReportFilterDropdownProps) => {
  const intl = useIntl();
  const getOptionLabel = (key: FilterOption) => {
    const option = options[key];
    if (option?.nameKey) {
      return intl.formatMessage({
        id: option.nameKey,
        defaultMessage: option.name || key
      });
    }
    return option?.name || key;
  };

  if (readOnly) {
    return (
      <div className="btn btn-clear font-semibold text-xs h-fit px-3 py-[6px] cursor-default text-gray-500 bg-gray-300">
        {getOptionLabel(selected)}
      </div>
    );
  }

  return (
    <Menu>
      <MenuItem
        toggle="dropdown"
        trigger="click"
        dropdownProps={{
          placement: 'bottom-start',
          modifiers: [
            {
              name: 'offset',
              options: { offset: [0, 10] } // [skid, distance]
            }
          ]
        }}
      >
        <MenuToggle className="btn btn-clear gap-2 font-bold text-xs h-fit px-4 py-2.5 cursor-pointer text-gray-500 bg-gray-100">
          <KeenIcon icon="down" className="!text-inherit !text-xs" />
          <span>{getOptionLabel(selected)}</span>
          <KeenIcon icon="calendar" className="!text-inherit" />
        </MenuToggle>
        <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
          {Object.entries(options).map(([key, option]) => (
            <MenuItem
              key={key}
              onClick={() => {
                setSelected(key as FilterOption);
              }}
            >
              <MenuLink>
                <MenuTitle>
                  {option.nameKey
                    ? intl.formatMessage({
                        id: option.nameKey,
                        defaultMessage: option.name || key
                      })
                    : option.name || key}
                </MenuTitle>
              </MenuLink>
            </MenuItem>
          ))}
        </MenuSub>
      </MenuItem>
    </Menu>
  );
};
