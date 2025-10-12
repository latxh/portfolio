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

const canvas = document.querySelector("canvas");
const canvasButtonOn = document.getElementById("canvas-on");
const canvasButtonOff = document.getElementById("canvas-off");

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let motion = localStorage.getItem("motion") ?? "system";
let systemReducedMotion = reducedMotionQuery.matches;

const updateCanvas = () => {
  localStorage.setItem("motion", motion);
  const isReducedMotion = motion === "system" ? systemReducedMotion : motion === "reduce";

  if (isReducedMotion) {
    canvasButtonOn.classList.remove("hide");
    canvasButtonOff.classList.add("hide");
    canvas.classList.remove("show");
    document.body.classList.add("canvas-off");
    document.body.classList.remove("canvas-on");
  } else {
    canvasButtonOn.classList.add("hide");
    canvasButtonOff.classList.remove("hide");
    canvas.classList.add("show");
    document.body.classList.remove("canvas-off");
    document.body.classList.add("canvas-on");
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
};

initCanvasMotion();
initRandomMessage();
initMusicCards();
