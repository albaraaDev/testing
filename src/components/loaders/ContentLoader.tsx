import { CircularProgress } from '@mui/material';

const ContentLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center self-center relative">
      <CircularProgress color="primary" />
    </div>
  );
};

export { ContentLoader };
