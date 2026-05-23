"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <div className="border-border text-muted-foreground mx-auto mb-6 inline-flex size-12 items-center justify-center rounded-full border">
          <AlertTriangle className="size-5" />
        </div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Something broke.
        </h1>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
          Cohort SOS hit an unexpected error. Try again, or head back to the
          board.
        </p>
        {error.digest ? (
          <p className="text-muted-foreground mt-4 font-mono text-[11px]">
            Reference: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button onClick={reset}>Try again</Button>
          <Link href="/board" className={buttonVariants({ variant: "outline" })}>
            Go to board
          </Link>
        </div>
      </div>
    </div>
  );
}
