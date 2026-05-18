import React from 'react';

// Animated skeleton loader for AI messages still loading
// Uses the custom `.skeleton` class from index.css
export function SkeletonMessage() {
  return (
    <div className="flex flex-col gap-2.5 w-full max-w-md py-1">
      <div className="skeleton h-3.5 w-3/4"></div>
      <div className="skeleton h-3.5 w-1/2"></div>
      <div className="skeleton h-3.5 w-5/6"></div>
    </div>
  );
}