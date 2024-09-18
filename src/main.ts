import { FFmpeg } from "@ffmpeg/ffmpeg";
import { FileData } from "@ffmpeg/ffmpeg/dist/esm/types";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import JSZip from "jszip";

// メインの処理をDOMContentLoadedイベント内で実行
document.addEventListener("DOMContentLoaded", () => {
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
  ) as HTMLParagraphElement | null;
  const logMessage = document.getElementById(
    "logMessage"
  ) as HTMLPreElement | null;

  // ログをUIに表示する関数
  const logToUI = (message: string) => {
    if (logMessage) {
      const timestamp = new Date().toLocaleTimeString();
      logMessage.textContent += `[${timestamp}] ${message}\n`;
    } else {
      console.error("logMessage要素が見つかりません。");
    }
  };

  loadFFmpeg()
    .then((ffmpeg) => {
      // ファイル選択時の処理
      fileInput?.addEventListener("change", () => {
        if (fileInput?.files?.length) {
          convertButton!.disabled = false; // ボタンを有効化
          logToUI("ファイルが選択されました。");
        }
      });

      // コンバートボタンが押された時の処理
      convertButton?.addEventListener("click", () => {
        if (fileInput?.files?.length) {
          const file = fileInput.files[0];
          const url = URL.createObjectURL(file);

          statusMessage!.textContent = "コンバート中です...";
          logToUI("コンバートが開始されました...");
          convertButton!.disabled = true; // ボタンを無効化

          // メディアの処理とZIP作成
          extractMediaAndZip(ffmpeg, url)
            .then((zipUrl) => {
              // ダウンロードリンクの作成
              if (downloadLinkContainer) {
                const link = document.createElement("a");
                link.href = zipUrl;
                link.download = "media.zip";
                link.textContent = "ZIPファイルをダウンロード";
                downloadLinkContainer.innerHTML = ""; // 前のリンクをクリア
                downloadLinkContainer.appendChild(link);
              }

              statusMessage!.textContent = "コンバートが完了しました！";
              logToUI("コンバートが完了しました。");
            })
            .catch(handleError)
            .finally(() => {
              convertButton!.disabled = false; // ボタンを再び有効化
            });
        }
      });
    })
    .catch(handleError);

  // FFmpegを使用してメディアを処理し、ZIPファイルを作成する関数
  async function extractMediaAndZip(
    ffmpeg: FFmpeg,
    inputFile: string
  ): Promise<string> {
    logToUI("MP4ファイルをFFmpegに読み込み中...");

    return ffmpeg
      .writeFile("input.mp4", await fetchFile(inputFile))
      .then(() => {
        logToUI("input.mp4が書き込まれました。");

        // 映像をフレームごとに番号付きの画像（PNG）として抽出
        return ffmpeg.exec([
          "-i",
          "input.mp4",
          "-vf",
          "fps=1",
          "-q:v",
          "3",
          "output_%03d.png",
        ]);
      })
      .then(() => {
        logToUI("画像がフレームごとに抽出されました。");

        // 音声をOGG形式で抽出
        return ffmpeg.exec([
          "-i",
          "input.mp4",
          "-q:a",
          "0",
          "-map",
          "a",
          "output.ogg",
        ]);
      })
      .then(() => {
        logToUI("音声がOGG形式で抽出されました。");

        // 出力ファイルを読み込む
        return ffmpeg.readFile("output.ogg").then((audioData) => {
          if (typeof audioData === "string") {
            audioData = stringToUint8Array(audioData); // stringからUint8Arrayに変換
          }

          // 生成された画像の読み込み
          const zip = new JSZip();
          let i = 1;

          const loadImages = (): Promise<void> => {
            return ffmpeg
              .readFile(`output_${String(i).padStart(3, "0")}.png`)
              .then((imageData) => {
                if (typeof imageData === "string") {
                  imageData = stringToUint8Array(imageData); // stringからUint8Arrayに変換
                }
                zip.file(`image_${i}.png`, imageData as Uint8Array);
                i++;
                return loadImages(); // 次の画像を読み込む
              })
              .catch(() => {
                // ファイルが見つからない場合ループを終了
                logToUI("画像と音声の抽出が完了しました。");
              });
          };

          return loadImages().then(() => {
            // ZIPファイルに音声を追加
            zip.file("output.ogg", audioData as Uint8Array);

            // ZIPファイルを生成してBlobに変換
            return zip.generateAsync({ type: "blob" }).then((zipBlob) => {
              const zipURL = URL.createObjectURL(zipBlob);
              logToUI("ZIPファイルが生成されました。");
              return zipURL;
            });
          });
        });
      });
  }

  // FFmpegをロードし、初期化する関数
  async function loadFFmpeg(): Promise<FFmpeg> {
    const ffmpeg = new FFmpeg();
    const CORE_VERSION = "0.12.6";

    logToUI("FFmpegをロード中...");

    return ffmpeg
      .load({
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
      })
      .then(() => {
        // ログイベントの設定
        ffmpeg.on("log", ({ type, message }) => {
          logToUI(`[${type}] ${message}`);
        });

        // 進捗イベントの設定
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
      });
  }

  // エラーハンドリング関数
  function handleError(error: unknown) {
    if (error instanceof Error) {
      console.error("エラー:", error);
      logToUI(`エラー: ${error.message}`);
    } else {
      logToUI("不明なエラーが発生しました。");
    }
    if (statusMessage) {
      statusMessage.textContent = "エラーが発生しました。再試行してください。"; // エラーメッセージを表示
    }
  }

  // stringからUint8Arrayに変換する関数
  function stringToUint8Array(data: string): Uint8Array {
    const binaryString = atob(data); // Base64でエンコードされている場合のデコード
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
});
