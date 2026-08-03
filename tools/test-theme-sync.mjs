/**
 * Verifies that a light/dark choice survives moving between versions.
 *
 * Runs the real snapshot pages in jsdom against a single shared localStorage,
 * the way one browser would see them.
 *
 *   npm install --no-save jsdom && node tools/test-theme-sync.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BRIDGE = fs.readFileSync(path.join(ROOT, "js", "theme-sync.js"), "utf8");

// Eras that ship a toggle, and the key each one stores its choice under.
const ERAS = [
  { year: "2021", key: "appearance" },
  { year: "2022", key: "appearance" },
  { year: "2023", key: "appearance" },
];

let failures = 0;

function check(label, actual, expected) {
  if (actual === expected) return console.log(`  ok    ${label}`);
  failures += 1;
  console.error(`  FAIL  ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

/** One page visit: fresh document, shared storage, bridge runs as in <head>. */
function visit(file, storage, themeKey) {
  const virtualConsole = new VirtualConsole();
  const dom = new JSDOM(fs.readFileSync(path.join(ROOT, file), "utf8"), {
    url: "https://latchman.ca/",
    virtualConsole,
    runScripts: "outside-only",
  });
  const { window } = dom;

  // Hand the page the storage carried over from the previous visit.
  storage.mount(window);

  if (themeKey) {
    const tag = window.document.createElement("script");
    tag.setAttribute("data-theme-key", themeKey);
    window.document.head.appendChild(tag);
    Object.defineProperty(window.document, "currentScript", {
      value: tag,
      configurable: true,
    });
    window.eval(BRIDGE);
  }
  return window;
}

/**
 * Stand-in for one browser's localStorage across several page loads.
 *
 * The stored data outlives a page load but the JS context does not, so each
 * mount gets a fresh Storage class — an unpatched prototype — over the same
 * data. That matters: the bridge wraps Storage.prototype.setItem, and a plain
 * object with its own setItem would never see the patch, so the test would pass
 * or fail for reasons the browser wouldn't share.
 */
function makeStorage(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    mount(window) {
      function Storage() {}
      Storage.prototype.getItem = function (k) { return data.has(k) ? data.get(k) : null; };
      Storage.prototype.setItem = function (k, v) { data.set(k, String(v)); };
      Storage.prototype.removeItem = function (k) { data.delete(k); };
      Storage.prototype.clear = function () { data.clear(); };

      const instance = new Storage();
      Object.defineProperty(window, "Storage", { value: Storage, configurable: true });
      Object.defineProperty(window, "localStorage", { value: instance, configurable: true });
      return instance;
    },
  };
}

console.log("\ncurrent site → archived era");
for (const era of ERAS) {
  for (const choice of ["dark", "light"]) {
    const storage = makeStorage({ theme: choice });
    visit(`archive/${era.year}/index.html`, storage, era.key);
    check(`${choice} set today carries into ${era.year}`, storage.getItem(era.key), choice);
  }
}

console.log("\narchived era → current site");
for (const era of ERAS) {
  // Someone toggles inside the old site: its own script writes its own key.
  const storage = makeStorage({ theme: "dark" });
  const window = visit(`archive/${era.year}/index.html`, storage, era.key);
  window.localStorage.setItem(era.key, "light");
  check(`toggling to light in ${era.year} updates the shared key`, storage.getItem("theme"), "light");
}

console.log("\nfollowing the OS");
for (const era of ERAS) {
  const storage = makeStorage();
  visit(`archive/${era.year}/index.html`, storage, era.key);
  check(`${era.year} defaults to system when nothing is set`, storage.getItem(era.key), "system");
}

{
  // A choice made in an old era before this feature existed should be adopted,
  // not clobbered, on the next visit.
  const storage = makeStorage({ appearance: "dark" });
  visit("archive/2022/index.html", storage, "appearance");
  check("a pre-existing era choice is promoted to the shared key", storage.getItem("theme"), "dark");
}

{
  // Storage has a named property setter — a naive patch would store an item
  // literally called "setItem" instead of wrapping the method.
  const storage = makeStorage({ theme: "dark" });
  visit("archive/2022/index.html", storage, "appearance");
  check("no stray setItem entry written", storage.getItem("setItem"), null);
}

console.log("\neras without a toggle are left alone");
for (const year of ["2019", "2025"]) {
  const html = fs.readFileSync(path.join(ROOT, `archive/${year}/index.html`), "utf8");
  check(`${year} does not load the bridge`, html.includes("theme-sync.js"), false);
}

const live = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
check("live site does not load the bridge", live.includes("theme-sync.js"), false);
check("live site still owns the canonical key", live.includes('localStorage.getItem("theme")'), true);

console.log(failures ? `\n${failures} failure(s)` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
