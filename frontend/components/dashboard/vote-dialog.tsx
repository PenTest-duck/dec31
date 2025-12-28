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
  onVote: (date: string, vote: "closer" | "further") => void;
  onClose: () => void;
}

export function VoteDialog({ date, onVote, onClose }: VoteDialogProps) {
  if (!date) return null;

  return (
    <Dialog open={!!date} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-lg text-white">{formatDate(date)}</DialogTitle>
          <DialogDescription className="text-sm text-zinc-400 pt-1">
            Did you feel closer or further from your Dec 31 identity?
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onVote(date, "closer")}
            className="flex-1 h-10 text-sm font-medium bg-green-500 hover:bg-green-600 text-black transition-colors"
          >
            Closer
          </button>
          <button
            onClick={() => onVote(date, "further")}
            className="flex-1 h-10 text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            Further
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
