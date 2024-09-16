import esbuild from "esbuild";
import { readdirSync } from "fs";
import { join } from "path";

const isWatchMode = process.argv.includes("--watch");

// TypeScriptファイルを全て取得
const tsFiles = readdirSync("src")
  .filter((file) => file.endsWith(".ts"))
  .map((file) => join("src", file));

const buildOptions = {
  entryPoints: tsFiles,
  bundle: true,
  minify: true, // ブラウザ向けにビルド時にコードを縮小
  outdir: "src", // 出力先ディレクトリをdistに変更
  platform: "browser", // ブラウザ向けに変更
  format: "iife", // 即時実行形式に変更
  target: ["es2015"], // ES2015以降をターゲットに
  sourcemap: true, // ソースマップを生成
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
