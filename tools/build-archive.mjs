/**
 * Builds the /archive snapshots that back the time machine.
 *
 * For each version below it checks the tree out of git, rewrites root-absolute
 * URLs so the snapshot resolves inside its own folder, and injects the shared
 * time machine script. Rerunning is safe — every snapshot folder is rebuilt
 * from scratch.
 *
 *   node tools/build-archive.mjs            # build every version
 *   node tools/build-archive.mjs 2022 2023  # build a subset
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARCHIVE_DIR = path.join(ROOT, "archive");
const SCRIPT_TAG = '<script src="/js/time-machine.js" defer></script>';

/**
 * One entry per major redesign, labelled with the year that design was live —
 * which is not always the year of the commit. Each commit is the last one
 * before the next redesign landed, so every snapshot shows a design at its most
 * finished rather than frozen mid-life.
 */
const VERSIONS = [
  // "Version 2.1 — Major changes throughout". This design dates back to 2019,
  // before the repo existed; the commit is its last version, not its first. It
  // stayed live until v3 landed in Sep 2021, so it is also the whole 2020 site
  // — the two commits in between only add OG meta tags.
  {
    year: "2019",
    commit: "d350c2f0f969d3a58ee9c7198ec404c562b279c4",
    // The gallery signs off with a year that contradicts the 2019 label. This
    // is the only place any snapshot's own copy is altered.
    edits: [
      {
        file: "gallery.html",
        find: "captured by me,\n            2020.</p>",
        replace: "captured by me.</p>",
      },
    ],
  },
  // "Version 3 Latchman" as it stood at the end of 2021: four pages, canvas
  // art, Shopify internship in the header, no case studies yet.
  { year: "2021", commit: "cb83fbb1680a2684948b2cb8a7c907ca0b575896", themeKey: "appearance" },
  // The same design after the Apr 2022 "Version 3.1" restyle and a year of
  // work — ten pages now, and the only version where the case studies are
  // finished, linked from the home page and still have their images. v4 moved
  // them into old-v2 and unlinked them; Mar 2023 deleted the photos outright.
  { year: "2022", commit: "8f040abf8be4fc6b18aef3bff8d5cdd4648d48c5", themeKey: "appearance" },
  // The "v4? Major revamp" design after 11 more months of work — by now it has
  // picked up the ai.html and gpu.html project pages, and its own footer reads
  // 2023. old-v2 is the previous site's case studies, unlinked and stripped of
  // their images, so the folder is nothing but 94 broken refs.
  {
    year: "2023",
    commit: "37ad0177946376b2b814cb21530fcb57fb15cc55",
    prune: ["old-v2"],
    themeKey: "appearance",
  },
  // No 2024 entry: the MSFT edition (99b323c, Jan 2024) reads as a near-copy of
  // the 2025 rewrite — both are two-page sites built around a music widget.
  // The Oct 2025 rewrite, clean and minimal before the case studies arrived.
  { year: "2025", commit: "a0cae63447c8730cd9f7eaae9e7b20266b39fc15" },
  // 2026 is the live site at the repo root — nothing to snapshot.
];

// Files that are copied but never rewritten (binaries, sourcemaps, LICENSE...).
const TEXT_EXTENSIONS = new Set([".html", ".htm", ".css", ".js", ".mjs", ".json", ".svg"]);
// Repo plumbing that has no business inside a snapshot.
const DROP = new Set(["CNAME", ".vscode", ".DS_Store", ".gitignore", ".github"]);

/** Directories whose absolute references we know are site-local. */
const LOCAL_DIRS = "assets|css|js|fonts|lib|static|img|images|photos|experimental|old-v2";
const ASSET_EXT =
  "png|jpe?g|gif|svg|webp|avif|ico|mp4|webm|mov|css|js|mjs|json|html|pdf|woff2?|ttf|otf|eot";

