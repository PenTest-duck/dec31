"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";

interface IdentityDisplayProps {
  identity: string;
  onUpdate: (newIdentity: string) => Promise<void>;
}

export function IdentityDisplay({ identity, onUpdate }: IdentityDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedIdentity, setEditedIdentity] = useState(identity);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setEditedIdentity(identity);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (editedIdentity.trim() !== identity) {
      setIsConfirming(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    await onUpdate(editedIdentity.trim());
    setIsSaving(false);
    setIsConfirming(false);
    setIsEditing(false);
  };

  return (
    <>
      <div className="group relative px-3 py-2 border border-zinc-800 bg-zinc-900/30 shrink-0">
        <p className="text-xs text-zinc-500 mb-1">Dec 31, 2026:</p>
        <p className="text-sm text-zinc-200 line-clamp-2">{identity}</p>
        <button
          onClick={handleEdit}
          className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-800"
          aria-label="Edit identity"
        >
          <Pencil className="h-3 w-3 text-zinc-500" />
        </button>
      </div>

      <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
        <DialogContent className="sm:max-w-lg bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Edit your Dec 31 identity</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Your identity should evolve as you grow. Make changes thoughtfully.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editedIdentity}
            onChange={(e) => setEditedIdentity(e.target.value)}
            className="min-h-[120px] text-sm bg-zinc-950 border-zinc-800 text-white"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)} className="border-zinc-700 text-zinc-300">
              Cancel
            </Button>
            <Button onClick={handleSaveClick}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirming} onOpenChange={(open) => !open && setIsConfirming(false)}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm identity change</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Changing your core identity is significant. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirming(false)} className="border-zinc-700 text-zinc-300">
              Go back
            </Button>
            <Button onClick={handleConfirmSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
