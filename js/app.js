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

    tabs.forEach((tab) => {
      tab.addEventListener("mouseenter", () => setIndicator(tab));
    });
    pill.addEventListener("mouseleave", () => setIndicator(getActive()));
    window.addEventListener("resize", () => setIndicator(getActive()));
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setIndicator(getActive()));
    }
  });
};

initPillNav();
initFooterYear();
initRandomMessage();
initMusicCards();
