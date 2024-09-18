import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import JSZip from "jszip";

const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const convertButton = document.getElementById(
  "convertButton"
) as HTMLButtonElement;
const downloadLinkContainer = document.getElementById("downloadLinkContainer");

fileInput.addEventListener("change", () => {
  if (fileInput.files?.length) {
    convertButton.disabled = false;
  }
});

convertButton.addEventListener("click", async () => {
  if (fileInput.files?.length) {
    const file = fileInput.files[0];
    const url = URL.createObjectURL(file);
    const zipUrl = await extractMediaAndZip(url);

    const link = document.createElement("a");
    link.href = zipUrl;
    link.download = "media.zip";
    link.textContent = "Download ZIP";

    if (downloadLinkContainer == null) return;
    downloadLinkContainer.innerHTML = ""; // Clear previous link
    downloadLinkContainer.appendChild(link);
  }
});

async function extractMediaAndZip(inputFile: string) {
  const ffmpeg = new FFmpeg();
  const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";

  // FFmpegの初期化
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    workerURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      "text/javascript"
    ),
  });

  console.warn("ffmpeg loaded");

  // MP4ファイルをFFmpegに読み込み
  await ffmpeg.writeFile("input.mp4", await fetchFile(inputFile));
  console.warn("input.mp4 written");

  // 映像をフレームごとに番号付きの画像（PNG）として抽出
  await ffmpeg.exec([
    "-i",
    "input.mp4",
    "-vf",
    "fps=1", // 1フレーム毎秒で抽出
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
  const audioData = await ffmpeg.readFile("output.ogg");

  // 生成された画像の読み込み
  const zip = new JSZip();
  let i = 1;
  while (true) {
    try {
      const imageData = await ffmpeg.readFile(
        `output_${String(i).padStart(3, "0")}.png`
      );
      zip.file(`image_${i}.png`, imageData);
      i++;
    } catch (e) {
      break;
    }
  }

  console.warn("Images and audio extracted");

  // ZIPファイルに音声を追加
  zip.file("output.ogg", audioData);

  // ZIPファイルを生成してBlobに変換
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const zipURL = URL.createObjectURL(zipBlob);

  return zipURL;
}
