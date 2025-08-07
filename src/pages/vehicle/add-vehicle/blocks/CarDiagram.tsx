import { toAbsoluteUrl } from '@/utils/Assets';
import React from 'react';

interface CarDiagramProps {
  onPlaceClick?: (place: number) => void;
  activePlaces?: number[];
  className?: string;
}

const CarDiagram: React.FC<CarDiagramProps> = ({
  onPlaceClick,
  activePlaces = [],
  className = ''
}) => {
  const handlePlaceClick = (place: number) => {
    onPlaceClick?.(place);
  };

  const getButtonClass = (place: number) => {
    const baseClass =
      'absolute border hover:shadow-md rounded-full w-8 h-8 flex items-center justify-center transition-colors';
    const isActive = activePlaces.includes(place);
    const colorClass = isActive
      ? 'bg-blue-500 text-white border-blue-600'
      : 'bg-gray-50 border-gray-300 hover:bg-gray-100';

    return `${baseClass} ${colorClass}`;
  };

  return (
    <div
      className={`relative flex p-4 justify-center items-center w-[310px] h-[800px] ${className}`}
    >
      <img src={toAbsoluteUrl('/media/images/car.png')} alt="Car" className="" />

      {/* Corners */}
      <div className="absolute top-[130px] left-10 w-16 h-20 border-t-2 border-l-2 border-blue-500 rounded-tl-full" />
      <div
        className="absolute top-[130px] right-10 w-16 h-20 border-t-2 border-r-2 border-blue-500 rounded-tr-full"
        style={{ boxShadow: '4px 0px 0px 0px rgba(0, 0, 0, 0.1)' }}
      />
      <div className="absolute bottom-[130px] left-10 w-16 h-20 border-b-2 border-l-2 border-blue-500 rounded-bl-full shadow-lg" />
      <div className="absolute bottom-[130px] right-10 w-16 h-20 border-b-2 border-r-2 border-blue-500 rounded-br-full shadow-lg" />

      {/* Place Buttons */}
      {/* Top */}
      <button
        className={`${getButtonClass(1)} top-[70px] left-1/2 -translate-x-1/2`}
        onClick={() => handlePlaceClick(1)}
      >
        1
      </button>
      <button
        className={`${getButtonClass(10)} top-[110px] left-0`}
        onClick={() => handlePlaceClick(10)}
      >
        10
      </button>
      <button
        className={`${getButtonClass(2)} top-[110px] right-0`}
        onClick={() => handlePlaceClick(2)}
      >
        2
      </button>

      {/* Upper Middle */}
      <button
        className={`${getButtonClass(9)} top-[290px] left-[-12px]`}
        onClick={() => handlePlaceClick(9)}
      >
        9
      </button>
      <button
        className={`${getButtonClass(11)} top-[300px] left-1/2 -translate-x-1/2`}
        onClick={() => handlePlaceClick(11)}
      >
        11
      </button>
      <button
        className={`${getButtonClass(3)} top-[290px] right-[-12px]`}
        onClick={() => handlePlaceClick(3)}
      >
        3
      </button>

      {/* Lower Middle */}
      <button
        className={`${getButtonClass(8)} bottom-1/3 left-[-12px]`}
        onClick={() => handlePlaceClick(8)}
      >
        8
      </button>
      <button
        className={`${getButtonClass(12)} bottom-[280px] left-1/2 -translate-x-1/2`}
        onClick={() => handlePlaceClick(12)}
      >
        12
      </button>
      <button
        className={`${getButtonClass(4)} bottom-1/3 right-[-12px]`}
        onClick={() => handlePlaceClick(4)}
      >
        4
      </button>

      {/* Bottom */}
      <button
        className={`${getButtonClass(6)} bottom-[70px] left-1/2 -translate-x-1/2`}
        onClick={() => handlePlaceClick(6)}
      >
        6
      </button>
      <button
        className={`${getButtonClass(7)} bottom-[110px] left-4`}
        onClick={() => handlePlaceClick(7)}
      >
        7
      </button>
      <button
        className={`${getButtonClass(5)} bottom-[110px] right-4`}
        onClick={() => handlePlaceClick(5)}
      >
        5
      </button>
    </div>
  );
};

export default CarDiagram;
