import React, { useState } from 'react';

export function CitationBubble({ citation }) {
  const [isHovered, setIsHovered] = useState(false);

  if (!citation) return null;

  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => window.open(citation.url, '_blank')}
        className="text-[10px] bg-neutral-800 border border-neutral-600 hover:border-orange-500 hover:text-orange-400 text-neutral-400 rounded-full w-4 h-4 flex items-center justify-center -translate-y-2 cursor-pointer transition-colors"
      >
        i
      </button>

      {isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-neutral-800 text-xs text-neutral-300 p-2 rounded shadow-lg border border-neutral-700 z-50 pointer-events-none">
          <p className="font-semibold text-white truncate">{citation.title}</p>
          <p className="text-[10px] text-neutral-500 truncate">{new URL(citation.url).hostname}</p>
          {citation.relevance && (
            <p className="text-[10px] text-orange-400 mt-1">Relevance: {Math.round(citation.relevance * 100)}%</p>
          )}
          {/* Triangle pointing down */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-neutral-700"></div>
        </div>
      )}
    </span>
  );
}
