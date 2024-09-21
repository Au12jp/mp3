import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import JSZip from "jszip";

// FFmpegの初期化
const ffmpeg = createFFmpeg({
  corePath:
    "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
  log: true,
});

let totalDuration = 0;
let videoMetadata = {
  resolution: "",
  fps: 0,
};

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
const detailedLog = document.getElementById("detailedLog") as HTMLPreElement;
const downloadLinkContainer = document.getElementById(
  "downloadLinkContainer"
) as HTMLDivElement;
const modal = document.getElementById("completeModal") as HTMLDivElement;
const toggleLogButton = document.getElementById(
  "toggleLogButton"
) as HTMLButtonElement;

// 詳細ログ表示を切り替える関数
let logVisible = false;
toggleLogButton.addEventListener("click", () => {
  logVisible = !logVisible;
  detailedLog.style.display = logVisible ? "block" : "none";
  toggleLogButton.textContent = logVisible ? "Hide Log" : "Show Log";
});

// ログに時間を含めて表示する関数
const logWithTimestamp = (message: string, isDetailed = false) => {
  const now = new Date();
  const timeString = now.toLocaleTimeString("ja-JP", { hour12: false });
  const formattedMessage = `[${timeString}] ${message}\n`;

  // 通常のログに表示（詳細なFFmpegの進捗以外を通常ログに表示）
  if (!isDetailed) {
    logMessage.textContent += formattedMessage;
  }

  // 詳細ログに表示
  if (isDetailed) {
    detailedLog.textContent += formattedMessage;
  }
};

// FFmpegロード
const loadFFmpeg = async () => {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
    logWithTimestamp("FFmpegがロードされました。");
  }
};

// ページロード時にFFmpegをプリロード
window.addEventListener("load", () => {
  logWithTimestamp("FFmpegをロード中...");
  loadFFmpeg();
});

// ファイル選択時のイベントリスナー
fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  if (file.name.endsWith(".zip")) {
    logWithTimestamp("ZIPファイルを処理中...");
    // ZIP処理関数
  } else if (file.name.endsWith(".mp4")) {
    logWithTimestamp("MP4ファイルを処理中...");

    // 入力ファイルをFFmpegに書き込む
    ffmpeg.FS("writeFile", file.name, await fetchFile(file));

    let resolution = "";
    let fps = 0;

    // FFmpegのログからメタデータを取得するためにログを解析
    ffmpeg.setLogger(({ type, message }) => {
      if (type === "fferr") {
        logWithTimestamp(message, true); // 詳細ログに追加

        // 解像度を取得
        const resolutionMatch = message.match(/(\d{3,4}x\d{3,4})/);
        if (resolutionMatch) {
          resolution = resolutionMatch[0];
          document.getElementById("videoResolution")!.textContent = resolution;

          // 解像度の制限
          const availableResolutions = [
            { value: "1920x1080", label: "1080p (Full HD)" },
            { value: "1280x720", label: "720p (HD)" },
            { value: "640x360", label: "360p (SD)" },
            { value: "256x144", label: "144p" },
          ];

          const maxResolution = resolution.split("x").map(Number);
          resolutionSelect.innerHTML = ""; // 解像度の選択肢をクリア

          // 使用可能な解像度のみ追加
          availableResolutions.forEach((res) => {
            const resNumbers = res.value.split("x").map(Number);
            if (
              resNumbers[0] <= maxResolution[0] &&
              resNumbers[1] <= maxResolution[1]
            ) {
              const option = document.createElement("option");
              option.value = res.value;
              option.textContent = res.label;
              resolutionSelect.appendChild(option);
            }
          });
        }

        // FPSを取得
        const fpsMatch = message.match(/(\d+(?:\.\d+)?) fps/);
        if (fpsMatch) {
          fps = parseFloat(fpsMatch[1]);
          document.getElementById("videoFPS")!.textContent = fps.toString();
          fpsInput.value = Math.min(fps, 20).toString(); // FPSを制限
        }
      }
    });

    videoMetadata.fps = fps;
    videoMetadata.resolution = resolution;

    // メタデータ取得用にFFmpegを実行
    await ffmpeg.run("-i", file.name);

    // 必要なUIを表示
    document.getElementById("videoInfo")!.style.display = "block";
    document.getElementById("formatSelection")!.style.display = "block";
    document.getElementById("videoSettings")!.style.display = "block";
    document.getElementById("statusContainer")!.style.display = "block";
    document.getElementById("progressContainer")!.style.display = "block";
    document.getElementById("convertButtonGroup")!.style.display = "block";
    convertButton.disabled = false; // コンバートボタンを有効化
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

    // 詳細ログにのみ表示
    logWithTimestamp(message, true);
  }
});

