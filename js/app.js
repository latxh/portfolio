const MESSAGE_LIST = [
  "Painting with code",
  "Going with the flow",
  "Hello from Toronto",
  "Meapless in Seattle",
  "Lo' Howler",
  "Till the next",
];

const MUSIC_LIST = [
  [
    "https://www.youtube.com/watch?v=X0WVU2xoD2o",
    "/assets/album-art/90210.png",
    "90210",
    "by Travis Scott",
  ],
  [
    "https://www.youtube.com/watch?v=dMV31MWIjLE",
    "/assets/album-art/pyramids.png",
    "Pyramids",
    "by Frank Ocean",
  ],
  [
    "https://www.youtube.com/watch?v=y32ejtuxSjM",
    "/assets/album-art/pyt.png",
    "P.Y.T.",
    "by Michael Jackson",
  ],
  [
    "https://www.youtube.com/watch?v=P891n88xOCc",
    "/assets/album-art/zeta-halo.png",
    "Zeta Halo",
    "by Curtis Schweitzer",
  ],
  [
    "https://www.youtube.com/watch?v=eMGRt0A9Yns",
    "/assets/album-art/mice-on-venus.png",
    "Mice on Venus",
    "by C418",
  ],
  [
    "https://www.youtube.com/watch?v=dGgBzSfgVsA",
    "/assets/album-art/drive-me-crazy.png",
    "drive ME crazy!",
    "by Lil Yachty",
  ],
  [
    "https://www.youtube.com/watch?v=XEolg577-DA",
    "/assets/album-art/mr-rager.png",
    "Mr.Rager",
    "by Kid Cudi",
  ],
  [
    "https://www.youtube.com/watch?v=LmbC_aqI4no",
    "/assets/album-art/summer-sixteen.png",
    "Summer Sixteen",
    "by Drake",
  ],
  [
    "https://www.youtube.com/watch?v=SB0GxBSFUJk",
    "/assets/album-art/seek-and-destroy.png",
    "Seek & Destroy",
    "by SZA",
  ],
  [
    "https://www.youtube.com/watch?v=MRMhH1mnEg4",
    "/assets/album-art/father-stretch-my-hands.png",
    "Father Stretch My Hands",
    "by Sunday Service",
  ],
  [
    "https://www.youtube.com/watch?v=h_VCgsWLmY4",
    "/assets/album-art/reminder.png",
    "Reminder",
    "by The Weeknd",
  ],
  [
    "https://www.youtube.com/watch?v=2nR1zrNzgcY",
    "/assets/album-art/fein.png",
    "FE!N",
    "by Travis Scott",
  ],
  [
    "https://www.youtube.com/watch?v=_h2WpMH_q-I",
    "/assets/album-art/devil-in-a-new-dress.png",
    "Devil in a New Dress",
    "by Kanye",
  ],
    [
    "https://www.youtube.com/watch?v=SNCqYFYMkT8",
    "/assets/album-art/whatever-works.png",
    "Whatever Works",
    "by Kanye",
  ],
  [
    "https://www.youtube.com/watch?v=WSSShAOKYfo",
    "/assets/album-art/consideration.png",
    "Consideration",
    "by Rihanna",
  ],
  [
    "https://www.youtube.com/watch?v=FTIvFD7TCVg",
    "/assets/album-art/everything-is-romantic.png",
    "Everything is Romantic",
    "by Charli XCX",
  ],
  [
    "https://www.youtube.com/watch?v=-gc1O5VImyY",
    "/assets/album-art/christmas-and-chill.png",
    "Christmas & Chill",
    "by Ariana Grande",
  ],
  [
    "https://www.youtube.com/watch?v=SHP-xh5NnVs",
    "/assets/album-art/toronto-2014.png",
    "Toronto 2014",
    "by Daniel Caesar",
  ],
  [
    "https://www.youtube.com/watch?v=e0JhRAxlQ1I",
    "/assets/album-art/imperfect-for-you.png",
    "Imperfect For You",
    "by Ariana Grande",
  ],
  [
    "https://www.youtube.com/watch?v=Q86_nlRoIGw",
    "/assets/album-art/hello-miss-johnson.png",
    "Hello Miss Johnson",
    "by Jack Harlow",
  ],
  [
    "https://www.youtube.com/watch?v=72wCf0yG9Wo",
    "/assets/album-art/through-the-sea-of-time.png",
    "Through the Sea of Time",
    "by Arata Iiyoshi",
  ],
  [
    "https://www.youtube.com/watch?v=8O01B5BN298",
    "/assets/album-art/1942.png",
    "1942",
    "by NEMZZZ",
  ],
  [
    "https://www.youtube.com/watch?v=X2DTROC4JCI",
    "/assets/album-art/solo.png",
    "Solo",
    "by Future",
  ],
  [
    "https://www.youtube.com/watch?v=i-DK2XUsKuw",
    "/assets/album-art/spiderman-superman.png",
    "Spiderman Superman",
    "by PartyNextDoor",
  ],
    [
    "https://www.youtube.com/watch?v=K9OzeJauM0Q",
    "/assets/album-art/trini-2-de-bone.png",
    "Trini 2 De Bone",
    "by David Rudder",
  ],
];

