import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// イベントリスナーを設定
document
  .getElementById("trimButton")
  ?.addEventListener("click", handleVideoExport);

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return (
    (hours < 10 ? "0" + hours : hours) +
    ":" +
    (minutes < 10 ? "0" + minutes : minutes) +
    ":" +
    (remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds)
  );
}

async function handleVideoExport() {
  const fileInput = document.getElementById(
    "fileInput"
  ) as HTMLInputElement | null;
  if (!fileInput || !fileInput.files) {
    alert("ファイルが選択されていません。");
    return;
  }

  const startTime = (document.getElementById("startTime") as HTMLInputElement)
    ?.value;
  const endTime = (document.getElementById("endTime") as HTMLInputElement)
    ?.value;

  if (!startTime || !endTime) {
    alert("開始時間と終了時間を入力してください。");
    return;
  }

  const file = fileInput.files[0];
  if (!file) {
    alert("動画ファイルを選択してください。");
    return;
  }

  try {
    const trimmedVideoUrl = await trimVideo(
      file,
      formatTime(Number(startTime)),
      formatTime(Number(endTime))
    );
    const previewVideo = document.getElementById("preview") as HTMLVideoElement;
    previewVideo.src = trimmedVideoUrl;

    // 動画をダウンロードするリンクを生成
    const downloadLink = document.createElement("a");
    downloadLink.download = "trimmed_video.mp4";
    downloadLink.href = trimmedVideoUrl;
    downloadLink.click();
  } catch (error) {
    console.error("エラーが発生しました: ", error);
  }
}

async function trimVideo(
  inputFile: File,
  startTime: string,
  endTime: string
): Promise<string> {
  const ffmpeg = new FFmpeg();
  const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    workerURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      "text/javascript"
    ),
  });

  console.log("FFmpegロード完了");

  await ffmpeg.writeFile("input.mp4", await fetchFile(inputFile));
  console.log("input.mp4書き込み完了");

  const duration = calculateDuration(startTime, endTime);

  await ffmpeg.exec([
    "-i",
    "input.mp4",
    "-ss",
    startTime,
    "-t",
    duration,
    "output.mp4",
  ]);
  console.log("output.mp4書き込み完了");

  const data = await ffmpeg.readFile("output.mp4");
  console.log("output.mp4読み込み完了");

  const videoBlob = new Blob([new Uint8Array(data as Uint8Array)], {
    type: "video/mp4",
  });
  const url = URL.createObjectURL(videoBlob);

  console.log("URL作成完了");

  return url;
}

function calculateDuration(startTime: string, endTime: string): string {
  const start = toSeconds(startTime);
  const end = toSeconds(endTime);
  return (end - start).toString();
}

function toSeconds(time: string): number {
  const parts = time.split(":").map(Number);
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}
