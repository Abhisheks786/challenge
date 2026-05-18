import React from 'react';
import ReactMarkdown from 'react-markdown';





export function StreamingText({ content }) {
  return (
    <div className="relative">
      <ReactMarkdown>{content}</ReactMarkdown>
      {/* Blinking cursor for streaming effect */}
      <span className="inline-block w-1.5 h-4 ml-1 bg-orange-500 animate-pulse align-middle" />
    </div>);

}