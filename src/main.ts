import { createFFmpeg, fetchFile, FFmpeg } from "@ffmpeg/ffmpeg";
import JSZip from "jszip";

// FFmpegインスタンスを作成する関数
const createFFmpegInstance = () => {
  const ffmpeg = createFFmpeg({
    corePath:
      "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
    log: true,
  });
  ffmpeg.setLogger(ffmpegLogHandler);
  return ffmpeg;
};

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

// 音声を処理する関数
const processAudio = async (
  ffmpeg: any,
  file: File,
  audioFormat: string
): Promise<Uint8Array> => {
  logWithTimestamp(`音声を${audioFormat}形式で抽出しています...`);

  // 入力ファイルを書き込む
  ffmpeg.FS("writeFile", "input.mp4", await fetchFile(file));

  try {
    // 音声を抽出する
    await ffmpeg.run(
      "-i",
      "input.mp4",
      "-q:a",
      "0",
      "-map",
      "a",
      `output.${audioFormat}`
    );
    logWithTimestamp("音声の抽出が完了しました。");
  } catch (error) {
    logWithTimestamp(`音声抽出中にエラーが発生しました: ${error}`);
    throw error;
  }

  // 抽出された音声データを取得
  const audioData = ffmpeg.FS("readFile", `output.${audioFormat}`);
  return audioData;
};

// 動画を指定した時間ごとに分割する関数
const splitVideo = async (
  ffmpeg: FFmpeg,
  segmentDuration: number
): Promise<string[]> => {
  logWithTimestamp(`動画を${segmentDuration}秒ごとに分割しています...`);

  await ffmpeg.run(
    "-i",
    "input.mp4", // 入力動画
    "-c",
    "copy", // 映像や音声の再エンコードなし
    "-map",
    "0", // すべてのストリームをマップ
    "-segment_time",
    segmentDuration.toString(), // セグメントごとの長さ (秒単位)
    "-f",
    "segment", // セグメント形式で出力
    "segment_%03d.mp4" // 出力ファイル名フォーマット
  );

  logWithTimestamp("動画の分割が完了しました。");

  // セグメントファイルの名前を手動で追跡
  const segmentFiles: string[] = [];
  for (let i = 0; ; i++) {
    const segmentFileName = `segment_${String(i).padStart(3, "0")}.mp4`;
    try {
      ffmpeg.FS("readFile", segmentFileName); // ファイルの存在を確認
      segmentFiles.push(segmentFileName);
    } catch (error) {
      break; // ファイルが見つからない場合は終了
    }
  }

  return segmentFiles; // セグメントファイル名のリストを返す
};

// 分割された動画セグメントを並列処理する関数
const processSegmentsWithMultipleFFmpeg = async (
  segmentFiles: string[],
  videoFormat: string,
  resolution: string,
  fps: string
) => {
  const processingPromises = [];

  // セグメントファイルごとにFFmpegインスタンスを作成し、並列処理
  for (const segmentFileName of segmentFiles) {
    const ffmpegInstance = createFFmpegInstance(); // 新しいFFmpegインスタンス
    await ffmpegInstance.load();
    ffmpegInstance.setLogger(ffmpegLogHandler);

    ffmpegInstance.FS(
      "writeFile",
      segmentFileName,
      ffmpegInstance.FS("readFile", segmentFileName)
    );

    const processingPromise = ffmpegInstance
      .run(
        "-i",
        segmentFileName, // 入力セグメント
        "-vf",
        `fps=${fps},scale=${resolution}`, // FPSと解像度の設定
        `processed_${segmentFileName}.${videoFormat}` // 出力ファイル名
      )
      .then(() => {
        return ffmpegInstance.FS(
          "readFile",
          `processed_${segmentFileName}.${videoFormat}`
        );
      });

    processingPromises.push(processingPromise);
  }

  const processedFiles = await Promise.all(processingPromises);

  logWithTimestamp("すべてのセグメントの処理が完了しました。");

  return processedFiles;
};