// Built from the two lists above, once, rather than per file.
const LOCAL_DIR_PATH = new RegExp(`(["'])(\\/(?:${LOCAL_DIRS})\\/[^"'\\s]*)\\1`, "gi");
const ASSET_PATH = new RegExp(
  `(["'])(\\/[A-Za-z0-9_@.\\-\\/]*\\.(?:${ASSET_EXT}))\\1`,
  "gi"
);
const CSS_URL = /url\(\s*(["']?)(\/[^)"']*)\1\s*\)/gi;

function run(args, options = {}) {
  return execFileSync(args[0], args.slice(1), { cwd: ROOT, ...options });
}

/** Maps one root-absolute path onto the snapshot, skipping anything already mapped. */
function remap(url, base) {
  if (!url.startsWith("/") || url.startsWith("//")) return url;
  if (url.startsWith(base)) return url;
  if (url.startsWith("/js/time-machine.js")) return url;
  return base + url.slice(1);
}

function rewriteHtml(source, base) {
  const withAttrs =
    source
      // href="/about", src='/assets/x.png', content="/og.png", poster, action...
      .replace(
        /\b(href|src|action|poster|data-src|data-href|content)=("|')(\/[^"']*)\2/gi,
        (match, attr, quote, url) => `${attr}=${quote}${remap(url, base)}${quote}`
      )
      // Minified pages drop the quotes entirely — href=/projects
      .replace(
        /\b(href|src|action|poster|data-src|data-href)=(\/[^\s>"'`=]*)/gi,
        (match, attr, url) => `${attr}=${remap(url, base)}`
      )
      // srcset carries a comma separated list of candidates
      .replace(/\bsrcset=("|')([^"']*)\1/gi, (match, quote, value) => {
        const rewritten = value
          .split(",")
          .map((candidate) => {
            const trimmed = candidate.trim();
            if (!trimmed) return candidate;
            const [url, ...rest] = trimmed.split(/\s+/);
            return [remap(url, base), ...rest].join(" ");
          })
          .join(", ");
        return `srcset=${quote}${rewritten}${quote}`;
      });

  return rewriteCssUrls(withAttrs, base);
}

function rewriteCssUrls(source, base) {
  return source.replace(
    CSS_URL,
    (match, quote, url) => `url(${quote}${remap(url, base)}${quote})`
  );
}

function rewriteAsset(source, base) {
  const quoted = (match, quote, url) => `${quote}${remap(url, base)}${quote}`;
  // Quoted string literals that are unambiguously site paths: either they point
  // at a known directory, or they end in an asset extension.
  return rewriteCssUrls(source, base)
    .replace(LOCAL_DIR_PATH, quoted)
    .replace(ASSET_PATH, quoted);
}

/** Adds a tag at the top of <head> unless the page already carries one. */
function ensureInHead(html, tag, present) {
  if (present.test(html)) return html;
  return html.replace(/<head([^>]*)>/i, (match) => `${match}\n  ${tag}`);
}

function injectWidget(html, themeKey) {
  if (html.includes("time-machine.js")) return html;

  // Each injection gets its own guard. They were once a single block behind the
  // robots check, which meant a page that happened to declare robots would
  // silently miss the theme bridge as well.
  let out = html;

  // Applied in reverse, since each inserts directly after <head> — the meta ends
  // up first, which is how these pages already read.
  //
  // Must not be deferred: it has to run before the era's own theme script reads
  // localStorage, or the page paints in the wrong theme first.
  if (themeKey) {
    out = ensureInHead(
      out,
      `<script src="/js/theme-sync.js" data-theme-key="${themeKey}"></script>`,
      /theme-sync\.js/
    );
  }

  // Archived pages are duplicates of the live site — keep them out of search.
  out = ensureInHead(out, '<meta name="robots" content="noindex" />', /name=["']robots["']/i);

  return /<\/body>/i.test(out)
    ? out.replace(/<\/body>/i, `  ${SCRIPT_TAG}\n</body>`)
    : `${out}\n${SCRIPT_TAG}\n`;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function build({ year, commit, prune = [], edits = [], themeKey = null }) {
  const base = `/archive/${year}/`;
  // Build into staging and swap at the end. A snapshot that fails partway —
  // a content edit that no longer matches, say — would otherwise be left
  // extracted but unrewritten, and an unrewritten snapshot has absolute paths
  // pointing straight back at the live site.
  const published = path.join(ARCHIVE_DIR, year);
  const target = path.join(ARCHIVE_DIR, `.building-${year}`);

  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });

  // git archive gives a clean tree at the commit without touching the worktree.
  const tar = run(["git", "archive", "--format=tar", commit], {
    maxBuffer: 512 * 1024 * 1024,
    encoding: "buffer",
  });
  run(["tar", "-x", "-C", target], { input: tar, maxBuffer: 512 * 1024 * 1024 });

  for (const name of [...DROP, ...prune]) {
    fs.rmSync(path.join(target, name), { recursive: true, force: true });
  }
  // .DS_Store turns up nested in a few of the older trees.
  for (const file of walk(target)) {
    if (path.basename(file) === ".DS_Store") fs.rmSync(file);
  }

  // Deliberate rewordings of a snapshot's own copy. These throw rather than
  // silently no-op — if a version's commit ever moves, a stale edit should stop
  // the build instead of quietly leaving the old text in place.
  for (const { file, find, replace } of edits) {
    const full = path.join(target, file);
    const before = fs.readFileSync(full, "utf8");
    if (!before.includes(find)) {
      throw new Error(
        `${year}: content edit no longer matches in ${file} — looked for ${JSON.stringify(find)}`
      );
    }
    fs.writeFileSync(full, before.split(find).join(replace));
  }

  let rewritten = 0;
  let injected = 0;

  for (const file of walk(target)) {
    const ext = path.extname(file).toLowerCase();
    if (!TEXT_EXTENSIONS.has(ext)) continue;

    const original = fs.readFileSync(file, "utf8");
    const isHtml = ext === ".html" || ext === ".htm";
    let updated = isHtml ? rewriteHtml(original, base) : rewriteAsset(original, base);
    if (isHtml) {
      const withWidget = injectWidget(updated, themeKey);
      if (withWidget !== updated) injected += 1;
      updated = withWidget;
    }
    if (updated !== original) {
      fs.writeFileSync(file, updated);
      rewritten += 1;
    }
  }

  // Some links were already broken when the site was live — the 2022 home page
  // points "View all" at /work, which never existed. Left alone they fall
  // through to the live site's 404, dumping a visitor from 2022 into today's
  // design. Send them to the snapshot's own 404 instead, which is what the real
  // site would have shown at the time.
  const fallback = fs.existsSync(path.join(target, "404.html")) ? `${base}404.html` : null;
  let redirected = 0;

  if (fallback) {
    for (const file of walk(target)) {
      const ext = path.extname(file).toLowerCase();
      if (ext !== ".html" && ext !== ".htm") continue;

      const original = fs.readFileSync(file, "utf8");
      const updated = original.replace(/href="([^"]*)"/g, (match, url) => {
        if (!url.startsWith(base) || url === fallback) return match;

        const rel = url.slice(base.length).split(/[?#]/)[0];
        // Only page links. A missing stylesheet should stay missing, not
        // silently start resolving to an HTML document.
        const linkExt = path.extname(rel).toLowerCase();
        if (linkExt && linkExt !== ".html" && linkExt !== ".htm") return match;

        const candidates = rel
          ? [rel, `${rel}.html`, path.join(rel, "index.html")]
          : ["index.html"];
        if (candidates.some((c) => fs.existsSync(path.join(target, c)))) return match;

        redirected += 1;
        return `href="${fallback}"`;
      });

      if (updated !== original) fs.writeFileSync(file, updated);
    }
  }

  const subject = run(["git", "log", "-1", "--format=%ad — %s", "--date=short", commit], {
    encoding: "utf8",
  }).trim();

  const bytes = walk(target).reduce((sum, file) => sum + fs.statSync(file).size, 0);

  fs.rmSync(published, { recursive: true, force: true });
  fs.renameSync(target, published);

  console.log(
    `${year}  ${commit.slice(0, 7)}  ${subject}\n` +
      `      ${injected} page(s) wired up, ${rewritten} file(s) rewritten, ` +
      `${redirected} dead link(s) sent to the era 404, ` +
      `${(bytes / 1048576).toFixed(1)} MB`
  );
}

const requested = process.argv.slice(2);
const selected = requested.length
  ? VERSIONS.filter((version) => requested.includes(version.year))
  : VERSIONS;

if (!selected.length) {
  console.error(`No matching versions. Known: ${VERSIONS.map((v) => v.year).join(", ")}`);
  process.exit(1);
}

fs.mkdirSync(ARCHIVE_DIR, { recursive: true });

for (const version of selected) {
  try {
    build(version);
  } catch (error) {
    // Never leave a half-built snapshot sitting in archive/.
    fs.rmSync(path.join(ARCHIVE_DIR, `.building-${version.year}`), {
      recursive: true,
      force: true,
    });
    throw error;
  }
}
