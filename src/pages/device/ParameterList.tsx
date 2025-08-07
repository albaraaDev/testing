import { FormattedMessage, useIntl } from 'react-intl';

interface ParameterListProps {
  items: Record<string, { data: any; timestamp: Date; latest: boolean }>;
}

const ParameterList = ({ items }: ParameterListProps) => {
  const intl = useIntl();
  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center  p-4">
        <h2 className="text-xl font-semibold text-gray-800">
          <FormattedMessage id="DEVICE.PARAMETERS.TITLE" />
        </h2>
        <div className="flex gap-4">
          {/* Filters Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-md border text-sm">
            <FormattedMessage id="COMMON.FILTERS" />
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">2</span>
          </button>
          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-md border text-sm">
            <FormattedMessage id="COMMON.EXPORT" />
          </button>
          {/* Search Bar */}
          <div className="relative">
            <input
              type="search"
              placeholder={intl.formatMessage({ id: 'COMMON.SEARCH' })}
              className="pl-8 pr-4 py-2 border rounded-md text-sm w-56"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m1.85-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(items).map(([key, value]) => (
          <div
            key={key}
            className={`card p-4 rounded-lg transition-colors duration-200 ${
              value.latest ? 'bg-[#50CD891A] ' : 'bg-white '
            }`}
          >
            {/* Card Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{key}</h3>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-xs text-gray-500">{value.timestamp.toLocaleString()}</p>
              </div>
            </div>

            {/* Card Body */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 truncate">{value.data?.toString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParameterList;
