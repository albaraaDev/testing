import { ReactElement, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useAuthContext } from '@/auth';
import { useLoaders } from '@/providers';
import { AppRoutingSetup } from '.';
import { useInvalidateCoreData } from '@/api';

const AppRouting = (): ReactElement => {
  const { setProgressBarLoader } = useLoaders();
  const { verify } = useAuthContext();
  const [previousLocation, setPreviousLocation] = useState('');
  const location = useLocation();
  const path = location.pathname.trim();
  const { invalidate } = useInvalidateCoreData();

  const init = async () => {
    try {
      if (verify) {
        await verify();
      }
    } catch {
      throw new Error('Something went wrong!');
    }
  };

  const initLocation = async () => {
    setProgressBarLoader(true);

    setPreviousLocation(path);

    if (path === previousLocation) {
      setPreviousLocation('');
    }
  };

  useEffect(() => {
    initLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // this triggers the initial data load and sets up the routing
  // which means it also triggers on the refresh of the page
  useEffect(() => {
    // as it triggers on the refresh of the page, we need to
    // invalidate our core data to ensure we have the latest data
    // so by default we set them to have a short cache duration,
    // and we invalidate them on every page load, but NOT on every route change
    invalidate();
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setProgressBarLoader(false);

    // Scroll to page top on route change if URL does not contain a hash
    if (!CSS.escape(window.location.hash)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousLocation]);

  return <AppRoutingSetup />;
};

export { AppRouting };
