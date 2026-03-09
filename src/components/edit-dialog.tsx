"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Save } from "lucide-react";
import type { Entry } from "@/lib/types";

interface Props {
  entry: Entry | null;
  open: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    data: {
      task: string;
      description: string;
      category: string;
      duration: number | null;
    },
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function EditDialog({ entry, open, onClose, onSave, onDelete }: Props) {
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sync fields when a new entry is opened
  useEffect(() => {
    if (entry) {
      setTask(entry.task);
      setDescription(entry.description);
      setCategory(entry.category);
      setDuration(entry.duration?.toString() ?? "");
    }
  }, [entry]);

  function handleClose() {
    setTask("");
    setDescription("");
    setCategory("");
    setDuration("");
    onClose();
  }

  async function handleSave() {
    if (!entry) return;
    setSaving(true);
    await onSave(entry.id, {
      task,
      description,
      category,
      duration: duration ? Number(duration) : null,
    });
    setSaving(false);
    handleClose();
  }

  async function handleDelete() {
    if (!entry) return;
    setDeleting(true);
    await onDelete(entry.id);
    setDeleting(false);
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Edit Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Task
            </label>
            <Input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="border-zinc-800 bg-zinc-900 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-zinc-800 bg-zinc-900 text-sm"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Category
              </label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border-zinc-800 bg-zinc-900 text-sm"
              />
            </div>
            <div className="w-28">
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Duration (min)
              </label>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                type="number"
                className="border-zinc-800 bg-zinc-900 text-sm"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 text-white hover:bg-indigo-500"
          >
            <Save className="mr-1 h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}