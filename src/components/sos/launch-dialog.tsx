"use client";

import { useState } from "react";
import { Sparkles, Wand2, Download, GitBranch } from "lucide-react";
import { parseError } from "@/lib/parse-error";
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
import { AiSuggestions } from "./ai-suggestions";

interface LaunchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TIME_OPTIONS = [10, 15, 30, 60];

const TEMPLATES: Record<Category, string> = {
  Auth: `What's happening:

Where it breaks (local / staging / prod):

What I've tried:

Error message / status:`,
  Deploy: `What I deployed:

Build log error:

Last working commit:

What I've tried:`,
  Frontend: `What the UI is doing:

Expected vs actual:

Component / file:

What I've tried:`,
  Backend: `Endpoint / function:

Expected vs actual response:

Logs:

What I've tried:`,
  Database: `Query / migration:

Error message:

Schema diff:

What I've tried:`,
  Design: `What I'm designing:

Constraint / brand rules:

Current attempt (link):

Specific feedback I want:`,
  Pitch: `Audience:

What I'm pitching (one line):

Specific section that feels off:

Link to current draft:`,
  Other: `What I'm trying to do:

What's blocking me:

What I've tried:`,
};

export function LaunchDialog({ open, onOpenChange }: LaunchDialogProps) {
  const { launchSos } = useStore();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Deploy");
  const [urgency, setUrgency] = useState<Urgency>("High");
  const [timeNeededMinutes, setTimeNeededMinutes] = useState(15);
  const [deadlineAt, setDeadlineAt] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [context, setContext] = useState("");
  const [issueUrl, setIssueUrl] = useState("");
  const [importStatus, setImportStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [importError, setImportError] = useState("");

  function reset() {
    setTitle("");
    setCategory("Deploy");
    setUrgency("High");
    setTimeNeededMinutes(15);
    setDeadlineAt("");
    setRepoUrl("");
    setLiveUrl("");
    setContext("");
    setIssueUrl("");
    setImportStatus("idle");
    setImportError("");
  }

  async function importFromGitHub() {
    const trimmed = issueUrl.trim();
    if (!trimmed) return;
    setImportStatus("loading");
    setImportError("");
    try {
      const res = await fetch(
        `/api/github/issue?url=${encodeURIComponent(trimmed)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error ?? `Error ${res.status}`);
        setImportStatus("error");
        return;
      }
      if (data.title && !title) setTitle(data.title.slice(0, 90));
      if (data.body) {
        setContext(
          [
            data.body,
            "",
            "·",
            `Imported from GitHub issue #${data.number} by @${data.author}`,
          ]
            .filter(Boolean)
            .join("\n"),
        );
      }
      if (data.repoUrl && !repoUrl) setRepoUrl(data.repoUrl);
      setImportStatus("idle");
    } catch (err) {
      setImportError((err as Error).message);
      setImportStatus("error");
    }
  }

  function applyTemplate() {
    setContext(TEMPLATES[category]);
  }

  function autoParseFromPaste(text: string) {
    if (text.length < 60) return;
    const parsed = parseError(text);
    if (parsed.title && !title) setTitle(parsed.title);
    if (parsed.category && category === "Deploy") setCategory(parsed.category);
    if (parsed.urgency && urgency !== "Deadline Panic") setUrgency(parsed.urgency);
  }

  const hasErrorShape = context.length > 60 && /\n|Error|error|\.tsx|\.ts/.test(context);
  function applyParser() {
    const parsed = parseError(context);
    if (parsed.title) setTitle(parsed.title);
    if (parsed.category) setCategory(parsed.category);
    if (parsed.urgency) setUrgency(parsed.urgency);
    if (parsed.context) setContext(parsed.context);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !context.trim()) return;
    launchSos({
      title,
      category,
      urgency,
      timeNeededMinutes,
      deadlineAt: deadlineAt ? new Date(deadlineAt).toISOString() : undefined,
      githubIssueUrl: issueUrl,
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
          <div className="border-border bg-muted/30 space-y-2 rounded-md border p-3">
            <Label htmlFor="sos-issue" className="text-xs">
              <GitBranch className="size-3" />
              Import from GitHub issue
              <span className="text-muted-foreground ml-1 font-normal">
                (optional)
              </span>
            </Label>
            <div className="flex gap-1.5">
              <Input
                id="sos-issue"
                value={issueUrl}
                onChange={(e) => {
                  setIssueUrl(e.target.value);
                  setImportError("");
                }}
                placeholder="https://github.com/owner/repo/issues/42"
                className="h-8 flex-1 text-xs"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={importFromGitHub}
                disabled={!issueUrl.trim() || importStatus === "loading"}
              >
                <Download className="size-3.5" />
                {importStatus === "loading" ? "Fetching…" : "Import"}
              </Button>
            </div>
            {importError ? (
              <p className="text-red-600 text-xs">{importError}</p>
            ) : null}
            <p className="text-muted-foreground text-[11px]">
              Pulls title, body, and repo URL from the issue. Public repos
              only (private repos need a token).
            </p>
          </div>

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

          <div className="space-y-1.5">
            <Label htmlFor="sos-deadline">
              Hard deadline
              <span className="text-muted-foreground ml-1.5 text-xs font-normal">
                (optional: when you must ship)
              </span>
            </Label>
            <Input
              id="sos-deadline"
              type="datetime-local"
              value={deadlineAt}
              onChange={(e) => setDeadlineAt(e.target.value)}
            />
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
            <div className="flex items-center justify-between">
              <Label htmlFor="sos-context">Context</Label>
              <div className="flex items-center gap-3">
                {hasErrorShape ? (
                  <button
                    type="button"
                    onClick={applyParser}
                    className="text-foreground hover:underline inline-flex items-center gap-1 text-xs font-medium"
                  >
                    <Wand2 className="size-3" />
                    Parse as error
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={applyTemplate}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
                >
                  <Sparkles className="size-3" />
                  Use {category} template
                </button>
              </div>
            </div>
            <Textarea
              id="sos-context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                autoParseFromPaste(text);
              }}
              required
              rows={6}
              placeholder="Paste an error or describe what's broken. We'll detect Cursor errors and auto-fill."
            />
          </div>

          <AiSuggestions query={`${title}\n${context}`} />

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