const MUSIC_CARD_COUNT = 3;

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const shuffleArray = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const initRandomMessage = () => {
  const randomMessageElement = document.getElementById("random-message");
  if (randomMessageElement) {
    randomMessageElement.innerHTML = getRandomElement(MESSAGE_LIST);
  }
};

const initMusicCards = () => {
  if (!document.querySelector(".card-stack-container")) return;

  const selectedSongs = shuffleArray(MUSIC_LIST).slice(0, MUSIC_CARD_COUNT);

  for (let i = 0; i < MUSIC_CARD_COUNT; i++) {
    const [url, imageSrc, title] = selectedSongs[i];
    const cardIndex = i + 1;

    const musicCard = document.getElementById(`music-card-${cardIndex}`);
    const albumCover = document.getElementById(`album-cover-${cardIndex}`);
    const musicTooltip = document.getElementById(`music-tooltip-${cardIndex}`);

    if (musicCard) musicCard.href = url;
    if (albumCover) albumCover.src = imageSrc;
    if (musicTooltip) musicTooltip.innerHTML = title;
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      document.querySelectorAll(".music-card").forEach((card) => card.blur());
    }
  });
};

const EMAIL = "latxhman@gmail.com";
const SWAP_MS = 120;
const COPIED_HOLD_MS = 1400;

// Swap a label's text with a short vertical wipe — the old text lifts out, the
// new one rises into its place.
const swapLabel = (label, text) => {
  label.classList.add("is-leaving");
  setTimeout(() => {
    label.textContent = text;
    label.classList.add("is-entering"); // sits low and transparent, untransitioned
    label.classList.remove("is-leaving");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => label.classList.remove("is-entering"))
    );
  }, SWAP_MS);
};

const copyEmail = (el) => {
  // click and Enter can both land on this — ignore anything mid-swap
  if (el.dataset.busy) return;

  const label = el.querySelector("p") || el;
  const original = label.textContent;
  el.dataset.busy = "true";

  const confirm = (message) => {
    swapLabel(label, message);
    setTimeout(() => {
      swapLabel(label, original);
      setTimeout(() => delete el.dataset.busy, SWAP_MS);
    }, COPIED_HOLD_MS);
  };

  navigator.clipboard
    .writeText(EMAIL)
    .then(() => confirm("Copied!"))
    // clipboard can be blocked outright — show the address so it stays usable
    .catch(() => confirm(EMAIL));
};

const initFooterYear = () => {
  const year = new Date().getFullYear();
  document.querySelectorAll(".tm").forEach((el) => {
    el.textContent = `${year} TM`;
  });
};

const THEME_KEY = "theme";
const THEME_COLORS = { light: "#f7f8f9", dark: "#121315" };

