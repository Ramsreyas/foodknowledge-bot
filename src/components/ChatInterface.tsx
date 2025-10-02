import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage } from './ChatMessage';
import { pipeline } from '@huggingface/transformers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ page: string; content: string; similarity: number }>;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingSoundRef = useRef<HTMLAudioElement | null>(null);
  const sendSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio elements for sound effects
    typingSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZLQ0RVKzn77RgGgg+lNjzy3oqBSl+zPHaizsIGGS57OihURELTKXk8bhkGwk7kdPzzHkpBSl+zPHaizsIGGS57OihURELTKXk8bhkGwk7kdPzzHkpBSl+zPHaizsIGGS57OihURELTKXk8bhkGwk7kdPzzHkpBSl+zPHaizsIGGS57OihURELTKXk8bhkGwk7kdPzzHkpBSl+zPHaizsIGGS57OihURELTKXk8bhkGwk7kdPzzHkpBSl+zPHaizsIGGS57OihURELTKXk8bhkGwk7kdPzzHkpBSl+zPHaizsIGGS57OihURELTKXk8bhkGw==');
    sendSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZLQ0RVKzn77RgGgg+lNjzy3oqBSl+zPHaizsIGGS57OihURELTKXk8bhkGwk7kdPzzHkpBSl+zPHaizsIGGS57OihURELTKXk8bhkGwk7kdPzzHkpBSl+zPHaizsIGGS57OihURELTKXk8bhkGwk7kdPzzHkpBSl+zPHaizsIGGS57OihURELTKXk8bhkGwk7kdPzzHkpBSl+zPHaizsIGGS57OihURELTKXk8bhkGwk7kdPzzHkpBSl+zPHaizsIGGS57OihURELTKXk8bhkGwk7kdPzzHkpBSl+zPHaizsIGGS57OihURELTKXk8bhkGw==');
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const playSound = (soundRef: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.volume = 0.3;
      soundRef.current.play().catch(() => {
        // Ignore errors if sound fails to play
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    playSound(sendSoundRef);

    try {
      // Generate embedding using Hugging Face transformers
      const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      const queryEmbedding = await pipe(input, {
        pooling: 'mean',
        normalize: true,
      });
      const embeddingArray = Array.from(queryEmbedding.data);

      playSound(typingSoundRef);

      // Call edge function with query and embedding
      const { data, error } = await supabase.functions.invoke('rag-chat', {
        body: { 
          query: input,
          embedding: embeddingArray
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response. Please try again.');
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your question. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border p-6">
        <h1 className="text-3xl font-mono font-bold text-foreground mb-1">
          Nutritional RAG-Chatbot
        </h1>
        <p className="text-muted-foreground font-sans font-light">
          Your personal nutrition expert.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <h2 className="text-xl font-mono font-bold text-foreground mb-2">
                Welcome! 👋
              </h2>
              <p className="text-muted-foreground font-sans">
                Ask me anything about nutrition, dietary guidelines, vitamins, minerals, or healthy eating habits.
              </p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-sm font-mono">AI</span>
            </div>
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground font-sans">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-6">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a nutrition question..."
            className="min-h-[60px] resize-none bg-secondary border-border font-sans"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 font-mono bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
