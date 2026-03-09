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
    "/assets/music/rodeo.png",
    "90210",
    "by Travis Scott",
  ],
  [
    "https://www.youtube.com/watch?v=dMV31MWIjLE",
    "/assets/music/orange.png",
    "Pyramids",
    "by Frank Ocean",
  ],
  [
    "https://www.youtube.com/watch?v=y32ejtuxSjM",
    "/assets/music/mj.png",
    "P.Y.T.",
    "by Michael Jackson",
  ],
  [
    "https://www.youtube.com/watch?v=P891n88xOCc",
    "/assets/music/halo-ost.png",
    "Zeta Halo",
    "by Curtis Schweitzer",
  ],
  [
    "https://www.youtube.com/watch?v=T5-faDLv1Vs",
    "/assets/music/mc.png",
    "Mice on Venus",
    "by C418",
  ],
  [
    "https://www.youtube.com/watch?v=dGgBzSfgVsA",
    "/assets/music/boat.png",
    "drive ME crazy!",
    "by Lil Yachty",
  ],
  [
    "https://www.youtube.com/watch?v=XEolg577-DA",
    "/assets/music/cudi.png",
    "Mr.Rager",
    "by Kid Cudi",
  ],
  [
    "https://www.youtube.com/watch?v=LmbC_aqI4no",
    "/assets/music/s16.png",
    "Summer Sixteen",
    "by Drake",
  ],
  [
    "https://www.youtube.com/watch?v=SB0GxBSFUJk",
    "/assets/music/sos.png",
    "Seek & Destroy",
    "by SZA",
  ],
  [
    "https://www.youtube.com/watch?v=MRMhH1mnEg4",
    "/assets/music/ssc.png",
    "Father Stretch My Hands",
    "by Sunday Service",
  ],
  [
    "https://www.youtube.com/watch?v=h_VCgsWLmY4",
    "/assets/music/starboy.png",
    "Reminder",
    "by The Weeknd",
  ],
  [
    "https://www.youtube.com/watch?v=2nR1zrNzgcY",
    "/assets/music/utopia.png",
    "FE!N",
    "by Travis Scott",
  ],
  [
    "https://www.youtube.com/watch?v=_h2WpMH_q-I",
    "/assets/music/ye.png",
    "Devil in a New Dress",
    "by Kanye",
  ],
  [
    "https://www.youtube.com/watch?v=WSSShAOKYfo",
    "/assets/music/anti.png",
    "Consideration",
    "by Rihanna",
  ],
  [
    "https://www.youtube.com/watch?v=FTIvFD7TCVg",
    "/assets/music/brat.png",
    "Everything is Romantic",
    "by Charli XCX",
  ],
  [
    "https://www.youtube.com/watch?v=-gc1O5VImyY",
    "/assets/music/chri.png",
    "Christmas & Chill",
    "by Ariana Grande",
  ],
  [
    "https://www.youtube.com/watch?v=SHP-xh5NnVs",
    "/assets/music/dc.png",
    "Toronto 2014",
    "by Daniel Caesar",
  ],
  [
    "https://www.youtube.com/watch?v=e0JhRAxlQ1I",
    "/assets/music/eter.png",
    "Imperfect For You",
    "by Ariana Grande",
  ],
  [
    "https://www.youtube.com/watch?v=Q86_nlRoIGw",
    "/assets/music/mrs.png",
    "Hello Miss Johnson",
    "by Jack Harlow",
  ],
  [
    "https://www.youtube.com/watch?v=72wCf0yG9Wo",
    "/assets/music/mys.png",
    "Through the Sea of Time",
    "by Arata Iiyoshi",
  ],
  [
    "https://www.youtube.com/watch?v=8O01B5BN298",
    "/assets/music/nemz.png",
    "1942",
    "by NEMZZZ",
  ],
  [
    "https://www.youtube.com/watch?v=X2DTROC4JCI",
    "/assets/music/solo.png",
    "Solo",
    "by Future",
  ],
  [
    "https://www.youtube.com/watch?v=i-DK2XUsKuw",
    "/assets/music/sss.png",
    "Spiderman Superman",
    "by PartyNextDoor",
  ],
];

const MUSIC_CARD_COUNT = 3;

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const shuffleArray = (array) => [...array].sort(() => 0.5 - Math.random());

