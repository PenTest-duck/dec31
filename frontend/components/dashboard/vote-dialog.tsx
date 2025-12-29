"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/votes";

interface VoteDialogProps {
  date: string | null;
  currentVote?: "closer" | "further" | null;
  onVote: (date: string, vote: "closer" | "further") => void;
  onClear: (date: string) => void;
  onClose: () => void;
}

export function VoteDialog({ date, currentVote, onVote, onClear, onClose }: VoteDialogProps) {
  if (!date) return null;

  return (
    <Dialog open={!!date} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-lg text-white">{formatDate(date)}</DialogTitle>
          <DialogDescription className="text-sm text-zinc-400 pt-1">
            {currentVote 
              ? `Current vote: ${currentVote}. Change your vote?`
              : "Did you feel closer or further from your Dec 31 identity?"
            }
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onVote(date, "closer")}
            className={`flex-1 h-10 text-sm font-medium transition-colors ${
              currentVote === "closer" 
                ? "bg-green-600 text-black" 
                : "bg-green-500 hover:bg-green-600 text-black"
            }`}
          >
            Closer
          </button>
          <button
            onClick={() => onVote(date, "further")}
            className={`flex-1 h-10 text-sm font-medium transition-colors ${
              currentVote === "further" 
                ? "bg-red-600 text-white" 
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            Further
          </button>
          {currentVote && (
            <button
              onClick={() => onClear(date)}
              className="px-3 h-10 text-sm font-medium bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
