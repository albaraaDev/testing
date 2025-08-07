import { getScratches, ScratchDTO } from '@/api/cars';
import { toAbsoluteUrl } from '@/utils';
import { useEffect, useState } from 'react';
import ScratchesPopover from './ScratchesPopover';

export default function VehicleScratchesDisplay({ vehicleId }: { vehicleId?: string }) {
  const [scratches, setScratches] = useState<Record<string, ScratchDTO[]> | undefined>(undefined);
  const [offSet] = useState([0, 100]);

  const groupScratchesByPlace = (scratches: ScratchDTO[]) => {
    const groupedScratches: Record<string, ScratchDTO[]> = {};
    scratches.forEach((scratch) => {
      if (!groupedScratches[scratch.place]) {
        groupedScratches[scratch.place] = [];
      }
      groupedScratches[scratch.place].push(scratch);
    });
    return groupedScratches;
  };

  useEffect(() => {
    (async () => {
      if (!vehicleId) return;
      const res = await getScratches(vehicleId, {
        start: offSet[0],
        end: offSet[1]
      });
      setScratches(groupScratchesByPlace(res));
    })();
  }, [vehicleId]);

  return (
    <div className="relative flex p-4 justify-center items-center col-span-full mb-4">
      <div className="relative">
        <img src={toAbsoluteUrl('/media/images/car.png')} alt="Car" />
        {/* Corners */}
        <div className="absolute top-0 left-3 w-20 h-32 border-t-2 border-l-2 border-info rounded-tl-full" />
        <div className="absolute top-0 right-3 w-20 h-32 border-t-2 border-r-2 border-info rounded-tr-full" />
        <div className="absolute bottom-0 left-3 w-20 h-32 border-b-2 border-l-2 border-info rounded-bl-full" />
        <div className="absolute bottom-0 right-3 w-20 h-32 border-b-2 border-r-2 border-info rounded-br-full" />
      </div>
      {/* Top row */}
      <ScratchesPopover
        className="absolute top-3 left-1/3 -translate-x-1/2 border hover:shadow-md bg-gray-100 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center"
        scratches={scratches?.['10']}
      />
      <ScratchesPopover
        className="absolute top-0 left-1/2 -translate-x-1/2 border hover:shadow-md bg-gray-100 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center"
        scratches={scratches?.['1']}
      />
      <ScratchesPopover
        className="absolute top-3 right-1/3 translate-x-1/2 border hover:shadow-md bg-gray-100 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center"
        scratches={scratches?.['2']}
      />
      {/* Middle top row */}
      <ScratchesPopover
        className="absolute top-1/4 left-1/4 border hover:shadow-md text-gray-600 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
        scratches={scratches?.['9']}
      />
      <ScratchesPopover
        className="absolute top-1/4 left-1/2 -translate-x-1/2 border hover:shadow-md text-gray-600 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
        scratches={scratches?.['11']}
      />
      <ScratchesPopover
        className="absolute top-1/4 right-1/4 border hover:shadow-md text-gray-600 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
        scratches={scratches?.['3']}
      />
      {/* Middle bottom row */}
      <ScratchesPopover
        className="absolute bottom-1/4 left-1/4 border hover:shadow-md text-gray-600 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
        scratches={scratches?.['8']}
      />
      <ScratchesPopover
        className="absolute bottom-1/4 left-1/2 -translate-x-1/2 border hover:shadow-md text-gray-600 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
        scratches={scratches?.['12']}
      />
      <ScratchesPopover
        className="absolute bottom-1/4 right-1/4 border hover:shadow-md text-gray-600 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
        scratches={scratches?.['4']}
      />
      {/* Bottom row */}
      <ScratchesPopover
        className="absolute bottom-7 left-1/3 -translate-x-1/2 border bg-gray-100 hover:shadow-md text-gray-600 rounded-full w-8 h-8 flex items-center justify-center"
        scratches={scratches?.['7']}
      />
      <ScratchesPopover
        className="absolute bottom-4 left-1/2 -translate-x-1/2 border bg-gray-100 hover:shadow-md text-gray-600 rounded-full w-8 h-8 flex items-center justify-center"
        scratches={scratches?.['6']}
      />
      <ScratchesPopover
        className="absolute bottom-7 right-1/3 translate-x-1/2 border bg-gray-100 hover:shadow-md text-gray-600 rounded-full w-8 h-8 flex items-center justify-center"
        scratches={scratches?.['5']}
      />
    </div>
  );
}
