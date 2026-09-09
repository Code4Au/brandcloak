import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePng(size) {
  const width = size;
  const height = size;
  const rawData = Buffer.alloc(height * (1 + width * 4));

  // Draw a sleek stealth shield icon:
  // Background: Deep dark rounded rectangle (#0f172a)
  // Icon: Neon cyan/emerald shield outline & stealth glasses/hood
  const rCorner = size * 0.22;
  const center = size / 2;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Distance to corner centers for rounded squircle
      let insideBase = true;
      const dx = Math.abs(x - (width - 1) / 2);
      const dy = Math.abs(y - (height - 1) / 2);
      const maxDist = (size / 2) - 1;

      // Squircle distance formula: (dx/R)^4 + (dy/R)^4 <= 1
      const normalizedDist = Math.pow(dx / (maxDist), 4) + Math.pow(dy / (maxDist), 4);

      if (normalizedDist > 1.05) {
        // Transparent outside rounded icon
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
        continue;
      }

      // Base background color: Deep rich navy/slate gradient
      const gradT = y / height;
      let r = Math.round(15 + gradT * 10);
      let g = Math.round(23 + gradT * 15);
      let b = Math.round(42 + gradT * 25);
      let a = 255;

      // Antialiased border on base icon
      if (normalizedDist > 0.92) {
        const edgeAlpha = Math.max(0, Math.min(1, (1.05 - normalizedDist) / 0.13));
        a = Math.round(255 * edgeAlpha);
      }

      // Draw stealth shield symbol inside:
      // Coordinates normalized to [0, 1]
      const nx = (x - center) / (size * 0.38);
      const ny = (y - center * 1.05) / (size * 0.38);

      // Shield shape: |nx| <= 1 - 0.5 * ny (top), curved bottom
      const shieldTop = ny >= -0.8 && ny <= -0.1 && Math.abs(nx) <= 0.85;
      const shieldBottom = ny > -0.1 && ny <= 0.9 && Math.abs(nx) <= (1 - 0.7 * (ny + 0.1) * (ny + 0.1));
      const inShield = shieldTop || shieldBottom;

      // Inner cutout for shield outline
      const innerNx = nx * 1.35;
      const innerNy = (ny + 0.05) * 1.35;
      const innerTop = innerNy >= -0.8 && innerNy <= -0.1 && Math.abs(innerNx) <= 0.85;
      const innerBottom = innerNy > -0.1 && innerNy <= 0.9 && Math.abs(innerNx) <= (1 - 0.7 * (innerNy + 0.1) * (innerNy + 0.1));
      const inInnerShield = innerTop || innerBottom;

      // Stealth visor / sunglasses across the middle
      const inVisor = (ny >= -0.35 && ny <= 0.05 && Math.abs(nx) <= 0.6);

      if (inVisor) {
        // Vibrant Cyan / Emerald stealth visor (#06b6d4 -> #10b981)
        const visorT = (nx + 0.6) / 1.2;
        r = Math.round(6 + visorT * 10);
        g = Math.round(182 + visorT * 3);
        b = Math.round(212 - visorT * 83);
        a = Math.max(a, 255);
      } else if (inShield && !inInnerShield) {
        // Shield border: Sleek bright cyan (#38bdf8)
        r = 56;
        g = 189;
        b = 248;
        a = Math.max(a, 255);
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // Build PNG Buffer
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const sizes = [16, 32, 48, 128];
const iconsDir = path.resolve('icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

for (const size of sizes) {
  const pngBuf = generatePng(size);
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, pngBuf);
  console.log(`Generated ${filePath} (${size}x${size}, ${pngBuf.length} bytes)`);
}
