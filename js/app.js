// Two before/after demos. All text goes in with textContent, never as HTML.

const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));

// Small DOM builder: h("div", { class: "x" }, "text", child, ...)
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k === "style") el.setAttribute("style", v);
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

// Swap a demo's content without the page jumping: the panel stays where it is on
// screen, eases to its new height, and the new content fades in.
function smoothSwap(panel, change, focusEl) {
  const top0 = panel.getBoundingClientRect().top;
  const h0 = panel.offsetHeight;
  change();
  const drift = panel.getBoundingClientRect().top - top0;
  if (drift) window.scrollBy({ top: drift, behavior: "instant" });
  if (focusEl) focusEl.focus({ preventScroll: true });
  if (reduceMotion) return;
  const h1 = panel.offsetHeight;
  if (h0 !== h1) panel.animate([{ height: `${h0}px` }, { height: `${h1}px` }], { duration: 380, easing: "cubic-bezier(.2,.8,.2,1)" });
  panel.lastElementChild.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "ease-out" });
}

// Open or close a box smoothly: it grows from nothing and fades in, or shrinks
// away and fades out, so the content below glides instead of jumping.
function toggleBox(el, show) {
  if (!el._anims && show === !el.hidden) return;
  if (el._anims) el._anims.forEach((a) => a.cancel());
  if (reduceMotion) { el.hidden = !show; return; }
  el.hidden = false;
  const cs = getComputedStyle(el);
  const parent = el.parentElement;
  const gap = getComputedStyle(parent).rowGap;
  const open = { height: `${el.offsetHeight}px`, paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, marginTop: cs.marginTop, marginBottom: cs.marginBottom, borderTopWidth: cs.borderTopWidth, borderBottomWidth: cs.borderBottomWidth, opacity: 1, transform: "none" };
  const shut = { height: "0px", paddingTop: "0px", paddingBottom: "0px", marginTop: "0px", marginBottom: "0px", borderTopWidth: "0px", borderBottomWidth: "0px", opacity: 0, transform: "translateY(-8px)" };
  const timing = { duration: show ? 450 : 320, delay: show ? 150 : 0, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" };
  el.style.overflow = "hidden";
  // The space between the demo and the box (the grid gap) closes and opens along with it
  const anims = [
    el.animate(show ? [shut, open] : [open, shut], timing),
    parent.animate(show ? [{ rowGap: "0px" }, { rowGap: gap }] : [{ rowGap: gap }, { rowGap: "0px" }], timing),
  ];
  el._anims = anims;
  anims[0].onfinish = () => {
    el._anims = null;
    if (!show) el.hidden = true;
    anims.forEach((a) => a.cancel());
    el.style.overflow = "";
  };
}

/* =====================================================================
   Demo 1: a raw test report, then Faultwise's triage of the same run.
   Data: window.REPORT, generated from the real AI QA Lab recorded run.
   ===================================================================== */
if ($("report-body")) initReportDemo();
if ($("jira-body")) initJiraDemo();

function initReportDemo() {
const R = window.REPORT;
const failures = R.failures;
const SEV = ["critical", "high", "medium", "low"];
const appBugs = failures.filter((f) => f.verdict === "app-bug").sort((a, b) => SEV.indexOf(a.severity) - SEV.indexOf(b.severity));
const brokenTests = failures.filter((f) => f.verdict === "test-bug");

function renderRaw() {
  $("report-title").textContent = "nightly e2e run";
  const lines = failures.map((f, i) =>
    h("div", { class: "line", "data-i": i },
      h("span", { class: "x" }, "✘"),
      h("span", { class: "t" }, f.title, h("span", { class: "e" }, `${f.file} · ${f.error}`)),
      h("span", { class: `tag ${f.verdict === "app-bug" ? "bug" : "test"}` }, f.verdict === "app-bug" ? "APP BUG" : "BROKEN TEST")
    )
  );
  $("report-body").replaceChildren(
    h("div", { class: "raw" }, h("div", { class: "sum" }, `${failures.length} failed · ${R.passed} passed · ${failures.length + R.passed} tests`), lines)
  );
}

async function triage() {
  const btn = $("triage-btn");
  btn.disabled = true;
  btn.textContent = "Reading the failures…";
  $("report-title").textContent = "Faultwise is reading the run…";
  const lines = [...document.querySelectorAll("#report-body .line")];
  for (const line of lines) {
    line.classList.add("scan");
    line.scrollIntoView({ block: "nearest" });
    await wait(110);
    line.querySelector(".tag").classList.add("show");
    line.classList.remove("scan");
  }
  await wait(700);
  smoothSwap($("report"), () => {
    renderTriaged();
    btn.hidden = true;
    btn.disabled = false;
    btn.textContent = "Sort it with Faultwise";
    $("raw-btn").hidden = false;
    toggleBox($("tests-outcome"), true);
  }, $("raw-btn"));
}

function renderTriaged() {
  $("report-title").textContent = "sorted by Faultwise";
  let ticket = 214;
  const bugItems = appBugs.map((f) =>
    h("div", { class: "item" },
      h("span", { class: `sev ${f.severity || "low"}` }, f.severity || "low"),
      h("div", { class: "what" }, h("b", {}, f.title), h("span", {}, f.summary)),
      h("span", { class: "pill" }, `PROJ-${ticket++} created`)
    )
  );
  const testItems = brokenTests.map((f) =>
    h("div", { class: "item" },
      h("span", { class: "sev fixed" }, "test fix"),
      h("div", { class: "what" }, h("b", {}, f.title), h("span", {}, f.summary)),
      h("span", { class: "pill ok" }, f.healed ? "passes now" : "needs review")
    )
  );
  const critical = appBugs.filter((f) => f.severity === "critical").length;
  $("report-body").replaceChildren(
    h("div", { class: "triaged" },
      h("p", { class: "tally" },
        h("b", { class: "bug" }, `${appBugs.length} real bugs`), ` (${critical} critical) went to the developers with the evidence and a fix. `,
        h("b", { class: "test" }, `${brokenTests.length} were problems in the tests`), ", and ",
        h("b", { class: "ok" }, `${brokenTests.filter((f) => f.healed).length} of ${brokenTests.length}`), " of those are already repaired and passing."
      ),
      h("div", { class: "group" }, h("h3", {}, "Bugs in the product, most severe first"), bugItems),
      h("div", { class: "group" }, h("h3", {}, "Problems in the tests"), testItems)
    )
  );
  $("report-body").scrollTop = 0;
}

$("triage-btn").addEventListener("click", triage);
$("raw-btn").addEventListener("click", () => smoothSwap($("report"), () => {
  renderRaw();
  $("raw-btn").hidden = true;
  $("triage-btn").hidden = false;
  toggleBox($("tests-outcome"), false);
}, $("triage-btn")));
renderRaw();
}

function initJiraDemo() {
/* =====================================================================
   Demo 2: a messy Jira board, then a clean setup with automations,
   a Confluence knowledge base and Rovo agents. Demo data.
   ===================================================================== */

const MESSY = [
  ["To do", "147", [
    ["Login broken", ["Highest", "no owner", "212 days"]],
    ["login not working!!!", ["Highest", "no owner"]],
    ["LOGIN BUG URGENT", ["Highest", "duplicate?"]],
    ["fix stuff from tuesday meeting", ["no description"]],
    ["Customer asked AGAIN about export", ["Highest", "38 days"]],
  ], "+142 more"],
  ["In progress", "23", [
    ["Create user for customer (again)", ["manual work", "Highest"]],
    ["Release 4.2 when??", ["Highest", "no owner"]],
    ["Check with Dana", ["no description"]],
  ], "+20 more"],
  ["In progress (old)", "11", [
    ["Migration", ["no update: 6 months"]],
    ["New dashboard??", ["no owner"]],
  ], "+9 more"],
  ["QA??", "9", [
    ["Is this tested?", ["no owner"]],
    ["Waiting for QA environment", ["31 days"]],
  ], "+7 more"],
  ["Waiting", "17", [
    ["Waiting for customer", ["no SLA", "54 days"]],
    ["Waiting for someone", ["no owner"]],
  ], "+15 more"],
  ["Done", "412", [
    ["Fix login (reopened 3 times)", ["Highest"]],
  ], "+411 more"],
];

const PEOPLE = { DL: "#1b3f73", NM: "#2c7a4b", RK: "#a86400", SB: "#7a3b8f", TA: "#c0392b" };
const CLEAN = [
  ["Backlog", "prioritized", [
    ["PROJ-231", "Export reports to CSV", ["Medium"], [], "NM"],
    ["PROJ-236", "Shorter onboarding emails", ["Low"], [], "SB"],
  ]],
  ["Ready", "", [
    ["PROJ-142", "Login fails after password reset", ["High"], ["3 duplicates linked by Rovo"], "DL"],
    ["PROJ-229", "Customer export times out over 10k rows", ["Medium"], ["from support, via portal"], "RK"],
  ]],
  ["In progress", "WIP 3 / 3", [
    ["PROJ-214", "Login accepts any password for a known username", ["Critical"], ["filed by Faultwise", "SLA 3h left"], "TA"],
    ["PROJ-205", "Bulk user import", ["High"], ["spec in Confluence"], "NM"],
    ["PROJ-240", "Release 4.2 checklist", ["High"], ["release page linked"], "DL"],
  ]],
  ["In review", "", [
    ["PROJ-219", "Search ignores capital letters", ["Medium"], ["moved here when the PR merged"], "SB"],
  ]],
  ["Done", "this sprint", [
    ["PROJ-198", "Add users from the customer portal", ["Medium"], ["no agent needed any more"], "RK"],
  ]],
];

const RULES = [
  ["Answer first", "A customer opens a request", "", "A Rovo agent searches the knowledge base and answers; the request closes only when the customer says it helped"],
  ["Self-service", "The request type is \"Add a user\"", "", "The portal form creates the user directly. No support agent involved"],
  ["No duplicates", "A bug is created", "", "Rovo looks for open bugs with the same symptoms and links them, so one owner fixes it once"],
  ["Critical path", "Priority is set to Critical", "", "Notify on-call, start a 4-hour SLA, post in the team channel"],
  ["Code to review", "A pull request is merged", "The issue is in progress", "Move the issue to In review and assign QA"],
  ["Before it's late", "75% of an SLA has passed", "Nobody updated the issue", "Remind the owner and tell the team lead"],
];

function chip(text, kind = "") {
  return h("span", { class: `chip ${kind}` }, text);
}

function renderMessy() {
  $("jira-title-bar").textContent = "board";
  $("jira-tabs").hidden = true;
  const cols = MESSY.map(([name, count, cards, more]) =>
    h("div", { class: "col-b" },
      h("h4", {}, name, h("span", { class: "wip" }, count)),
      cards.map(([title, tags], i) =>
        h("div", { class: "card", style: `--tilt:${((i * 37) % 5) - 2}deg` },
          h("div", {}, title),
          h("div", { class: "meta" }, tags.map((t) => chip(t, /Highest/.test(t) ? "prio" : "bad")))
        )
      ),
      h("div", { class: "more" }, more)
    )
  );
  $("jira-body").replaceChildren(h("div", { class: "board messy" }, cols));
}

function renderCleanBoard() {
  const cols = CLEAN.map(([name, note, cards]) =>
    h("div", { class: "col-b" },
      h("h4", {}, name, h("span", { class: "wip" }, note)),
      cards.map(([key, title, prio, notes, who]) =>
        h("div", { class: "card" },
          h("span", { class: "key" }, key),
          h("div", {}, title),
          h("div", { class: "meta" },
            prio.map((p) => chip(p, p === "Critical" ? "bad" : "")),
            notes.map((n) => chip(n, "auto")),
            h("span", { class: "avatar", style: `background:${PEOPLE[who]}`, title: "Owner" }, who)
          )
        )
      )
    )
  );
  return h("div", { class: "board" }, cols);
}

function renderRules() {
  return h("div", { class: "rules" },
    RULES.map(([name, when, cond, then]) =>
      h("div", { class: "rule" },
        h("div", { class: "rname" }, name),
        h("div", { class: "flow" }, h("div", { class: "w" }, when), cond ? h("div", { class: "i" }, cond) : null, h("div", { class: "th" }, then))
      )
    )
  );
}

function renderKb() {
  return h("div", { class: "kb" },
    h("div", { class: "crumbs" }, "Customer Help Center › Accounts"),
    h("h3", {}, "How to add a user to your account"),
    h("div", { class: "byline" }, h("span", {}, "Owner: Support team"), chip("verified 3 days ago", "good"), chip("used by Rovo", "auto")),
    h("ol", {},
      h("li", {}, "Open Settings › Users and click Invite user."),
      h("li", {}, "Enter the person's work email and choose a role: Viewer, Editor or Admin."),
      h("li", {}, "They get an invitation email that is valid for 7 days.")
    ),
    h("div", { class: "callout" }, "No invitation? Check the spam folder, then use Resend invitation on the Users page. Still missing: open a request and choose \"Invitation not received\".")
  );
}

const CHAT = [
  ["user", "Customer", "How do I add a new user to our account?"],
  ["agent", "Rovo · support agent", "Go to Settings › Users and click Invite user, enter their work email and pick a role. They'll get an invitation that's valid for 7 days. Did that solve it?", "Source: How to add a user to your account (Confluence)"],
  ["user", "Customer", "Yes, thanks!"],
  ["sep", "", "Request closed by the customer. No ticket for the support team."],
  ["user", "Support engineer", "A customer says they can't log in after resetting their password. Known issue?"],
  ["agent", "Rovo · support assistant", "Yes. PROJ-142 \"Login fails after password reset\" matches the same error and is ready for development (owner: DL). I linked this request to it and drafted an update for the customer.", "Found in Jira: PROJ-142 and 3 linked duplicates"],
];

async function renderRovo(body) {
  const chat = h("div", { class: "chat" });
  body.replaceChildren(chat);
  for (const [kind, who, text, src] of CHAT) {
    if (kind === "sep") {
      chat.append(h("div", { class: "sep" }, text));
      continue;
    }
    const msg = h("div", { class: `msg ${kind}` }, h("div", { class: "who" }, who), text, src ? h("span", { class: "src" }, src) : null);
    chat.append(msg);
    await wait(60);
    msg.classList.add("show");
    await wait(kind === "agent" ? 900 : 500);
  }
}

function showTab(name) {
  document.querySelectorAll("#jira-tabs [role=tab]").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === name)));
  const body = $("jira-body");
  const titles = { board: "board, after the cleanup", rules: "Automation rules", kb: "Confluence · Customer Help Center", rovo: "Rovo agents" };
  $("jira-title-bar").textContent = titles[name];
  if (name === "board") body.replaceChildren(renderCleanBoard());
  if (name === "rules") body.replaceChildren(renderRules());
  if (name === "kb") body.replaceChildren(renderKb());
  if (name === "rovo") renderRovo(body);
}

