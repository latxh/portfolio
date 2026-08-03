/**
 * Time machine — a version switcher that rides along on every snapshot of the
 * site. Archived pages load this file from the live root (/js/time-machine.js),
 * so the list below is the single source of truth: edit it here and every
 * version, past and present, picks up the change on next load.
 *
 * It renders one of two ways.
 *
 * On the current site there is already a nav pill, so the control joins it as
 * another member — trigger markup sits in the pages, styling in
 * css/time-machine.css, and this script only opens and closes the menu. That
 * keeps it native to the design system rather than floating over it.
 *
 * Every archived version gets a self-contained pill pinned to the top instead.
 * Those pages carry their own global CSS going back years, so the whole control
 * is built here inside a shadow root where none of it can reach in.
 */
(function () {
  "use strict";

  /**
   * Each entry is a design, labelled with the year it was live — which is not
   * always the year of the commit it was cut from. The year doubles as the
   * folder name under /archive; the live site sits at the root.
   */
  var VERSIONS = [
    { year: "2019", path: "/archive/2019/", note: "Where it started" },
    { year: "2021", path: "/archive/2021/", note: "Shopify era" },
    { year: "2022", path: "/archive/2022/", note: "Microsoft era" },
    { year: "2023", path: "/archive/2023/", note: "Seattle bound" },
    // Dark only — that rewrite shipped with color-scheme: dark and no toggle,
    // so there is no class on the body to read and the pill has to be told.
    { year: "2025", path: "/archive/2025/", note: "Rebuilt from scratch", theme: "dark" },
    { year: "2026", path: "/", note: "Today" },
  ];

  var LIVE_YEAR = "2026";

  // Matches the .34s the panel and label transitions run for.
  var SETTLE_MS = 360;

  var OPEN_LABEL = "Time machine";
  var CLOSE_LABEL = "Collapse time machine";


  if (!document.body) return;
  if (document.getElementById("time-machine")) return;

  var archived = /^\/archive\/(\d{4})(\/|$)/.exec(window.location.pathname);
  var activeYear = archived ? archived[1] : LIVE_YEAR;
  if (!VERSIONS.some(function (v) { return v.year === activeYear; })) {
    activeYear = LIVE_YEAR;
  }

  function versionFor(year) {
    return VERSIONS.filter(function (v) { return v.year === year; })[0];
  }

  // Set for eras that ship one theme and no toggle, so there is no class on the
  // body to read. Resolved once — it cannot change while the page is open.
  var FIXED_THEME = versionFor(activeYear).theme;

  // The current site ships its own trigger inside the nav pill. Anything else
  // is an archived page, which gets the standalone pill built below.
  var navTrigger = document.querySelector(".pill-nav .year-toggle");
  if (navTrigger) return mountInNav(navTrigger);

  if (!document.body.attachShadow) return;

  /**
   * Current site: the pill morphs rather than dropping a menu. Pressing the
   * trigger folds the page tabs away and unfolds the year run in their place,
   * which is the same move the archived pill makes with its own bar — one
   * behaviour across every version instead of two.
   *
   * The trigger and its styling already ship in the pages; everything below is
   * the run and the folding.
   */
  function mountInNav(trigger) {
    var pill = trigger.closest(".pill-nav");

    // Wrappers exist only to drive the fold, so they are built here rather than
    // written into all three pages. Each slot animates its track from 1fr to
    // 0fr; the run inside it is a plain box, because min-width: 0 cannot shrink
    // a control past its own padding.
    //
    // Everything that folds away shares one pair of names; the year run needs
    // its own because it folds the other way.
    function slot(kind) {
      var outer = document.createElement("div");
      outer.className = (kind || "fold") + "-slot";
      var inner = document.createElement("div");
      inner.className = (kind || "fold") + "-run";
      outer.appendChild(inner);
      return outer;
    }

    var tabs = [].slice.call(pill.querySelectorAll(".pill-tab"));
    var tabsSlot = slot();
    pill.insertBefore(tabsSlot, tabs[0]);
    tabs.forEach(function (tab) {
      tabsSlot.firstChild.appendChild(tab);
    });

    var yearsSlot = slot("years");
    var yearsRun = yearsSlot.firstChild;
    trigger.parentNode.insertBefore(yearsSlot, trigger.nextSibling);

    // The theme control folds away too — the run is the whole pill while it is
    // open, and the toggle comes back with the tabs.
    var theme = pill.querySelector(".theme-toggle");
    if (theme) {
      var themeSlot = slot();
      pill.insertBefore(themeSlot, theme);
      themeSlot.firstChild.appendChild(theme);
    }

    var items = VERSIONS.map(function (version) {
      var item = document.createElement("a");
      item.className = "year-item";
      item.href = version.path;
      item.dataset.year = version.year;
      item.textContent = version.year;
      item.setAttribute("aria-label", version.year + " — " + version.note);
      if (version.year === activeYear) item.setAttribute("aria-current", "true");

      item.addEventListener("click", function (event) {
        if (version.year !== activeYear) return;
        // Already here — the entry doubles as the way back, as it does on the
        // archived pill.
        event.preventDefault();
        setOpen(false);
      });

      yearsRun.appendChild(item);
      return item;
    });

    var triggerTip = trigger.querySelector(".tool-tip");
    var open = false;
    var settleTimer;

    function setOpen(next) {
      open = next;
      pill.classList.toggle("is-timeline", next);
      if (triggerTip) triggerTip.textContent = next ? CLOSE_LABEL : OPEN_LABEL;
      // Only when it actually changes: setAttribute emits a mutation record even
      // for an identical value, and the indicator observes this attribute — so
      // the no-op write at init would start a settle loop over a still page.

      // The runs have to clip while the fold is in motion, which also clips the
      // tooltips hanging off the controls inside them. Marking the pill settled
      // once the fold is done hands those tooltips back.
      pill.classList.remove("is-settled");
      clearTimeout(settleTimer);
      settleTimer = setTimeout(function () {
        pill.classList.add("is-settled");
      }, SETTLE_MS);
      trigger.setAttribute("aria-expanded", String(next));
      // Folded away, so not a tab stop either.
      tabs.concat(theme || []).forEach(function (control) {
        if (next) control.setAttribute("tabindex", "-1");
        else control.removeAttribute("tabindex");
      });
      items.forEach(function (item) {
        if (next) item.removeAttribute("tabindex");
        else item.setAttribute("tabindex", "-1");
      });
    }

    setOpen(false);
    pill.classList.add("is-settled");

    trigger.addEventListener("click", function (event) {
      event.stopPropagation();
      setOpen(!open);
    });

    yearsRun.addEventListener("keydown", function (event) {
      var index = items.indexOf(event.target);
      if (index === -1) return;
      var step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      items[(index + step + items.length) % items.length].focus();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && open) {
        setOpen(false);
        trigger.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (open && !pill.contains(event.target)) setOpen(false);
    });
  }

  var host = document.createElement("div");
  host.id = "time-machine";
  var root = host.attachShadow({ mode: "open" });

  var style = document.createElement("style");
  style.textContent = [
    /* The current site's tokens, restated. Custom properties inherit into a
       shadow root, but these pages are from before any of them existed, so the
       values are carried here and switched off the era's own theme. */
    ":host {",
    "  --tm-surface: rgba(255,255,255,.72);",
    "  --tm-active: #e8eaee;",
    "  --tm-font-1: #101112;",
    "  --tm-font-2: #686e78;",
    "  --tm-shadow: rgba(16,17,18,.1);",
    "  --tm-tip: #fff;",
    "  --tm-focus: #1668dc;",
    "  color-scheme: light;",
    "  position: fixed;",
    "  left: 50%;",
    "  top: max(16px, env(safe-area-inset-top, 0px));",
    "  transform: translateX(-50%);",
    "  z-index: 2147483647;",
    "  max-width: calc(100vw - 24px);",
    "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;",
    "}",
    ":host([data-theme='dark']) {",
    "  --tm-surface: rgba(28,30,33,.72);",
    "  --tm-active: #2a2d32;",
    "  --tm-font-1: #ececed;",
    "  --tm-font-2: #9aa1ab;",
    "  --tm-shadow: rgba(0,0,0,.55);",
    "  --tm-tip: #1c1e21;",
    "  --tm-focus: #5ba4ff;",
    "  color-scheme: dark;",
    "}",
    "@media print { :host { display: none; } }",

    ".tm {",
    "  display: flex;",
    "  flex-direction: column;",
    "  align-items: center;",
    "  opacity: 0;",
    "  transform: translateY(-8px);",
    "  transition: opacity .45s ease, transform .45s cubic-bezier(.22,1,.36,1);",
    "}",
    ".tm.is-ready { opacity: 1; transform: none; }",

    /* One of the site's tooltips, behaving like one: it names whichever year is
       under the pointer and is centred on that year rather than on the bar.
       Script sets --at to the middle of the hovered entry. */
    ".note {",
    "  position: absolute;",
    /* 8px off the bar puts it on the same line the current site's tooltips
       land on: those are 12px off a control that sits 4px inside its pill. */
    "  top: calc(100% + 8px);",
    "  left: var(--at, 50%);",
    "  z-index: 1;",
    "  font-size: 11px;",
    "  line-height: 1;",
    "  padding: 6px 10px;",
    "  border-radius: 8px;",
    "  background: var(--tm-tip);",
    "  box-shadow: 0 4px 12px var(--tm-shadow);",
    "  color: var(--tm-font-1);",
    "  white-space: nowrap;",
    "  opacity: 0;",
    "  visibility: hidden;",
    "  translate: -50% 0;",
    "  transform: scale(.9);",
    "  transform-origin: top;",
    "  transition: opacity .15s ease, transform .15s ease, visibility .15s;",
    "  pointer-events: none;",
    "}",
    ".note.is-shown { opacity: 1; visibility: visible; transform: scale(1); }",

    /* No gap while closed. The panel collapses to nothing but the gap that
       separates it from the trigger does not, and it reads as the pill being
       lopsided — more air to the right of the chevron than left of the year. */
    ".bar {",
    "  position: relative;",
    "  display: flex;",
    "  align-items: center;",
    "  gap: 0;",
    "  padding: 4px;",
    "  transition: gap .34s cubic-bezier(.22,1,.36,1);",
    "  border-radius: 48px;",
    "  background: var(--tm-surface);",
    "  -webkit-backdrop-filter: blur(20px);",
    "  backdrop-filter: blur(20px);",
    "  box-shadow: 0 8px 24px var(--tm-shadow);",
    "  max-width: 100%;",
    "}",

    /* The sliding fill the current nav uses in place of a painted-on active
       state. Sits under the controls and is moved by script. */
    ".indicator {",
    "  position: absolute;",
    "  top: 4px;",
    "  left: 0;",
    "  height: 40px;",
    "  width: 0;",
    "  opacity: 0;",
    "  border-radius: 48px;",
    "  background: var(--tm-active);",
    "  transition: transform .25s ease, width .25s ease, opacity .2s ease;",
    "  pointer-events: none;",
    "}",
    ".indicator.no-transition { transition: none; }",

    "button {",
    "  position: relative;",
    "  z-index: 1;",
    "  appearance: none;",
    "  -webkit-appearance: none;",
    "  margin: 0;",
    "  border: 0;",
    "  background: transparent;",
    "  color: var(--tm-font-2);",
    "  font: inherit;",
    "  font-size: 12px;",
    "  font-variant-numeric: tabular-nums;",
    "  line-height: 1;",
    "  height: 40px;",
    "  border-radius: 48px;",
    "  cursor: pointer;",
    "  display: inline-flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  white-space: nowrap;",
    "  flex: none;",
    "  transition: color .2s;",
    "}",
    "button:hover { color: var(--tm-font-1); }",
    "button:focus-visible { outline: 2px solid var(--tm-focus); outline-offset: -2px; }",

    /* Only the year folds away as the run opens — it is the one thing the run
       already shows, highlighted. The chevron stays put and becomes the way
       back. Mirrors the panel's 0fr trick, in reverse. */
    ".label-slot {",
    "  display: grid;",
    "  grid-template-columns: 1fr;",
    "  transition: grid-template-columns .34s cubic-bezier(.22,1,.36,1);",
    "}",
    ".tm[data-open='true'] .label-slot { grid-template-columns: 0fr; }",
    ".label-slot > .label { overflow: hidden; min-width: 0; }",
    /* The gap has to go with it, or the collapsed trigger keeps 7px of air
       where the year used to be. */
    /* Less padding on the chevron side: that glyph is drawn at x 8.5-16.7 of a
       24-wide box, so it carries about 4px of its own air on each side and an
       even 12px would read as a lopsided pill. */
    ".trigger {",
    "  gap: 7px;",
    "  padding: 0 8px 0 12px;",
    "  color: var(--tm-font-1);",
    "  transition: color .2s, gap .34s cubic-bezier(.22,1,.36,1),",
    "    padding .34s cubic-bezier(.22,1,.36,1);",
    "}",
    /* Once the year folds away the chevron is on its own, so the padding is set
       to square the button against its 40px height — 13.5 + 13 + 13.5 — and the
       fill lands on it as a circle rather than a standing oval. */
    ".tm[data-open='true'] .trigger { gap: 0; padding: 0 13.5px; }",
    /* Drawn pointing right, which is the direction the run unfolds, so it is
       left as-drawn while collapsed and turned to point back the other way
       once there is something to fold up. */
    ".trigger .chevron {",
    "  width: 13px; height: 13px; flex: none; opacity: .7;",
    "  transform: rotate(0deg);",
    "  transition: transform .3s cubic-bezier(.22,1,.36,1);",
    "}",
    ".tm[data-open='true'] .trigger .chevron { transform: rotate(180deg); }",

    /* 0fr -> 1fr animates the panel open without measuring anything. */
    ".panel {",
    "  display: grid;",
    "  grid-template-columns: 0fr;",
    "  transition: grid-template-columns .34s cubic-bezier(.22,1,.36,1);",
    "}",
    ".tm[data-open='true'] .bar { gap: 2px; }",
    ".tm[data-open='true'] .panel { grid-template-columns: 1fr; }",
    ".panel > .years { overflow: hidden; min-width: 0; display: flex; gap: 2px; }",
    ".years { scrollbar-width: none; }",
    ".years::-webkit-scrollbar { display: none; }",
    ".tm[data-open='true'] .years { overflow-x: auto; }",
    ".year { padding: 0 12px; }",
    ".year[aria-current='true'] { color: var(--tm-font-1); }",

    /* Only one thing in the bar reads as lit at a time, as in the current nav. */
    ".bar:has(button:hover) .year[aria-current='true']:not(:hover) {",
    "  color: var(--tm-font-2);",
    "}",

    "@media (max-width: 520px) {",
    "  .trigger { padding: 0 10px; }",
    "  .year { padding: 0 10px; }",
    "}",

    "@media (prefers-reduced-motion: reduce) {",
    "  .tm, .note, .bar, .panel, .label-slot, .chevron, button, .indicator { transition: none; }",
    "  .tm { transform: none; }",
    "}",
  ].join("\n");

  var wrap = document.createElement("div");
  wrap.className = "tm";
  wrap.dataset.open = "false";

  var note = document.createElement("div");
  note.className = "note";
  note.setAttribute("aria-hidden", "true");

  var bar = document.createElement("div");
  bar.className = "bar";

  var indicator = document.createElement("span");
  indicator.className = "indicator";
  bar.appendChild(indicator);

  var trigger = document.createElement("button");
  trigger.className = "trigger";
  trigger.type = "button";
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute(
    "aria-label",
    activeYear === LIVE_YEAR
      ? "Time machine — viewing the current version of this site"
      : "Time machine — viewing the " + activeYear + " version of this site"
  );
  trigger.innerHTML =
    '<span class="label-slot"><span class="label">' + activeYear + "</span></span>" +
    // Fluent's chevron, which is drawn pointing right; CSS turns it to point
    // down while collapsed and up once the run is open.
    '<svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" ' +
    'd="M8.47 4.22a.75.75 0 0 0 0 1.06L15.19 12l-6.72 6.72a.75.75 0 1 0 1.06 1.06l7.25-7.25a.75.75 ' +
    '0 0 0 0-1.06L9.53 4.22a.75.75 0 0 0-1.06 0Z"></path></svg>';

  var panel = document.createElement("div");
  panel.className = "panel";

  var years = document.createElement("div");
  years.className = "years";
  years.setAttribute("role", "group");
  years.setAttribute("aria-label", "Site versions by year");

  var currentButton = null;

  var buttons = VERSIONS.map(function (version) {
    var button = document.createElement("button");
    button.className = "year";
    button.type = "button";
    button.textContent = version.year;
    button.dataset.year = version.year;
    button.setAttribute("aria-current", String(version.year === activeYear));
    button.setAttribute("aria-label", version.year + " — " + version.note);
    button.addEventListener("click", function () {
      if (version.year === activeYear) {
        setOpen(false);
        return;
      }
      window.location.href = version.path;
    });
    function enter() {
      place(button);
    }
    button.addEventListener("mouseenter", enter);
    button.addEventListener("focus", enter);
    if (version.year === activeYear) currentButton = button;
    years.appendChild(button);
    return button;
  });

  panel.appendChild(years);
  bar.appendChild(trigger);
  bar.appendChild(panel);
  bar.appendChild(note);
  wrap.appendChild(bar);
  root.appendChild(style);
  root.appendChild(wrap);
  document.body.appendChild(host);

  /* offsetLeft is measured against the bar, which does not move when the year
     run scrolls sideways on a narrow screen — so the scroll has to come off by
     hand or the fill and the label drift away from the entry. */
  function barOffset(el) {
    return el.offsetLeft - (years.contains(el) ? years.scrollLeft : 0);
  }

  function showNote(target, text) {
    note.textContent = text;
    note.style.setProperty("--at", barOffset(target) + target.offsetWidth / 2 + "px");
    note.classList.add("is-shown");
  }

  function hideNote() {
    note.classList.remove("is-shown");
  }

  /* Where the fill sits when nothing is under the pointer: on the year you are
     viewing once the run is open, and behind the trigger while it is closed —
     the trigger is standing in for that year at that point. */
  function resting() {
    return open ? currentButton : trigger;
  }

  function place(target) {
    if (!target) {
      indicator.style.opacity = "0";
      return;
    }
    indicator.style.width = target.offsetWidth + "px";
    indicator.style.transform = "translateX(" + barOffset(target) + "px)";
    indicator.style.opacity = "1";
  }

  function hovered() {
    return buttons.concat(trigger).filter(function (el) {
      return el.matches(":hover");
    })[0];
  }

  /* Opening and closing animate the year run and the label at the same time, so
     everything the fill measures against is still moving. Measuring once at the
     start locks in a stale width — the trigger it lands on is mid-collapse.
     Re-measuring each frame instead, with the fill's own transition off so the
     two do not fight, lets it ride the layout to wherever it settles. */
  var settling = 0;

  function settle() {
    // Nothing moves under prefers-reduced-motion, so the layout is already
    // final and the loop would be pure forced reflow.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      place(hovered() || resting());
      return;
    }

    cancelAnimationFrame(settling);
    indicator.classList.add("no-transition");
    var started = null;

    settling = requestAnimationFrame(function step(now) {
      if (started === null) started = now;
      place(hovered() || resting());
      if (now - started < SETTLE_MS) settling = requestAnimationFrame(step);
      else indicator.classList.remove("no-transition");
    });
  }

  var open = false;

  function setOpen(next) {
    open = next;
    wrap.dataset.open = String(next);
    trigger.setAttribute("aria-expanded", String(next));
    settle();
    hideNote();
    if (!next) return;
    // Keep the version you are on in view when the years overflow on a narrow
    // screen. Setting scrollLeft by hand — scrollIntoView would be allowed to
    // scroll the page behind the widget.
    window.setTimeout(function () {
      if (!currentButton) return;
      var centered =
        currentButton.offsetLeft - (years.clientWidth - currentButton.offsetWidth) / 2;
      years.scrollLeft = Math.max(0, centered);
    }, SETTLE_MS);
  }

  trigger.addEventListener("click", function (event) {
    event.stopPropagation();
    setOpen(!open);
  });

  function showTriggerNote() {
    place(trigger);
    showNote(trigger, open ? CLOSE_LABEL : OPEN_LABEL);
  }

  trigger.addEventListener("mouseenter", showTriggerNote);
  trigger.addEventListener("focus", showTriggerNote);
  trigger.addEventListener("mouseleave", hideNote);
  trigger.addEventListener("blur", hideNote);
  bar.addEventListener("mouseleave", function () { place(resting()); });

  years.addEventListener("keydown", function (event) {
    var index = buttons.indexOf(event.target);
    if (index === -1) return;
    var step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    buttons[(index + step + buttons.length) % buttons.length].focus();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && open) {
      setOpen(false);
      trigger.focus();
    }
  });

  document.addEventListener("click", function (event) {
    // Clicks inside the shadow root are retargeted to the host element.
    if (open && event.target !== host) setOpen(false);
  });

  /* These pages predate the current site's theme tokens, so the pill takes its
     colours from whatever the era itself is showing: 2021 through 2023 mark
     dark mode with a class on the body, and the two without a dark mode never
     set it. Watched, so toggling the theme on one of those pages brings the
     pill along. */
  function syncTheme() {
    host.dataset.theme =
      FIXED_THEME || (document.body.classList.contains("dark") ? "dark" : "light");
  }

  syncTheme();
  if (window.MutationObserver) {
    new MutationObserver(syncTheme).observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  // First placement without the slide, the way the nav seats its own indicator.
  indicator.classList.add("no-transition");
  place(resting());
  requestAnimationFrame(function () {
    indicator.classList.remove("no-transition");
    wrap.classList.add("is-ready");
  });

  window.addEventListener("resize", function () { place(resting()); });

  // Scrolling the run sideways moves the entries out from under both the fill
  // and the label, neither of which is inside the scroller. Coalesced into one
  // update per frame — momentum scrolling fires this far faster than that, and
  // each pass reads layout.
  var tracking = 0;
  years.addEventListener("scroll", function () {
    cancelAnimationFrame(tracking);
    tracking = requestAnimationFrame(function () {
      place(hovered() || resting());
    });
  });
})();
