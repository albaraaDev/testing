import { ReplayProvider } from './providers/ReplayContext';
import { ReplayMap } from './ReplayMap';

const ReplayPage = () => {
  return (
    <div className="size-full">
      <ReplayProvider>
        <ReplayMap />
      </ReplayProvider>
    </div>
  );
};

export { ReplayPage };
