import React from 'react';

interface GaugeProps {
  value?: number;
  maxValue?: number;
  unit?: string;
}

const CONSTANTS = {
  RADIUS: 80,
  STROKE_WIDTH: 35,
  VIEW_BOX_SIZE: 250,
  START_ANGLE: -180,
  END_ANGLE: 0,
  WARNING_ZONE_DEGREES: 30,
  POINTER_LENGTH: 90,
  POINTER_OFFSET: 19.5
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

const SpeedGauge: React.FC<GaugeProps> = ({ maxValue = 100, unit = 'km/h', value }: GaugeProps) => {
  const center = CONSTANTS.VIEW_BOX_SIZE / 2;
  const angleRange = CONSTANTS.END_ANGLE - CONSTANTS.START_ANGLE;
  const valueAngle = CONSTANTS.START_ANGLE + angleRange * ((value ?? 0) / maxValue);

  return (
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
        d={createArc(
          CONSTANTS.END_ANGLE - CONSTANTS.WARNING_ZONE_DEGREES,
          CONSTANTS.END_ANGLE,
          center,
          CONSTANTS.RADIUS
        )}
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
      <text
        x={center}
        y={center + 15}
        textAnchor="middle"
        className="text-4xl font-bold text-black dark:text-white"
        fill="currentColor"
      >
        {value !== undefined && value !== null ? Math.round(value) : '?'}
      </text>
      <text x={center} y={center + 30} textAnchor="middle" className="text-sm" fill="#6b7280">
        {unit}
      </text>
    </svg>
  );
};

export default SpeedGauge;
