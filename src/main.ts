import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// HTML要素を取得
const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const trimButton = document.getElementById("trimButton") as HTMLButtonElement;
const videoOutput = document.getElementById("videoOutput") as HTMLVideoElement;

trimButton.addEventListener("click", async () => {
  if (!fileInput.files || fileInput.files.length === 0) {
    alert("まず動画ファイルを選択してください。");
    return;
  }

  const start = (document.getElementById("start") as HTMLInputElement).value;
  const end = (document.getElementById("end") as HTMLInputElement).value;

  // トリミング処理を実行
  const trimmedVideoUrl = await trimVideo(fileInput.files[0], start, end);
  if (trimmedVideoUrl) {
    videoOutput.src = trimmedVideoUrl; // トリミングされた動画をプレビュー
  }
});

async function trimVideo(
  file: File,
  startTime: string,
  endTime: string
): Promise<string | null> {
  const ffmpeg = new FFmpeg();

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  console.warn("ffmpeg loaded");

  // 入力ファイルをFFmpegの仮想ファイルシステムに書き込み
  await ffmpeg.writeFile("input.mp4", await fetchFile(file));

  const duration = (parseInt(endTime) - parseInt(startTime)).toString();

  // FFmpegを使って動画をトリミング
  await ffmpeg.exec([
    "-i",
    "input.mp4",
    "-ss",
    startTime,
    "-t",
    duration,
    "output.mp4",
  ]);

  // トリミング後のファイルを読み込み
  const data = await ffmpeg.readFile("output.mp4");
  const videoBlob = new Blob([new Uint8Array(data as Uint8Array)], {
    type: "video/mp4",
  });

  // トリミングされた動画のURLを作成
  return URL.createObjectURL(videoBlob);
}