// 使用例
const processMp4FileInParallelWithMultipleFFmpeg = async (
  file: File,
  segmentDuration: number
) => {
  logWithTimestamp("MP4ファイルの分割と並列処理を開始します...");

  const ffmpeg = createFFmpegInstance();
  await ffmpeg.load();

  // 音声と動画メタデータの取得
  const { resolution, fps } = await getVideoMetadata(file);

  // まず音声を処理
  const audioData = await processAudio(ffmpeg, file, formatSelectAudio.value);
  logWithTimestamp(`音声データの処理が完了しました。`);

  // 動画を分割
  const segmentFiles = await splitVideo(ffmpeg, segmentDuration);

  // セグメントファイルを処理
  const processedFiles = await processSegmentsWithMultipleFFmpeg(
    segmentFiles,
    formatSelectVideo.value,
    resolution,
    fps.toString()
  );

  logWithTimestamp("動画の分割と並列処理が完了しました。");
  showCompleteModal(); // 処理完了時にモーダルを表示

  // メタデータ作成
  const metaData = {
    audioFormat: formatSelectAudio.value,
    videoFormat: formatSelectVideo.value,
    resolution,
    fps,
  };

  // ZIPにまとめる
  const zip = new JSZip();
  zip.file(`output.${formatSelectAudio.value}`, audioData); // 先に音声をZIPに追加
  zip.file("meta.json", JSON.stringify(metaData)); // メタデータをZIPに追加
  processedFiles.forEach((file, index) => {
    zip.file(`processed_${index}.${formatSelectVideo.value}`, file);
  });

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(zipBlob);
  downloadLink.download = "processed_segments.zip";
  downloadLink.textContent = "Download Processed Segments ZIP";
  downloadLinkContainer.innerHTML = "";
  downloadLinkContainer.appendChild(downloadLink);
};

// コンバートボタン押下時のイベントリスナー
convertButton.addEventListener("click", async () => {
  if (!fileInput.files?.length) return;

  const segmentDuration = 10; // 10秒ごとに分割
  await processMp4FileInParallelWithMultipleFFmpeg(
    fileInput.files[0],
    segmentDuration
  );
});

// 動画ファイルからメタデータを取得する関数
const getVideoMetadata = async (
  file: File
): Promise<{ resolution: string; fps: number }> => {
  return new Promise<{ resolution: string; fps: number }>(
    async (resolve, reject) => {
      const ffmpeg = createFFmpegInstance();
      await ffmpeg.load();
      ffmpeg.FS("writeFile", "temp.mp4", await fetchFile(file));

      let resolution = "";
      let fps = 0;

      ffmpeg.setLogger(
        ({ type, message }: { type: string; message: string }) => {
          if (type === "fferr") {
            const resolutionMatch = message.match(/(\d{3,4}x\d{3,4})/);
            if (resolutionMatch) {
              resolution = resolutionMatch[0];
            }

            const fpsMatch = message.match(/(\d+(?:\.\d+)?) fps/);
            if (fpsMatch) {
              fps = parseFloat(fpsMatch[1]);
            }
          }
        }
      );

      await ffmpeg.run("-i", "temp.mp4");

      if (resolution && fps) {
        resolve({ resolution, fps });
      } else {
        reject("Unable to extract metadata from video.");
      }

      ffmpeg.FS("unlink", "temp.mp4");
    }
  );
};

// FFmpegの進捗バーを表示する関数
const parseProgress = (log: string) => {
  const timeRegex = /time=(\d+):(\d+):(\d+\.\d+)/;
  const match = timeRegex.exec(log);

  if (match) {
    const hours = parseFloat(match[1]);
    const minutes = parseFloat(match[2]);
    const seconds = parseFloat(match[3]);
    const currentTime = hours * 3600 + minutes * 60 + seconds;

    if (totalDuration > 0) {
      const progress = (currentTime / totalDuration) * 100;
      progressBar.value = progress;
      progressPercent.textContent = `進捗: ${progress.toFixed(2)}%`;
    }
  }
};

// メタデータから動画の合計時間を取得する関数
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

// FFmpegのログを処理して進捗を表示
const ffmpegLogHandler = ({
  type,
  message,
}: {
  type: string;
  message: string;
}) => {
  if (type === "fferr") {
    if (message.includes("Duration:")) {
      parseDuration(message);
    }
    if (message.includes("time=")) {
      parseProgress(message);
    }
    logWithTimestamp(message, true);
  }
};

// 処理完了時にモーダルを表示する関数
const showCompleteModal = () => {
  modal.style.display = "block";
  setTimeout(() => {
    modal.style.display = "none";
  }, 3000);
};

// ファイル選択時のイベントリスナー
fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  if (file.name.endsWith(".zip")) {
    logWithTimestamp("ZIPファイルを処理中...");
    await processZipFile(file);
  } else if (file.name.endsWith(".mp4")) {
    await processMp4File(file);
  }
});

