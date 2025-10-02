import { User } from 'lucide-react';
import { CitationPopup } from './CitationPopup';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ page: string; content: string; similarity: number }>;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Extract citation numbers from the message content (if any)
  const renderContentWithCitations = () => {
    if (!message.sources || message.sources.length === 0) {
      return <p className="text-sm leading-relaxed font-sans whitespace-pre-wrap">{message.content}</p>;
    }

    // Split content and add citations at the end
    return (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed font-sans whitespace-pre-wrap">{message.content}</p>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground font-mono">Sources:</span>
          {message.sources.slice(0, 3).map((source, index) => (
            <CitationPopup
              key={index}
              citationNumber={index + 1}
              page={source.page}
              content={source.content}
              similarity={source.similarity}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-secondary' : 'bg-primary'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-foreground" />
        ) : (
          <span className="text-primary-foreground text-sm font-mono">AI</span>
        )}
      </div>

      {/* Message content */}
      <div className={`flex-1 ${
        isUser 
          ? 'bg-secondary border border-border rounded-lg p-4' 
          : 'bg-card border border-border rounded-lg p-4'
      }`}>
        {renderContentWithCitations()}
      </div>
    </div>
  );
}