const COLOR_PRESETS = {
  cyan:    { r: 3,   g: 2,   b: 1   },
  emerald: { r: 2.5, g: 1,   b: 3   },
  coral:   { r: 1,   g: 2.8, b: 3.2 },
  amber:   { r: 1.2, g: 2,   b: 3.8 },
};

const colorPickerWrapper = document.getElementById("color-picker-wrapper");
const colorPopup = document.getElementById("color-popup");

const setColor = (name) => {
  const preset = COLOR_PRESETS[name];
  if (!preset) return;
  localStorage.setItem("canvasColor", name);
  if (window.setCanvasColor) {
    window.setCanvasColor(preset.r, preset.g, preset.b);
  }
  document.querySelectorAll(".color-swatch").forEach((swatch) => {
    swatch.classList.toggle("active", swatch.dataset.color === name);
  });
};

const toggleColorPicker = () => {
  const isOpen = colorPopup.classList.toggle("open");
  document.getElementById("color-picker-btn").classList.toggle("popup-open", isOpen);
};

document.addEventListener("click", (e) => {
  if (!colorPopup.classList.contains("open")) return;
  const wrapper = document.getElementById("color-picker-wrapper");
  if (!wrapper.contains(e.target)) {
    colorPopup.classList.remove("open");
    document.getElementById("color-picker-btn").classList.remove("popup-open");
  }
});

const initCanvasColor = () => {
  const saved = localStorage.getItem("canvasColor") || "cyan";
  setColor(saved);
};

const canvas = document.querySelector("canvas");
const canvasButtonOn = document.getElementById("canvas-on");
const canvasButtonOff = document.getElementById("canvas-off");

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileQuery = window.matchMedia("(max-width: 670px)");
let motion = localStorage.getItem("motion") ?? "system";
let systemReducedMotion = reducedMotionQuery.matches;
let isMobile = mobileQuery.matches;

const updateCanvas = () => {
  localStorage.setItem("motion", motion);
  const isReducedMotion = motion === "system" ? systemReducedMotion : motion === "reduce";

  const pickerButtons = colorPickerWrapper.querySelectorAll("button");

  if (isReducedMotion || isMobile) {
    canvasButtonOn.classList.remove("hide");
    canvasButtonOff.classList.add("hide");
    canvas.classList.remove("show");
    colorPickerWrapper.classList.add("hide");
    pickerButtons.forEach((btn) => btn.setAttribute("tabindex", "-1"));
    colorPopup.classList.remove("open");
    document.body.classList.add("canvas-off");
    document.body.classList.remove("canvas-on");
    if (window.stopCanvasAnimation) window.stopCanvasAnimation();
  } else {
    canvasButtonOn.classList.add("hide");
    canvasButtonOff.classList.remove("hide");
    canvas.classList.add("show");
    colorPickerWrapper.classList.remove("hide");
    pickerButtons.forEach((btn) => btn.removeAttribute("tabindex"));
    document.body.classList.remove("canvas-off");
    document.body.classList.add("canvas-on");
    if (window.startCanvasAnimation) window.startCanvasAnimation();
  }
};

const toggleCanvas = () => {
  motion = motion === "reduce" ? "no-preference" : "reduce";
  updateCanvas();
};

const initCanvasMotion = () => {
  reducedMotionQuery.addEventListener("change", (m) => {
    systemReducedMotion = m.matches;
    updateCanvas();
  });
  mobileQuery.addEventListener("change", (m) => {
    isMobile = m.matches;
    updateCanvas();
  });
  updateCanvas();
};

const initRandomMessage = () => {
  const randomMessageElement = document.getElementById("random-message");
  if (randomMessageElement) {
    randomMessageElement.innerHTML = getRandomElement(MESSAGE_LIST);
  }
};

const initMusicCards = () => {
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

const copyEmail = (el) => {
  navigator.clipboard.writeText("latxhman@gmail.com").then(() => {
    const text = el.querySelector("p") || el;
    const original = text.textContent;
    el.style.pointerEvents = "none";
    text.style.transition = "filter 0.2s ease";
    text.style.filter = "blur(4px)";
    setTimeout(() => {
      text.textContent = "Copied!";
      text.style.filter = "blur(0)";
    }, 200);
    setTimeout(() => {
      text.style.filter = "blur(4px)";
      setTimeout(() => {
        text.textContent = original;
        text.style.filter = "blur(0)";
        el.style.pointerEvents = "";
      }, 200);
    }, 1000);
  });
};

initCanvasMotion();
initCanvasColor();
initRandomMessage();
initMusicCards();
