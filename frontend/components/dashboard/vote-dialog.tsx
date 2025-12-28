"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{formatDate(date)}</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Did you feel closer or further from your Dec 31 identity?
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => onVote(date, "closer")}
            className="flex-1 h-12 text-base font-medium bg-green-500 hover:bg-green-600"
          >
            Closer
          </Button>
          <Button
            onClick={() => onVote(date, "further")}
            className="flex-1 h-12 text-base font-medium bg-red-500 hover:bg-red-600"
          >
            Further
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
