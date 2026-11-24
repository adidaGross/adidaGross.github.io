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

/* =====================================================================
   Demo 1: a raw test report, then Faultwise's triage of the same run.
   Data: window.REPORT, generated from the real AI QA Lab recorded run.
   ===================================================================== */
const R = window.REPORT;
const failures = R.failures;
const SEV = ["critical", "high", "medium", "low"];
const appBugs = failures.filter((f) => f.verdict === "app-bug").sort((a, b) => SEV.indexOf(a.severity) - SEV.indexOf(b.severity));
const brokenTests = failures.filter((f) => f.verdict === "test-bug");
const intro1 = $("tests-intro").textContent;

function renderRaw() {
  $("report-title").textContent = "CI · e2e-tests · run #1482";
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
  $("report-title").textContent = "Faultwise · reading run #1482";
  const lines = [...document.querySelectorAll("#report-body .line")];
  for (const line of lines) {
    line.classList.add("scan");
    line.scrollIntoView({ block: "nearest" });
    await wait(110);
    line.querySelector(".tag").classList.add("show");
    line.classList.remove("scan");
  }
  await wait(700);
  renderTriaged();
  btn.hidden = true;
  btn.disabled = false;
  btn.textContent = "Let Faultwise read it";
  $("raw-btn").hidden = false;
  $("tests-outcome").hidden = false;
  $("tests-intro").textContent = "Same run, after Faultwise: every failure has a verdict, a reason and a next step.";
  $("tests-intro").classList.add("solved");
}

function renderTriaged() {
  $("report-title").textContent = "Faultwise · triage of run #1482";
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
      h("span", { class: "sev fixed" }, "repaired"),
      h("div", { class: "what" }, h("b", {}, f.title), h("span", {}, f.summary)),
      h("span", { class: "pill ok" }, f.healed ? "re-run: passing" : "needs review")
    )
  );
  const critical = appBugs.filter((f) => f.severity === "critical").length;
  $("report-body").replaceChildren(
    h("div", { class: "triaged" },
      h("div", { class: "counts" },
        h("div", { class: "count bug" }, h("b", {}, appBugs.length), h("span", {}, `real product bugs, ${critical} critical: sent to developers with evidence and a fix`)),
        h("div", { class: "count test" }, h("b", {}, brokenTests.length), h("span", {}, "broken tests: repaired automatically, waiting for a quick review")),
        h("div", { class: "count ok" }, h("b", {}, `${brokenTests.filter((f) => f.healed).length}/${brokenTests.length}`), h("span", {}, "repaired tests pass when re-run"))
      ),
      h("div", { class: "group" }, h("h3", {}, "Real bugs in the product", h("small", {}, "sorted by severity")), bugItems),
      h("div", { class: "group" }, h("h3", {}, "Problems in the tests", h("small", {}, "fixed, not a product issue")), testItems)
    )
  );
  $("report-body").scrollTop = 0;
}

$("triage-btn").addEventListener("click", triage);
$("raw-btn").addEventListener("click", () => {
  renderRaw();
  $("raw-btn").hidden = true;
  $("triage-btn").hidden = false;
  $("tests-outcome").hidden = true;
  $("tests-intro").textContent = intro1;
  $("tests-intro").classList.remove("solved");
});
renderRaw();

/* =====================================================================
   Demo 2: a messy Jira board, then a clean setup with automations,
   a Confluence knowledge base and Rovo agents. Demo data.
   ===================================================================== */
const intro2 = $("jira-intro").textContent;

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
  $("jira-title-bar").textContent = "PROJ board";
  $("jira-tabs").hidden = true;
  const cols = MESSY.map(([name, count, cards, more]) =>
    h("div", { class: "col" },
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
    h("div", { class: "col" },
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
  const titles = { board: "PROJ board · after", rules: "Automation rules", kb: "Confluence · Customer Help Center", rovo: "Rovo agents" };
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
  $("jira-tabs").hidden = false;
  showTab("board");
  btn.hidden = true;
  btn.disabled = false;
  btn.textContent = "Clean it up";
  $("messy-btn").hidden = false;
  $("jira-outcome").hidden = false;
  $("jira-intro").textContent = "After: one clear workflow, owners and limits, rules that do the routine work, and agents that answer before anyone has to. Try the tabs.";
  $("jira-intro").classList.add("solved");
}

document.querySelectorAll("#jira-tabs [role=tab]").forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));
$("clean-btn").addEventListener("click", cleanUp);
$("messy-btn").addEventListener("click", () => {
  renderMessy();
  $("messy-btn").hidden = true;
  $("clean-btn").hidden = false;
  $("jira-outcome").hidden = true;
  $("jira-intro").textContent = intro2;
  $("jira-intro").classList.remove("solved");
});
renderMessy();
