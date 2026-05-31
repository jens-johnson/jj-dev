/**
 * Favicon generator — rasterizes the JJ mark SVG into favicon.ico and apple-touch-icon.png.
 *
 * Uses ImageMagick (magick / convert). Run once after changing the logo mark SVG.
 *
 * Usage: npm run gen:favicon
 */

import { execSync, spawnSync } from 'child_process';
import { readFileSync, unlinkSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const SVG = join(PUBLIC, 'favicon.svg');

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function hasCmd(cmd) {
  const r = spawnSync(cmd, ['--version'], {
    encoding: 'utf8',
  });
  return r.status === 0;
}

function rasterize(tool, src, out, width, height, background) {
  const bg = background ?? 'transparent';
  if (tool === 'magick') {
    execSync(`magick -background "${bg}" -resize ${width}x${height} "${src}" "${out}"`);
  } else {
    execSync(`convert -background "${bg}" -resize ${width}x${height} "${src}" "${out}"`);
  }
}

/** Pack two PNGs into a minimal .ico file. */
function buildICO(png16, png32, outPath) {
  const data16 = readFileSync(png16);
  const data32 = readFileSync(png32);

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = ICO
  header.writeUInt16LE(2, 4); // 2 images

  const offsetBase = 6 + 16 * 2;

  function dirEntry(size, dataLen, offset) {
    const buf = Buffer.alloc(16);
    buf[0] = size;
    buf[1] = size;
    buf[2] = 0;
    buf[3] = 0;
    buf.writeUInt16LE(1, 4);
    buf.writeUInt16LE(32, 6);
    buf.writeUInt32LE(dataLen, 8);
    buf.writeUInt32LE(offset, 12);
    return buf;
  }

  const ico = Buffer.concat([
    header,
    dirEntry(16, data16.length, offsetBase),
    dirEntry(32, data32.length, offsetBase + data16.length),
    data16,
    data32,
  ]);

  writeFileSync(outPath, ico);
}

/** Build an SVG with a solid background rect for the apple-touch-icon. */
function buildAppleSvg(tmpPath) {
  const src = readFileSync(SVG, 'utf8');
  const withBg = src.replace(/(<svg[^>]*>)/, '$1\n  <rect width="500" height="500" fill="#F8F4EE"/>');
  writeFileSync(tmpPath, withBg);
}

/* ─── Main ───────────────────────────────────────────────────────────────── */

const tool = hasCmd('magick') ? 'magick' : hasCmd('convert') ? 'convert' : null;

if (!tool) {
  console.error('ImageMagick not found. Install with: brew install imagemagick');
  process.exit(1);
}

console.error(`Using: ${tool}`);

const png16 = join(PUBLIC, '_favicon-16.png');
const png32 = join(PUBLIC, '_favicon-32.png');
const appleTmp = join(PUBLIC, '_apple-tmp.svg');
const icoOut = join(PUBLIC, 'favicon.ico');
const appleOut = join(PUBLIC, 'apple-touch-icon.png');

rasterize(tool, SVG, png16, 16, 16, 'transparent');
rasterize(tool, SVG, png32, 32, 32, 'transparent');
buildAppleSvg(appleTmp);
rasterize(tool, appleTmp, appleOut, 180, 180, '#F8F4EE');

buildICO(png16, png32, icoOut);

unlinkSync(png16);
unlinkSync(png32);
unlinkSync(appleTmp);

console.error('Generated: public/favicon.ico');
console.error('Generated: public/apple-touch-icon.png');
