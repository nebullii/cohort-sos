"use client";

import { useEffect, useState } from "react";
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
import { useStore } from "@/lib/store";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { state, updateProfile, updateCohort } = useStore();
  const me = state.users.find((u) => u.id === state.currentUserId);

  const [name, setName] = useState(me?.name ?? "");
  const [handle, setHandle] = useState(me?.githubHandle ?? "");
  const [skills, setSkills] = useState((me?.skills ?? []).join(", "));
  const [cohortName, setCohortName] = useState(state.cohort.name);
  const [cohortMotto, setCohortMotto] = useState(state.cohort.motto);

  useEffect(() => {
    if (!open) return;
    setName(me?.name ?? "");
    setHandle(me?.githubHandle ?? "");
    setSkills((me?.skills ?? []).join(", "));
    setCohortName(state.cohort.name);
    setCohortMotto(state.cohort.motto);
  }, [open, me, state.cohort]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      githubHandle: handle.trim().replace(/^@/, ""),
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    updateCohort({
      name: cohortName.trim(),
      motto: cohortMotto.trim(),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Your profile</DialogTitle>
          <DialogDescription>
            How the rest of your cohort sees you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-handle">GitHub handle</Label>
            <Input
              id="profile-handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@yourhandle"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-skills">Skills</Label>
            <Input
              id="profile-skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Frontend, Auth, Deploy"
            />
            <p className="text-muted-foreground text-xs">
              Comma-separated. We&apos;ll match you to SOSes in these areas.
            </p>
          </div>

          <div className="border-border space-y-4 border-t pt-4">
            <h3 className="text-foreground text-sm font-semibold">Cohort</h3>
            <div className="space-y-1.5">
              <Label htmlFor="cohort-name">Cohort name</Label>
              <Input
                id="cohort-name"
                value={cohortName}
                onChange={(e) => setCohortName(e.target.value)}
                placeholder="Cohort 26"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cohort-motto">Cohort motto</Label>
              <Input
                id="cohort-motto"
                value={cohortMotto}
                onChange={(e) => setCohortMotto(e.target.value)}
                placeholder="Ship together, get unblocked together."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
