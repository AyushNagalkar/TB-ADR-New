import React from 'react';

export interface ChatBubbleProps {
  role: 'assistant' | 'patient';
  content: string;
  timestamp: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ role, content, timestamp }) => {
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex flex-col w-full max-w-[85%] ${isAssistant ? 'self-start' : 'self-start'} mb-4`}>
      <div
        className={`px-4 py-3 rounded-r rounded-bl ${
          isAssistant
            ? 'bg-bg border-l-2 border-primary text-ink'
            : 'bg-surface border-l-2 border-secondary text-ink'
        }`}
      >
        <p className="font-body text-base whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
      <span className="text-xs text-ink/40 font-body mt-1 ml-1">{timestamp}</span>
    </div>
  );
};
