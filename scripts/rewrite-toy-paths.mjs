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

function relativeTarget(url, htmlFile, keepDirectory = false) {
  if (!url.startsWith("/") || url.startsWith("//")) return url;
  const match = url.match(/^([^?#]*)([?#].*)?$/);
  if (!match) return url;
  const pathname = match[1];
  const suffix = match[2] || "";
  const clean = pathname.replace(/^\/+/, "");
  const hasExtension = path.posix.extname(clean) !== "";
  const target = keepDirectory
    ? clean
    : clean === ""
      ? "index.html"
      : pathname.endsWith("/") || !hasExtension
        ? path.posix.join(clean, "index.html")
        : clean;
  let relative = path.posix.relative(path.posix.dirname(htmlFile), target);
  if (!relative.startsWith(".")) relative = `./${relative}`;
  if (keepDirectory && !relative.endsWith("/")) relative += "/";
  return `${relative}${suffix}`;
}

const files = (await walk(dist)).filter((file) => file.endsWith(".html"));
for (const absoluteFile of files) {
  const htmlFile = path.relative(dist, absoluteFile).split(path.sep).join("/");
  let html = await fs.readFile(absoluteFile, "utf8");
  html = html.replace(
    /(^|[\s<])(href|src|poster|action|data-bundle-path)=(?:(['"])(\/[^'"]*)\3|(\/[^\s>]*))/g,
    (_, prefix, name, quote, quotedURL, bareURL) => {
      const url = quotedURL || bareURL;
      const rewritten = relativeTarget(
        url,
        htmlFile,
        name === "data-bundle-path",
      );
      return quote
        ? `${prefix}${name}=${quote}${rewritten}${quote}`
        : `${prefix}${name}=${rewritten}`;
    },
  );
  html = html.replace(
    /(^|[\s<])srcset=(?:(['"])([^'"]+)\2|([^\s>]+))/g,
    (_, prefix, quote, quotedValue, bareValue) => {
      const value = quotedValue || bareValue;
      const rewritten = value
        .split(",")
        .map((item) => {
          const [url, descriptor] = item.trim().split(/\s+/, 2);
          return `${relativeTarget(url, htmlFile)}${descriptor ? ` ${descriptor}` : ""}`;
        })
        .join(", ");
      return quote
        ? `${prefix}srcset=${quote}${rewritten}${quote}`
        : `${prefix}srcset=${rewritten}`;
    },
  );
  html = html.replace(
    /url\((['"]?)(\/[^)'"\s]+)\1\)/g,
    (_, quote, url) => `url(${quote}${relativeTarget(url, htmlFile)}${quote})`,
  );
  html = html.replace(
    /this\.src=(['"])(\/[^'"]+)\1/g,
    (_, quote, url) =>
      `this.src=${quote}${relativeTarget(url, htmlFile)}${quote}`,
  );
  await fs.writeFile(absoluteFile, html);
}

process.stdout.write(
  `Rewrote internal paths in ${files.length} HTML files for Toy static hosting.\n`,
);
