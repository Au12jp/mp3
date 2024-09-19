import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import JSZip from "jszip";

// FFmpegの初期化
const ffmpeg = createFFmpeg({ log: true });
const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const convertButton = document.getElementById(
  "convertButton"
) as HTMLButtonElement;
const statusMessage = document.getElementById(
  "statusMessage"
) as HTMLParagraphElement;
const logMessage = document.getElementById("logMessage") as HTMLPreElement;
const downloadLinkContainer = document.getElementById(
  "downloadLinkContainer"
) as HTMLDivElement;

// ファイル選択時のイベントリスナー
fileInput.addEventListener("change", () => {
  if (fileInput.files?.length) {
    statusMessage.textContent = "ファイルが選択されました。";
    convertButton.disabled = false; // ボタンを有効化
  }
});

// コンバートボタン押下時のイベントリスナー
convertButton.addEventListener("click", async () => {
  if (!fileInput.files?.length) return;

  convertButton.disabled = true; // ボタンを無効化
  statusMessage.textContent = "変換中...";

  if (!ffmpeg.isLoaded()) {
    logMessage.textContent += "FFmpegをロード中...\n";
    await ffmpeg.load();
  }

  logMessage.textContent += "FFmpegがロードされました。\n";

  // ファイルの読み込み
  const file = fileInput.files[0];
  const fileName = file.name.split(".")[0];

  ffmpeg.FS("writeFile", "input.mp4", await fetchFile(file));
  logMessage.textContent += "ファイルを読み込みました。\n";

  // 音声の抽出（ogg形式）
  logMessage.textContent += "音声をogg形式で抽出しています...\n";
  await ffmpeg.run("-i", "input.mp4", "-q:a", "0", "-map", "a", "output.ogg");

  // 映像の抽出 (20fpsでpng画像として出力)
  logMessage.textContent += "映像を20fpsでpng形式で抽出しています...\n";
  await ffmpeg.run("-i", "input.mp4", "-vf", "fps=20", "output_%03d.png");

  logMessage.textContent += "変換が完了しました。\n";

  // ZIPにまとめる
  const zip = new JSZip();

  // 音声ファイルをZIPに追加
  const audioData = ffmpeg.FS("readFile", "output.ogg");
  zip.file("audio.ogg", audioData);

  // PNGファイルをまとめて追加
  let index = 1;
  while (true) {
    const fileName = `output_${String(index).padStart(3, "0")}.png`;
    try {
      const imageData = ffmpeg.FS("readFile", fileName);
      zip.file(fileName, imageData);
      index++;
    } catch (error) {
      // すべてのフレームを読み終わった場合に抜ける
      break;
    }
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(zipBlob);
  downloadLink.download = `${fileName}_audio_and_images.zip`;
  downloadLink.textContent = "Download ZIPファイル";
  downloadLink.classList.add("download-link");

  // ダウンロードリンクを表示
  downloadLinkContainer.innerHTML = ""; // リセット
  downloadLinkContainer.appendChild(downloadLink);

  statusMessage.textContent = "変換が完了しました。";
  convertButton.disabled = false; // ボタンを再度有効化
});
