import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import JSZip from "jszip";

// FFmpegの初期化
const ffmpeg = createFFmpeg({
  corePath:
    "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
  log: true,
});

let totalDuration = 0;

const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const convertButton = document.getElementById(
  "convertButton"
) as HTMLButtonElement;
const formatSelectAudio = document.getElementById(
  "formatSelectAudio"
) as HTMLSelectElement;
const formatSelectVideo = document.getElementById(
  "formatSelectVideo"
) as HTMLSelectElement;
const resolutionSelect = document.getElementById(
  "resolutionSelect"
) as HTMLSelectElement;
const fpsInput = document.getElementById("fpsInput") as HTMLInputElement;
const statusMessage = document.getElementById(
  "statusMessage"
) as HTMLParagraphElement;
const progressPercent = document.getElementById(
  "progressPercent"
) as HTMLParagraphElement;
const progressBar = document.getElementById(
  "progressBar"
) as HTMLProgressElement;
const logMessage = document.getElementById("logMessage") as HTMLPreElement;
const downloadLinkContainer = document.getElementById(
  "downloadLinkContainer"
) as HTMLDivElement;
const modal = document.getElementById("completeModal") as HTMLDivElement;

let totalFileSize: number;

// FFmpegロード
const loadFFmpeg = async () => {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
    logMessage.textContent += "FFmpegがロードされました。\n";
  }
};

// ページロード時にFFmpegをプリロード
window.addEventListener("load", () => {
  logMessage.textContent += "FFmpegをロード中...\n";
  loadFFmpeg();
});

// ファイル選択時のイベントリスナー
fileInput.addEventListener("change", async () => {
  if (fileInput.files?.length) {
    const files = fileInput.files;
    totalFileSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);
    statusMessage.textContent = `ファイルが選択されました (${
      files.length
    } ファイル, 合計: ${Math.round(totalFileSize / 1024 / 1024)} MB)`;
    convertButton.disabled = false;
  }
});

// FFmpegのログから進捗を解析するための関数
const parseDuration = (log: string) => {
  const durationRegex = /Duration: (\d+):(\d+):(\d+\.\d+)/;
  const match = durationRegex.exec(log);

  if (match) {
    const hours = parseFloat(match[1]);
    const minutes = parseFloat(match[2]);
    const seconds = parseFloat(match[3]);
    totalDuration = hours * 3600 + minutes * 60 + seconds;
  }
};

const parseProgress = (log: string) => {
  const timeRegex = /time=(\d+):(\d+):(\d+\.\d+)/;
  const match = timeRegex.exec(log);

  if (match) {
    const hours = parseFloat(match[1]);
    const minutes = parseFloat(match[2]);
    const seconds = parseFloat(match[3]);
    const currentTime = hours * 3600 + minutes * 60 + seconds;

    // 進捗を計算して進捗バーを更新
    if (totalDuration > 0) {
      const progress = (currentTime / totalDuration) * 100;
      progressBar.value = progress;
      progressPercent.textContent = `進捗: ${progress.toFixed(2)}%`;
    }
  }
};

// FFmpegのログを処理して進捗を表示
ffmpeg.setLogger(({ type, message }) => {
  if (type === "fferr") {
    // 初めにdurationを取得
    if (message.includes("Duration:")) {
      parseDuration(message);
    }

    // timeの進捗を取得
    if (message.includes("time=")) {
      parseProgress(message);
    }
  }
});

// 処理完了時にモーダルを表示
const showCompleteModal = () => {
  modal.style.display = "block";
};

// モーダルを閉じる処理
modal.addEventListener("click", () => {
  modal.style.display = "none";
});

// ファイル変換処理
const processFile = async (
  file: File,
  audioFormat: string,
  videoFormat: string,
  resolution: string,
  fps: string
) => {
  const fileName = file.name.split(".")[0];

  // 入力ファイルをFFmpegに書き込む
  ffmpeg.FS("writeFile", "input.mp4", await fetchFile(file));

  logMessage.textContent += `音声を${audioFormat}形式で抽出しています...\n`;

  await ffmpeg.run(
    "-i",
    "input.mp4",
    "-q:a",
    "0",
    "-map",
    "a",
    `output.${audioFormat}`
  );

  logMessage.textContent += `映像を${fps}fpsで${resolution}解像度に設定し、${videoFormat}形式で抽出しています...\n`;

  await ffmpeg.run(
    "-i",
    "input.mp4",
    "-vf",
    `fps=${fps},scale=${resolution}`,
    `output_%03d.${videoFormat}`
  );

  logMessage.textContent += "変換が完了しました。\n";

  // ZIPにまとめる
  const zip = new JSZip();

  // 音声ファイルをZIPに追加
  const audioData = ffmpeg.FS("readFile", `output.${audioFormat}`);
  zip.file(`audio.${audioFormat}`, audioData);

  // PNGファイルをまとめて追加
  let index = 1;
  while (true) {
    const fileName = `output_${String(index).padStart(3, "0")}.${videoFormat}`;
    try {
      const imageData = ffmpeg.FS("readFile", fileName);
      zip.file(fileName, imageData);
      index++;
    } catch (error) {
      break;
    }
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(zipBlob);
  downloadLink.download = `${fileName}_audio_and_images.zip`;
  downloadLink.textContent = "Download ZIPファイル";
  downloadLink.classList.add("download-link");

  downloadLinkContainer.innerHTML = "";
  downloadLinkContainer.appendChild(downloadLink);

  statusMessage.textContent = "変換が完了しました。";
  convertButton.disabled = false;

  // 処理完了後の通知
  showCompleteModal();
};

// コンバートボタン押下時のイベントリスナー
convertButton.addEventListener("click", async () => {
  if (!fileInput.files?.length) return;

  const audioFormat = formatSelectAudio.value;
  const videoFormat = formatSelectVideo.value;
  const resolution = resolutionSelect.value;
  const fps = fpsInput.value;

  convertButton.disabled = true;
  statusMessage.textContent = "変換中...";

  const files = fileInput.files;

  // 複数ファイルを順次処理
  for (let i = 0; i < files.length; i++) {
    await processFile(files[i], audioFormat, videoFormat, resolution, fps);
  }
});
