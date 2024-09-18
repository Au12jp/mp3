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
const statusMessage = document.getElementById(
  "statusMessage"
) as HTMLParagraphElement; // 状態表示用の要素
const logMessage = document.getElementById("logMessage") as HTMLPreElement; // FFmpegのログ表示用の要素

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
      statusMessage.textContent = "コンバート中です..."; // 処理開始メッセージを表示
      convertButton.disabled = true; // ボタンを無効化
      const ffmpeg = await ffmpegPromise; // FFmpegロード待ち
      const zipUrl = await extractMediaAndZip(ffmpeg, url);

      const link = document.createElement("a");
      link.href = zipUrl;
      link.download = "media.zip";
      link.textContent = "ZIPファイルをダウンロード";

      downloadLinkContainer.innerHTML = ""; // 前のリンクをクリア
      downloadLinkContainer.appendChild(link);
      statusMessage.textContent = "コンバートが完了しました！"; // 完了メッセージを表示
    } catch (error) {
      console.error("FFmpeg loading or execution failed", error);
      statusMessage.textContent = "エラーが発生しました。再試行してください。"; // エラーメッセージを表示
    } finally {
      convertButton.disabled = false; // ボタンを再び有効化
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
async function loadFFmpeg(): Promise<FFmpeg> {
  try {
    const ffmpeg = new FFmpeg();
    const CORE_VERSION = "0.12.6";

    // FFmpegコアのロード
    await ffmpeg.load({
      coreURL: await toBlobURL(
        `https://unpkg.com/@ffmpeg/core-mt@${CORE_VERSION}/dist/umd/ffmpeg-core.js`,
        "text/javascript"
      ),
      wasmURL: await toBlobURL(
        `https://unpkg.com/@ffmpeg/core-mt@${CORE_VERSION}/dist/umd/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      workerURL: await toBlobURL(
        `https://unpkg.com/@ffmpeg/core-mt@${CORE_VERSION}/dist/umd/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
      classWorkerURL: await toBlobURL("./worker.js", "text/javascript"),
    });

    // FFmpegのログ表示
    ffmpeg.on("log", ({ type, message }) => {
      logMessage.textContent += `[${type}] ${message}\n`; // ログを追加
    });

    // FFmpegの進捗表示
    ffmpeg.on("progress", ({ progress, time }) => {
      statusMessage.textContent = `進行状況: ${(progress * 100).toFixed(
        2
      )}% - 時間: ${time}`;
    });

    console.log("FFmpeg core loaded successfully");
    return ffmpeg;
  } catch (error) {
    console.error("FFmpegのロード中にエラーが発生しました:", error);
    throw error; // エラーを再スローして他の部分でもハンドリングできるようにする
  }
}

/**
 * stringからUint8Arrayに変換する関数
 * @param data Base64などでエンコードされたデータ
 * @returns Uint8Arrayに変換されたデータ
 */
function stringToUint8Array(data: string): Uint8Array {
  const binaryString = atob(data); // Base64でエンコードされている場合のデコード
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
