import { FFmpeg } from "@ffmpeg/ffmpeg";
import { FileData } from "@ffmpeg/ffmpeg/dist/esm/types";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import JSZip from "jszip";

const ffmpegPromise: Promise<FFmpeg> = loadFFmpeg();

const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const convertButton = document.getElementById(
  "convertButton"
) as HTMLButtonElement;
const downloadLinkContainer = document.getElementById(
  "downloadLinkContainer"
) as HTMLDivElement;

fileInput.addEventListener("change", () => {
  if (fileInput.files?.length) {
    convertButton.disabled = false;
  }
});

convertButton.addEventListener("click", async () => {
  if (fileInput.files?.length) {
    const file = fileInput.files[0];
    const url = URL.createObjectURL(file);

    try {
      const ffmpeg = await ffmpegPromise; // FFmpegロード待ち
      const zipUrl = await extractMediaAndZip(ffmpeg, url);

      const link = document.createElement("a");
      link.href = zipUrl;
      link.download = "media.zip";
      link.textContent = "Download ZIP";

      downloadLinkContainer.innerHTML = ""; // 前のリンクをクリア
      downloadLinkContainer.appendChild(link);
    } catch (error) {
      console.error("FFmpeg loading or execution failed", error);
    }
  }
});

/**
 * FFmpegを使用してメディアを処理し、ZIPファイルを作成する関数
 * @param ffmpeg FFmpegインスタンス
 * @param inputFile 処理対象のMP4ファイルのURL
 * @returns ZIPファイルのURL
 */
async function extractMediaAndZip(
  ffmpeg: FFmpeg,
  inputFile: string
): Promise<string> {
  // MP4ファイルをFFmpegに読み込み
  await ffmpeg.writeFile("input.mp4", await fetchFile(inputFile));
  console.warn("input.mp4 written");

  // 映像をフレームごとに番号付きの画像（PNG）として抽出
  await ffmpeg.exec([
    "-i",
    "input.mp4",
    "-vf",
    "fps=1",
    "-q:v",
    "3",
    "output_%03d.png",
  ]);
  console.warn("output images written");

  // 音声をOGG形式で抽出
  await ffmpeg.exec([
    "-i",
    "input.mp4",
    "-q:a",
    "0",
    "-map",
    "a",
    "output.ogg",
  ]);
  console.warn("output.ogg written");

  // 出力ファイルを読み込む
  let audioData: FileData = await ffmpeg.readFile("output.ogg");
  if (typeof audioData === "string") {
    audioData = stringToUint8Array(audioData); // stringからUint8Arrayに変換
  }

  // 生成された画像の読み込み
  const zip = new JSZip();
  let i = 1;
  while (true) {
    try {
      let imageData: FileData = await ffmpeg.readFile(
        `output_${String(i).padStart(3, "0")}.png`
      );
      if (typeof imageData === "string") {
        imageData = stringToUint8Array(imageData); // stringからUint8Arrayに変換
      }
      zip.file(`image_${i}.png`, imageData as Uint8Array); // 型キャスト
      i++;
    } catch (e) {
      break; // ファイルが見つからない場合ループを終了
    }
  }

  console.warn("Images and audio extracted");

  // ZIPファイルに音声を追加
  zip.file("output.ogg", audioData as Uint8Array); // 型キャスト

  // ZIPファイルを生成してBlobに変換
  const zipBlob: Blob = await zip.generateAsync({ type: "blob" });
  const zipURL: string = URL.createObjectURL(zipBlob);

  return zipURL;
}

/**
 * FFmpegをロードし、初期化する関数
 * @returns FFmpegインスタンス
 */
export async function loadFFmpeg(): Promise<FFmpeg> {
  const ffmpeg = new FFmpeg();
  const CORE_VERSION = "0.12.6"; // 使用するバージョンを指定

  // FFmpegの初期化
  await ffmpeg.load({
    coreURL: await toBlobURL(
      `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd/ffmpeg-core.js`,
      "text/javascript"
    ),
    wasmURL: await toBlobURL(
      `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd/ffmpeg-core.wasm`,
      "application/wasm"
    ),
    workerURL: await toBlobURL(
      `https://unpkg.com/@ffmpeg/core-mt@${CORE_VERSION}/dist/umd/ffmpeg-core.worker.js`,
      "text/javascript"
    ),
    classWorkerURL: await toBlobURL("./worker.js", "text/javascript"), // worker.ts からコンパイルされたworker.jsを使用
  });

  console.log("FFmpeg core loaded successfully");
  return ffmpeg;
}

function stringToUint8Array(data: string): Uint8Array {
  const binaryString = atob(data); // Base64エンコードされた文字列をデコード
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
