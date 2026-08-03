/**
 * Smoke test for the time machine widget. Runs js/time-machine.js against a
 * jsdom copy of each snapshot's index page and asserts the control mounts,
 * knows which year it is on, and opens.
 *
 *   npm install --no-save jsdom && node tools/test-time-machine.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WIDGET = fs.readFileSync(path.join(ROOT, "js", "time-machine.js"), "utf8");

const EXPECTED_VERSIONS = 6;

const PAGES = [
  { file: "archive/2019/index.html", url: "https://latchman.ca/archive/2019/", label: "2019" },
  { file: "archive/2021/index.html", url: "https://latchman.ca/archive/2021/", label: "2021" },
  { file: "archive/2022/index.html", url: "https://latchman.ca/archive/2022/", label: "2022" },
  { file: "archive/2023/index.html", url: "https://latchman.ca/archive/2023/", label: "2023" },
  { file: "archive/2025/index.html", url: "https://latchman.ca/archive/2025/", label: "2025" },
  { file: "index.html", url: "https://latchman.ca/", label: "2026" },
  { file: "memories.html", url: "https://latchman.ca/memories", label: "2026" },
  { file: "404.html", url: "https://latchman.ca/nope", label: "2026" },
];

let failures = 0;

function check(label, condition, detail = "") {
  if (condition) return;
  failures += 1;
  console.error(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
}

for (const page of PAGES) {
  const html = fs.readFileSync(path.join(ROOT, page.file), "utf8");

  // Snapshots reference their own scripts and images; none of that matters here.
  const virtualConsole = new VirtualConsole();
  const dom = new JSDOM(html, {
    url: page.url,
    virtualConsole,
    pretendToBeVisual: true,
    runScripts: "outside-only", // gives window its own eval; page scripts stay inert
  });
  const { window } = dom;

  check(`${page.file}: page loads the widget`, html.includes("/js/time-machine.js"));

  window.eval(WIDGET);

  // Two render modes: the current site puts the control in its nav pill, every
  // archived version gets the standalone shadow-DOM pill.
  const inNav = Boolean(window.document.querySelector(".pill-nav .year-toggle"));
  check(
    `${page.file}: renders ${inNav ? "in the nav" : "as a floating pill"}`,
    inNav === (page.label === "2026")
  );

  let trigger;
  let entries;
  let current;
  let isOpen;

  if (inNav) {
    trigger = window.document.querySelector(".year-toggle");
    const pill = window.document.querySelector(".pill-nav");
    const run = window.document.querySelector(".years-run");
    check(`${page.file}: year run is built`, Boolean(run));
    if (!run) continue;
    entries = [...run.querySelectorAll(".year-item")];
    current = run.querySelector(".year-item[aria-current='true']");
    isOpen = () => pill.classList.contains("is-timeline");
    // The run unfolds inside the pill; there is no dropdown any more.
    check(`${page.file}: run is inside the pill`, run.closest(".pill-nav") === pill);
    check(
      `${page.file}: page tabs sit in a folding slot`,
      Boolean(window.document.querySelector(".fold-slot > .fold-run > .pill-tab"))
    );
  } else {
    const host = window.document.getElementById("time-machine");
    check(`${page.file}: widget mounts`, Boolean(host));
    if (!host) continue;
    const shadow = host.shadowRoot;
    trigger = shadow.querySelector(".trigger");
    entries = [...shadow.querySelectorAll(".year")];
    current = shadow.querySelector(".year[aria-current='true']");
    const wrap = shadow.querySelector(".tm");
    isOpen = () => wrap.dataset.open === "true";
    check(
      `${page.file}: pill shows ${page.label}`,
      shadow.querySelector(".trigger .label").textContent === page.label
    );
  }

  check(
    `${page.file}: lists ${EXPECTED_VERSIONS} versions`,
    entries.length === EXPECTED_VERSIONS,
    `got ${entries.length}`
  );
  check(
    `${page.file}: ${page.label} marked current`,
    current && current.dataset.year === page.label,
    current ? current.dataset.year : "none"
  );
  check(`${page.file}: starts closed`, !isOpen());

  trigger.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  check(`${page.file}: opens on click`, isOpen());

  window.document.dispatchEvent(
    new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })
  );
  check(`${page.file}: closes on Escape`, !isOpen());

  // Every entry should point at a page that actually exists on disk.
  for (const entry of entries) {
    const year = entry.dataset.year;
    const target = year === "2026" ? "index.html" : `archive/${year}/index.html`;
    check(`${page.file}: ${year} target exists`, fs.existsSync(path.join(ROOT, target)), target);
  }

  window.close();
  console.log(`  ok    ${page.file} (${page.label})`);
}

// No snapshot should contain an internal link that resolves to nothing. Those
// escape to the live site's 404 and drop the visitor back into today's design.
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const archiveDir = path.join(ROOT, "archive");
for (const year of fs.readdirSync(archiveDir).sort()) {
  const base = `/archive/${year}/`;
  let dead = 0;

  for (const file of walk(path.join(archiveDir, year))) {
    if (![".html", ".htm"].includes(path.extname(file).toLowerCase())) continue;

    const html = fs.readFileSync(file, "utf8");
    for (const [, url] of html.matchAll(/href="([^"]*)"/g)) {
      if (!url.startsWith(base)) continue;
      const rel = url.slice(base.length).split(/[?#]/)[0];
      const ext = path.extname(rel).toLowerCase();
      if (ext && ext !== ".html" && ext !== ".htm") continue;

      const candidates = rel
        ? [rel, `${rel}.html`, path.join(rel, "index.html")]
        : ["index.html"];
      if (candidates.some((c) => fs.existsSync(path.join(archiveDir, year, c)))) continue;

      dead += 1;
      check(`${year}: dead internal link`, false, `${url} in ${path.relative(archiveDir, file)}`);
    }
  }

  if (!dead) console.log(`  ok    archive/${year} has no dead internal links`);
}

console.log(failures ? `\n${failures} failure(s)` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
