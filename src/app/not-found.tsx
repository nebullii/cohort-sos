import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <div className="border-border text-muted-foreground mx-auto mb-6 inline-flex size-12 items-center justify-center rounded-full border">
          <Compass className="size-5" />
        </div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Lost in the cohort.
        </h1>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
          That page doesn&apos;t exist. Maybe it was never launched, or it&apos;s
          already been resolved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Link href="/board" className={buttonVariants()}>
            Open the board
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
