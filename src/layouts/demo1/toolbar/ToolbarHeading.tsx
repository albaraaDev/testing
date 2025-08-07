import { ReactNode } from 'react';
import { useMenus } from '@/providers';
import { useMenuCurrentItem } from '@/components';
import { useLocation } from 'react-router';

export interface IToolbarHeadingProps {
  title?: string | ReactNode;
  description?: string | ReactNode;
  suffix?: ReactNode;
}

const ToolbarHeading = ({ title = '', description, suffix }: IToolbarHeadingProps) => {
  const { getMenuConfig } = useMenus();
  const { pathname } = useLocation();
  const currentMenuItem = useMenuCurrentItem(pathname, getMenuConfig('primary'));

  return (
    // space between title and suffix
    <div className="flex flex-row justify-between items-center gap-4 w-full">
      <div className="flex flex-col justify-center gap-2">
        <h1 className="text-xl font-medium leading-none text-gray-900">
          {title || currentMenuItem?.title}
        </h1>
        {description && (
          <div className="flex items-center gap-2 text-sm font-normal text-gray-700">
            {description}
          </div>
        )}
      </div>
      {suffix && <>{suffix}</>}
    </div>
  );
};

export { ToolbarHeading };
