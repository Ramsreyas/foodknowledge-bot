import { useState } from 'react';
import { FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CitationPopupProps {
  citationNumber: number;
  page: string;
  content: string;
  similarity: number;
}

export function CitationPopup({ citationNumber, page, content, similarity }: CitationPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-colors"
      >
        <FileText className="w-3 h-3 text-primary" />
        <span className="text-xs font-mono text-primary">[{citationNumber}]</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between font-mono">
              <span>Source Citation [{citationNumber}]</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-mono">
                  Page: <span className="text-foreground">{page}</span>
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  Relevance: <span className="text-primary">{(similarity * 100).toFixed(1)}%</span>
                </p>
              </div>
            </div>

            <div className="bg-secondary/50 border border-border rounded-lg p-4">
              <p className="text-sm leading-relaxed font-sans text-foreground whitespace-pre-wrap">
                {content}
              </p>
            </div>

            <div className="text-xs text-muted-foreground font-mono">
              This excerpt was retrieved from the nutritional knowledge base and used to generate the response.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
