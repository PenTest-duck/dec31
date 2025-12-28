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
      <div className="group relative p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
          On Dec 31, 2026, I am:
        </p>
        <p className="text-base text-black dark:text-white whitespace-pre-wrap">
          {identity}
        </p>
        <button
          onClick={handleEdit}
          className="absolute top-4 right-4 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-200 dark:hover:bg-zinc-800"
          aria-label="Edit identity"
        >
          <Pencil className="h-4 w-4 text-zinc-500" />
        </button>
      </div>

      <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit your Dec 31 identity</DialogTitle>
            <DialogDescription>
              Your identity should evolve as you grow. Make changes thoughtfully.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editedIdentity}
            onChange={(e) => setEditedIdentity(e.target.value)}
            className="min-h-[160px] text-base"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveClick}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirming} onOpenChange={(open) => !open && setIsConfirming(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm identity change</DialogTitle>
            <DialogDescription>
              Changing your core identity is significant. Are you sure this new
              identity represents who you are becoming?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirming(false)}>
              Go back
            </Button>
            <Button onClick={handleConfirmSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Yes, update my identity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