// MP4ファイルを処理する関数
const processMp4File = async (file: File) => {
  logWithTimestamp("MP4ファイルを処理中...");

  try {
    const { resolution, fps } = await getVideoMetadata(file);

    document.getElementById("videoResolution")!.textContent = resolution;
    document.getElementById("videoFPS")!.textContent = fps.toString();

    const availableResolutions = [
      { value: "1920x1080", label: "1080p (Full HD)" },
      { value: "1280x720", label: "720p (HD)" },
      { value: "640x360", label: "360p (SD)" },
      { value: "256x144", label: "144p" },
    ];

    const maxResolution = resolution.split("x").map(Number);
    resolutionSelect.innerHTML = "";

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

    fpsInput.value = Math.min(fps, 20).toString();

    document.getElementById("videoInfo")!.style.display = "block";
    document.getElementById("formatSelection")!.style.display = "block";
    document.getElementById("videoSettings")!.style.display = "block";
    document.getElementById("statusContainer")!.style.display = "block";
    document.getElementById("progressContainer")!.style.display = "block";
    document.getElementById("convertButtonGroup")!.style.display = "block";
    convertButton.disabled = false;
  } catch (error) {
    logWithTimestamp(`メタデータの取得に失敗しました: ${error}`);
  }
};

// RGBAを4bitに変換して1文字で表現するエンコード関数
const rgbaToChar = (r: number, g: number, b: number, a: number): string => {
  const to4bit = (value: number) => Math.floor((value / 255) * 15); // 0-255 -> 0-15 (4bit)

  const charSet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const r4 = to4bit(r);
  const g4 = to4bit(g);
  const b4 = to4bit(b);
  const a4 = to4bit(a);

  return charSet[r4] + charSet[g4] + charSet[b4] + charSet[a4];
};

// ピクセル情報をテキスト形式に変換
const convertPixelsToText = (pixels: Uint8ClampedArray): string => {
  let txtData = "";
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    txtData += rgbaToChar(r, g, b, a);
  }
  return txtData;
};

// ピクセル情報をテキストファイルに変換してZIPに保存
const saveImageToText = async (
  zip: JSZip,
  pngFile: Uint8Array,
  fileName: string
) => {
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

// txtファイルから画像を生成して保存する関数
const saveTextToImage = async (
  zip: JSZip,
  txtFile: string,
  width: number,
  height: number,
  fileName: string
) => {
  return new Promise<void>((resolve, reject) => {
    const pixelData = convertTextToPixels(txtFile);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas context could not be created."));
      return;
    }

    const imageData = new ImageData(pixelData, width, height);
    ctx.putImageData(imageData, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        zip.file(`${fileName}.png`, blob);
        resolve();
      } else {
        reject(new Error("Blob creation failed."));
      }
    }, "image/png");
  });
};

// 文字列から4bit RGBA値をデコードする関数
const charToRGBA = (char: string): [number, number, number, number] => {
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

// ピクセルデータをテキストから復元する関数
const convertTextToPixels = (txtData: string): Uint8ClampedArray => {
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

// ZIPファイル内のメタデータを取得し、画像を復元する関数
const processZipFile = async (file: File) => {
  const zip = await JSZip.loadAsync(file);
  const zipEntries = Object.keys(zip.files);

  const newZip = new JSZip();

  for (const entryName of zipEntries) {
    const entry = zip.file(entryName);
    if (!entry) continue;

    const content = await entry.async("string");
    const fileName = entryName.split(".")[0];

    if (entryName.endsWith(".txt")) {
      const metaEntry = zip.file("meta.json");
      let resolution: string;
      let fps: number;

      if (metaEntry) {
        const metaData = await metaEntry.async("string");
        const parsedMeta = JSON.parse(metaData);
        resolution = parsedMeta.resolution;
        fps = parsedMeta.fps;
      } else {
        const videoFile = zip.file("input.mp4");
        if (!videoFile) {
          throw new Error("Meta information and video file not found.");
        }

        const videoBlob = await videoFile.async("blob");
        const videoFileObject = new File([videoBlob], "input.mp4");
        const videoMeta = await getVideoMetadata(videoFileObject);

        resolution = videoMeta.resolution;
        fps = videoMeta.fps;
      }

      const [width, height] = resolution.split("x").map(Number);
      await saveTextToImage(newZip, content, width, height, fileName);
    } else {
      const fileBlob = await entry.async("blob"); // バイナリデータとして処理する
      newZip.file(entryName, fileBlob);
    }
  }

  const zipBlob = await newZip.generateAsync({ type: "blob" });
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(zipBlob);
  downloadLink.download = "restored_images.zip";
  downloadLink.textContent = "Download Restored ZIP";
  downloadLinkContainer.innerHTML = "";
  downloadLinkContainer.appendChild(downloadLink);
};
