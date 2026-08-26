import { promises as fs } from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const fonts = path.join(dist, "fonts");
const removed = [];

try {
  const entries = await fs.readdir(fonts, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const isLegacyFont = entry.name.endsWith(".ttf");
    const isUnusedLightFace = entry.name === "LXGWWenKai-Light.woff2";
    if (!isLegacyFont && !isUnusedLightFace) continue;
    await fs.rm(path.join(fonts, entry.name));
    removed.push(entry.name);
  }
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

process.stdout.write(
  `Toy asset pruning removed ${removed.length} duplicate or unused font files.\n`,
);