// A view transition paints the page as a snapshot for its duration, and the
// pointer is not over that snapshot — so the browser fires a mouseleave the
// visitor never performed, then a mouseenter when the live DOM returns. On the
// pill that reads as the indicator darting to the active tab and back for no
// reason. This is raised for the length of the swap so the nav can tell that
// kind of leave from a real one, and THEME_SWAP_END lets it resync afterwards
// against wherever the pointer actually ended up.
const THEME_SWAP_END = "themeswapend";
let themeSwapInFlight = false;

// Only ever holds a theme the visitor picked themselves — absent means "follow
// the system", which is what keeps the site tracking the OS until it's told
// otherwise. Storage throws outright in some privacy modes.
const readStoredTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch (error) {
    return null;
  }
};

const initTheme = () => {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const themeColors = document.querySelectorAll('meta[name="theme-color"]');
  const darkArt = document.querySelectorAll("picture source[data-dark]");

  const apply = (theme, isOverride) => {
    root.dataset.theme = theme;

    // The work-card logos ship a dark cut as a <source>, so the browser fetches
    // only the one it needs rather than loading both and hiding one. Its media
    // query reads the system setting, which is right until the toggle disagrees
    // with it — so the resolved theme is pinned here instead. Changing .media
    // re-runs the browser's source selection.
    darkArt.forEach((source) => {
      source.media = theme === "dark" ? "all" : "not all";
    });

    // The markup ships a media-scoped pair, which is already right whenever the
    // system is in charge. An override has to outrank both, so it collapses
    // them onto the one colour.
    if (isOverride) {
      themeColors.forEach((meta) => {
        meta.content = THEME_COLORS[theme];
      });
    }

    if (toggle) {
      toggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  };

  const stored = readStoredTheme();
  apply(stored || (systemDark.matches ? "dark" : "light"), Boolean(stored));

  systemDark.addEventListener("change", (event) => {
    if (readStoredTheme()) return; // their choice outranks the OS
    apply(event.matches ? "dark" : "light", false);
  });

  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (error) {
      // Not persisting is survivable — the switch still applies for this visit.
    }

    const swap = () => apply(next, true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (document.startViewTransition && !reducedMotion.matches) {
      themeSwapInFlight = true;

      // The tooltip has the same problem as the indicator, and needs the same
      // treatment for a different reason: it is shown by :hover in CSS, so the
      // snapshot stealing the pointer blinks the label out and back. Pinning it
      // open for the swap holds it steady. Only worth doing if it was actually
      // up — a keyboard press keeps :focus-visible throughout and needs nothing,
      // and a tap has no tooltip to hold.
      const tipWasUp = toggle.matches(":hover");
      if (tipWasUp) toggle.classList.add("is-tip-held");

      // Settles either way — a transition that gets skipped rejects rather than
      // resolving, and these have to come down for both.
      const released = () => {
        themeSwapInFlight = false;
        // Handing back to :hover: still pointed at and it stays up untouched,
        // moved away and it fades out from here as it normally would.
        toggle.classList.remove("is-tip-held");
        document.dispatchEvent(new CustomEvent(THEME_SWAP_END));
      };
      document.startViewTransition(swap).finished.then(released, released);
    } else {
      swap();
    }
  });
};

// Degrees of lean at the very edge of a card. Small on purpose — the foil is
// doing the talking, and the tilt is only there to give it an angle to catch.
const HOLO_TILT = 5;

