/**
 * Turns a camera original into the two web copies the photos page serves:
 *
 *   assets/photos/<name>.webp         full size, for the lightbox
 *   assets/photos/thumbs/<name>.webp  grid size, picked by srcset
 *
 * Orientation is baked in and metadata (EXIF, GPS) is stripped. Prints the
 * finished width and height to paste into the PHOTOS list in js/photos.js.
 *
 *   npm run photos -- ~/Downloads/IMG_1234.jpeg [--name=space-needle]
 *   npm run photos -- ~/Pictures/export/*.jpeg      # several at once
 *
 * The originals are not kept in the site — they would be shipped to nobody.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "assets", "photos");

// Long edge of the lightbox copy: the lightbox tops out around 900 CSS px tall
// on a large retina display, so 2000 device px covers it with room to spare.
const FULL_EDGE = 2000;
// Grid column is at most ~430 CSS px wide (a full-width phone, or half the
// 880px desktop feed), so 900 covers it at 2x.
const THUMB_WIDTH = 900;
const QUALITY = 80;

const args = process.argv.slice(2);
const nameFlag = args.find((a) => a.startsWith("--name="));
const files = args.filter((a) => !a.startsWith("--"));

if (!files.length) {
  console.error("usage: npm run photos -- <image> [<image>...] [--name=<slug>]");
  process.exit(1);
}
if (nameFlag && files.length > 1) {
  console.error("--name only makes sense with a single image");
  process.exit(1);
}

fs.mkdirSync(path.join(OUT, "thumbs"), { recursive: true });

for (const file of files) {
  const name = nameFlag
    ? nameFlag.slice("--name=".length)
    : path.basename(file, path.extname(file)).toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // rotate() with no angle applies the EXIF orientation, so what is written is
  // what the camera meant; sharp drops all metadata on output by default.
  const source = sharp(file).rotate();

  const full = await source
    .clone()
    .resize({ width: FULL_EDGE, height: FULL_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(path.join(OUT, `${name}.webp`));

  const thumb = await source
    .clone()
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(path.join(OUT, "thumbs", `${name}.webp`));

  const kb = (bytes) => `${Math.round(bytes / 1024)}KB`;
  console.log(
    `${name}: ${full.width}×${full.height} (${kb(full.size)}, thumb ${kb(thumb.size)})` +
      `  →  src: "assets/photos/${name}.webp", width: ${full.width}, height: ${full.height}`
  );
}
