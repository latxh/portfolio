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
const ANALYTICS_TAG = '<script src="/js/analytics.js"></script>';

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
    // The only snapshot whose own copy is altered: a year that contradicted the
    // 2019 label, and an About paragraph rewritten to fold the studies line
    // into the opening sentence.
    edits: [
      {
        file: "gallery.html",
        find: "captured by me,\n            2020.</p>",
        replace: "captured by me.</p>",
      },
      {
        file: "index.html",
        find:
          "<p>I’m a programmer, designer, and entrepreneur from Toronto, CA. " +
          "I spend most of my time learning new",
        replace:
          "<p>I’m a programmer, designer, and entrepreneur from Toronto, Canada, " +
          "studying Computer Science at the University of Toronto. " +
          "I spend most of my time learning new",
      },
      // Absorbed into the sentence above, so the paragraph and the break that
      // separated it both come out.
      {
        file: "index.html",
        find:
          "                <br>\n" +
          "                <p>\n" +
          "                    I'm going into my third year of\n" +
          "                    studies at the University of Toronto, grateful for all I have learned" +
          " from starting Cayendo and\n" +
          "                    turning my solution into a reality that helps others daily.\n" +
          "                </p>\n",
        replace: "",
      },
    ],
  },
  // "Version 3 Latchman" as it stood at the end of 2021: four pages, canvas
  // art, Shopify internship in the header, no case studies yet.
  {
    year: "2021",
    commit: "cb83fbb1680a2684948b2cb8a7c907ca0b575896",
    themeKey: "appearance",
    edits: [
      {
        file: "index.html",
        find: "<h1>Design technologist intern at <a",
        replace: "<h1>Design at <a",
      },
      {
        file: "about.html",
        find: "<p>Shopify — Design Technologist</p>",
        replace: "<p>Shopify — Product Designer</p>",
      },
      // The 2022 snapshot already gives Redmond for the same role.
      {
        file: "about.html",
        find: '<p class="grey">Bellevue, Washington</p>',
        replace: '<p class="grey">Redmond, Washington</p>',
      },
      // Matches how the 2022 snapshot already words it.
      {
        file: "about.html",
        find:
          '<p class="grey">BSc, Computer Science, Information Communications Technology</p>',
        replace: '<p class="grey">BSc, Computer Science</p>',
      },
      {
        file: "about.html",
        find: '            <p class="grey">Class of 2023</p>\n',
        replace: "",
      },
    ],
  },
  // The same design after the Apr 2022 "Version 3.1" restyle and a year of
  // work — ten pages now, and the only version where the case studies are
  // finished, linked from the home page and still have their images. v4 moved
  // them into old-v2 and unlinked them; Mar 2023 deleted the photos outright.
  {
    year: "2022",
    commit: "8f040abf8be4fc6b18aef3bff8d5cdd4648d48c5",
    themeKey: "appearance",
    edits: [
      {
        file: "index.html",
        find: "beautifully engineered experiences to empower people.",
        replace: "beautifully engineered experiences that empower people.",
      },
      {
        file: "about.html",
        find: '                    <p class="grey">Class of 2023</p>\n',
        replace: "",
      },
      // The 404 page is the one page here with no nav, so its heading starts
      // 24px from the top and lands under the floating time machine pill. The
      // class is used by that page alone, so this does not touch the others.
      {
        file: "css/styles.css",
        find: ".center-wrapper {\n  margin: auto;\n  max-width: 956px;\n}",
        replace:
          ".center-wrapper {\n  margin: auto;\n  max-width: 956px;\n  padding-top: 64px;\n}",
      },
    ],
  },
  // The "v4? Major revamp" design after 11 more months of work — by now it has
  // picked up the ai.html and gpu.html project pages, and its own footer reads
  // 2023. old-v2 is the previous site's case studies, unlinked and stripped of
  // their images, so the folder is nothing but 94 broken refs.
  {
    year: "2023",
    commit: "37ad0177946376b2b814cb21530fcb57fb15cc55",
    prune: ["old-v2"],
    themeKey: "appearance",
    edits: [
      {
        file: "index.html",
        find: "under a public NDA",
        replace: "under an NDA",
      },
      // The studies sentence goes; the work history that shared the paragraph
      // stays.
      {
        file: "index.html",
        find:
          "<h3>I'm a computer science student in my final year at the University of Toronto. I have previously\n",
        replace: "<h3>I have previously\n",
      },
      // The header carries two wordmarks — a wide "Microsoft | Image Guesser"
      // and a standalone "Image Guesser" — and the stylesheet never hides
      // either, so the title renders twice. The standalone one comes out.
      {
        file: "ai.html",
        find: "            <svg class=\"small-logo\" width=\"129\" height=\"20\" viewBox=\"0 0 129 20\" fill=\"none\"\n                xmlns=\"http://www.w3.org/2000/svg\">\n                <path d=\"M2.48099 15.2297H0.0562439V1.03757H2.48099V15.2297Z\" fill=\"var(--msft)\" />\n                <path\n                    d=\"M20.474 15.2297H18.1779V9.70727C18.1779 8.645 18.0261 7.87634 17.7226 7.40129C17.4257 6.92623 16.921 6.68871 16.2084 6.68871C15.608 6.68871 15.0966 6.98892 14.6744 7.58933C14.2587 8.18974 14.0509 8.90892 14.0509 9.74685V15.2297H11.7449V9.51922C11.7449 7.63221 11.0785 6.68871 9.74571 6.68871C9.1255 6.68871 8.61417 6.97242 8.21169 7.53984C7.81581 8.10727 7.61788 8.84294 7.61788 9.74685V15.2297H5.32179V5.09531H7.61788V6.69861H7.65746C8.38984 5.47139 9.4554 4.85778 10.8542 4.85778C11.5535 4.85778 12.1639 5.05242 12.6851 5.4417C13.2129 5.82438 13.5725 6.32912 13.7639 6.95593C14.516 5.55716 15.6377 4.85778 17.1288 4.85778C19.3589 4.85778 20.474 6.23345 20.474 8.98479V15.2297Z\"\n                    fill=\"var(--msft)\" />\n                <path\n                    d=\"M30.6484 15.2297H28.4216V13.6462H28.382C27.6826 14.8603 26.6566 15.4673 25.304 15.4673C24.3078 15.4673 23.5259 15.1968 22.9585 14.6557C22.3977 14.1147 22.1172 13.3988 22.1172 12.5081C22.1172 10.5947 23.2191 9.47964 25.4228 9.16294L28.4315 8.73737C28.4315 7.29242 27.7453 6.56995 26.3729 6.56995C25.1655 6.56995 24.0768 6.98562 23.1069 7.81696V5.80788C24.1758 5.17448 25.4096 4.85778 26.8084 4.85778C29.3684 4.85778 30.6484 6.11799 30.6484 8.6384V15.2297ZM28.4315 10.2516L26.3036 10.5485C25.6438 10.6343 25.1457 10.7959 24.8092 11.0335C24.4793 11.2644 24.3144 11.6735 24.3144 12.2607C24.3144 12.6895 24.4661 13.0425 24.7696 13.3196C25.0797 13.5902 25.4921 13.7254 26.0067 13.7254C26.7061 13.7254 27.2834 13.4813 27.7387 12.993C28.2005 12.4982 28.4315 11.878 28.4315 11.1324V10.2516Z\"\n                    fill=\"var(--msft)\" />\n                <path\n                    d=\"M42.2776 14.4182C42.2776 18.1394 40.4071 20.0001 36.6661 20.0001C35.3465 20.0001 34.1952 19.779 33.2121 19.337V17.2388C34.3205 17.8722 35.3729 18.1889 36.3692 18.1889C38.7774 18.1889 39.9816 17.0046 39.9816 14.6359V13.5275H39.942C39.1832 14.8207 38.0418 15.4673 36.5176 15.4673C35.2838 15.4673 34.2875 15.0186 33.5288 14.1213C32.7766 13.2174 32.4005 12.0066 32.4005 10.4891C32.4005 8.76706 32.8063 7.39799 33.6178 6.3819C34.4294 5.36582 35.5444 4.85778 36.963 4.85778C38.3024 4.85778 39.2954 5.40541 39.942 6.50067H39.9816V5.09531H42.2776V14.4182ZM40.0013 10.5881V9.2718C40.0013 8.55922 39.7638 7.95221 39.2888 7.45077C38.8203 6.94273 38.2331 6.68871 37.5271 6.68871C36.6562 6.68871 35.9733 7.01201 35.4785 7.65861C34.9902 8.29861 34.7461 9.19593 34.7461 10.3506C34.7461 11.3469 34.9803 12.1452 35.4488 12.7456C35.9238 13.3394 36.5506 13.6363 37.3292 13.6363C38.1209 13.6363 38.7642 13.3526 39.2591 12.7852C39.7539 12.2112 40.0013 11.4788 40.0013 10.5881Z\"\n                    fill=\"var(--msft)\" />\n                <path\n                    d=\"M53.4417 10.786H46.5337C46.5601 11.7229 46.8471 12.4454 47.3947 12.9535C47.949 13.4615 48.7077 13.7155 49.671 13.7155C50.7531 13.7155 51.7461 13.3922 52.65 12.7456V14.5963C51.7263 15.177 50.5057 15.4673 48.9881 15.4673C47.497 15.4673 46.3259 15.0087 45.4747 14.0916C44.6302 13.1679 44.2079 11.8714 44.2079 10.2021C44.2079 8.6252 44.6731 7.34191 45.6034 6.35221C46.5403 5.35593 47.7015 4.85778 49.0871 4.85778C50.4727 4.85778 51.5448 5.30314 52.3036 6.19386C53.0624 7.08459 53.4417 8.3217 53.4417 9.9052V10.786ZM51.2248 9.16294C51.2182 8.33819 51.0236 7.69819 50.6409 7.24294C50.2582 6.78108 49.7304 6.55015 49.0574 6.55015C48.3976 6.55015 47.8368 6.79098 47.3749 7.27263C46.9197 7.75428 46.6393 8.38438 46.5337 9.16294H51.2248Z\"\n                    fill=\"var(--msft)\" />\n                <path\n                    d=\"M71.732 14.2598C70.2541 15.0648 68.6079 15.4673 66.7935 15.4673C64.6953 15.4673 62.9964 14.8141 61.6966 13.5077C60.3968 12.2013 59.7469 10.4726 59.7469 8.3217C59.7469 6.12459 60.4561 4.32335 61.8747 2.91799C63.2999 1.50603 65.1077 0.800049 67.2982 0.800049C68.8751 0.800049 70.2013 1.03098 71.2768 1.49283V3.91757C70.1881 3.1918 68.8916 2.82891 67.3873 2.82891C65.8764 2.82891 64.6359 3.32706 63.666 4.32335C62.7027 5.31964 62.2211 6.60953 62.2211 8.19304C62.2211 9.82273 62.6368 11.106 63.4681 12.0429C64.2994 12.9732 65.4277 13.4384 66.8528 13.4384C67.8293 13.4384 68.6739 13.2504 69.3865 12.8743V9.49943H66.3976V7.52005H71.732V14.2598Z\"\n                    fill=\"var(--msft)\" />\n                <path\n                    d=\"M82.9654 15.2297H80.6693V13.6264H80.6297C79.9633 14.8537 78.9275 15.4673 77.5221 15.4673C75.1271 15.4673 73.9295 14.0289 73.9295 11.1522V5.09531H76.2256V10.9147C76.2256 12.7357 76.9283 13.6462 78.3337 13.6462C79.0132 13.6462 79.5708 13.3955 80.0062 12.8941C80.4483 12.3926 80.6693 11.7361 80.6693 10.9246V5.09531H82.9654V15.2297Z\"\n                    fill=\"var(--msft)\" />\n                <path\n                    d=\"M94.1394 10.786H87.2314C87.2578 11.7229 87.5448 12.4454 88.0924 12.9535C88.6466 13.4615 89.4054 13.7155 90.3687 13.7155C91.4508 13.7155 92.4437 13.3922 93.3477 12.7456V14.5963C92.4239 15.177 91.2033 15.4673 89.6858 15.4673C88.1947 15.4673 87.0235 15.0087 86.1724 14.0916C85.3279 13.1679 84.9056 11.8714 84.9056 10.2021C84.9056 8.6252 85.3708 7.34191 86.3011 6.35221C87.238 5.35593 88.3992 4.85778 89.7848 4.85778C91.1703 4.85778 92.2425 5.30314 93.0013 6.19386C93.76 7.08459 94.1394 8.3217 94.1394 9.9052V10.786ZM91.9225 9.16294C91.9159 8.33819 91.7213 7.69819 91.3386 7.24294C90.9559 6.78108 90.4281 6.55015 89.7551 6.55015C89.0953 6.55015 88.5345 6.79098 88.0726 7.27263C87.6174 7.75428 87.3369 8.38438 87.2314 9.16294H91.9225Z\"\n                    fill=\"var(--msft)\" />\n                <path\n                    d=\"M95.2878 14.913V12.7852C96.1456 13.4384 97.0924 13.765 98.1283 13.765C99.5138 13.765 100.207 13.3559 100.207 12.5378C100.207 12.3069 100.147 12.1122 100.028 11.9539C99.9097 11.7889 99.7481 11.6438 99.5435 11.5184C99.3456 11.393 99.1081 11.2809 98.8309 11.1819C98.5604 11.0829 98.2569 10.9708 97.9204 10.8454C97.5048 10.6805 97.1287 10.5056 96.7922 10.3209C96.4623 10.1361 96.1852 9.9283 95.9608 9.69737C95.7431 9.45984 95.5782 9.19263 95.466 8.89572C95.3538 8.59881 95.2977 8.25242 95.2977 7.85654C95.2977 7.3683 95.4132 6.93943 95.6441 6.56995C95.8751 6.19386 96.1852 5.88046 96.5744 5.62974C96.9637 5.37242 97.4058 5.18108 97.9006 5.05572C98.3955 4.92376 98.9068 4.85778 99.4347 4.85778C100.372 4.85778 101.209 4.99964 101.948 5.28335V7.29242C101.236 6.80417 100.418 6.56005 99.494 6.56005C99.2037 6.56005 98.9398 6.58974 98.7023 6.64912C98.4714 6.7085 98.2734 6.79098 98.1085 6.89654C97.9435 7.00211 97.8149 7.13077 97.7225 7.28252C97.6301 7.42768 97.5839 7.58933 97.5839 7.76747C97.5839 7.9852 97.6301 8.16995 97.7225 8.3217C97.8149 8.47345 97.9501 8.60871 98.1283 8.72747C98.313 8.83964 98.5307 8.9452 98.7815 9.04417C99.0388 9.13654 99.3324 9.23881 99.6623 9.35098C100.098 9.52912 100.487 9.71057 100.83 9.89531C101.18 10.08 101.477 10.2912 101.721 10.5287C101.965 10.7596 102.153 11.0302 102.285 11.3403C102.417 11.6438 102.483 12.0066 102.483 12.4289C102.483 12.9436 102.364 13.3922 102.127 13.7749C101.889 14.1576 101.572 14.4743 101.177 14.725C100.781 14.9757 100.322 15.1605 99.8008 15.2792C99.2862 15.4046 98.7419 15.4673 98.1678 15.4673C97.0594 15.4673 96.0994 15.2825 95.2878 14.913Z\"\n                    fill=\"var(--msft)\" />\n                <path\n                    d=\"M103.631 14.913V12.7852C104.489 13.4384 105.436 13.765 106.472 13.765C107.857 13.765 108.55 13.3559 108.55 12.5378C108.55 12.3069 108.491 12.1122 108.372 11.9539C108.253 11.7889 108.092 11.6438 107.887 11.5184C107.689 11.393 107.452 11.2809 107.174 11.1819C106.904 11.0829 106.6 10.9708 106.264 10.8454C105.848 10.6805 105.472 10.5056 105.136 10.3209C104.806 10.1361 104.529 9.9283 104.304 9.69737C104.087 9.45984 103.922 9.19263 103.809 8.89572C103.697 8.59881 103.641 8.25242 103.641 7.85654C103.641 7.3683 103.757 6.93943 103.988 6.56995C104.219 6.19386 104.529 5.88046 104.918 5.62974C105.307 5.37242 105.749 5.18108 106.244 5.05572C106.739 4.92376 107.25 4.85778 107.778 4.85778C108.715 4.85778 109.553 4.99964 110.292 5.28335V7.29242C109.579 6.80417 108.761 6.56005 107.838 6.56005C107.547 6.56005 107.283 6.58974 107.046 6.64912C106.815 6.7085 106.617 6.79098 106.452 6.89654C106.287 7.00211 106.158 7.13077 106.066 7.28252C105.974 7.42768 105.927 7.58933 105.927 7.76747C105.927 7.9852 105.974 8.16995 106.066 8.3217C106.158 8.47345 106.294 8.60871 106.472 8.72747C106.656 8.83964 106.874 8.9452 107.125 9.04417C107.382 9.13654 107.676 9.23881 108.006 9.35098C108.441 9.52912 108.831 9.71057 109.174 9.89531C109.523 10.08 109.82 10.2912 110.064 10.5287C110.308 10.7596 110.496 11.0302 110.628 11.3403C110.76 11.6438 110.826 12.0066 110.826 12.4289C110.826 12.9436 110.708 13.3922 110.47 13.7749C110.233 14.1576 109.916 14.4743 109.52 14.725C109.124 14.9757 108.666 15.1605 108.144 15.2792C107.63 15.4046 107.085 15.4673 106.511 15.4673C105.403 15.4673 104.443 15.2825 103.631 14.913Z\"\n                    fill=\"var(--msft)\" />\n                <path\n                    d=\"M121.189 10.786H114.281C114.307 11.7229 114.594 12.4454 115.142 12.9535C115.696 13.4615 116.455 13.7155 117.418 13.7155C118.5 13.7155 119.493 13.3922 120.397 12.7456V14.5963C119.473 15.177 118.253 15.4673 116.735 15.4673C115.244 15.4673 114.073 15.0087 113.222 14.0916C112.377 13.1679 111.955 11.8714 111.955 10.2021C111.955 8.6252 112.42 7.34191 113.35 6.35221C114.287 5.35593 115.449 4.85778 116.834 4.85778C118.22 4.85778 119.292 5.30314 120.051 6.19386C120.809 7.08459 121.189 8.3217 121.189 9.9052V10.786ZM118.972 9.16294C118.965 8.33819 118.771 7.69819 118.388 7.24294C118.005 6.78108 117.478 6.55015 116.805 6.55015C116.145 6.55015 115.584 6.79098 115.122 7.27263C114.667 7.75428 114.386 8.38438 114.281 9.16294H118.972Z\"\n                    fill=\"var(--msft)\" />\n                <path\n                    d=\"M128.849 7.28252C128.572 7.06479 128.173 6.95593 127.652 6.95593C126.972 6.95593 126.405 7.26273 125.95 7.87634C125.494 8.48995 125.267 9.32459 125.267 10.3803V15.2297H122.971V5.09531H125.267V7.18355H125.306C125.531 6.47098 125.874 5.91675 126.336 5.52087C126.804 5.1184 127.325 4.91716 127.899 4.91716C128.315 4.91716 128.632 4.97984 128.849 5.1052V7.28252Z\"\n                    fill=\"var(--msft)\" />\n            </svg>\n",
        replace: "",
      },
      // ai.html and gpu.html shipped in this era but were never linked from
      // anywhere, so the only page that lists all the work now lists them too.
      // Linked with the extension on purpose: each has a sibling folder of the
      // same name holding its assets, so /ai would redirect into ai/ and die.
      //
      // Inserted at the head of the run because the list is newest-first and
      // these two are the most recent things on it.
      {
        file: "404.html",
        find: "            <div class=\"work-wrapper\">\n",
        replace: "            <div class=\"work-wrapper\">\n                <a class=\"work-item blur row\" href=\"/gpu.html\">\n                    <div class=\"work-info row\">\n                        <div class=\"work-icon row\">\n                            <svg width=\"24\" height=\"24\" fill=\"var(--font-1)\" viewBox=\"0 0 24 24\">\n                                <path d=\"M9.25 6a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-5.5ZM8.5 17.75a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75ZM9.25 14a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-5.5ZM6 5a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V5Zm3-1.5A1.5 1.5 0 0 0 7.5 5v14A1.5 1.5 0 0 0 9 20.5h6a1.5 1.5 0 0 0 1.5-1.5V5A1.5 1.5 0 0 0 15 3.5H9Z\"/>\n                            </svg>\n                        </div>\n                        <div>\n                            <h3 class=\"clamp-text\">The Global Journey of a GPU</h3>\n                            <p class=\"clamp-text\">A visual essay tracing where a graphics card comes from</p>\n                        </div>\n                    </div>\n                    <div class=\"work-item-line\"></div>\n                    <p class=\"work-item-date\">2023</p>\n                </a>\n\n                <a class=\"work-item blur row\" href=\"/ai.html\">\n                    <div class=\"work-info row\">\n                        <div class=\"work-icon row\">\n                            <svg width=\"24\" height=\"24\" fill=\"var(--font-1)\" viewBox=\"0 0 24 24\">\n                                <path d=\"M7.152 3.012c.832-.648 1.92-1.006 3-1.006.647 0 1.17.222 1.567.575.108.095.203.198.288.304.084-.106.18-.209.287-.304.396-.353.92-.575 1.566-.575 1.082 0 2.17.358 3.001 1.006.647.503 1.154 1.198 1.353 2.037.42.07.794.284 1.096.567.48.451.822 1.103 1.038 1.774.218.681.328 1.446.295 2.181-.017.376-.072.76-.178 1.127l.066.03c.37.174.67.447.894.81.425.685.575 1.671.575 2.928 0 1.445-.552 2.426-1.262 3.035a3.447 3.447 0 0 1-1.27.69 5.172 5.172 0 0 1-1.019 2.137c-.723.904-1.846 1.668-3.357 1.668-1.21 0-2.163-.67-2.775-1.31a5.358 5.358 0 0 1-.31-.357 5.36 5.36 0 0 1-.31.356c-.613.642-1.566 1.311-2.776 1.311-1.51 0-2.634-.764-3.357-1.668a5.171 5.171 0 0 1-1.019-2.137 3.447 3.447 0 0 1-1.27-.69c-.71-.61-1.262-1.59-1.262-3.035 0-1.257.15-2.243.575-2.928a2.096 2.096 0 0 1 .96-.84 4.892 4.892 0 0 1-.177-1.127c-.033-.735.076-1.5.295-2.181.215-.67.557-1.323 1.038-1.774a2.122 2.122 0 0 1 1.095-.567c.199-.84.706-1.534 1.353-2.037Zm.921 1.183c-.545.425-.865.991-.865 1.643a.75.75 0 0 1-.987.711c-.138-.046-.282-.035-.491.161-.231.217-.467.61-.636 1.138a4.843 4.843 0 0 0-.225 1.656c.025.556.157 1.018.366 1.33a.752.752 0 0 1 .083.166H6.4a2.85 2.85 0 0 1 2.842 2.642 2 2 0 1 1-1.507.01A1.35 1.35 0 0 0 6.4 12.5H3.8a.7.7 0 0 1-.025 0c-.15.348-.262.949-.262 1.966 0 1.021.372 1.581.74 1.897.402.345.845.435.973.435a.75.75 0 0 1 .75.75c0 .42.232 1.183.76 1.843.509.637 1.233 1.105 2.185 1.105.637 0 1.224-.358 1.69-.846.226-.238.402-.485.518-.685a1.8 1.8 0 0 0 .116-.233l.005-.014V9.25h-.895a2 2 0 1 1 0-1.5h.895V5.212l-.002-.057a3.053 3.053 0 0 0-.18-.904c-.09-.238-.207-.426-.346-.55-.123-.11-.292-.195-.57-.195-.765 0-1.525.258-2.079.69ZM12.763 17v1.718l.005.014c.02.053.058.132.116.233.116.2.292.447.518.685.466.488 1.053.846 1.69.846.953 0 1.676-.468 2.185-1.105.528-.66.76-1.424.76-1.843a.75.75 0 0 1 .75-.75c.128 0 .57-.09.974-.435.367-.316.739-.876.739-1.897 0-1.208-.158-1.83-.349-2.137a.6.6 0 0 0-.26-.245c-.102-.048-.253-.084-.488-.084a.75.75 0 0 1-.625-1.166c.209-.313.341-.774.366-1.33a4.844 4.844 0 0 0-.225-1.656c-.17-.528-.404-.92-.636-1.138-.208-.196-.353-.207-.49-.161a.75.75 0 0 1-.988-.711c0-.652-.32-1.218-.865-1.643-.554-.431-1.313-.69-2.08-.69-.277 0-.446.087-.569.196-.139.124-.255.312-.345.55a3.053 3.053 0 0 0-.18.904 2.056 2.056 0 0 0-.003.057V15.5h.637a1.35 1.35 0 0 0 1.35-1.35v-1.795a2 2 0 1 1 1.5 0v1.795A2.85 2.85 0 0 1 13.4 17h-.637ZM8.5 8a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1ZM8 15.5a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0Zm7-5a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0Z\"/>\n                            </svg>\n                        </div>\n                        <div>\n                            <h3 class=\"clamp-text\">Image Guesser</h3>\n                            <p class=\"clamp-text\">A course project on how people read AI generated imagery</p>\n                        </div>\n                    </div>\n                    <div class=\"work-item-line\"></div>\n                    <p class=\"work-item-date\">2023</p>\n                </a>\n\n",
      },
    ],
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

/** Adds a tag right after the opening <body> unless the page already carries one. */
function ensureAfterBody(html, tag, present) {
  if (present.test(html) || !/<body[^>]*>/i.test(html)) return html;
  return html.replace(/<body([^>]*)>/i, (match) => `${match}\n  ${tag}`);
}

/** Adds a tag just before </body> unless the page already carries one. */
function ensureBeforeBodyEnd(html, tag, present) {
  if (present.test(html)) return html;
  return /<\/body>/i.test(html)
    ? html.replace(/<\/body>/i, `  ${tag}\n</body>`)
    : `${html}\n${tag}\n`;
}

/**
 * A blocking inline script for the very top of <body>. Every archived era keys
 * .dark on <body> and only applies it from a script at the END of the body, so
 * the page paints light first and then flips — the flash. This runs before any
 * body content is parsed, so first paint already carries the right theme; the
 * era's own end-of-body script then finds the class already set and does nothing
 * visible. It reads the era key, which /js/theme-sync.js (in <head>, blocking)
 * has already seeded from the canonical "theme" key by the time this runs.
 */
function themeApplyTag(key) {
  return (
    "<script>/* theme-apply */(function(){try{" +
    `var a=localStorage.getItem(${JSON.stringify(key)})||"system";` +
    'var d=a==="dark"||(a!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);' +
    'document.documentElement.style.colorScheme=d?"dark":"light";' +
    'if(d)document.body.classList.add("dark");' +
    "}catch(e){}})();</script>"
  );
}

function injectWidget(html, year, themeKey) {
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
    // Paints the theme before first paint so the era's end-of-body script no
    // longer flips it and flashes. Keyed on the era's own store, seeded above.
    out = ensureAfterBody(out, themeApplyTag(themeKey), /theme-apply/);
  }

  // Archived pages are duplicates of the live site — keep them out of search.
  out = ensureInHead(out, '<meta name="robots" content="noindex" />', /name=["']robots["']/i);

  // Which version this page belongs to, stated rather than inferred. The widget
  // used to read it out of the URL, which is wrong for exactly one page: the
  // live 404, which GitHub Pages serves under whatever path failed — including
  // paths inside a snapshot.
  out = ensureInHead(
    out,
    `<meta name="time-machine-version" content="${year}" />`,
    /name=["']time-machine-version["']/i
  );

  // Analytics on every archived page, mirroring the live site. Sits just before
  // the time machine at the end of the body; guarded so a rebuild stays idempotent.
  out = ensureBeforeBodyEnd(out, ANALYTICS_TAG, /analytics\.js/);

  return /<\/body>/i.test(out)
    ? out.replace(/<\/body>/i, `  ${SCRIPT_TAG}\n</body>`)
    : `${out}\n${SCRIPT_TAG}\n`;
}

/**
 * Does a snapshot-relative link land on something a static host will serve?
 *
 * A directory wins over a same-named .html file — /ai redirects into ai/ even
 * though ai.html exists next to it — so a folder without an index is a dead end
 * regardless of its sibling.
 */
function resolves(root, rel) {
  if (!rel) return fs.existsSync(path.join(root, "index.html"));
  const full = path.join(root, rel);
  if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
    return fs.existsSync(path.join(full, "index.html"));
  }
  return fs.existsSync(full) || fs.existsSync(`${full}.html`);
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
      const withWidget = injectWidget(updated, year, themeKey);
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

        if (resolves(target, rel)) return match;

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
