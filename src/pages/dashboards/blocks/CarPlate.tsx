import { DefaultTooltip } from '@/components';
import clsx from 'clsx';

export interface CarPlateProps {
  plate?: string;
  className?: string;
  showTooltip?: boolean;
}

export const CarPlate = ({ plate, className, showTooltip = false }: CarPlateProps) => {
  return (
    <div
      className={clsx('flex font-medium font-sans w-36', className)}
      style={{ direction: 'ltr' }}
    >
      <div className="flex items-center justify-center rounded-s-lg py-2 px-2 bg-[#5271FF] text-white">
        TR
      </div>
      <DefaultTooltip title={plate} placement="right" open={!showTooltip ? false : undefined}>
        <div className="w-full truncate font-monospace rounded-e-lg py-2 px-2 text-[1rem] text-gray-700 font-bold border-e border-t border-b border-[#F1F1F4] bg-white dark:bg-black dark:border-gray-200 dark:text-gray-50 text-nowrap">
          {plate}
        </div>
      </DefaultTooltip>
    </div>
  );
};
