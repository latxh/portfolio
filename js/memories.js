(function () {
  const MEMORIES = [
    { src: "assets/memories/start-gg.mp4", caption: "Start.gg Rebrand", date: "May 16, 2022", width: 1440, height: 1080 },
    { src: "assets/memories/world-cup.jpeg", caption: "World Cup", location: "Vancouver", date: "Jul 3, 2026", width: 2268, height: 4032 },
    { src: "assets/memories/montenegro.jpeg", caption: "Kayaking in Montenegro", location: "Montenegro", date: "Jun 25, 2026", width: 3213, height: 5712 },
    { src: "assets/memories/greece.jpeg", caption: "Stavros Beach", location: "Greece", date: "Jun 22, 2026", width: 2268, height: 4032 },
    { src: "assets/memories/custom-made-jerseys.jpeg", caption: "Custom Made Jerseys", location: "Seattle", date: "Feb 26, 2026", width: 2268, height: 4032 },
    { src: "assets/memories/seahawks-super-bowl-run.jpeg", caption: "Seahawks Super Bowl Run", location: "Seattle", date: "Jan 17, 2026", width: 3114, height: 5536 },
    { src: "assets/memories/matt-and-claudias-wedding.jpeg", caption: "Matt & Claudia's Wedding", location: "Dominican Republic", date: "Dec 11, 2025", width: 4000, height: 6000 },
    { src: "assets/memories/jays-win-the-al-east.jpeg", caption: "Jays Win the AL East", location: "Toronto", date: "Sep 26, 2025", width: 2268, height: 4032 },
    { src: "assets/memories/weeknd-seattle.jpeg", caption: "After Hours Til Dawn", location: "Seattle", date: "Jul 12, 2025", width: 3213, height: 5712 },
    { src: "assets/memories/alderwood-trail.jpeg", caption: "Alderwood Trail", location: "Home", date: "May 25, 2025", width: 3213, height: 5712 },
    { src: "assets/memories/space-needle.jpeg", caption: "Space Needle", location: "Seattle", date: "Jul 14, 2024", width: 4032, height: 3024 },
    { src: "assets/memories/jays-world-series-run.jpeg", caption: "Jays World Series Run", location: "Seattle", date: "Oct 15, 2025", width: 1179, height: 2096 },
    { src: "assets/memories/70-flights-and-counting.png", caption: "70 Flights & Counting", location: "Everywhere", date: "Jan 1 2026", width: 1179, height: 1572 },
    { src: "assets/memories/xbox-forever.png", caption: "Xbox Forever", location: "Mississauga", date: "Dec 15 2004", width: 2048, height: 1536 },
    { src: "assets/memories/killy.jpeg", caption: "Killy", location: "Toronto", date: "Mar 8 2018", width: 899, height: 899 },
    { src: "assets/memories/price-on-my-head.jpeg", caption: "Price On My Head", location: "Toronto", date: "Feb 26 2019", width: 1080, height: 1314 },
    { src: "assets/memories/ryan-uo.jpeg", caption: "Ryan UO", location: "New York", date: "Jul 2 2019", width: 1080, height: 1920 },
    { src: "assets/portrait.jpg", caption: "Me", location: "Toronto", date: "Oct 16 2017", width: 1500, height: 994 },
  ];

  const VIDEO = /\.(mp4|mov|webm)$/i;

  const grid = document.getElementById("memories-grid");
  const lightbox = document.getElementById("lightbox");
  if (!grid || !lightbox) return;

  const lightboxFrame = document.getElementById("lightbox-frame");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxMeta = document.getElementById("lightbox-meta");
  const allowMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Date first, location second — either can be absent, and the separator only
  // appears when there are two things to separate.
  const metaLine = (item) => [item.date, item.location].filter(Boolean).join(" · ");

  // One builder for both the grid and the lightbox, so the two can't drift.
  const buildMedia = (item, { full = false } = {}) => {
    const isVideo = VIDEO.test(item.src);
    const media = document.createElement(isVideo ? "video" : "img");
    const markLoaded = () => media.classList.add("is-loaded");

    media.src = item.src;
    if (item.width) media.width = item.width;
    if (item.height) media.height = item.height;

    if (isVideo) {
      media.loop = true;
      media.playsInline = true;
      media.preload = full ? "auto" : "metadata";
      media.setAttribute("aria-label", item.caption);
      // muted is required for autoplay to be allowed at all
      media.muted = true;
      media.setAttribute("muted", "");
      // autoplaying motion should be opt-out — offer controls instead
      if (allowMotion) media.autoplay = true;
      else media.controls = true;

      media.addEventListener("loadeddata", markLoaded);
      if (media.readyState >= 2) markLoaded();
    } else {
      media.alt = item.caption;
      media.decoding = "async";
      if (!full) media.loading = "lazy";

      media.addEventListener("load", markLoaded);
      if (media.complete && media.naturalWidth) markLoaded();
    }

    return media;
  };

  /* Lightbox --------------------------------------------------------------- */

  let lastFocused = null;
  const isOpen = () => !lightbox.hidden;

  const openLightbox = (item, trigger) => {
    lastFocused = trigger;
    lightboxFrame.replaceChildren(buildMedia(item, { full: true }));
    lightboxCaption.textContent = item.caption;
    lightboxMeta.textContent = metaLine(item);
    lightbox.hidden = false;
    document.body.classList.add("is-locked");
    lightbox.focus();
  };

  const closeLightbox = () => {
    if (!isOpen()) return;
    lightbox.hidden = true;
    lightboxFrame.replaceChildren(); // drops the media, stopping any video
    document.body.classList.remove("is-locked");
    if (lastFocused) lastFocused.focus();
  };

  // Anything but the caption closes — leaves the text selectable
  lightbox.addEventListener("click", (e) => {
    if (e.target.closest(".memory-info")) return;
    closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") closeLightbox();
    // nothing inside is focusable, so hold focus rather than letting Tab walk
    // behind the scrim — aria-modal promises as much
    if (e.key === "Tab") {
      e.preventDefault();
      lightbox.focus();
    }
  });

  /* Grid ------------------------------------------------------------------- */

  const buildCard = (item) => {
    const fig = document.createElement("figure");
    fig.className = "memory-item";

    // a real button, so Enter/Space and focus come for free
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "memory-open";
    trigger.setAttribute("aria-label", `Open ${item.caption}`);
    trigger.addEventListener("click", () => openLightbox(item, trigger));

    const frame = document.createElement("div");
    frame.className = "memory-frame";
    if (item.width && item.height) frame.style.aspectRatio = `${item.width} / ${item.height}`;
    frame.appendChild(buildMedia(item));
    trigger.appendChild(frame);
    fig.appendChild(trigger);

    const info = document.createElement("div");
    info.className = "memory-info";
    info.append(
      Object.assign(document.createElement("p"), {
        className: "memory-caption",
        textContent: item.caption,
      }),
      Object.assign(document.createElement("p"), {
        className: "memory-meta",
        textContent: metaLine(item),
      })
    );
    fig.appendChild(info);

    return fig;
  };

  const NARROW = window.matchMedia("(max-width: 670px)");
  const columnCount = () => (NARROW.matches ? 1 : 2);

  // Round-robin, so item 1 is top-left, item 2 top-right, item 3 below item 1 —
  // the feed reads down the page in the order MEMORIES is written. Filling one
  // column at a time would put the whole first half on the left instead.
  const render = () => {
    const count = columnCount();
    const columns = Array.from({ length: count }, () => {
      const column = document.createElement("div");
      column.className = "memories-column";
      return column;
    });

    MEMORIES.forEach((item, i) => columns[i % count].appendChild(buildCard(item)));
    grid.replaceChildren(...columns);
  };

  render();
  NARROW.addEventListener("change", render);
})();
