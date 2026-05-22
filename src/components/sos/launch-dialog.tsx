"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, URGENCIES, type Category, type Urgency } from "@/lib/types";
import { useStore } from "@/lib/store";

interface LaunchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TIME_OPTIONS = [10, 15, 30, 60];

export function LaunchDialog({ open, onOpenChange }: LaunchDialogProps) {
  const { launchSos } = useStore();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Deploy");
  const [urgency, setUrgency] = useState<Urgency>("High");
  const [timeNeededMinutes, setTimeNeededMinutes] = useState(15);
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [context, setContext] = useState("");

  function reset() {
    setTitle("");
    setCategory("Deploy");
    setUrgency("High");
    setTimeNeededMinutes(15);
    setRepoUrl("");
    setLiveUrl("");
    setContext("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !context.trim()) return;
    launchSos({
      title,
      category,
      urgency,
      timeNeededMinutes,
      repoUrl,
      liveUrl,
      context,
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Launch SOS</DialogTitle>
          <DialogDescription>
            Give helpers enough context to jump in fast.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sos-title">Problem title</Label>
            <Input
              id="sos-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={90}
              placeholder="Vercel env vars failing before deadline"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => v && setCategory(v as Category)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Urgency</Label>
              <Select value={urgency} onValueChange={(v) => v && setUrgency(v as Urgency)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {URGENCIES.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Time needed</Label>
              <Select
                value={String(timeNeededMinutes)}
                onValueChange={(v) => v && setTimeNeededMinutes(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((t) => (
                    <SelectItem key={t} value={String(t)}>
                      {t} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sos-repo">Repo URL</Label>
              <Input
                id="sos-repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sos-live">Live URL</Label>
              <Input
                id="sos-live"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sos-context">Context</Label>
            <Textarea
              id="sos-context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              required
              rows={4}
              placeholder="What changed, what you tried, and what error you see"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Launch SOS</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
