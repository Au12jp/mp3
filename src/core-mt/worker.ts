import { FFmpeg } from "@ffmpeg/ffmpeg";
import JSZip from "jszip";
import { FFMessageLoadConfig } from "@ffmpeg/ffmpeg/dist/esm/types";
import { toBlobURL } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();
let zip: JSZip | null = null;
let ffmpegLoaded = false; // FFmpegがロードされたかどうかを追跡する変数

self.addEventListener("message", async (event: MessageEvent) => {
  const { command, args } = event.data;

  switch (command) {
    case "load":
      await loadFFmpeg();
      break;
    case "createPack":
      if (!ffmpegLoaded) {
        self.postMessage({
          status: "error",
          message: "FFmpeg is not loaded yet.",
        });
        return;
      }
      await createBPandRP(args[0], args[1], args[2]);
      break;
    case "getPack":
      if (!zip) {
        self.postMessage({
          status: "error",
          message: "No pack generated yet.",
        });
        return;
      }
      const pack = await getGeneratedPack();
      self.postMessage({ status: "completed", result: pack });
      break;
    default:
      self.postMessage({
        status: "error",
        message: `Unknown command: ${command}`,
      });
  }
});

// FFmpegのロード
async function loadFFmpeg() {
  const baseURL = ".";

  const config: FFMessageLoadConfig = {
    classWorkerURL: await toBlobURL(`${baseURL}/worker.js`, "text/javascript"),
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    workerURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      "text/javascript"
    ),
  };

  await ffmpeg.load(config);
  ffmpegLoaded = true; // FFmpegのロードが完了したことをマーク
  self.postMessage({ status: "loaded" });
}

// BPとRPのパック生成
async function createBPandRP(
  inputFileData: Uint8Array,
  frameCount: number,
  fps: number
) {
  zip = new JSZip();

  // 動画からフレームを生成
  await ffmpeg.writeFile("input.mp4", inputFileData);
  await ffmpeg.exec(["-i", "input.mp4", "-vf", `fps=${fps}`, "output%d.png"]);

  for (let i = 1; i <= frameCount; i++) {
    const frame = await ffmpeg.readFile(`output${i}.png`);
    zip.file(`RP/textures/video/frame${i}.png`, frame);

    // 進捗を計算
    const percent = (i / frameCount) * 100;
    const estimatedRemainingTime = ((frameCount - i) / fps).toFixed(2);

    // 進捗をメインスレッドに送信
    self.postMessage({
      status: "progress",
      percent,
      estimatedRemainingTime,
    });
  }

  // OGG音声を生成
  await ffmpeg.exec([
    "-i",
    "input.mp4",
    "-vn",
    "-c:a",
    "libvorbis",
    "output.ogg",
  ]);
  const oggAudio = await ffmpeg.readFile("output.ogg");
  zip.file("RP/sounds/sound.ogg", oggAudio);

  // BPデータ.js
  zip.file(
    "BP/scripts/data.js",
    `export const frameCount = ${frameCount};\nexport const fps = ${fps};`
  );

  self.postMessage({ status: "pack-created" });
}

// パックをZIP形式で取得
async function getGeneratedPack(): Promise<Blob> {
  if (!zip) {
    throw new Error("Pack is not generated.");
  }

  return await zip.generateAsync({ type: "blob" });
}
