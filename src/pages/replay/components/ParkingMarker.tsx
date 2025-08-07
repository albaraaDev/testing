import React from 'react';

interface ParkingMarkerProps {
  color: string;
  letter?: string;
}

const ParkingMarker: React.FC<ParkingMarkerProps> = ({ color, letter = 'P' }) => {
  return (
    <svg width="30" height="31" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15.0005 0C9.12701 0 4.34863 4.77838 4.34863 10.6518C4.34863 17.9408 13.881 28.6416 14.2868 29.0936C14.668 29.5182 15.3336 29.5174 15.7141 29.0936C16.1199 28.6416 25.6523 17.9408 25.6523 10.6518C25.6522 4.77838 20.8738 0 15.0005 0Z"
        fill={color}
      />
      <ellipse cx="14.9998" cy="30.0003" rx="2.94118" ry="0.588235" fill="#F15700" />
      <text
        x="15"
        y="13"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fill="#F1F1F4"
      >
        {letter}
      </text>
    </svg>
  );
};

export default ParkingMarker;
