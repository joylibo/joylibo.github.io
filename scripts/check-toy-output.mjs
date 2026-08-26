import { promises as fs } from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(target) : target;
    }),
  );
  return files.flat();
}

const allFiles = await walk(dist);
const failures = [];

for (const file of allFiles.filter((item) => item.endsWith(".html"))) {
  const html = await fs.readFile(file, "utf8");
  const tags =
    html.match(
      /<(?:a|audio|form|iframe|img|link|script|source|video)\b[^>]*>/gi,
    ) || [];
  for (const tag of tags) {
    const rootAbsolutePatterns = [
      /(?:^|\s)(?:href|src|poster|action|data-bundle-path)=(?:(['"])\/|(\/))(?!\/)/,
      /(?:^|\s)srcset=(?:(['"])[^'"]*\/|(\/))(?!\/)/,
      /url\((['"]?)\/(?!\/)/,
      /this\.src=(['"])\/(?!\/)/,
    ];
    if (rootAbsolutePatterns.some((pattern) => pattern.test(tag))) {
      failures.push(
        `${path.relative(dist, file)}: contains a root-absolute local path`,
      );
      break;
    }

    const tagName = tag.match(/^<([a-z]+)/i)?.[1]?.toLowerCase();
    const attributePattern =
      /(?:^|\s)(href|src|poster)=(?:(['"])([^'"]+)\2|([^\s>]+))/g;
    for (const match of tag.matchAll(attributePattern)) {
      const attribute = match[1];
      const rawURL = match[3] || match[4];
      if (attribute === "href" && tagName !== "link") continue;
      if (!rawURL || rawURL.startsWith("#") || rawURL.startsWith("//"))
        continue;
      if (/^(?:https?:|mailto:|tel:|data:|javascript:|obsidian:)/i.test(rawURL))
        continue;
      const pathname = rawURL.split(/[?#]/, 1)[0];
      if (!pathname) continue;
      let decoded = pathname;
      try {
        decoded = decodeURIComponent(pathname);
      } catch {}
      const target = path.resolve(path.dirname(file), decoded);
      try {
        const stat = await fs.stat(target);
        if (stat.isDirectory())
          await fs.access(path.join(target, "index.html"));
      } catch {
        failures.push(
          `${path.relative(dist, file)}: missing local target ${rawURL}`,
        );
      }
    }
  }
}

const legacyFonts = allFiles.filter((file) => file.endsWith(".ttf"));
if (legacyFonts.length > 0) {
  failures.push(
    `legacy TTF files remain: ${legacyFonts.map((file) => path.basename(file)).join(", ")}`,
  );
}

const sizes = await Promise.all(
  allFiles.map(async (file) => ({
    file,
    size: (await fs.stat(file)).size,
  })),
);
const totalBytes = sizes.reduce((sum, item) => sum + item.size, 0);
const totalMB = totalBytes / 1024 / 1024;
const maxMB = Number.parseFloat(process.env.TOY_MAX_MB || "");
if (Number.isFinite(maxMB) && totalMB > maxMB) {
  failures.push(
    `output is ${totalMB.toFixed(2)} MB, above TOY_MAX_MB=${maxMB}`,
  );
}

if (failures.length > 0) {
  process.stderr.write(
    `Toy output check failed:\n${failures.map((item) => `- ${item}`).join("\n")}\n`,
  );
  process.exit(1);
}

const largest = sizes.sort((a, b) => b.size - a.size).slice(0, 10);
process.stdout.write(
  `Toy output check passed: ${totalMB.toFixed(2)} MB across ${allFiles.length} files.\n`,
);
process.stdout.write("Largest files:\n");
for (const item of largest) {
  process.stdout.write(
    `- ${(item.size / 1024 / 1024).toFixed(2)} MB  ${path.relative(dist, item.file)}\n`,
  );
}
