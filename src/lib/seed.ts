import type { CohortState, SosComment, Reward, RewardType } from "./types";
import { REWARD_POINTS } from "./types";

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function comment(
  id: string,
  userId: string,
  body: string,
  minutes: number,
): SosComment {
  return { id, userId, body, createdAt: minutesAgo(minutes) };
}

function reward(
  id: string,
  sosId: string,
  fromUserId: string,
  toUserId: string,
  type: RewardType,
  kudosMessage: string,
): Reward {
  return {
    id,
    sosId,
    fromUserId,
    toUserId,
    type,
    points: REWARD_POINTS[type],
    kudosMessage,
    createdAt: minutesAgo(350),
  };
}

export function createSeed(): CohortState {
  return {
    currentUserId: "u1",
    cohort: {
      name: "Cohort 26",
      motto: "Ship together, get unblocked together.",
      startedAt: hoursAgo(24 * 14),
    },
    users: [
      {
        id: "u1",
        name: "Neha Chaudhari",
        githubHandle: "nebullii",
        avatarUrl: "",
        skills: ["Frontend", "Deploy", "Pitch"],
        rescueRep: 28,
      },
      {
        id: "u2",
        name: "Harry Joshi",
        githubHandle: "HarryJ12",
        avatarUrl: "",
        skills: ["Backend", "Database"],
        rescueRep: 34,
      },
      {
        id: "u3",
        name: "Bo Wu",
        githubHandle: "dengziwu123",
        avatarUrl: "",
        skills: ["Auth", "Supabase"],
        rescueRep: 24,
      },
      {
        id: "u4",
        name: "Maya Patel",
        githubHandle: "mayabuilds",
        avatarUrl: "",
        skills: ["Design", "Frontend"],
        rescueRep: 19,
      },
      {
        id: "u5",
        name: "Sam Rivera",
        githubHandle: "samships",
        avatarUrl: "",
        skills: ["Deploy", "Testing"],
        rescueRep: 16,
      },
      {
        id: "u6",
        name: "Ari Kim",
        githubHandle: "arikim",
        avatarUrl: "",
        skills: ["Pitch", "UX"],
        rescueRep: 12,
      },
    ],
    sosRequests: [
      {
        id: "s1",
        title: "Supabase GitHub OAuth redirect broken on Vercel",
        category: "Auth",
        urgency: "Deadline Panic",
        status: "claimed",
        requesterId: "u4",
        helperIds: ["u3"],
        context:
          "Login works locally, but production redirects back to localhost after GitHub auth. Need a second pair of eyes before the submission window closes.",
        repoUrl: "https://github.com/mayabuilds/cohort-auth",
        liveUrl: "https://cohort-auth.vercel.app",
        timeNeededMinutes: 15,
        createdAt: minutesAgo(12),
        comments: [
          comment(
            "c1",
            "u3",
            "Check Supabase URL Configuration and the GitHub OAuth callback. This usually means Site URL or redirect allow list is stale.",
            9,
          ),
        ],
        rewards: [],
      },
      {
        id: "s2",
        title: "Tailwind styles missing after deploy",
        category: "Deploy",
        urgency: "High",
        status: "open",
        requesterId: "u2",
        helperIds: [],
        context:
          "The app is styled locally but looks unstyled on Vercel. I suspect the content paths or build output are wrong.",
        repoUrl: "https://github.com/HarryJ12/week2-comms",
        liveUrl: "https://week2-comms.vercel.app",
        timeNeededMinutes: 10,
        createdAt: minutesAgo(28),
        comments: [],
        rewards: [],
      },
      {
        id: "s3",
        title: "Need feedback on Loom pitch before submission",
        category: "Pitch",
        urgency: "Medium",
        status: "open",
        requesterId: "u5",
        helperIds: [],
        context:
          "The demo works, but the pitch feels flat. Need someone to tell me what to cut and how to make the wedge clearer.",
        repoUrl: "",
        liveUrl: "https://builder-comms.vercel.app",
        timeNeededMinutes: 30,
        createdAt: minutesAgo(45),
        comments: [],
        rewards: [],
      },
      {
        id: "s5",
        title: "Prisma migrate failing on Neon — column already exists",
        category: "Database",
        urgency: "High",
        status: "open",
        requesterId: "u4",
        helperIds: [],
        context:
          "I added a new column locally and ran `prisma migrate dev`. Now on Neon prod, `migrate deploy` fails with 'column already exists'. Did I break shadow DB? Migration history looks fine.",
        repoUrl: "https://github.com/mayabuilds/cohort-data",
        liveUrl: "",
        timeNeededMinutes: 15,
        createdAt: minutesAgo(8),
        comments: [],
        rewards: [],
      },
      {
        id: "s6",
        title: "Stripe webhook 401 from local ngrok tunnel",
        category: "Backend",
        urgency: "Medium",
        status: "open",
        requesterId: "u6",
        helperIds: [],
        context:
          "Webhook signature verification fails locally. Stripe dashboard shows 401. STRIPE_WEBHOOK_SECRET is set. Suspect raw body vs parsed body issue in Next.js App Router.",
        repoUrl: "https://github.com/arikim/cohort-billing",
        liveUrl: "",
        timeNeededMinutes: 20,
        createdAt: minutesAgo(34),
        comments: [],
        rewards: [],
      },
      {
        id: "s7",
        title: "Demo video has 8s of dead air — need a tighter cut",
        category: "Pitch",
        urgency: "Low",
        status: "resolved",
        requesterId: "u2",
        helperIds: ["u6"],
        context:
          "Loom is 2:14 but the first 8 seconds feel slow. I have 90 minutes left and can't tell what to cut.",
        repoUrl: "",
        liveUrl: "https://www.loom.com/share/example",
        timeNeededMinutes: 15,
        createdAt: hoursAgo(14),
        resolvedAt: hoursAgo(13),
        fixNote:
          "Cut the intro slide entirely and started on the live product. New opening: 'This is what happens when a builder in our cohort gets stuck.' Cut total down to 1:48.",
        comments: [
          comment(
            "c4",
            "u6",
            "Open on the product, not the problem statement. The problem reveals itself.",
            820,
          ),
        ],
        rewards: [
          reward(
            "r3",
            "s7",
            "u2",
            "u6",
            "unblocked",
            "Ari cut 26 seconds in 5 minutes.",
          ),
        ],
      },
      {
        id: "s4",
        title: "Mobile layout broken on project cards",
        category: "Frontend",
        urgency: "Low",
        status: "resolved",
        requesterId: "u6",
        helperIds: ["u1", "u4"],
        context:
          "Cards overflow on iPhone width and buttons overlap the project description.",
        repoUrl: "https://github.com/arikim/project-wall",
        liveUrl: "https://project-wall.vercel.app",
        timeNeededMinutes: 20,
        createdAt: hoursAgo(7),
        resolvedAt: hoursAgo(6),
        fixNote:
          "The card grid used fixed columns and a long unbreakable URL. We changed the layout to one column below 640px, added min-width: 0 to the card body, and used overflow-wrap: anywhere on links.",
        fixCommitUrl: "https://github.com/arikim/project-wall/commit/9d5ba31",
        comments: [
          comment(
            "c2",
            "u1",
            "The grid child needs min-width: 0 or text refuses to shrink inside the column.",
            380,
          ),
          comment(
            "c3",
            "u4",
            "Also make the CTA row wrap so the buttons do not overlap.",
            368,
          ),
        ],
        rewards: [
          reward(
            "r1",
            "s4",
            "u6",
            "u1",
            "unblocked",
            "Neha spotted the grid issue immediately.",
          ),
          reward(
            "r2",
            "s4",
            "u6",
            "u4",
            "tested",
            "Maya verified the mobile layout after the fix.",
          ),
        ],
      },
    ],
  };
}