async function cleanUp() {
  const btn = $("clean-btn");
  btn.disabled = true;
  btn.textContent = "Cleaning up…";
  const cards = [...document.querySelectorAll("#jira-body .card")];
  for (const c of cards) {
    c.style.transition = "opacity .25s, transform .25s";
    c.style.opacity = "0";
    c.style.transform = "scale(.96)";
    await wait(45);
  }
  await wait(300);
  smoothSwap($("jira-panel"), () => {
    $("jira-tabs").hidden = false;
    showTab("board");
    btn.hidden = true;
    btn.disabled = false;
    btn.textContent = "Show it after the cleanup";
    $("messy-btn").hidden = false;
    toggleBox($("jira-outcome"), true);
  }, $("messy-btn"));
}

document.querySelectorAll("#jira-tabs [role=tab]").forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));
$("clean-btn").addEventListener("click", cleanUp);
$("messy-btn").addEventListener("click", () => smoothSwap($("jira-panel"), () => {
  renderMessy();
  $("messy-btn").hidden = true;
  $("clean-btn").hidden = false;
  toggleBox($("jira-outcome"), false);
}, $("clean-btn")));
renderMessy();
}

/* =====================================================================
   Motion: sections fade in as you scroll, and the background drifts a
   little toward the mouse. Both stay off when the visitor asks for less motion.
   ===================================================================== */
