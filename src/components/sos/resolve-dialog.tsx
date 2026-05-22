"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useStore } from "@/lib/store";
import { celebrateResolve } from "@/lib/celebrate";
import {
  REWARD_POINTS,
  type RewardType,
  type SosRequest,
} from "@/lib/types";
import { labelReward } from "@/lib/format";
import { UserAvatar } from "./user-avatar";

interface ResolveDialogProps {
  sos: SosRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REWARD_TYPES = Object.keys(REWARD_POINTS) as RewardType[];

interface HelperSelection {
  enabled: boolean;
  rewardType: RewardType;
}

export function ResolveDialog({ sos, open, onOpenChange }: ResolveDialogProps) {
  const { state, resolveSos } = useStore();
  const [fixNote, setFixNote] = useState("");
  const [fixCommitUrl, setFixCommitUrl] = useState("");
  const [kudosMessage, setKudosMessage] = useState("");

  const helperCandidates = useMemo(() => {
    const ids = new Set<string>([state.currentUserId, ...sos.helperIds]);
    ids.delete(sos.requesterId);
    return Array.from(ids)
      .map((id) => state.users.find((u) => u.id === id))
      .filter((u): u is NonNullable<typeof u> => Boolean(u));
  }, [state.currentUserId, state.users, sos.helperIds, sos.requesterId]);

  const [helperState, setHelperState] = useState<Record<string, HelperSelection>>({});

  useEffect(() => {
    if (!open) return;
    setFixNote("");
    setFixCommitUrl("");
    setKudosMessage("");
    const initial: Record<string, HelperSelection> = {};
    helperCandidates.forEach((helper) => {
      initial[helper.id] = {
        enabled: sos.helperIds.includes(helper.id),
        rewardType: "unblocked",
      };
    });
    setHelperState(initial);
  }, [open, helperCandidates, sos.helperIds]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fixNote.trim()) return;
    const helpers = Object.entries(helperState)
      .filter(([, sel]) => sel.enabled)
      .map(([userId, sel]) => ({ userId, rewardType: sel.rewardType }));
    resolveSos({
      sosId: sos.id,
      fixNote,
      fixCommitUrl,
      kudosMessage,
      helpers,
    });
    onOpenChange(false);
    celebrateResolve();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Resolve SOS</DialogTitle>
          <DialogDescription>
            Credit helpers and save the fix for the next builder.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fix-note">Final fix note</Label>
            <Textarea
              id="fix-note"
              value={fixNote}
              onChange={(e) => setFixNote(e.target.value)}
              required
              rows={4}
              placeholder="What fixed it? Include concrete files, settings, or commands."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fix-commit">
              Proof of fix
              <span className="text-muted-foreground ml-1.5 text-xs font-normal">
                (optional — commit, PR, or screenshot URL)
              </span>
            </Label>
            <Input
              id="fix-commit"
              value={fixCommitUrl}
              onChange={(e) => setFixCommitUrl(e.target.value)}
              placeholder="https://github.com/org/repo/commit/abc1234"
            />
          </div>

          <div className="space-y-2">
            <Label>Credit helpers</Label>
            {helperCandidates.length === 0 ? (
              <div className="text-muted-foreground border-border bg-muted/30 rounded-md border border-dashed p-4 text-center text-sm">
                No helpers yet. Claim the SOS first to credit yourself.
              </div>
            ) : (
              <div className="space-y-2">
                {helperCandidates.map((helper) => {
                  const sel = helperState[helper.id];
                  if (!sel) return null;
                  return (
                    <div
                      key={helper.id}
                      className="border-border bg-card flex items-center gap-3 rounded-lg border p-2.5"
                    >
                      <input
                        id={`helper-${helper.id}`}
                        type="checkbox"
                        className="accent-primary size-4"
                        checked={sel.enabled}
                        onChange={(e) =>
                          setHelperState((prev) => ({
                            ...prev,
                            [helper.id]: {
                              ...prev[helper.id],
                              enabled: e.target.checked,
                            },
                          }))
                        }
                      />
                      <UserAvatar user={helper} className="size-7" />
                      <label
                        htmlFor={`helper-${helper.id}`}
                        className="min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="truncate text-sm font-medium">
                          {helper.name}
                        </div>
                        <div className="text-muted-foreground truncate text-xs">
                          @{helper.githubHandle}
                        </div>
                      </label>
                      <Select
                        value={sel.rewardType}
                        onValueChange={(v) => {
                          if (!v) return;
                          setHelperState((prev) => ({
                            ...prev,
                            [helper.id]: {
                              ...prev[helper.id],
                              rewardType: v as RewardType,
                            },
                          }));
                        }}
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REWARD_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {labelReward(type)} (+{REWARD_POINTS[type]})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kudos">Kudos message</Label>
            <Input
              id="kudos"
              value={kudosMessage}
              onChange={(e) => setKudosMessage(e.target.value)}
              placeholder="Harry fixed my Vercel env vars in 12 minutes."
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
            <Button type="submit">Save fix &amp; award rep</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
