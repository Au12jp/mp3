import esbuild from "esbuild";
import { readdirSync, statSync } from "fs";
import { join } from "path";

function getAllTsFiles(dir) {
  let results = [];
  const files = readdirSync(dir);

  files.forEach((file) => {
    const fullPath = join(dir, file);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      results = results.concat(getAllTsFiles(fullPath));
    } else if (stats.isFile() && file.endsWith(".ts")) {
      results.push(fullPath);
    }
  });

  return results;
}

const isWatchMode = process.argv.includes("--watch");

const tsFiles = getAllTsFiles("src");

const buildOptions = {
  entryPoints: tsFiles,
  bundle: true,
  minify: true,
  outdir: "src",
  platform: "browser",
  format: "iife",
  target: ["es2015"],
  sourcemap: true,
};

async function build() {
  if (isWatchMode) {
    const context = await esbuild.context(buildOptions);
    await context.watch();
    console.log("Watching for changes...");
  } else {
    esbuild.build(buildOptions).catch(() => process.exit(1));
  }
}

build();
