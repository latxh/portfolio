// Google Analytics 4 (gtag.js)
// Measurement ID lives here only — update it in this one place if it ever changes.
(function () {
  const GA_MEASUREMENT_ID = "G-KJ9PQEE8P2";

  const gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
  document.head.appendChild(gtagScript);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);
})();
