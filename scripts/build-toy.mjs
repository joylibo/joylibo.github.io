import { spawnSync } from "node:child_process";

const run = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status || 1);
};

run(process.execPath, ["scripts/themeGenerator.js"]);
run("hugo", [
  "--gc",
  "--minify",
  "--forceSyncStatic",
  "--cleanDestinationDir",
  "--environment",
  "toy",
  "--destination",
  "dist",
]);
run(process.execPath, ["scripts/prune-toy-assets.mjs"]);
run(process.execPath, ["scripts/rewrite-toy-paths.mjs"]);
run(process.execPath, ["scripts/check-toy-output.mjs"]);
