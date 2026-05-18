import React from 'react';
import ReactMarkdown from 'react-markdown';

import { User, Bot } from 'lucide-react';
import { SkeletonMessage } from './SkeletonMessage';
import { StreamingText } from './StreamingText';
import { WidgetRenderer } from '../widgets/WidgetRenderer';





export function MessageItem({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full py-6 px-4 md:px-8 ${isUser ? 'bg-neutral-900/30' : 'bg-transparent'}`}>
      <div className="max-w-4xl mx-auto flex gap-4 w-full">
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>
        
        {/* Message Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {message.content &&
          <div className="prose prose-invert prose-p:leading-relaxed max-w-none text-sm text-neutral-200 break-words">
              {message.isStreaming ?
            <StreamingText content={message.content} /> :

            <ReactMarkdown>{message.content}</ReactMarkdown>
            }
            </div>
          }
          
          {/* Skeleton while streaming data widget */}
          {message.isStreaming && !message.content && !message.widget &&
          <SkeletonMessage />
          }

          {/* Structured JSON Widget */}
          {message.widget &&
          <div className="mt-2 w-full">
              <WidgetRenderer payload={message.widget} />
            </div>
          }
        </div>
      </div>
    </div>);

}