"use client";

import { Fragment } from "react";

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i;
const URL_RE = /(https?:\/\/[^\s)]+)/g;

type Segment =
  | { kind: "text"; value: string }
  | { kind: "code"; value: string }
  | { kind: "inline-code"; value: string }
  | { kind: "url"; value: string }
  | { kind: "image"; value: string };

function tokenize(body: string): Segment[] {
  const segments: Segment[] = [];
  const codeBlockRe = /```([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = codeBlockRe.exec(body))) {
    if (match.index > lastIndex) {
      pushText(body.slice(lastIndex, match.index));
    }
    segments.push({ kind: "code", value: match[1].replace(/^\n|\n$/g, "") });
    lastIndex = match.index + match[0].length;
  }
  pushText(body.slice(lastIndex));

  function pushText(chunk: string) {
    if (!chunk) return;
    const inlineRe = /`([^`\n]+)`/g;
    let textCursor = 0;
    let inlineMatch: RegExpExecArray | null;
    while ((inlineMatch = inlineRe.exec(chunk))) {
      if (inlineMatch.index > textCursor) {
        splitUrls(chunk.slice(textCursor, inlineMatch.index));
      }
      segments.push({ kind: "inline-code", value: inlineMatch[1] });
      textCursor = inlineMatch.index + inlineMatch[0].length;
    }
    if (textCursor < chunk.length) splitUrls(chunk.slice(textCursor));
  }

  function splitUrls(text: string) {
    if (!text) return;
    let urlCursor = 0;
    let urlMatch: RegExpExecArray | null;
    while ((urlMatch = URL_RE.exec(text))) {
      if (urlMatch.index > urlCursor) {
        segments.push({
          kind: "text",
          value: text.slice(urlCursor, urlMatch.index),
        });
      }
      const url = urlMatch[1];
      segments.push({
        kind: IMAGE_EXT.test(url) ? "image" : "url",
        value: url,
      });
      urlCursor = urlMatch.index + urlMatch[0].length;
    }
    if (urlCursor < text.length) {
      segments.push({ kind: "text", value: text.slice(urlCursor) });
    }
  }

  return segments;
}

interface MessageBodyProps {
  body: string;
  className?: string;
}

export function MessageBody({ body, className }: MessageBodyProps) {
  const segments = tokenize(body);
  return (
    <div className={className}>
      {segments.map((seg, i) => {
        if (seg.kind === "code") {
          return (
            <pre
              key={i}
              className="border-border bg-muted/60 my-2 overflow-x-auto rounded-md border p-3 font-mono text-[12px] leading-relaxed"
            >
              <code>{seg.value}</code>
            </pre>
          );
        }
        if (seg.kind === "inline-code") {
          return (
            <code
              key={i}
              className="bg-muted/70 rounded px-1 py-0.5 font-mono text-[12px]"
            >
              {seg.value}
            </code>
          );
        }
        if (seg.kind === "url") {
          return (
            <a
              key={i}
              href={seg.value}
              target="_blank"
              rel="noreferrer"
              className="text-foreground break-all underline-offset-2 hover:underline"
            >
              {seg.value}
            </a>
          );
        }
        if (seg.kind === "image") {
          return (
            <Fragment key={i}>
              <a
                href={seg.value}
                target="_blank"
                rel="noreferrer"
                className="border-border bg-muted/30 my-2 block max-w-md overflow-hidden rounded-md border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={seg.value}
                  alt=""
                  className="block max-h-80 w-full object-cover"
                  loading="lazy"
                />
              </a>
            </Fragment>
          );
        }
        return <Fragment key={i}>{seg.value}</Fragment>;
      })}
    </div>
  );
}
