import React from 'react';
import { useElectionStore, selectCurrentPath } from '../../store/useElectionStore';

export function LearningPathBar() {
  const currentPath = useElectionStore(selectCurrentPath);
  
  // Mock data for the path - in a real scenario we'd fetch this from the API or store based on currentPath
  const pathData = currentPath ? {
    title: 'Indian Electoral System',
    step: 3,
    totalSteps: 5,
    topic: 'Coalition Governments'
  } : null;

  if (!pathData) return null;

  const progress = (pathData.step / pathData.totalSteps) * 100;

  return (
    <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-2 flex items-center gap-4 sticky top-14 z-30 shadow-sm">
      <div className="hidden sm:block text-xs font-semibold text-neutral-400">
        Learning Path
      </div>
      <div className="flex-1 max-w-2xl">
        <div className="flex justify-between items-end mb-1 text-[10px]">
          <span className="text-orange-400 font-medium">
            {pathData.title} <span className="text-neutral-500 mx-1">&gt;</span> <span className="text-neutral-300">{pathData.topic}</span>
          </span>
          <span className="text-neutral-500">Step {pathData.step} of {pathData.totalSteps}</span>
        </div>
        <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
}
