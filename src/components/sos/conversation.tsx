"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, Link as LinkIcon, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { broadcastTyping, useTypingIndicator } from "@/lib/presence";
import type { SosRequest } from "@/lib/types";
import { UserAvatar } from "./user-avatar";
import { Pill, UrgencyPill, StatusPill } from "./pills";
import { ResolveDialog } from "./resolve-dialog";
import { DeadlineCountdown } from "./deadline-countdown";
import { MessageBody } from "./message-body";
import { SocialShare } from "./social-share";
import { timeAgo } from "@/lib/format";

interface ConversationProps {
  sos: SosRequest | null;
  onBack?: () => void;
}

export function Conversation({ sos, onBack }: ConversationProps) {
  const { state, claimSos, addComment } = useStore();
  const [draft, setDraft] = useState("");
  const [resolveOpen, setResolveOpen] = useState(false);

  if (!sos) {
    return (
      <section className="bg-background flex h-full items-center justify-center">
        <div className="text-muted-foreground text-center text-sm">
          <p>Select a request to view the conversation.</p>
        </div>
      </section>
    );
  }

  const requester = state.users.find((u) => u.id === sos.requesterId);
  const isHelping = sos.helperIds.includes(state.currentUserId);
  const isRequester = sos.requesterId === state.currentUserId;
  const resolved = sos.status === "resolved";
  const [copied, setCopied] = useState(false);
  const typingUserIds = useTypingIndicator(sos?.id ?? null, state.currentUserId);
  const typingUsers = Array.from(typingUserIds)
    .map((id) => state.users.find((u) => u.id === id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  async function handleShare() {
    if (!sos) return;
    const url = `${window.location.origin}/board/${sos.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function buildShareUrl(): string {
    if (!sos) return "";
    const helper = sos.helperIds[0]
      ? state.users.find((u) => u.id === sos.helperIds[0])?.name
      : "";
    const minutes = sos.resolvedAt
      ? Math.max(
          1,
          Math.round(
            (new Date(sos.resolvedAt).getTime() -
              new Date(sos.createdAt).getTime()) /
              60000,
          ),
        )
      : 0;
    const params = new URLSearchParams({
      title: sos.title,
      fix: sos.fixNote ?? "",
      helper: helper ?? "",
      category: sos.category,
      minutes: String(minutes),
    });
    return `${window.location.origin}/api/og?${params.toString()}`;
  }

  function handleSend() {
    if (!sos) return;
    const body = draft.trim();
    if (!body) return;
    addComment(sos.id, body);
    setDraft("");
  }

  return (
    <section className="bg-background grid h-full min-h-0 grid-rows-[auto_1fr_auto]">
      <header className="border-border border-b px-6 py-5">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1 text-xs md:hidden"
          >
            <ArrowLeft className="size-3.5" />
            Back to board
          </button>
        ) : null}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-foreground text-lg font-semibold leading-tight">
              {sos.title}
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              {requester?.name ?? "Unknown"} · {timeAgo(sos.createdAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleShare}
              aria-label="Copy share link"
              title={copied ? "Link copied" : "Copy share link"}
            >
              <LinkIcon className="size-3.5" />
            </Button>
            {!resolved ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isHelping || isRequester}
                  onClick={() => claimSos(sos.id)}
                >
                  {isHelping ? "Helping" : isRequester ? "Your SOS" : "Claim"}
                </Button>
                <Button size="sm" onClick={() => setResolveOpen(true)}>
                  Resolve
                </Button>
              </>
            ) : null}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <UrgencyPill urgency={sos.urgency} />
          <Pill>{sos.category}</Pill>
          <StatusPill status={sos.status} />
          {sos.deadlineAt && !resolved ? (
            <DeadlineCountdown deadlineAt={sos.deadlineAt} />
          ) : null}
          {sos.githubIssueUrl ? (
            <a
              href={sos.githubIssueUrl}
              target="_blank"
              rel="noreferrer"
              className="border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-[11px] font-medium"
              title="Open linked GitHub issue"
            >
              <ExternalLink className="size-3 opacity-60" />
              {sos.githubIssueUrl.match(/issues\/(\d+)/)
                ? `#${sos.githubIssueUrl.match(/issues\/(\d+)/)![1]}`
                : "GitHub issue"}
            </a>
          ) : null}
          <span className="text-muted-foreground ml-1 text-xs">
            · {sos.timeNeededMinutes} min
          </span>
        </div>
      </header>

      <div className="min-h-0 space-y-5 overflow-y-auto px-6 py-5">
        <MessageRow
          author={requester?.name ?? "Unknown"}
          createdAt={sos.createdAt}
          user={requester ?? null}
        >
          {sos.context}
        </MessageRow>

        {sos.comments.map((comment) => {
          const user = state.users.find((u) => u.id === comment.userId);
          return (
            <MessageRow
              key={comment.id}
              author={user?.name ?? "Unknown"}
              createdAt={comment.createdAt}
              user={user ?? null}
            >
              {comment.body}
            </MessageRow>
          );
        })}

        {typingUsers.length > 0 && !resolved ? (
          <div className="text-muted-foreground ml-11 flex items-center gap-1.5 text-xs">
            <span className="flex gap-0.5">
              <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-current" />
            </span>
            {typingUsers[0].name}
            {typingUsers.length > 1 ? ` +${typingUsers.length - 1}` : ""} typing
          </div>
        ) : null}

        {sos.fixNote ? (
          <div className="ml-11 max-w-3xl">
            <div className="border-border bg-muted/30 rounded-lg border p-4">
              <div className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide">
                <CheckCircle2 className="size-3.5" />
                Final fix
              </div>
              <p className="text-foreground mt-2 text-sm leading-relaxed">
                {sos.fixNote}
              </p>
              {sos.fixCommitUrl ? (
                <a
                  href={sos.fixCommitUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground hover:underline mt-2 inline-flex items-center gap-1 text-xs"
                >
                  <ExternalLink className="size-3 opacity-60" />
                  {sos.fixCommitUrl.replace(/^https?:\/\//, "")}
                </a>
              ) : null}
              <a
                href={buildShareUrl()}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground ml-3 mt-2 inline-flex items-center gap-1 text-xs"
              >
                <ExternalLink className="size-3 opacity-60" />
                Open share card
              </a>
            </div>
            <SocialShare
              sos={sos}
              helpers={sos.helperIds
                .map((id) => state.users.find((u) => u.id === id))
                .filter((u): u is NonNullable<typeof u> => Boolean(u))}
              cohortName={state.cohort?.name ?? "Cohort SOS"}
            />
          </div>
        ) : null}
      </div>

      {!resolved ? (
        <footer className="bg-background border-border grid grid-cols-[1fr_auto] items-end gap-2 border-t px-4 py-3">
          <Textarea
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (sos) broadcastTyping(sos.id, state.currentUserId);
            }}
            placeholder="Reply with a clue, question, or next step"
            className="min-h-[60px] resize-y bg-background text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend} disabled={!draft.trim()}>
            <Send className="size-4" />
            Send
          </Button>
        </footer>
      ) : (
        <footer className="border-border text-muted-foreground border-t px-4 py-3 text-center text-xs">
          Resolved {timeAgo(sos.resolvedAt ?? sos.createdAt)}.
        </footer>
      )}

      <ResolveDialog
        sos={sos}
        open={resolveOpen}
        onOpenChange={setResolveOpen}
      />
    </section>
  );
}

interface MessageRowProps {
  author: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string } | null;
  children: React.ReactNode;
}

function MessageRow({ author, createdAt, user, children }: MessageRowProps) {
  return (
    <article className="grid grid-cols-[auto_1fr] gap-3">
      {user ? (
        <UserAvatar user={user as never} className="size-8 shrink-0" />
      ) : (
        <div className="bg-muted size-8 rounded-full" />
      )}
      <div className="min-w-0 max-w-3xl">
        <div className="flex items-baseline gap-2">
          <span className="text-foreground text-sm font-medium">{author}</span>
          <span className="text-muted-foreground text-xs">
            {timeAgo(createdAt)}
          </span>
        </div>
        <div className="text-foreground mt-1 text-sm leading-relaxed">
          {typeof children === "string" ? (
            <MessageBody body={children} />
          ) : (
            children
          )}
        </div>
      </div>
    </article>
  );
}

export { ExternalLink };
