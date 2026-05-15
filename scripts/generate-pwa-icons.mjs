import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const svg = await readFile(path.join(publicDir, "icon.svg"));

const sizes = [
  { name: "pwa-192x192.png", size: 192 },
  { name: "pwa-512x512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "maskable-icon-512x512.png", size: 512, maskable: true },
];

await mkdir(publicDir, { recursive: true });

for (const { name, size, maskable } of sizes) {
  let pipeline = sharp(svg).resize(size, size);

  if (maskable) {
    const padding = Math.round(size * 0.1);
    const inner = size - padding * 2;
    pipeline = sharp(svg).resize(inner, inner).extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: "#06152d",
    });
  }

  await pipeline.png().toFile(path.join(publicDir, name));
}
