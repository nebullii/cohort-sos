import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  LifeBuoy,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="border-border border-b">
        <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between px-4 md:px-6">
          <Link
            href="/"
            className="text-foreground flex items-center gap-2 text-[15px] font-semibold tracking-tight"
          >
            <span className="bg-foreground size-2 rounded-full" />
            Cohort SOS
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="https://github.com/nebullii/cohort-sos"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground hidden text-sm sm:inline-block"
            >
              GitHub
            </Link>
            <Link href="/board" className={buttonVariants({ size: "sm" })}>
              Open app <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-20 md:px-6 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="border-border bg-muted/40 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
            <span className="bg-emerald-500 size-1.5 rounded-full" />
            Live for cohorts and hackathons
          </div>
          <h1 className="text-foreground mt-6 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Unblock stuck builders
            <br className="hidden sm:block" /> in minutes.
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg">
            Cohort SOS is a rescue network for blocked builders. Launch a
            30-second SOS, get unstuck fast, and turn every fix into searchable
            cohort memory.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <Link href="/board" className={buttonVariants({ size: "lg" })}>
              Try it — no signup <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/knowledge"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              See solved fixes
            </Link>
          </div>
        </div>

        {/* Product shot */}
        <div className="border-border bg-card mx-auto mt-16 max-w-5xl overflow-hidden rounded-xl border shadow-sm">
          <div className="border-border bg-muted/30 flex items-center gap-1.5 border-b px-3 py-2">
            <span className="size-2.5 rounded-full bg-red-400/70" />
            <span className="size-2.5 rounded-full bg-amber-400/70" />
            <span className="size-2.5 rounded-full bg-emerald-400/70" />
            <span className="text-muted-foreground ml-3 text-xs">
              cohort-sos.vercel.app/board
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)_220px]">
            {/* Mock list */}
            <div className="border-border border-r p-4">
              <div className="text-foreground text-xs font-semibold">
                Help Board
              </div>
              <div className="text-muted-foreground mt-1 text-[10px]">
                4 active · 8 solved
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { d: "red", t: "Stripe webhook 401 from ngrok" },
                  { d: "amber", t: "Prisma migrate failing on Neon" },
                  { d: "blue", t: "Tailwind missing after deploy" },
                  { d: "green", t: "Mobile cards overflow" },
                ].map((row, i) => (
                  <div
                    key={i}
                    className={
                      "border-border border-b pb-3 last:border-b-0 last:pb-0 " +
                      (i === 0 ? "opacity-100" : "opacity-70")
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          "size-1.5 rounded-full " +
                          (row.d === "red"
                            ? "bg-red-500"
                            : row.d === "amber"
                              ? "bg-amber-500"
                              : row.d === "blue"
                                ? "bg-foreground"
                                : "bg-emerald-500")
                        }
                      />
                      <span className="text-foreground text-xs font-medium">
                        {row.t}
                      </span>
                    </div>
                    <div className="text-muted-foreground mt-1 text-[10px]">
                      {["Maya", "Bo", "Harry", "Ari"][i]} · {[3, 8, 28, 45][i]}m ago
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Mock conversation */}
            <div className="p-5">
              <div className="text-foreground text-sm font-semibold">
                Stripe webhook 401 from ngrok
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <span className="border-red-200 text-red-700 inline-flex items-center gap-1 rounded-full border bg-background px-1.5 py-0.5 text-[10px] font-medium">
                  <span className="size-1 rounded-full bg-red-500" /> Deadline
                  Panic
                </span>
                <span className="border-border text-muted-foreground inline-flex items-center rounded-full border bg-background px-1.5 py-0.5 text-[10px] font-medium">
                  Backend
                </span>
              </div>
              <div className="mt-5 space-y-3 text-xs">
                <div className="flex gap-2">
                  <div className="bg-muted size-6 shrink-0 rounded-full" />
                  <div>
                    <div className="text-foreground font-medium">
                      Ari · 3m ago
                    </div>
                    <p className="text-foreground mt-0.5 leading-relaxed">
                      Stripe says 401. STRIPE_WEBHOOK_SECRET is set. Suspect raw
                      body parsing in App Router.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="bg-muted size-6 shrink-0 rounded-full" />
                  <div>
                    <div className="text-foreground font-medium">
                      Harry · 1m ago
                    </div>
                    <p className="text-foreground mt-0.5 leading-relaxed">
                      In App Router you need to read the raw body via
                      <code className="bg-muted mx-1 rounded px-1 py-0.5 text-[10px]">
                        await req.text()
                      </code>
                      before parsing. Don&apos;t use
                      <code className="bg-muted mx-1 rounded px-1 py-0.5 text-[10px]">
                        await req.json()
                      </code>
                      — it consumes the stream.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Mock context */}
            <div className="border-border hidden border-l p-4 md:block">
              <div className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">
                Top Rescuers
              </div>
              <div className="mt-3 space-y-2 text-xs">
                {[
                  ["Harry", 34],
                  ["Neha", 28],
                  ["Bo", 24],
                ].map(([name, rep], i) => (
                  <div key={name as string} className="flex items-center gap-2">
                    <span className="text-muted-foreground w-3 text-[10px]">
                      {i + 1}
                    </span>
                    <span className="text-foreground flex-1 truncate">
                      {name}
                    </span>
                    <span className="text-foreground font-medium">{rep}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-border border-y bg-muted/20">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-20 md:px-6">
          <div className="max-w-2xl">
            <h2 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
              How it works
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Four steps. Every rescue triples in value — requester ships,
              helper earns rep, cohort gets a permanent fix.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                icon: LifeBuoy,
                title: "Launch",
                body: "Hit ⌘N. Pick a category, pick a template, drop your context. 30 seconds.",
              },
              {
                n: "02",
                icon: MessageSquare,
                title: "Claim",
                body: "Helpers with matching skills see your SOS, claim it, and reply with clues.",
              },
              {
                n: "03",
                icon: CheckCircle2,
                title: "Resolve",
                body: "Write the fix note, link the commit, credit your rescuers, send kudos.",
              },
              {
                n: "04",
                icon: Sparkles,
                title: "Compound",
                body: "Every resolved SOS becomes a searchable fix. The cohort gets smarter every day.",
              },
            ].map(({ n, icon: Icon, title, body }) => (
              <div
                key={n}
                className="border-border bg-background rounded-lg border p-5"
              >
                <div className="flex items-center justify-between">
                  <Icon className="text-foreground size-5" />
                  <span className="text-muted-foreground text-xs font-medium tabular-nums">
                    {n}
                  </span>
                </div>
                <div className="text-foreground mt-4 font-semibold">{title}</div>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quotes */}
      <section className="mx-auto w-full max-w-[1200px] px-4 py-20 md:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              q: "Harry fixed my Vercel env vars in 12 minutes. The cohort just paid for itself.",
              w: "Maya · Frontend",
            },
            {
              q: "Used to die in Slack. Now every fix is a search away.",
              w: "Bo · Backend",
            },
            {
              q: "I love that helping someone earns rep. Suddenly the whole cohort is online.",
              w: "Neha · Full-stack",
            },
          ].map(({ q, w }) => (
            <figure
              key={w}
              className="border-border bg-background rounded-lg border p-6"
            >
              <blockquote className="text-foreground text-sm leading-relaxed">
                “{q}”
              </blockquote>
              <figcaption className="text-muted-foreground mt-3 text-xs">
                — {w}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-border border-t">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-20 text-center md:px-6">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Start your cohort&apos;s rescue network.
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm">
            Free during beta. No signup. Open the board, launch your first SOS,
            and watch your cohort go from blocked to unstuck.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <Link href="/board" className={buttonVariants({ size: "lg" })}>
              Open the board <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/leaderboard"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              See the leaderboard
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-border border-t">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-3 px-4 py-6 text-xs md:flex-row md:px-6">
          <span className="text-muted-foreground">
            © {new Date().getFullYear()} Cohort SOS — built for builders who
            help each other.
          </span>
          <div className="text-muted-foreground flex items-center gap-4">
            <Link
              href="https://github.com/nebullii/cohort-sos"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </Link>
            <Link href="/knowledge" className="hover:text-foreground">
              Knowledge Base
            </Link>
            <Link href="/leaderboard" className="hover:text-foreground">
              Leaderboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
