import React from 'react';

interface LoadingSkeletonProps {
  message?: string;
  percent?: number;
}

export default function LoadingSkeleton({
  message = 'Reading resume lines against Junior Frontend Developer benchmark...',
  percent = 64
}: LoadingSkeletonProps) {
  return (
    <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-variant">
      <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-mono text-primary font-semibold text-xs uppercase tracking-wider">Parsing</span>
        </div>
        <span className="font-mono text-xs text-on-surface-variant">Live Calibration</span>
      </div>

      <div className="p-6 md:p-8 flex flex-col gap-6">
        {/* Header skeleton block */}
        <div className="flex flex-col gap-2">
          <div className="h-6 w-3/5 bg-surface-container-high rounded animate-pulse"></div>
          <div className="h-4 w-4/5 bg-surface-container rounded animate-pulse"></div>
        </div>

        {/* Metric cards skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col gap-2">
            <div className="h-3 w-1/2 bg-surface-container-high rounded animate-pulse"></div>
            <div className="h-6 w-2/3 bg-surface-container rounded animate-pulse"></div>
          </div>
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col gap-2">
            <div className="h-3 w-1/2 bg-surface-container-high rounded animate-pulse"></div>
            <div className="h-6 w-2/3 bg-surface-container rounded animate-pulse"></div>
          </div>
          <div className="bg-surface-container-low p-3 rounded-lg flex flex-col gap-2">
            <div className="h-3 w-1/2 bg-surface-container-high rounded animate-pulse"></div>
            <div className="h-6 w-2/3 bg-surface-container rounded animate-pulse"></div>
          </div>
        </div>

        {/* 3 row skeletons with calm tone */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-container-low p-4 rounded-lg flex items-center justify-between">
              <div className="flex flex-col gap-2 w-3/4">
                <div className="h-4 w-1/3 bg-surface-container-high rounded animate-pulse"></div>
                <div className="h-3 w-2/3 bg-surface-container rounded animate-pulse"></div>
              </div>
              <div className="h-6 w-16 bg-surface-container-high rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Quiet status label */}
        <div className="pt-3 bg-surface-container-low rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border border-surface-variant/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">hourglass_empty</span>
            <span className="font-mono text-xs text-on-surface">{message}</span>
          </div>
          <span className="font-mono text-xs text-on-surface-variant">{percent}% complete</span>
        </div>
      </div>
    </div>
  );
}
