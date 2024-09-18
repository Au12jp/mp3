import { FFmpeg } from "@ffmpeg/ffmpeg";
import { FileData } from "@ffmpeg/ffmpeg/dist/esm/types";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import JSZip from "jszip";

// FFmpegの初期化とロードを行うPromise
const ffmpegPromise: Promise<FFmpeg> = loadFFmpeg();
// HTML要素の取得
const fileInput = document.getElementById(
  "fileInput"
) as HTMLInputElement | null;
const convertButton = document.getElementById(
  "convertButton"
) as HTMLButtonElement | null;
const downloadLinkContainer = document.getElementById(
  "downloadLinkContainer"
) as HTMLDivElement | null;
const statusMessage = document.getElementById(
  "statusMessage"
) as HTMLParagraphElement | null; // 状態表示用の要素
const logMessage = document.getElementById(
  "logMessage"
) as HTMLPreElement | null; // FFmpegのログ表示用の要素

/**
 * ログをUIに表示する関数
 * @param message ログメッセージ
 */
function logToUI(message: string) {
  if (logMessage) {
    const timestamp = new Date().toLocaleTimeString();
    logMessage.textContent += `[${timestamp}] ${message}\n`;
  } else {
    console.error("logMessage 要素が見つかりません。");
  }
}

// ファイルが選択された際の処理
fileInput?.addEventListener("change", () => {
  if (fileInput?.files?.length) {
    if (convertButton) convertButton.disabled = false;
    logToUI("ファイルが選択されました。");
  }
});

// コンバートボタンが押された時の処理
convertButton?.addEventListener("click", async () => {
  if (fileInput?.files?.length) {
    const file = fileInput.files[0];
    const url = URL.createObjectURL(file);

    try {
      if (statusMessage) statusMessage.textContent = "コンバート中です..."; // 処理開始メッセージを表示
      logToUI("コンバートが開始されました...");
      if (convertButton) convertButton.disabled = true; // ボタンを無効化

      const ffmpeg = await ffmpegPromise; // FFmpegロード待ち
      logToUI("FFmpegが正常にロードされました。");

      // メディアの処理とZIP作成
      const zipUrl = await extractMediaAndZip(ffmpeg, url);

      // ダウンロードリンクの作成
      if (downloadLinkContainer) {
        const link = document.createElement("a");
        link.href = zipUrl;
        link.download = "media.zip";
        link.textContent = "ZIPファイルをダウンロード";

        downloadLinkContainer.innerHTML = ""; // 前のリンクをクリア
        downloadLinkContainer.appendChild(link);
      }

      if (statusMessage)
        statusMessage.textContent = "コンバートが完了しました！"; // 完了メッセージを表示
      logToUI("コンバートが完了しました。");
    } catch (error) {
      logToUI(`エラー: ${error}`);
      if (statusMessage)
        statusMessage.textContent =
          "エラーが発生しました。再試行してください。"; // エラーメッセージを表示
    } finally {
      if (convertButton) convertButton.disabled = false; // ボタンを再び有効化
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
  logToUI("MP4ファイルをFFmpegに読み込み中...");
  await ffmpeg.writeFile("input.mp4", await fetchFile(inputFile));
  logToUI("input.mp4が書き込まれました。");

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
  logToUI("画像がフレームごとに抽出されました。");

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
  logToUI("音声がOGG形式で抽出されました。");

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

  logToUI("画像と音声の抽出が完了しました。");

  // ZIPファイルに音声を追加
  zip.file("output.ogg", audioData as Uint8Array); // 型キャスト

  // ZIPファイルを生成してBlobに変換
  const zipBlob: Blob = await zip.generateAsync({ type: "blob" });
  const zipURL: string = URL.createObjectURL(zipBlob);

  logToUI("ZIPファイルが生成されました。");

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

    logToUI("FFmpegをロード中...");
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
      logToUI(`[${type}] ${message}`);
    });

    // FFmpegの進捗表示
    ffmpeg.on("progress", ({ progress, time }) => {
      if (statusMessage) {
        statusMessage.textContent = `進行状況: ${(progress * 100).toFixed(
          2
        )}% - 時間: ${time}`;
      }
      logToUI(`進行状況: ${(progress * 100).toFixed(2)}% - 時間: ${time}`);
    });

    logToUI("FFmpegが正常にロードされました。");
    return ffmpeg;
  } catch (error) {
    logToUI(`FFmpegのロード中にエラーが発生しました: ${error}`);
    throw error;
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