if (!reduceMotion) {
  const targets = document.querySelectorAll("main h2, main p, main ul, .next, .demo-wrap");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add("reveal"); io.observe(el); }
    });
  }
  const layer = document.querySelector(".bg-layer");
  if (layer && window.matchMedia("(pointer: fine)").matches) {
    let frame = 0;
    window.addEventListener("mousemove", (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 30;
        layer.style.transform = `translate(${x}px, ${y}px)`;
      });
    });
  }
}

/* =====================================================================
   Light / dark switch. Starts from the device setting; a click picks
   the other one and remembers it (if the browser allows storage).
   ===================================================================== */
(function themeSwitch() {
  const btn = $("theme-toggle");
  if (!btn) return;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const current = () => document.documentElement.dataset.theme || (systemDark.matches ? "dark" : "light");
  const label = () => { btn.textContent = current() === "dark" ? "Light mode" : "Dark mode"; btn.setAttribute("aria-label", `Switch to ${btn.textContent.toLowerCase()}`); };
  btn.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
    label();
  });
  systemDark.addEventListener?.("change", label);
  label();
})();

/* Fallback page transition: fade the page out, then follow the link */
if (document.documentElement.classList.contains("fx-fallback") && !reduceMotion) {
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html$/.test(href) || a.getAttribute("aria-current") === "page") return;
    e.preventDefault();
    document.documentElement.classList.add("page-leave");
    setTimeout(() => { location.href = href; }, 240);
  });
  // Coming back with the browser's back button shows the cached page: undo the fade
  window.addEventListener("pageshow", () => document.documentElement.classList.remove("page-leave"));
}