// Where the cursor is over a work card, as a share of the card, driving both
// the foil's position and the card's lean. Mirrors the approach in
// simeydotme/pokemon-cards-css, trimmed to the two layers this site uses.
const initWorkCardHolo = () => {
  const cards = document.querySelectorAll(".work-card");
  if (!cards.length) return;

  // Matches the media query the foil is declared under, so the two can't
  // disagree about when the effect exists.
  const fine = window.matchMedia("(hover: hover) and (min-width: 671px)");
  const still = window.matchMedia("(prefers-reduced-motion: reduce)");

  cards.forEach((card) => {
    let frame = 0;
    let point = null;

    const paint = () => {
      frame = 0;
      if (!point) return;
      card.style.setProperty("--holo-x", `${point.x * 100}%`);
      card.style.setProperty("--holo-y", `${point.y * 100}%`);

      // Distance from the middle, 0 at centre and 1 by the edges. The band and
      // the bloom both scale their brightness off this, so the card is dimmest
      // when looked at straight on and lights up as it turns edge-on. Corners
      // run past 1 on the diagonal, hence the clamp.
      const dx = point.x - 0.5;
      const dy = point.y - 0.5;
      card.style.setProperty(
        "--holo-dist",
        Math.min(Math.hypot(dx, dy) / 0.5, 1).toFixed(3)
      );
      // Lean away from the cursor's side: pointing at the right edge should
      // tip that edge back, like a card being pressed at one corner.
      card.style.setProperty("--ry", `${(point.x - 0.5) * 2 * HOLO_TILT}deg`);
      card.style.setProperty("--rx", `${(0.5 - point.y) * 2 * HOLO_TILT}deg`);
    };

    const clear = () => {
      point = null;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      // Dropping the properties returns the card to the resting transform, and
      // to the longer ease, so it settles rather than snaps.
      ["--holo-x", "--holo-y", "--holo-dist", "--rx", "--ry"].forEach((prop) =>
        card.style.removeProperty(prop)
      );
    };

    card.addEventListener("pointermove", (event) => {
      if (!fine.matches || still.matches || event.pointerType === "touch") return;

      // offsetX/offsetY are measured in the card's own untransformed box, so
      // the lean can't feed back into the reading the way a transformed
      // getBoundingClientRect() would. <picture> waives pointer events, which
      // keeps the card the only thing these can be relative to.
      point = {
        x: Math.min(Math.max(event.offsetX / card.clientWidth, 0), 1),
        y: Math.min(Math.max(event.offsetY / card.clientHeight, 0), 1),
      };

      if (!frame) frame = requestAnimationFrame(paint);
    });

    card.addEventListener("pointerleave", clear);
    card.addEventListener("blur", clear);
  });
};

const initPillNav = () => {
  document.querySelectorAll(".pill-nav").forEach((pill) => {
    const tabs = pill.querySelectorAll(".pill-tab");
    if (!tabs.length) return;

    const indicator = document.createElement("span");
    indicator.className = "pill-indicator";
    pill.prepend(indicator);

    const setIndicator = (target) => {
      if (!target) {
        indicator.style.opacity = "0";
        return;
      }
      indicator.style.width = `${target.offsetWidth}px`;
      indicator.style.transform = `translateX(${target.offsetLeft}px)`;
      indicator.style.opacity = "1";
    };

    const getActive = () => pill.querySelector(".pill-tab.active");

    indicator.classList.add("no-transition");
    setIndicator(getActive());
    requestAnimationFrame(() => indicator.classList.remove("no-transition"));

    // The theme toggle shares the pill but is not a destination, so it takes
    // the indicator on hover without ever being what the indicator returns to.
    pill.querySelectorAll(".pill-tab, .theme-toggle").forEach((target) => {
      target.addEventListener("mouseenter", () => setIndicator(target));
    });
    pill.addEventListener("mouseleave", () => {
      // Ignore the phantom leave a theme swap causes; a real one still lands,
      // because the resync below reads the pointer's actual position rather
      // than assuming it stayed put.
      if (themeSwapInFlight) return;
      setIndicator(getActive());
    });

    document.addEventListener(THEME_SWAP_END, () => {
      setIndicator(pill.querySelector(".pill-tab:hover, .theme-toggle:hover") || getActive());
    });

    window.addEventListener("resize", () => setIndicator(getActive()));
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setIndicator(getActive()));
    }
  });
};

initTheme();
initWorkCardHolo();
initPillNav();
initFooterYear();
initRandomMessage();
initMusicCards();