// ZIPファイルにoggとtxtを保存
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

  logWithTimestamp(`音声を${audioFormat}形式で抽出しています...`);

  await ffmpeg.run(
    "-i",
    "input.mp4",
    "-q:a",
    "0",
    "-map",
    "a",
    `output.${audioFormat}`
  );

  logWithTimestamp(
    `映像を${fps}fpsで${resolution}解像度に設定し、${videoFormat}形式で抽出しています...`
  );

  await ffmpeg.run(
    "-i",
    "input.mp4",
    "-vf",
    `fps=${fps},scale=${resolution}`,
    `output_%03d.${videoFormat}`
  );

  logWithTimestamp("変換が完了しました。");

  // ZIPにまとめる
  const zip = new JSZip();

  // 音声ファイルをZIPに追加
  const audioData = ffmpeg.FS("readFile", `output.${audioFormat}`);
  zip.file(`sound.${audioFormat}`, audioData);

  // メタ情報（解像度やFPS）を保存
  const metaData = {
    resolution,
    fps,
  };
  zip.file("meta.json", JSON.stringify(metaData));

  // PNGファイルをTXTファイルに変換してZIPに追加
  let index = 1;
  while (true) {
    const fileName = `output_${String(index).padStart(3, "0")}`;
    try {
      const imageData = ffmpeg.FS("readFile", `${fileName}.${videoFormat}`);
      await saveImageToText(zip, imageData, fileName);
      index++;
    } catch (error) {
      break;
    }
  }

  // ZIPを生成してダウンロードリンクを作成
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

  await processFile(
    fileInput.files[0],
    audioFormat,
    videoFormat,
    resolution,
    fps
  );
});

// 処理完了時にモーダルを表示する関数
const showCompleteModal = () => {
  modal.style.display = "block";
  setTimeout(() => {
    modal.style.display = "none";
  }, 3000);
};

// RGBAを4bitに変換して1文字で表現するエンコード関数
const rgbaToChar = (r: number, g: number, b: number, a: number) => {
  const to4bit = (value: number) => Math.floor((value / 255) * 15); // 0-255 -> 0-15 (4bit)

  // 16進数を使用して1文字で表現
  const charSet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const r4 = to4bit(r);
  const g4 = to4bit(g);
  const b4 = to4bit(b);
  const a4 = to4bit(a);

  // 16進数の配列としてまとめる（例： "AB"）
  return charSet[r4] + charSet[g4] + charSet[b4] + charSet[a4];
};

// ピクセル情報をテキスト形式に変換
const convertPixelsToText = (pixels: Uint8ClampedArray) => {
  let txtData = "";
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    txtData += rgbaToChar(r, g, b, a); // RGBAを文字列に変換
  }
  return txtData;
};

// ピクセル情報をテキストファイルに変換してZIPに保存
const saveImageToText = async (
  zip: JSZip,
  pngFile: Uint8Array,
  fileName: string
) => {
  // FFmpegで画像を取り出す
  const blob = new Blob([pngFile], { type: "image/png" });
  const img = new Image();
  const imageUrl = URL.createObjectURL(blob);
  img.src = imageUrl;

  return new Promise<void>((resolve) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const pixelData = imageData.data;
      const txtData = convertPixelsToText(pixelData);

      zip.file(`${fileName}.txt`, txtData);
      URL.revokeObjectURL(imageUrl);
      resolve();
    };
  });
};

// 文字列から4bit RGBA値をデコードする関数
const charToRGBA = (char: string) => {
  const charSet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const to8bit = (value: number) => Math.floor((value / 15) * 255); // 0-15 -> 0-255 (8bit)

  const r4 = charSet.indexOf(char[0]);
  const g4 = charSet.indexOf(char[1]);
  const b4 = charSet.indexOf(char[2]);
  const a4 = charSet.indexOf(char[3]);

  const r = to8bit(r4);
  const g = to8bit(g4);
  const b = to8bit(b4);
  const a = to8bit(a4);

  return [r, g, b, a];
};

// ピクセルデータをテキストから復元
const convertTextToPixels = (txtData: string) => {
  const pixels = new Uint8ClampedArray(txtData.length * 4);
  for (let i = 0; i < txtData.length / 4; i++) {
    const char = txtData.slice(i * 4, (i + 1) * 4);
    const [r, g, b, a] = charToRGBA(char);
    pixels[i * 4] = r;
    pixels[i * 4 + 1] = g;
    pixels[i * 4 + 2] = b;
    pixels[i * 4 + 3] = a;
  }
  return pixels;
};

// テキストデータをもとに画像を生成してZIPに保存
const saveTextToImage = async (
  zip: JSZip,
  txtFile: string,
  width: number,
  height: number,
  fileName: string
) => {
  return new Promise<void>((resolve) => {
    const pixelData = convertTextToPixels(txtFile);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    const imageData = new ImageData(pixelData, width, height);
    ctx.putImageData(imageData, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        zip.file(`${fileName}.png`, blob);
        resolve();
      }
    }, "image/png");
  });
};

// txtファイルをアップロードし、画像に復元してZIPに保存する処理
const processTextFile = async (
  file: File,
  zip: JSZip,
  width: number,
  height: number
) => {
  const fileName = file.name.split(".")[0];
  const txtContent = await file.text();
  await saveTextToImage(zip, txtContent, width, height, fileName);
};
