import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function TimelineWidget({ data, title }) {
  const [expandedPhase, setExpandedPhase] = useState(null);
  
  if (!data || !data.steps) return null;

  return (
    <div className="w-full bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden my-4">
      <div className="bg-neutral-800 px-4 py-3 border-b border-neutral-700">
        <h3 className="text-sm font-semibold text-white">{title || 'Timeline'}</h3>
      </div>
      <div className="p-4 flex flex-col gap-0 md:flex-row md:overflow-x-auto scrollbar-hide pb-6">
        {data.steps.map((step, idx) => {
          const isExpanded = expandedPhase === idx;
          const statusColors = {
            active: 'bg-orange-500 border-orange-500 text-white',
            upcoming: 'bg-neutral-800 border-neutral-600 text-neutral-400',
            completed: 'bg-green-600 border-green-600 text-white',
          };
          const colorClass = step.status ? statusColors[step.status] : statusColors.upcoming;
          
          return (
            <div key={idx} className="relative flex md:flex-col items-start md:min-w-[160px] cursor-pointer group" onClick={() => setExpandedPhase(isExpanded ? null : idx)}>
              {/* Connector Line Mobile (Vertical) */}
              {idx < data.steps.length - 1 && (
                <div className="md:hidden absolute left-[15px] top-[30px] bottom-[-20px] w-0.5 bg-neutral-700 z-0"></div>
              )}
              {/* Connector Line Desktop (Horizontal) */}
              {idx < data.steps.length - 1 && (
                <div className="hidden md:block absolute top-[15px] left-[30px] right-[-10px] h-0.5 bg-neutral-700 z-0"></div>
              )}
              
              <div className="flex flex-col md:items-center relative z-10 w-full mb-4 md:mb-0">
                <div className="flex md:flex-col items-center md:justify-center w-full">
                  {/* Node */}
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shrink-0 ${colorClass} transition-transform group-hover:scale-110`}>
                    {idx + 1}
                  </div>
                  
                  {/* Title Mobile */}
                  <div className="ml-4 md:hidden flex-1">
                    <p className={`text-sm font-medium ${isExpanded ? 'text-white' : 'text-neutral-300'}`}>{step.title}</p>
                    <p className="text-xs text-neutral-500">{step.date || step.status}</p>
                  </div>
                </div>
                
                {/* Title Desktop */}
                <div className="hidden md:block mt-3 text-center px-2">
                  <p className={`text-xs font-medium line-clamp-2 ${isExpanded ? 'text-white' : 'text-neutral-300'}`}>{step.title}</p>
                  <p className="text-[10px] text-neutral-500 mt-1">{step.date || step.status}</p>
                </div>

                {/* Details / Description Expansion */}
                {isExpanded && (
                  <div className="md:absolute md:top-full md:left-1/2 md:-translate-x-1/2 md:mt-2 md:w-48 bg-neutral-800 border border-neutral-600 rounded-lg p-3 text-xs text-neutral-300 z-20 shadow-xl ml-12 md:ml-0 mt-2">
                    <p>{step.description}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
