import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
}

const Image: React.FC<ImageProps> = ({ fallback, title, onError, ...restProps }) => {
  const [isError, setIsError] = React.useState(false);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    onError ? onError(event) : setIsError(true);
  };

  return (() => {
    if (isError || !restProps.src) {
      if (fallback) {
        return <>{fallback}</>;
      }
      if (title) {
        return (
          <div className="uppercase w-full h-full flex items-center justify-center bg-coal-600 text-white p-3 rounded-full">
            {title[0]}
          </div>
        );
      }
      return null;
    }

    return <img {...restProps} title={title} onError={handleError} />;
  })();
};

export default Image;
