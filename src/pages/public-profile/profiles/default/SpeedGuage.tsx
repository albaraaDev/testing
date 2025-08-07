import React from 'react';

// [Previous interfaces and constants remain the same]
interface LocationInfo {
  place: string;
  timestamp: string;
}

interface GaugeProps {
  value: number;
  maxValue: number;
  unit: string;
  distance: string;
  speed: number;
  startLocation: LocationInfo;
  endLocation: LocationInfo;
}

const CONSTANTS = {
  RADIUS: 80,
  STROKE_WIDTH: 35,
  VIEW_BOX_SIZE: 250,
  START_ANGLE: -180,
  END_ANGLE: 0,
  WARNING_ZONE_DEGREES: 30,
  POINTER_LENGTH: 90,
  POINTER_OFFSET: 19.5, 
} as const;

// [Previous utility functions remain the same]
const createArc = (start: number, end: number, center: number, radius: number): string => {
  const startRad = (start * Math.PI) / 180;
  const endRad = (end * Math.PI) / 180;

  const x1 = center + radius * Math.cos(startRad);
  const y1 = center + radius * Math.sin(startRad);
  const x2 = center + radius * Math.cos(endRad);
  const y2 = center + radius * Math.sin(endRad);

  const largeArcFlag = end - start <= 180 ? '0' : '1';

  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
};

const calculateTaperedPointer = (angle: number, center: number, length: number): string => {
  const rad = (angle * Math.PI) / 180;
  const baseWidth = 4;
  const baseRadius = baseWidth / 2;
  const perpRad = rad + Math.PI / 2;
  
  const baseOffsetX = Math.cos(rad) * CONSTANTS.POINTER_OFFSET;
  const baseOffsetY = Math.sin(rad) * CONSTANTS.POINTER_OFFSET;
  const baseCenter = {
    x: center + baseOffsetX,
    y: center + baseOffsetY
  };
  
  const tipX = center + length * Math.cos(rad);
  const tipY = center + length * Math.sin(rad);
  
  const leftBaseX = baseCenter.x + baseWidth * Math.cos(perpRad);
  const leftBaseY = baseCenter.y + baseWidth * Math.sin(perpRad);
  const rightBaseX = baseCenter.x - baseWidth * Math.cos(perpRad);
  const rightBaseY = baseCenter.y - baseWidth * Math.sin(perpRad);
  
  return `
    M ${leftBaseX} ${leftBaseY}
    A ${baseWidth} ${baseWidth} 0 0 1 ${rightBaseX} ${rightBaseY}
    L ${tipX} ${tipY}
    Z
  `;
};

const LocationPoint: React.FC<{ info: LocationInfo }> = ({ info }) => (
  <div className="flex items-center">
    <div className="w-3 h-3 rounded-full bg-white border-2 border-blue-600" />
    <div className="ml-2">
      <div className="text-sm font-semibold text-gray-800">{info.place}</div>
      <div className="text-xs text-gray-500">{info.timestamp}</div>
    </div>
  </div>
);

const SpeedIndicator: React.FC<{ speed: number }> = ({ speed }) => (
  <div className="relative mt-2">
    <div className="w-20 h-20 rounded-full border-4 border-gray-200" />
    <div
      className="absolute inset-0 w-20 h-20 rounded-full border-4 border-yellow-400"
      style={{
        clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)'
      }}
    />
    <div className="absolute inset-2 flex items-center justify-center text-sm font-bold text-gray-700">
      km/h {speed}
    </div>
  </div>
);

const SpeedGauge: React.FC = () => {
  const props: GaugeProps = {
    value: 45,
    maxValue: 100,
    unit: 'km',
    distance: '4.92 KM',
    speed: 75,
    startLocation: {
      place: 'Başakşehir/İstanbul',
      timestamp: '2024-04-29 12:35:35'
    },
    endLocation: {
      place: 'Fatih/İstanbul',
      timestamp: '2024-04-29 12:35:35'
    }
  };

  const center = CONSTANTS.VIEW_BOX_SIZE / 2;
  const angleRange = CONSTANTS.END_ANGLE - CONSTANTS.START_ANGLE;
  const valueAngle = CONSTANTS.START_ANGLE + angleRange * (props.value / props.maxValue);

  return (
    <div className="card flex flex-col max-w-sm p-8">
      <svg 
        viewBox={`0 0 ${CONSTANTS.VIEW_BOX_SIZE} ${CONSTANTS.VIEW_BOX_SIZE}`} 
        className="mx-auto"
        style={{ marginBottom: '-110px' }} 
      >
     
        <defs>
          <filter id="pointerShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="2" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <path
          d={createArc(CONSTANTS.START_ANGLE, CONSTANTS.END_ANGLE, center, CONSTANTS.RADIUS)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={CONSTANTS.STROKE_WIDTH}
        />

        {/* Value arc */}
        <path
          d={createArc(CONSTANTS.START_ANGLE, valueAngle, center, CONSTANTS.RADIUS)}
          fill="none"
          stroke="#4338ca"
          strokeWidth={CONSTANTS.STROKE_WIDTH}
        />

        {/* Warning zone */}
        <path
          d={createArc(CONSTANTS.END_ANGLE - CONSTANTS.WARNING_ZONE_DEGREES, CONSTANTS.END_ANGLE, center, CONSTANTS.RADIUS)}
          fill="none"
          stroke="#ef4444"
          strokeWidth={CONSTANTS.STROKE_WIDTH}
        />

        {/* Pointer with shadow */}
        <path
          d={calculateTaperedPointer(valueAngle, center, CONSTANTS.POINTER_LENGTH)}
          fill="#5E6278"
          stroke="none"
          filter="url(#pointerShadow)"
        />

        {/* Center text */}
        <text x={center} y={center + 15} textAnchor="middle" className="text-4xl font-bold" fill="black">
          {props.value}
        </text>
        <text x={center} y={center + 30} textAnchor="middle" className="text-sm" fill="#6b7280">
          {props.unit}
        </text>
      </svg>

      <div className="bg-gray-50 p-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="text-lg font-semibold text-gray-800">{props.distance}</div>
            <SpeedIndicator speed={props.speed} />
          </div>

          <div className="ml-4 flex flex-col align-items-center">
            <LocationPoint info={props.startLocation} />
            <div className="ml-1 h-6 border-l border-gray-300" />
            <LocationPoint info={props.endLocation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedGauge;