import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, isMaskable = false) {
  // RGBA buffer: width * 4 + 1 per scanline (filter type byte 0)
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const rCorner = width * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Gradient background from Sky Blue (#0284c7) to Royal Blue (#2563eb) to Emerald (#10b981)
      const t = (x + y) / (width + height);
      let r = Math.round(2 + t * (16 - 2));
      let g = Math.round(132 + t * (185 - 132));
      let b = Math.round(199 + t * (129 - 199));
      let a = 255;

      // Rounded rect check unless maskable
      if (!isMaskable) {
        let dx = 0;
        let dy = 0;
        if (x < rCorner) dx = rCorner - x;
        else if (x > width - rCorner) dx = x - (width - rCorner);

        if (y < rCorner) dy = rCorner - y;
        else if (y > height - rCorner) dy = y - (height - rCorner);

        if (dx > 0 && dy > 0) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > rCorner) {
            a = 0;
          } else if (dist > rCorner - 1.5) {
            a = Math.round(255 * (rCorner - dist) / 1.5);
          }
        }
      }

      // Draw Heart / Pulse graphic inside safe zone
      const nx = (x - cx) / (width * 0.4);
      const ny = (cy - y) / (height * 0.4); // inverted Y

      // Heart equation: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
      const hx = nx * 1.15;
      const hy = ny * 1.15 + 0.2;
      const heartVal = Math.pow(hx * hx + hy * hy - 1, 3) - (hx * hx) * Math.pow(hy, 3);

      if (heartVal <= 0.05 && a > 0) {
        // Heart interior: Bright white / soft mint
        r = 255;
        g = 255;
        b = 255;
        a = 250;

        // Pulse line across center
        const py = Math.abs(ny - (Math.sin(nx * 5) * 0.25));
        if (py < 0.1 && Math.abs(nx) < 0.8) {
          r = 37;
          g = 99;
          b = 235;
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // Compress IDAT
  const compressed = zlib.deflateSync(rawData);

  // PNG structure
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : (c >>> 1);
    }
    table[i] = c;
  }

  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcTarget = Buffer.alloc(4 + len);
  chunk.copy(crcTarget, 0, 4, 8 + len);
  const c = crc32(crcTarget);
  chunk.writeUInt32BE(c, 8 + len);

  return chunk;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, true));
fs.writeFileSync('public/favicon.ico', createPNG(48, 48));

console.log('Successfully generated PWA icon assets in /public');
