import React, { useEffect, useRef } from 'react';

export interface WithInfiniteScrollProps {
  loadMore: () => void;
  hasMore: boolean;
  loaderThreshold?: number;
  loaderRootMargin?: string;
}

export function withInfiniteScroll<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const ComponentWithInfiniteScroll: React.FC<P & WithInfiniteScrollProps> = ({
    loadMore,
    hasMore,
    loaderThreshold = 1.0,
    loaderRootMargin = '0px',
    ...props
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const loaderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMore();
          }
        },
        {
          root: containerRef.current,
          rootMargin: loaderRootMargin,
          threshold: loaderThreshold
        }
      );

      const currentLoader = loaderRef.current;
      if (currentLoader) {
        observer.observe(currentLoader);
      }

      return () => {
        if (currentLoader) {
          observer.unobserve(currentLoader);
        }
      };
    }, [hasMore, loadMore, loaderThreshold, loaderRootMargin]);

    return (
      <div ref={containerRef}>
        <WrappedComponent {...(props as P)} />
        {hasMore ? (
          <div ref={loaderRef} className="text-center py-2">
            Loading...
          </div>
        ) : (
          <div className="text-center py-2">No more data</div>
        )}
      </div>
    );
  };

  return ComponentWithInfiniteScroll;
}
