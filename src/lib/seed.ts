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
      name: "Cursor Boston · Summer 1",
      motto: "Ship together, get unblocked together.",
      startedAt: hoursAgo(24 * 14),
    },
    users: [
      {
        id: "u1",
        name: "Nevi",
        githubHandle: "nebullii",
        avatarUrl: "",
        skills: ["Frontend", "Deploy", "Pitch"],
        rescueRep: 24,
      },
      {
        id: "u2",
        name: "Bo Wu",
        githubHandle: "dengziwu123",
        avatarUrl: "",
        skills: ["Backend", "Auth"],
        rescueRep: 28,
      },
      {
        id: "u3",
        name: "Harry Joshi",
        githubHandle: "HarryJ12",
        avatarUrl: "",
        skills: ["Backend", "Database"],
        rescueRep: 34,
      },
      {
        id: "u4",
        name: "James Fleck",
        githubHandle: "jfleck25",
        avatarUrl: "",
        skills: ["Frontend", "Design"],
        rescueRep: 22,
      },
      {
        id: "u5",
        name: "Jon Littel",
        githubHandle: "jonathanlittel",
        avatarUrl: "",
        skills: ["Pitch", "Frontend"],
        rescueRep: 20,
      },
      {
        id: "u6",
        name: "Kristjan Varnik",
        githubHandle: "kvarnik",
        avatarUrl: "",
        skills: ["Deploy", "Backend"],
        rescueRep: 18,
      },
      {
        id: "u7",
        name: "Param",
        githubHandle: "Paramjeet-singh-neu",
        avatarUrl: "",
        skills: ["Database", "Backend"],
        rescueRep: 16,
      },
      {
        id: "u8",
        name: "Simran Kumari",
        githubHandle: "SimranKumari30",
        avatarUrl: "",
        skills: ["Auth", "Frontend"],
        rescueRep: 16,
      },
    ],
    sosRequests: [
      {
        id: "s1",
        title: "Supabase GitHub OAuth redirect broken on Vercel",
        category: "Auth",
        urgency: "Deadline Panic",
        status: "claimed",
        requesterId: "u8",
        helperIds: ["u2"],
        context:
          "Login works locally, but production redirects back to localhost after GitHub auth. Need a second pair of eyes before the submission window closes.",
        repoUrl: "https://github.com/mayabuilds/cohort-auth",
        liveUrl: "https://cohort-auth.vercel.app",
        timeNeededMinutes: 15,
        deadlineAt: new Date(Date.now() + 27 * 60 * 1000).toISOString(),
        createdAt: minutesAgo(12),
        comments: [
          comment(
            "c1",
            "u2",
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
        requesterId: "u4",
        helperIds: [],
        context:
          "The app is styled locally but looks unstyled on Vercel. I suspect the content paths or build output are wrong.",
        repoUrl: "https://github.com/jfleck25/week2-product",
        liveUrl: "https://week2-product.vercel.app",
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
        title: "Prisma migrate failing on Neon: column already exists",
        category: "Database",
        urgency: "High",
        status: "open",
        requesterId: "u7",
        helperIds: [],
        context:
          "I added a new column locally and ran `prisma migrate dev`. Now on Neon prod, `migrate deploy` fails with 'column already exists'. Did I break shadow DB? Migration history looks fine.",
        repoUrl: "https://github.com/Paramjeet-singh-neu/cohort-data",
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
        requesterId: "u3",
        helperIds: [],
        context:
          "Webhook signature verification fails locally. Stripe dashboard shows 401. STRIPE_WEBHOOK_SECRET is set. Suspect raw body vs parsed body issue in Next.js App Router.",
        repoUrl: "https://github.com/HarryJ12/cohort-billing",
        liveUrl: "",
        timeNeededMinutes: 20,
        createdAt: minutesAgo(34),
        comments: [],
        rewards: [],
      },
      {
        id: "s7",
        title: "Demo video has 8s of dead air, need a tighter cut",
        category: "Pitch",
        urgency: "Low",
        status: "resolved",
        requesterId: "u3",
        helperIds: ["u5"],
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
            "u5",
            "Open on the product, not the problem statement. The problem reveals itself.",
            820,
          ),
        ],
        rewards: [
          reward(
            "r3",
            "s7",
            "u3",
            "u5",
            "unblocked",
            "Jon cut 26 seconds in 5 minutes.",
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
        repoUrl: "https://github.com/kvarnik/project-wall",
        liveUrl: "https://project-wall.vercel.app",
        timeNeededMinutes: 20,
        createdAt: hoursAgo(7),
        resolvedAt: hoursAgo(6),
        fixNote:
          "The card grid used fixed columns and a long unbreakable URL. We changed the layout to one column below 640px, added min-width: 0 to the card body, and used overflow-wrap: anywhere on links.",
        fixCommitUrl: "https://github.com/kvarnik/project-wall/commit/9d5ba31",
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
            "Nevi spotted the grid issue immediately.",
          ),
          reward(
            "r2",
            "s4",
            "u6",
            "u4",
            "tested",
            "James verified the mobile layout after the fix.",
          ),
        ],
      },
    ],
  };
}
