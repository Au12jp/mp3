import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

console.log(2);

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
    // 周波数解析フィルタ（astats）を使用して統計情報を取得
    await ffmpeg.run(
      "-i",
      "input.mp3",
      "-filter_complex",
      "astats=metadata=1:reset=1",
      "-f",
      "null",
      "-"
    );

    // ログ情報をテキストとして出力
    const textBlob = new Blob([ffmpegLog], { type: "text/plain" });
    const textURL = URL.createObjectURL(textBlob);

    // ダウンロードリンクを生成
    const link = document.createElement("a");
    link.href = textURL;
    link.download = "frequency_analysis.txt";
    link.textContent = "Download Frequency Analysis";
    output.innerHTML = ""; // 一度クリア
    output.appendChild(link);

    output.innerHTML += "\nConversion complete!";
  } catch (error) {
    output.textContent = "Error occurred during conversion.";
    console.error("FFmpeg error:", error);
    console.error("FFmpeg log:", ffmpegLog);
  }
});
