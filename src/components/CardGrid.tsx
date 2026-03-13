import type { ReactNode } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

interface CardGridProps {
  isLoading: boolean;
  skeletonCount?: number;
  children: ReactNode;
}

const CardGrid: React.FC<CardGridProps> = ({
  isLoading,
  skeletonCount = 4,
  children,
}) => {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:mt-12 laptop:grid-cols-3 laptop:gap-6 desktop:grid-cols-4">
      {isLoading
        ? Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col rounded-xl border border-border bg-card p-6"
            >
              <div className="grow space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="mt-6 h-9 w-full" />
            </div>
          ))
        : children}
    </div>
  );
};

export default CardGrid;
