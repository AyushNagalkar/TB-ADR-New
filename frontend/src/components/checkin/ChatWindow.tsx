import React, { useRef, useEffect, useState } from 'react';
import { ChatBubble } from '../ui/ChatBubble';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ChatMessage } from '../../types';
import { Send } from 'lucide-react';

export interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage?: (content: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-[600px] border border-line rounded bg-surface">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}
        <div ref={endOfMessagesRef} />
      </div>
      <div className="p-4 border-t border-line bg-bg">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" variant="primary" size="md">
            <Send size={18} className="mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
