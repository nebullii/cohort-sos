(function () {
  const categories = ["All", "Auth", "Deploy", "Frontend", "Backend", "Database", "Design", "Pitch", "Other"];
  const urgencies = ["All", "Low", "Medium", "High", "Deadline Panic"];
  const statuses = ["All", "open", "claimed", "resolved"];
  const rewardPoints = {
    unblocked: 10,
    diagnosed: 5,
    tested: 3,
    fix_note: 2,
    fast_response: 1,
  };

  const seed = {
    currentUserId: "u1",
    activeView: "board",
    filters: {
      search: "",
      category: "All",
      urgency: "All",
      status: "All",
    },
    knowledgeSearch: "",
    users: [
      {
        id: "u1",
        name: "Neha Chaudhari",
        githubHandle: "nebullii",
        avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocL7lUmR1B71l9kqbcggS2ik1rswuvJ48rOm5QZjBkl2okUbraA=s96-c",
        skills: ["Frontend", "Deploy", "Pitch"],
        rescueRep: 28,
      },
      { id: "u2", name: "Harry Joshi", githubHandle: "HarryJ12", avatarUrl: "", skills: ["Backend", "Database"], rescueRep: 34 },
      { id: "u3", name: "Bo Wu", githubHandle: "dengziwu123", avatarUrl: "", skills: ["Auth", "Supabase"], rescueRep: 24 },
      { id: "u4", name: "Maya Patel", githubHandle: "mayabuilds", avatarUrl: "", skills: ["Design", "Frontend"], rescueRep: 19 },
      { id: "u5", name: "Sam Rivera", githubHandle: "samships", avatarUrl: "", skills: ["Deploy", "Testing"], rescueRep: 16 },
      { id: "u6", name: "Ari Kim", githubHandle: "arikim", avatarUrl: "", skills: ["Pitch", "UX"], rescueRep: 12 },
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
          comment("c1", "u3", "Check Supabase URL Configuration and the GitHub OAuth callback. This usually means Site URL or redirect allow list is stale.", 9),
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
        comments: [
          comment("c2", "u1", "The grid child needs min-width: 0 or text refuses to shrink inside the column.", 380),
          comment("c3", "u4", "Also make the CTA row wrap so the buttons do not overlap.", 368),
        ],
        rewards: [
          reward("r1", "s4", "u6", "u1", "unblocked", "Neha spotted the grid issue immediately."),
          reward("r2", "s4", "u6", "u4", "tested", "Maya verified the mobile layout after the fix."),
        ],
      },
    ],
  };

  let state = loadState();
  let selectedSosId = null;
  let commentDraft = "";

  function minutesAgo(minutes) {
    return new Date(Date.now() - minutes * 60 * 1000).toISOString();
  }

  function hoursAgo(hours) {
    return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  }

  function comment(id, userId, body, minutes) {
    return { id, userId, body, createdAt: minutesAgo(minutes) };
  }

  function reward(id, sosId, fromUserId, toUserId, type, kudosMessage) {
    return { id, sosId, fromUserId, toUserId, type, points: rewardPoints[type], kudosMessage, createdAt: minutesAgo(350) };
  }

  function loadState() {
    const saved = localStorage.getItem("cohortSosState");
    if (!saved) return structuredClone(seed);
    try {
      return JSON.parse(saved);
    } catch (_error) {
      return structuredClone(seed);
    }
  }

  function persist() {
    localStorage.setItem("cohortSosState", JSON.stringify(state));
  }

  function render() {
    document.getElementById("app").innerHTML = `
      <div class="app">
        ${renderTopbar()}
        <main class="main">
          ${state.activeView === "board" ? renderBoard() : ""}
          ${state.activeView === "leaderboard" ? renderLeaderboard() : ""}
          ${state.activeView === "knowledge" ? renderKnowledge() : ""}
        </main>
        ${state.activeView === "board" ? "" : renderRoom()}
        ${renderLaunchModal()}
        ${renderResolveModal()}
      </div>
    `;
    bindEvents();
  }

  function renderTopbar() {
    return `
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark">SOS</div>
          <div>
            <div class="brand-title">Cohort SOS</div>
            <div class="brand-subtitle">Rescue network for blocked builders</div>
          </div>
        </div>
        <nav class="nav" aria-label="Primary">
          ${navButton("board", "Help Board")}
          ${navButton("leaderboard", "Leaderboard")}
          ${navButton("knowledge", "Knowledge Base")}
        </nav>
        <div class="actions">
          <button class="secondary" data-action="reset">Reset demo</button>
          <button class="primary" data-action="open-launch">Launch SOS</button>
        </div>
      </header>
    `;
  }

  function navButton(view, label) {
    return `<button class="${state.activeView === view ? "active" : ""}" data-view="${view}">${label}</button>`;
  }

  function renderBoard() {
    const filtered = getFilteredSos();
    const activeSos = state.sosRequests.find((item) => item.id === selectedSosId) || filtered[0] || null;
    return `
      <section class="workspace">
        <aside class="inbox">
          <div class="panel-head">
            <div>
              <h1>Help Board</h1>
              <p class="muted">${state.sosRequests.filter((sos) => sos.status !== "resolved").length} active SOS · ${state.sosRequests.filter((sos) => sos.status === "resolved").length} saved fixes</p>
            </div>
            <button class="primary compact" data-action="open-launch">New SOS</button>
          </div>
          <div class="toolbar slim" aria-label="Filters">
            <input class="input" data-filter="search" placeholder="Search requests" value="${escapeAttr(state.filters.search)}" />
            ${select("category", categories, state.filters.category)}
            ${select("status", statuses, state.filters.status)}
          </div>
          <div class="thread-list">${filtered.length ? filtered.map((sos) => renderSosCard(sos, activeSos && activeSos.id === sos.id)).join("") : `<div class="empty">No matching SOS requests.</div>`}</div>
        </aside>
        ${renderConversationPane(activeSos)}
        ${renderContextPanel(activeSos)}
      </section>
    `;
  }

  function renderPainMap() {
    const active = state.sosRequests.filter((sos) => sos.status !== "resolved");
    const counts = categories
      .filter((category) => category !== "All")
      .map((category) => ({ category, count: active.filter((sos) => sos.category === category).length }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
    const max = Math.max(1, ...counts.map((item) => item.count));
    return `
      <aside class="pain-map">
        <div>
          <p class="eyebrow">Cohort pain map</p>
          <h2>What is blocking builders right now</h2>
        </div>
        <div>
          ${
            counts.length
              ? counts
                  .map(
                    (item) => `
              <div class="pain-row">
                <span>${item.category}</span>
                <div class="bar"><span style="width: ${(item.count / max) * 100}%"></span></div>
                <strong>${item.count}</strong>
              </div>
            `
                  )
                  .join("")
              : `<p class="muted">No active blockers. The board is clear.</p>`
          }
        </div>
      </aside>
    `;
  }

  function select(name, options, value) {
    return `
      <select class="select" data-filter="${name}" aria-label="${name}">
        ${options.map((option) => `<option value="${option}" ${option === value ? "selected" : ""}>${labelStatus(option)}</option>`).join("")}
      </select>
    `;
  }

  function renderSosCards() {
    const filtered = getFilteredSos();
    if (!filtered.length) {
      return `<div class="empty"><h3>No SOS requests match those filters.</h3><p class="muted">Clear filters or launch a new request.</p></div>`;
    }
    return filtered.map(renderSosCard).join("");
  }

  function getFilteredSos() {
    const urgencyRank = { "Deadline Panic": 0, High: 1, Medium: 2, Low: 3 };
    return state.sosRequests
      .filter((sos) => {
        const haystack = `${sos.title} ${sos.context} ${sos.repoUrl || ""} ${sos.liveUrl || ""}`.toLowerCase();
        const matchesSearch = !state.filters.search || haystack.includes(state.filters.search.toLowerCase());
        const matchesCategory = state.filters.category === "All" || sos.category === state.filters.category;
        const matchesUrgency = state.filters.urgency === "All" || sos.urgency === state.filters.urgency;
        const matchesStatus = state.filters.status === "All" || sos.status === state.filters.status;
        return matchesSearch && matchesCategory && matchesUrgency && matchesStatus;
      })
      .sort((a, b) => {
        if (a.status === "resolved" && b.status !== "resolved") return 1;
        if (a.status !== "resolved" && b.status === "resolved") return -1;
        return (urgencyRank[a.urgency] ?? 9) - (urgencyRank[b.urgency] ?? 9) || new Date(b.createdAt) - new Date(a.createdAt);
      });
  }

  function renderSosCard(sos, isActive = false) {
    const requester = getUser(sos.requesterId);
    const helpers = sos.helperIds.map(getUser).filter(Boolean);
    return `
      <article class="thread-row ${isActive ? "active" : ""}" data-action="open-room" data-id="${sos.id}">
        <div>
          <div class="thread-top">
            <strong>${escapeHtml(requester.name)}</strong>
            <span>${timeAgo(sos.createdAt)}</span>
          </div>
          <h3>${escapeHtml(sos.title)}</h3>
          <p>${escapeHtml(sos.context)}</p>
          <div class="thread-meta">
            <span class="dot ${urgencyClass(sos.urgency)}"></span>
            <span>${sos.category}</span>
            <span>${labelStatus(sos.status)}</span>
            <span>${helpers.length || "No"} helper${helpers.length === 1 ? "" : "s"}</span>
          </div>
        </div>
      </article>
    `;
  }

  function renderConversationPane(sos) {
    if (!sos) {
      return `
        <section class="conversation">
          <div class="empty">Select an SOS request or launch a new one.</div>
        </section>
      `;
    }
    const requester = getUser(sos.requesterId);
    return `
      <section class="conversation">
        <header class="conversation-head">
          <div>
            <div class="thread-meta">
              <span class="dot ${urgencyClass(sos.urgency)}"></span>
              <span>${sos.urgency}</span>
              <span>${sos.category}</span>
              <span>${labelStatus(sos.status)}</span>
            </div>
            <h2>${escapeHtml(sos.title)}</h2>
            <p class="muted">Started by ${escapeHtml(requester.name)} · ${timeAgo(sos.createdAt)}</p>
          </div>
          <div class="conversation-actions">
            ${sos.status !== "resolved" ? `<button class="secondary compact" data-action="claim" data-id="${sos.id}">${sos.helperIds.includes(state.currentUserId) ? "Helping" : "Claim"}</button>` : ""}
            ${sos.status !== "resolved" ? `<button class="primary compact" data-action="open-resolve" data-id="${sos.id}">Resolve</button>` : ""}
          </div>
        </header>
        <div class="message-list">
          <article class="message requester">
            ${avatar(requester)}
            <div>
              <div class="message-meta">${escapeHtml(requester.name)} posted the SOS</div>
              <p>${escapeHtml(sos.context)}</p>
            </div>
          </article>
          ${sos.comments.map(renderComment).join("")}
          ${
            sos.fixNote
              ? `<article class="message fix"><div class="avatar">✓</div><div><div class="message-meta">Final fix note</div><p>${escapeHtml(sos.fixNote)}</p></div></article>`
              : ""
          }
        </div>
        <footer class="composer">
          <textarea class="textarea" data-comment placeholder="Reply with a clue, question, or next step">${escapeHtml(commentDraft)}</textarea>
          <button class="primary compact" data-action="add-comment" data-id="${sos.id}">Send</button>
        </footer>
      </section>
    `;
  }

  function renderContextPanel(sos) {
    if (!sos) return `<aside class="context-panel"><div class="empty">No request selected.</div></aside>`;
    const requester = getUser(sos.requesterId);
    const helpers = sos.helperIds.map(getUser).filter(Boolean);
    return `
      <aside class="context-panel">
        <section class="side-panel quiet">
          <h2>Request</h2>
          <dl class="context-list">
            <div><dt>Requester</dt><dd>${escapeHtml(requester.name)}</dd></div>
            <div><dt>Time needed</dt><dd>${sos.timeNeededMinutes} minutes</dd></div>
            <div><dt>Repo</dt><dd>${sos.repoUrl ? link(sos.repoUrl) : "Not provided"}</dd></div>
            <div><dt>Live</dt><dd>${sos.liveUrl ? link(sos.liveUrl) : "Not provided"}</dd></div>
          </dl>
        </section>
        <section class="side-panel quiet">
          <h2>Helpers</h2>
          <div class="helper-list">
            ${helpers.length ? helpers.map((helper) => `<div class="helper-row">${avatar(helper)}<div><strong>${escapeHtml(helper.name)}</strong><p class="muted">@${escapeHtml(helper.githubHandle)} · ${helper.rescueRep} rep</p></div></div>`).join("") : `<p class="muted">No helpers have claimed this yet.</p>`}
          </div>
        </section>
        ${renderMiniLeaderboard()}
      </aside>
    `;
  }

  function renderMiniLeaderboard() {
    return `
      <section class="side-panel">
        <div class="section-head">
          <h2>Top Rescuers</h2>
          <button class="ghost" data-view="leaderboard">View all</button>
        </div>
        <div class="rank-list">
          ${rankedUsers()
            .slice(0, 5)
            .map(
              (user, index) => `
            <div class="rank-row">
              <div class="rank">${index + 1}</div>
              <div><div class="name">${escapeHtml(user.name)}</div><div class="handle">@${escapeHtml(user.githubHandle)}</div></div>
              <strong>${user.rescueRep}</strong>
            </div>
          `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderRecentKudos() {
    const rewards = allRewards().filter((item) => item.reward.kudosMessage).slice(0, 3);
    return `
      <section class="side-panel">
        <h2>Recent Kudos</h2>
        <div class="kudos-grid" style="margin-top: 14px;">
          ${
            rewards.length
              ? rewards
                  .map(({ reward: item }) => {
                    const to = getUser(item.toUserId);
                    return `<div class="kudos-card"><strong>${escapeHtml(to.name)}</strong><p class="muted">${escapeHtml(item.kudosMessage)}</p></div>`;
                  })
                  .join("")
              : `<p class="muted">Resolve an SOS to create the first kudos card.</p>`
          }
        </div>
      </section>
    `;
  }

  function renderLeaderboard() {
    return `
      <section class="section-head">
        <div>
          <p class="eyebrow">Rescue Rep</p>
          <h1>Reward the people who unblock the cohort.</h1>
          <p class="lede">Rep comes from resolved SOS requests: unblocking, diagnosing, testing, fix notes, and fast response.</p>
        </div>
      </section>
      <section class="leaderboard-grid">
        ${rankedUsers()
          .map(
            (user, index) => `
          <article class="rep-card">
            ${avatar(user)}
            <div class="chip gold">Rank ${index + 1}</div>
            <h2 class="sos-title">${escapeHtml(user.name)}</h2>
            <p class="muted">@${escapeHtml(user.githubHandle)} · ${escapeHtml(user.skills.join(", "))}</p>
            <div class="rep-score">${user.rescueRep}</div>
            <div class="muted">Rescue Rep</div>
            <div class="chip-row" style="margin-top: 14px;">${badgesFor(user).map((badge) => `<span class="chip green">${badge}</span>`).join("")}</div>
          </article>
        `
          )
          .join("")}
      </section>
      <section style="margin-top: 24px;">
        <div class="section-head"><h2>Kudos Cards</h2></div>
        <div class="kudos-grid">${renderKudosCards()}</div>
      </section>
    `;
  }

  function renderKudosCards() {
    const rewards = allRewards().filter((item) => item.reward.kudosMessage);
    if (!rewards.length) return `<div class="empty">No kudos yet. Resolve an SOS and credit a helper.</div>`;
    return rewards
      .map(({ reward: item, sos }) => {
        const from = getUser(item.fromUserId);
        const to = getUser(item.toUserId);
        return `
          <article class="kudos-card">
            <div class="chip-row">
              <span class="chip green">+${item.points} ${labelReward(item.type)}</span>
              <span class="chip blue">${escapeHtml(sos.category)}</span>
            </div>
            <h3 class="sos-title">${escapeHtml(to.name)} helped on "${escapeHtml(sos.title)}"</h3>
            <p class="muted">${escapeHtml(item.kudosMessage)} - ${escapeHtml(from.name)}</p>
          </article>
        `;
      })
      .join("");
  }

  function renderKnowledge() {
    const solved = state.sosRequests.filter((sos) => sos.status === "resolved");
    const query = state.knowledgeSearch.toLowerCase();
    const filtered = solved.filter((sos) => `${sos.title} ${sos.context} ${sos.fixNote || ""} ${sos.category}`.toLowerCase().includes(query));
    return `
      <section class="section-head">
        <div>
          <p class="eyebrow">Cohort memory</p>
          <h1>Every rescue becomes a reusable fix.</h1>
          <p class="lede">Search solved SOS rooms before you ask the same question again.</p>
        </div>
      </section>
      <section class="toolbar" style="grid-template-columns: 1fr;">
        <input class="input" data-knowledge-search placeholder="Search fixes by problem, category, or final note" value="${escapeAttr(state.knowledgeSearch)}" />
      </section>
      <section class="knowledge-grid">
        ${
          filtered.length
            ? filtered.map(renderKnowledgeCard).join("")
            : `<div class="empty"><h3>No solved fixes found.</h3><p class="muted">Resolve an SOS to build cohort memory.</p></div>`
        }
      </section>
    `;
  }

  function renderKnowledgeCard(sos) {
    const helpers = sos.helperIds.map(getUser).filter(Boolean);
    return `
      <article class="knowledge-card">
        <div class="chip-row">
          <span class="chip blue">${sos.category}</span>
          <span class="chip green">Resolved ${timeAgo(sos.resolvedAt || sos.createdAt)}</span>
          <span class="chip">${helpers.length} helpers</span>
        </div>
        <h3 class="sos-title">${escapeHtml(sos.title)}</h3>
        <p>${escapeHtml(sos.fixNote || "No final fix note was recorded.")}</p>
        <div class="chip-row" style="margin-top: 14px;">
          ${helpers.map((helper) => `<span class="chip">@${escapeHtml(helper.githubHandle)}</span>`).join("")}
          <button class="secondary" data-action="open-room" data-id="${sos.id}">Open room</button>
        </div>
      </article>
    `;
  }

  function renderRoom() {
    const sos = selectedSosId ? state.sosRequests.find((item) => item.id === selectedSosId) : null;
    if (!sos) return `<div class="room" id="room"></div>`;
    const requester = getUser(sos.requesterId);
    const helpers = sos.helperIds.map(getUser).filter(Boolean);
    return `
      <aside class="room open" id="room" aria-modal="true" role="dialog">
        <div class="scrim" data-action="close-room"></div>
        <div class="room-panel">
          <header class="room-head">
            <div>
              <div class="chip-row">
                <span class="chip ${urgencyClass(sos.urgency)}">${sos.urgency}</span>
                <span class="chip blue">${sos.category}</span>
                <span class="chip ${statusClass(sos.status)}">${labelStatus(sos.status)}</span>
              </div>
              <h2 class="sos-title">${escapeHtml(sos.title)}</h2>
              <p class="muted">Requested by ${escapeHtml(requester.name)} · ${timeAgo(sos.createdAt)}</p>
            </div>
            <button class="icon-button" aria-label="Close room" data-action="close-room">X</button>
          </header>
          <div class="room-body">
            <p>${escapeHtml(sos.context)}</p>
            <div class="detail-grid">
              <div class="detail"><div class="detail-label">Time needed</div><div class="detail-value">${sos.timeNeededMinutes} minutes</div></div>
              <div class="detail"><div class="detail-label">Helpers</div><div class="detail-value">${helpers.length ? helpers.map((u) => u.name).join(", ") : "Unclaimed"}</div></div>
              <div class="detail"><div class="detail-label">Repo</div><div class="detail-value">${sos.repoUrl ? link(sos.repoUrl) : "Not provided"}</div></div>
              <div class="detail"><div class="detail-label">Live URL</div><div class="detail-value">${sos.liveUrl ? link(sos.liveUrl) : "Not provided"}</div></div>
            </div>
            <div class="section-head">
              <h2>Rescue Notes</h2>
            </div>
            <div class="comments">
              ${
                sos.comments.length
                  ? sos.comments.map(renderComment).join("")
                  : `<div class="empty">No notes yet. Add the first debugging clue.</div>`
              }
            </div>
            ${
              sos.fixNote
                ? `<div class="knowledge-card" style="margin-top: 18px;"><span class="chip green">Final fix note</span><p style="margin-top: 10px;">${escapeHtml(sos.fixNote)}</p></div>`
                : ""
            }
          </div>
          <footer class="room-foot">
            <textarea class="textarea" data-comment placeholder="Add a rescue note, question, or suggested fix">${escapeHtml(commentDraft)}</textarea>
            <div class="modal-actions">
              ${sos.status !== "resolved" ? `<button class="secondary" data-action="claim" data-id="${sos.id}">${sos.helperIds.includes(state.currentUserId) ? "Already helping" : "Claim SOS"}</button>` : ""}
              <button class="secondary" data-action="add-comment" data-id="${sos.id}">Add note</button>
              ${sos.status !== "resolved" ? `<button class="danger" data-action="open-resolve" data-id="${sos.id}">Resolve SOS</button>` : ""}
            </div>
          </footer>
        </div>
      </aside>
    `;
  }

  function renderComment(item) {
    const user = getUser(item.userId);
    return `
      <article class="message">
        ${avatar(user)}
        <div>
          <div class="message-meta">${escapeHtml(user.name)} · ${timeAgo(item.createdAt)}</div>
          <p>${escapeHtml(item.body)}</p>
        </div>
      </article>
    `;
  }

  function renderLaunchModal() {
    return `
      <div class="modal" id="launchModal" aria-modal="true" role="dialog">
        <div class="scrim" data-action="close-launch"></div>
        <form class="modal-card" data-form="launch">
          <header class="modal-head">
            <div><h2>Launch SOS</h2><p class="muted">Give helpers enough context to jump in fast.</p></div>
            <button type="button" class="icon-button" data-action="close-launch">X</button>
          </header>
          <div class="modal-body">
            <div class="form-grid">
              <div class="field full"><label>Problem title</label><input class="input" name="title" required maxlength="90" placeholder="Vercel env vars failing before deadline" /></div>
              <div class="field"><label>Category</label>${formSelect("category", categories.filter((x) => x !== "All"), "Deploy")}</div>
              <div class="field"><label>Urgency</label>${formSelect("urgency", urgencies.filter((x) => x !== "All"), "High")}</div>
              <div class="field"><label>Time needed</label>${formSelect("timeNeededMinutes", ["10", "15", "30", "60"], "15")}</div>
              <div class="field"><label>Repo URL</label><input class="input" name="repoUrl" placeholder="https://github.com/..." /></div>
              <div class="field"><label>Live URL</label><input class="input" name="liveUrl" placeholder="https://..." /></div>
              <div class="field full"><label>Context</label><textarea class="textarea" name="context" required placeholder="What changed, what you tried, and what error you see"></textarea></div>
            </div>
            <div class="modal-actions">
              <button type="button" class="secondary" data-action="close-launch">Cancel</button>
              <button class="primary" type="submit">Launch SOS</button>
            </div>
          </div>
        </form>
      </div>
    `;
  }

  function renderResolveModal() {
    const sos = selectedSosId ? state.sosRequests.find((item) => item.id === selectedSosId) : null;
    if (!sos) return `<div class="modal" id="resolveModal"></div>`;
    const helperOptions = unique([state.currentUserId, ...sos.helperIds]).filter((id) => id !== sos.requesterId).map(getUser).filter(Boolean);
    return `
      <div class="modal" id="resolveModal" aria-modal="true" role="dialog">
        <div class="scrim" data-action="close-resolve"></div>
        <form class="modal-card" data-form="resolve">
          <header class="modal-head">
            <div><h2>Resolve SOS</h2><p class="muted">Credit helpers and save the fix for the next builder.</p></div>
            <button type="button" class="icon-button" data-action="close-resolve">X</button>
          </header>
          <div class="modal-body">
            <div class="field"><label>Outcome</label>${formSelect("outcome", ["Unblocked me", "Helped diagnose", "Not resolved yet"], "Unblocked me")}</div>
            <div class="field full" style="margin-top: 14px;"><label>Final fix note</label><textarea class="textarea" name="fixNote" required placeholder="What fixed it? Include concrete files, settings, or commands."></textarea></div>
            <h3 style="margin-top: 18px;">Credit helpers</h3>
            <div class="kudos-grid" style="margin-top: 10px;">
              ${
                helperOptions.length
                  ? helperOptions
                      .map(
                        (user) => `
                  <div class="helper-credit">
                    <label><input type="checkbox" name="helper" value="${user.id}" ${sos.helperIds.includes(user.id) ? "checked" : ""} /> ${escapeHtml(user.name)} <span class="muted">@${escapeHtml(user.githubHandle)}</span></label>
                    ${formSelect(`reward-${user.id}`, Object.keys(rewardPoints), "unblocked")}
                  </div>
                `
                      )
                      .join("")
                  : `<div class="empty">No helpers yet. Claim the SOS or add helpers before resolving.</div>`
              }
            </div>
            <div class="field full" style="margin-top: 14px;"><label>Kudos message</label><input class="input" name="kudosMessage" placeholder="Harry fixed my Vercel env vars in 12 minutes." /></div>
            <div class="modal-actions">
              <button type="button" class="secondary" data-action="close-resolve">Cancel</button>
              <button class="danger" type="submit">Save fix and award rep</button>
            </div>
          </div>
        </form>
      </div>
    `;
  }

  function formSelect(name, options, value) {
    return `<select class="select" name="${name}">${options.map((option) => `<option value="${option}" ${option === value ? "selected" : ""}>${labelStatus(labelReward(option))}</option>`).join("")}</select>`;
  }

  function bindEvents() {
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeView = button.dataset.view;
        selectedSosId = null;
        persist();
        render();
      });
    });

    document.querySelectorAll("[data-filter]").forEach((input) => {
      input.addEventListener("input", () => {
        state.filters[input.dataset.filter] = input.value;
        persist();
        render();
      });
    });

    const knowledgeSearch = document.querySelector("[data-knowledge-search]");
    if (knowledgeSearch) {
      knowledgeSearch.addEventListener("input", () => {
        state.knowledgeSearch = knowledgeSearch.value;
        persist();
        render();
      });
    }

    document.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", (event) => handleAction(event, el));
    });

    const launchForm = document.querySelector('[data-form="launch"]');
    if (launchForm) launchForm.addEventListener("submit", handleLaunch);

    const resolveForm = document.querySelector('[data-form="resolve"]');
    if (resolveForm) resolveForm.addEventListener("submit", handleResolve);

    const commentBox = document.querySelector("[data-comment]");
    if (commentBox) {
      commentBox.addEventListener("input", () => {
        commentDraft = commentBox.value;
      });
    }
  }

  function handleAction(event, el) {
    const action = el.dataset.action;
    if (!action) return;
    if (["close-room", "close-launch", "close-resolve", "open-launch", "open-resolve", "claim", "open-room", "add-comment", "reset"].includes(action)) {
      event.preventDefault();
    }
    if (action === "open-launch") openModal("launchModal");
    if (action === "close-launch") closeModal("launchModal");
    if (action === "open-room") {
      selectedSosId = el.dataset.id;
      commentDraft = "";
      render();
    }
    if (action === "close-room") {
      selectedSosId = null;
      commentDraft = "";
      render();
    }
    if (action === "claim") claimSos(el.dataset.id);
    if (action === "add-comment") addComment(el.dataset.id);
    if (action === "open-resolve") openModal("resolveModal");
    if (action === "close-resolve") closeModal("resolveModal");
    if (action === "reset") {
      localStorage.removeItem("cohortSosState");
      state = structuredClone(seed);
      selectedSosId = null;
      render();
    }
  }

  function handleLaunch(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const sos = {
      id: `s${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
      title: form.get("title").trim(),
      category: form.get("category"),
      urgency: form.get("urgency"),
      status: "open",
      requesterId: state.currentUserId,
      helperIds: [],
      context: form.get("context").trim(),
      repoUrl: form.get("repoUrl").trim(),
      liveUrl: form.get("liveUrl").trim(),
      timeNeededMinutes: Number(form.get("timeNeededMinutes")),
      createdAt: new Date().toISOString(),
      comments: [],
      rewards: [],
    };
    state.sosRequests.unshift(sos);
    selectedSosId = sos.id;
    closeModal("launchModal");
    persist();
    render();
  }

  function claimSos(id) {
    const sos = state.sosRequests.find((item) => item.id === id);
    if (!sos || sos.status === "resolved") return;
    if (!sos.helperIds.includes(state.currentUserId) && sos.requesterId !== state.currentUserId) {
      sos.helperIds.push(state.currentUserId);
    }
    sos.status = sos.helperIds.length ? "claimed" : "open";
    persist();
    render();
  }

  function addComment(id) {
    const sos = state.sosRequests.find((item) => item.id === id);
    if (!sos || !commentDraft.trim()) return;
    sos.comments.push({
      id: `c${Date.now()}`,
      userId: state.currentUserId,
      body: commentDraft.trim(),
      createdAt: new Date().toISOString(),
    });
    commentDraft = "";
    persist();
    render();
  }

  function handleResolve(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const sos = state.sosRequests.find((item) => item.id === selectedSosId);
    if (!sos) return;
    const helperIds = form.getAll("helper");
    const kudosMessage = form.get("kudosMessage").trim();
    sos.status = "resolved";
    sos.resolvedAt = new Date().toISOString();
    sos.fixNote = form.get("fixNote").trim();
    sos.helperIds = unique([...sos.helperIds, ...helperIds]);
    helperIds.forEach((helperId) => {
      const type = form.get(`reward-${helperId}`);
      const item = {
        id: `r${Date.now()}-${helperId}`,
        sosId: sos.id,
        fromUserId: sos.requesterId,
        toUserId: helperId,
        type,
        points: rewardPoints[type],
        kudosMessage,
        createdAt: new Date().toISOString(),
      };
      sos.rewards.push(item);
      const user = getUser(helperId);
      user.rescueRep += item.points;
    });
    closeModal("resolveModal");
    persist();
    render();
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("open");
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("open");
  }

  function getUser(id) {
    return state.users.find((user) => user.id === id) || state.users[0];
  }

  function rankedUsers() {
    return [...state.users].sort((a, b) => b.rescueRep - a.rescueRep);
  }

  function allRewards() {
    return state.sosRequests.flatMap((sos) => sos.rewards.map((item) => ({ sos, reward: item }))).sort((a, b) => new Date(b.reward.createdAt) - new Date(a.reward.createdAt));
  }

  function badgesFor(user) {
    const helped = state.sosRequests.filter((sos) => sos.helperIds.includes(user.id) && sos.status === "resolved");
    const badges = [];
    const counts = helped.reduce((acc, sos) => {
      acc[sos.category] = (acc[sos.category] || 0) + 1;
      return acc;
    }, {});
    if ((counts.Auth || 0) >= 1) badges.push("Auth Medic");
    if ((counts.Deploy || 0) >= 1) badges.push("Deploy Rescuer");
    if ((counts.Frontend || 0) + (counts.Design || 0) >= 1) badges.push("UI Surgeon");
    if ((counts.Pitch || 0) >= 1) badges.push("Pitch Doctor");
    if (helped.length >= 2) badges.push("First Responder");
    if (user.rescueRep >= 35) badges.push("Cohort Hero");
    return badges.length ? badges : ["Ready to Rescue"];
  }

  function avatar(user) {
    const initials = user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return `<span class="avatar" title="${escapeAttr(user.name)}">${user.avatarUrl ? `<img src="${escapeAttr(user.avatarUrl)}" alt="" />` : initials}</span>`;
  }

  function link(url) {
    const escaped = escapeAttr(url);
    return `<a href="${escaped}" target="_blank" rel="noreferrer">${escapeHtml(url.replace(/^https?:\/\//, ""))}</a>`;
  }

  function unique(items) {
    return Array.from(new Set(items));
  }

  function labelStatus(value) {
    if (!value) return "";
    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function labelReward(value) {
    return String(value).replace(/_/g, " ");
  }

  function urgencyClass(urgency) {
    if (urgency === "Deadline Panic") return "red";
    if (urgency === "High") return "gold";
    if (urgency === "Medium") return "blue";
    return "green";
  }

  function statusClass(status) {
    if (status === "resolved") return "green";
    if (status === "claimed") return "blue";
    return "gold";
  }

  function timeAgo(iso) {
    const delta = Math.max(0, Date.now() - new Date(iso).getTime());
    const minutes = Math.floor(delta / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  render();
})();
