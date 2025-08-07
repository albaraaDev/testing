import { Link, Outlet } from 'react-router-dom';
import { Fragment } from 'react';
import { toAbsoluteUrl } from '@/utils';
import useBodyClasses from '@/hooks/useBodyClasses';
import { AuthBrandedLayoutProvider } from './AuthBrandedLayoutProvider';
import { getLogo } from '@/utils/getLogo';

const Layout = () => {
  // Applying body classes to manage the background color in dark mode
  useBodyClasses('dark:bg-coal-500');

  return (
    <Fragment>
      <style>
        {`
          .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/images/login/side-image.png')}');
          }
          // .dark .branded-bg {
          //   background-image: url('${toAbsoluteUrl('/media/images/2600x1600/1.svg')}');
          // }
          .brand-logo {
            background-image: url('${getLogo()}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
          }
        `}
      </style>

      <div className="grid lg:grid-cols-5 grow">
        <div className="flex flex-col justify-center lg:justify-start items-center p-4 sm:p-6 md:p-8 lg:p-10 order-2 lg:order-1 col-span-3 gap-8 lg:gap-12">
          <div className="object-contain bg-no-repeat brand-logo w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] lg:max-w-[420px] h-[180px] sm:h-[240px] md:h-[300px] lg:h-[375px] "></div>
          <Outlet />
        </div>

        <div className="lg:rounded-xl lg:border lg:border-gray-200 lg:m-5 order-1 lg:order-2 bg-top xxl:bg-center xl:bg-cover bg-no-repeat branded-bg col-span-2 hidden lg:block">
          <div className="flex flex-col p-8 lg:p-16 gap-4"></div>
        </div>
      </div>
    </Fragment>
  );
};

// AuthBrandedLayout component that wraps the Layout component with AuthBrandedLayoutProvider
const AuthBrandedLayout = () => (
  <AuthBrandedLayoutProvider>
    <Layout />
  </AuthBrandedLayoutProvider>
);

export { AuthBrandedLayout };
