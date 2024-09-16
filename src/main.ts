import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

console.log(1);

const ffmpeg = createFFmpeg({
  log: true, // ログを有効化
});

const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const convertButton = document.getElementById(
  "convertButton"
) as HTMLButtonElement;
const output = document.getElementById("output") as HTMLElement;

convertButton.addEventListener("click", async () => {
  if (!fileInput.files?.length) {
    alert("Please select an mp3 file.");
    return;
  }

  const file = fileInput.files[0];
  output.textContent = "Converting...";

  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  // MP3ファイルを書き込み
  ffmpeg.FS("writeFile", "input.mp3", await fetchFile(file));

  // FFmpegのログを解析するために標準エラー出力をキャプチャする
  let ffmpegLog = "";
  ffmpeg.setLogger(({ type, message }) => {
    if (type === "fferr" || type === "ffout") {
      ffmpegLog += message + "\n";
    }
  });

  try {
    // MP3の周波数解析。showfreqsフィルタで周波数スペクトラムを画像として出力
    await ffmpeg.run(
      "-i",
      "input.mp3",
      "-filter_complex",
      "showfreqs=s=1280x720:mode=line",
      "-frames:v",
      "1", // これを追加して最初のフレームだけを出力
      "output.png"
    );

    // 画像を表示または保存して確認できます
    const data = ffmpeg.FS("readFile", "output.png");
    const blob = new Blob([data.buffer], { type: "image/png" });
    const imgURL = URL.createObjectURL(blob);

    // 結果を画像として表示
    const img = document.createElement("img");
    console.log(imgURL); // URLを確認
    img.src = imgURL;
    img.style.width = "100%"; // 必要に応じてサイズを調整
    img.style.height = "auto";
    output.appendChild(img);
    console.log("Image element added to the page");

    // ダウンロードリンクを生成
    const link = document.createElement("a");
    link.href = imgURL;
    link.download = "output.png";
    link.textContent = "Download Frequency Spectrum";
    output.appendChild(link);

    output.textContent = "Conversion complete!";
  } catch (error) {
    output.textContent = "Error occurred during conversion.";
    console.error("FFmpeg error:", error);
    console.error("FFmpeg log:", ffmpegLog);
  }
});
